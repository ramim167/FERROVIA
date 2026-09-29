-- Additional PostgreSQL automation for FERROVIA operational workflows.

CREATE OR REPLACE FUNCTION get_available_seats_for_segment(
    p_trip_id INT,
    p_source_station_id INT,
    p_destination_station_id INT,
    p_class_id INT
) RETURNS TABLE (
    trip_seat_id INT,
    seat_id INT,
    seat_number VARCHAR,
    seat_type VARCHAR,
    coach_id INT,
    coach_code VARCHAR,
    class_id INT,
    class_name VARCHAR,
    class_code VARCHAR,
    is_available INT
) AS $$
DECLARE
    v_source_sequence INT;
    v_destination_sequence INT;
BEGIN
    SELECT SRC.STOP_SEQUENCE, DST.STOP_SEQUENCE
    INTO v_source_sequence, v_destination_sequence
    FROM TRIP_STOPS SRC
    JOIN TRIP_STOPS DST ON DST.TRIP_ID = SRC.TRIP_ID
    WHERE SRC.TRIP_ID = p_trip_id
      AND SRC.STATION_ID = p_source_station_id
      AND DST.STATION_ID = p_destination_station_id
      AND SRC.STOP_SEQUENCE < DST.STOP_SEQUENCE;

    IF v_source_sequence IS NULL THEN
        RAISE EXCEPTION 'Invalid journey segment for trip %', p_trip_id;
    END IF;

    RETURN QUERY
    SELECT TS.TRIP_SEAT_ID, S.SEAT_ID, S.SEAT_NUMBER, S.SEAT_TYPE,
           C.COACH_ID, C.COACH_CODE, CT.CLASS_ID, CT.CLASS_NAME, CT.CLASS_CODE,
           CASE WHEN EXISTS (
               SELECT 1
               FROM SEAT_RESERVATIONS SR
               WHERE SR.TRIP_SEAT_ID = TS.TRIP_SEAT_ID
                 AND SR.RESERVATION_STATUS IN ('BOOKED','HELD')
                 AND (SR.RESERVATION_STATUS <> 'HELD'
                      OR SR.HOLD_EXPIRES_AT > CURRENT_TIMESTAMP)
                 AND v_source_sequence < SR.DESTINATION_STOP_SEQUENCE
                 AND v_destination_sequence > SR.SOURCE_STOP_SEQUENCE
           ) THEN 0 ELSE 1 END::INT
    FROM TRIP_SEATS TS
    JOIN SEATS S ON S.SEAT_ID = TS.SEAT_ID
    JOIN COACHES C ON C.COACH_ID = S.COACH_ID
    JOIN CLASS_TYPES CT ON CT.CLASS_ID = C.CLASS_ID
    WHERE TS.TRIP_ID = p_trip_id
      AND TS.SEAT_STATUS = 'AVAILABLE'
      AND LOWER(S.IS_ACTIVE::TEXT) IN ('1','true','t')
      AND CT.CLASS_ID = p_class_id
    ORDER BY C.COACH_ORDER, S.SEAT_NUMBER;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION calculate_cancellation_refund(p_booking_id INT)
RETURNS TABLE (refund_percent NUMERIC(5,2), refund_amount NUMERIC(10,2)) AS $$
DECLARE
    v_hours_until_departure NUMERIC;
    v_total_fare NUMERIC(10,2);
BEGIN
    SELECT EXTRACT(EPOCH FROM (T.SCHEDULED_DEPARTURE - CURRENT_TIMESTAMP)) / 3600,
           B.TOTAL_FARE
    INTO v_hours_until_departure, v_total_fare
    FROM BOOKINGS B
    JOIN TRIPS T ON T.TRIP_ID = B.TRIP_ID
    WHERE B.BOOKING_ID = p_booking_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking % not found', p_booking_id;
    END IF;

    refund_percent := CASE
        WHEN v_hours_until_departure >= 48 THEN 90
        WHEN v_hours_until_departure >= 24 THEN 75
        WHEN v_hours_until_departure >= 12 THEN 50
        ELSE 0
    END;
    refund_amount := ROUND(v_total_fare * refund_percent / 100, 2);
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_ticket_details_by_pnr(p_pnr_number VARCHAR)
RETURNS TABLE (
    booking_id INT,
    pnr_number VARCHAR,
    user_id INT,
    trip_id INT,
    booking_time TIMESTAMP,
    total_fare NUMERIC(10,2),
    booking_status VARCHAR,
    train_name VARCHAR,
    train_code VARCHAR,
    direction VARCHAR,
    source_station VARCHAR,
    destination_station VARCHAR,
    scheduled_departure TIMESTAMP,
    scheduled_arrival TIMESTAMP,
    class_name VARCHAR,
    passenger_id INT,
    passenger_name VARCHAR,
    age INT,
    gender VARCHAR,
    coach_code VARCHAR,
    seat_number VARCHAR,
    reservation_id INT,
    reservation_status VARCHAR,
    hold_expires_at TIMESTAMP,
    ticket_id INT,
    ticket_status VARCHAR,
    ticket_fare NUMERIC(10,2),
    refund_id INT,
    refund_amount NUMERIC(10,2),
    refund_status VARCHAR,
    trip_status VARCHAR,
    current_delay_minutes NUMERIC,
    last_left_station VARCHAR,
    next_station VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT B.BOOKING_ID, B.PNR_NUMBER, B.USER_ID, B.TRIP_ID, B.BOOKING_TIME,
           B.TOTAL_FARE, B.BOOKING_STATUS, TR.TRAIN_NAME, TR.TRAIN_CODE,
           R.DIRECTION, SRC.STATION_NAME, DST.STATION_NAME,
           T.SCHEDULED_DEPARTURE, T.SCHEDULED_ARRIVAL, CT.CLASS_NAME,
           P.PASSENGER_ID, P.PASSENGER_NAME, P.AGE, P.GENDER,
           C.COACH_CODE, S.SEAT_NUMBER, SR.RESERVATION_ID, SR.RESERVATION_STATUS,
           SR.HOLD_EXPIRES_AT, TK.TICKET_ID, TK.TICKET_STATUS, TK.TICKET_FARE,
           RF.REFUND_ID, RF.REFUND_AMOUNT, RF.REFUND_STATUS, L.TRIP_STATUS,
           COALESCE(L.CURRENT_DELAY_MINUTES, 0), L.LAST_LEFT_STATION, L.NEXT_STATION
    FROM BOOKINGS B
    JOIN TRIPS T ON T.TRIP_ID = B.TRIP_ID
    JOIN TRAINS TR ON TR.TRAIN_ID = T.TRAIN_ID
    JOIN ROUTES R ON R.ROUTE_ID = T.ROUTE_ID
    JOIN STATIONS SRC ON SRC.STATION_ID = B.SOURCE_STATION_ID
    JOIN STATIONS DST ON DST.STATION_ID = B.DESTINATION_STATION_ID
    JOIN CLASS_TYPES CT ON CT.CLASS_ID = B.CLASS_ID
    LEFT JOIN PASSENGERS P ON P.BOOKING_ID = B.BOOKING_ID
    LEFT JOIN SEAT_RESERVATIONS SR ON SR.PASSENGER_ID = P.PASSENGER_ID
    LEFT JOIN TRIP_SEATS TS ON TS.TRIP_SEAT_ID = SR.TRIP_SEAT_ID
    LEFT JOIN SEATS S ON S.SEAT_ID = TS.SEAT_ID
    LEFT JOIN COACHES C ON C.COACH_ID = S.COACH_ID
    LEFT JOIN TICKETS TK ON TK.PASSENGER_ID = P.PASSENGER_ID
    LEFT JOIN REFUNDS RF ON RF.TICKET_ID = TK.TICKET_ID
    LEFT JOIN VW_LIVE_TRAIN_STATUS L ON L.TRIP_ID = T.TRIP_ID
    WHERE B.PNR_NUMBER = p_pnr_number
    ORDER BY P.PASSENGER_ID;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE PROCEDURE create_booking_with_seat_hold(
    p_user_id INT,
    p_pnr_number VARCHAR,
    p_trip_id INT,
    p_source_station_id INT,
    p_destination_station_id INT,
    p_class_id INT,
    p_passengers JSONB,
    p_hold_minutes INT DEFAULT 10
) AS $$
DECLARE
    v_source_sequence INT;
    v_destination_sequence INT;
    v_fare NUMERIC(10,2);
    v_booking_id INT;
    v_passenger JSONB;
    v_seat RECORD;
    v_passenger_id INT;
BEGIN
    IF p_passengers IS NULL OR jsonb_typeof(p_passengers) <> 'array'
       OR jsonb_array_length(p_passengers) = 0 THEN
        RAISE EXCEPTION 'At least one passenger is required';
    END IF;
    IF p_hold_minutes < 1 THEN
        RAISE EXCEPTION 'Hold duration must be positive';
    END IF;

    SELECT SRC.STOP_SEQUENCE, DST.STOP_SEQUENCE
    INTO v_source_sequence, v_destination_sequence
    FROM TRIP_STOPS SRC
    JOIN TRIP_STOPS DST ON DST.TRIP_ID = SRC.TRIP_ID
    WHERE SRC.TRIP_ID = p_trip_id
      AND SRC.STATION_ID = p_source_station_id
      AND DST.STATION_ID = p_destination_station_id
      AND SRC.STOP_SEQUENCE < DST.STOP_SEQUENCE;
    IF v_source_sequence IS NULL THEN
        RAISE EXCEPTION 'Invalid journey segment for trip %', p_trip_id;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(p_passengers) P
        GROUP BY (P->>'tripSeatId')::INT
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'The same seat cannot be selected twice';
    END IF;

    PERFORM TS.TRIP_SEAT_ID
    FROM TRIP_SEATS TS
    WHERE TS.TRIP_SEAT_ID IN (
        SELECT (P->>'tripSeatId')::INT FROM jsonb_array_elements(p_passengers) P
    )
    ORDER BY TS.TRIP_SEAT_ID
    FOR UPDATE OF TS;

    v_fare := calculate_ticket_fare(
        p_trip_id, p_source_station_id, p_destination_station_id, p_class_id
    );
    INSERT INTO BOOKINGS
        (PNR_NUMBER, USER_ID, TRIP_ID, SOURCE_STATION_ID, DESTINATION_STATION_ID,
         CLASS_ID, TOTAL_FARE, BOOKING_STATUS)
    VALUES
        (p_pnr_number, p_user_id, p_trip_id, p_source_station_id,
         p_destination_station_id, p_class_id,
         v_fare * jsonb_array_length(p_passengers), 'PENDING')
    RETURNING BOOKING_ID INTO v_booking_id;

    FOR v_passenger IN SELECT VALUE FROM jsonb_array_elements(p_passengers)
    LOOP
        IF NULLIF(v_passenger->>'name', '') IS NULL
           OR COALESCE((v_passenger->>'age')::INT, 0) NOT BETWEEN 1 AND 120
           OR UPPER(COALESCE(v_passenger->>'gender', '')) NOT IN ('MALE','FEMALE','OTHER')
           OR COALESCE((v_passenger->>'tripSeatId')::INT, 0) < 1 THEN
            RAISE EXCEPTION 'Passenger details or seat ID are invalid';
        END IF;

        SELECT TS.TRIP_SEAT_ID, TS.TRIP_ID, TS.SEAT_STATUS, C.CLASS_ID
        INTO v_seat
        FROM TRIP_SEATS TS
        JOIN SEATS S ON S.SEAT_ID = TS.SEAT_ID
        JOIN COACHES C ON C.COACH_ID = S.COACH_ID
        WHERE TS.TRIP_SEAT_ID = (v_passenger->>'tripSeatId')::INT
        FOR UPDATE OF TS;
          IF NOT FOUND THEN
                RAISE EXCEPTION 'Seat % does not exist', v_passenger->>'tripSeatId';
          END IF;
          IF v_seat.TRIP_ID <> p_trip_id OR v_seat.SEAT_STATUS <> 'AVAILABLE'
              OR v_seat.CLASS_ID <> p_class_id THEN
            RAISE EXCEPTION 'Seat % is unavailable or belongs to another class',
                v_passenger->>'tripSeatId';
        END IF;

        INSERT INTO PASSENGERS (BOOKING_ID, PASSENGER_NAME, AGE, GENDER)
        VALUES (v_booking_id, v_passenger->>'name',
                (v_passenger->>'age')::INT, UPPER(v_passenger->>'gender'))
        RETURNING PASSENGER_ID INTO v_passenger_id;

        INSERT INTO SEAT_RESERVATIONS
            (BOOKING_ID, PASSENGER_ID, TRIP_SEAT_ID, SOURCE_STATION_ID,
             DESTINATION_STATION_ID, SOURCE_STOP_SEQUENCE, DESTINATION_STOP_SEQUENCE,
             RESERVATION_STATUS, HELD_AT, HOLD_EXPIRES_AT)
        VALUES
            (v_booking_id, v_passenger_id, v_seat.TRIP_SEAT_ID,
             p_source_station_id, p_destination_station_id,
             v_source_sequence, v_destination_sequence, 'HELD', CURRENT_TIMESTAMP,
             CURRENT_TIMESTAMP + make_interval(mins => p_hold_minutes));
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE expire_stale_seat_holds()
AS $$
DECLARE
    v_booking_ids INT[];
BEGIN
    WITH expired AS (
        UPDATE SEAT_RESERVATIONS
        SET RESERVATION_STATUS = 'EXPIRED'
        WHERE RESERVATION_STATUS = 'HELD'
          AND HOLD_EXPIRES_AT <= CURRENT_TIMESTAMP
        RETURNING BOOKING_ID
    )
    SELECT ARRAY_AGG(DISTINCT BOOKING_ID) INTO v_booking_ids FROM expired;

    IF COALESCE(CARDINALITY(v_booking_ids), 0) = 0 THEN
        RETURN;
    END IF;

    UPDATE SEAT_RESERVATIONS
    SET RESERVATION_STATUS = 'EXPIRED'
    WHERE BOOKING_ID = ANY(v_booking_ids)
      AND RESERVATION_STATUS = 'HELD';

    UPDATE BOOKINGS
    SET BOOKING_STATUS = 'CANCELLED'
    WHERE BOOKING_ID = ANY(v_booking_ids)
      AND BOOKING_STATUS = 'PENDING';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE generate_scheduled_trips(p_days_ahead INT)
AS $$
DECLARE
    v_date DATE;
    v_route RECORD;
    v_stop RECORD;
    v_trip_id INT;
    v_day_code VARCHAR(3);
    v_sched_dep TIMESTAMP;
    v_sched_arr TIMESTAMP;
    v_stop_arr TIMESTAMP;
    v_stop_dep TIMESTAMP;
    v_window_start TIMESTAMP;
    v_window_end TIMESTAMP;
BEGIN
    IF p_days_ahead < 1 THEN
        RAISE EXCEPTION 'p_days_ahead must be positive';
    END IF;

    v_window_start := CASE
        WHEN CURRENT_TIME < TIME '08:00'
        THEN CURRENT_DATE - INTERVAL '1 day' + INTERVAL '8 hours'
        ELSE CURRENT_DATE + INTERVAL '8 hours'
    END;
    v_window_end := v_window_start + make_interval(days => p_days_ahead);

    FOR v_date IN
        SELECT GENERATE_SERIES(CURRENT_DATE, CURRENT_DATE + p_days_ahead, INTERVAL '1 day')::DATE
    LOOP
        v_day_code := UPPER(TRIM(TO_CHAR(v_date, 'Dy')));
        FOR v_route IN
            SELECT R.ROUTE_ID, R.TRAIN_ID, RD.DEPARTURE_MINUTE
            FROM ROUTES R
            JOIN TRAIN_RUNNING_DAYS RD ON RD.ROUTE_ID = R.ROUTE_ID
            WHERE R.IS_ACTIVE = 1 AND RD.DAY_CODE = v_day_code
        LOOP
            v_sched_dep := v_date + MAKE_INTERVAL(mins => v_route.DEPARTURE_MINUTE);
            IF v_sched_dep < v_window_start OR v_sched_dep >= v_window_end THEN
                CONTINUE;
            END IF;

            SELECT v_sched_dep + MAKE_INTERVAL(mins => MAX(COALESCE(ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN)))
            INTO v_sched_arr
            FROM ROUTE_STOPS
            WHERE ROUTE_ID = v_route.ROUTE_ID;

            INSERT INTO TRIPS
                (TRAIN_ID, ROUTE_ID, JOURNEY_DATE, SCHEDULED_DEPARTURE, SCHEDULED_ARRIVAL, TRIP_STATUS)
            VALUES
                (v_route.TRAIN_ID, v_route.ROUTE_ID, DATE(v_sched_dep), v_sched_dep, v_sched_arr, 'SCHEDULED')
            ON CONFLICT ON CONSTRAINT UQ_TRIP_ROUTE_DEPARTURE DO NOTHING
            RETURNING TRIP_ID INTO v_trip_id;

            IF v_trip_id IS NULL THEN
                SELECT TRIP_ID INTO v_trip_id
                FROM TRIPS
                WHERE ROUTE_ID = v_route.ROUTE_ID
                  AND SCHEDULED_DEPARTURE = v_sched_dep;
            END IF;

            FOR v_stop IN
                SELECT ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE,
                       ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN
                FROM ROUTE_STOPS
                WHERE ROUTE_ID = v_route.ROUTE_ID
                ORDER BY STOP_SEQUENCE
            LOOP
                v_stop_arr := CASE WHEN v_stop.ARRIVAL_OFFSET_MIN IS NULL THEN NULL
                    ELSE v_sched_dep + MAKE_INTERVAL(mins => v_stop.ARRIVAL_OFFSET_MIN) END;
                v_stop_dep := CASE WHEN v_stop.DEPARTURE_OFFSET_MIN IS NULL THEN NULL
                    ELSE v_sched_dep + MAKE_INTERVAL(mins => v_stop.DEPARTURE_OFFSET_MIN) END;

                INSERT INTO TRIP_STOPS
                    (TRIP_ID, ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE,
                     SCHEDULED_ARRIVAL, SCHEDULED_DEPARTURE, STOP_STATUS)
                VALUES
                    (v_trip_id, v_stop.ROUTE_STOP_ID, v_stop.STATION_ID, v_stop.STOP_SEQUENCE,
                     v_stop_arr, v_stop_dep, 'UPCOMING')
                ON CONFLICT (TRIP_ID, STOP_SEQUENCE) DO NOTHING;
            END LOOP;

            INSERT INTO TRIP_SEATS (TRIP_ID, SEAT_ID, SEAT_STATUS)
            SELECT v_trip_id, S.SEAT_ID, 'AVAILABLE'
            FROM SEATS S
            JOIN COACHES C ON C.COACH_ID = S.COACH_ID
            WHERE C.TRAIN_ID = v_route.TRAIN_ID
              AND LOWER(S.IS_ACTIVE::TEXT) IN ('1','true','t')
            ON CONFLICT (TRIP_ID, SEAT_ID) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE process_cancellation_request(
    p_request_id INT,
    p_admin_user_id INT,
    p_decision VARCHAR
) AS $$
DECLARE
    v_request CANCELLATION_REQUESTS%ROWTYPE;
    v_booking BOOKINGS%ROWTYPE;
    v_decision VARCHAR(10);
BEGIN
    v_decision := UPPER(p_decision);
    IF v_decision NOT IN ('APPROVED','REJECTED') THEN
        RAISE EXCEPTION 'Decision must be APPROVED or REJECTED';
    END IF;

    SELECT * INTO v_request
    FROM CANCELLATION_REQUESTS
    WHERE CANCELLATION_REQUEST_ID = p_request_id
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cancellation request % not found', p_request_id;
    END IF;
    IF v_request.REQUEST_STATUS <> 'REQUESTED' THEN
        RAISE EXCEPTION 'Cancellation request has already been reviewed';
    END IF;

    SELECT * INTO v_booking FROM BOOKINGS
    WHERE BOOKING_ID = v_request.BOOKING_ID FOR UPDATE;
    IF NOT FOUND OR v_booking.BOOKING_STATUS <> 'CONFIRMED' THEN
        RAISE EXCEPTION 'Booking is no longer eligible for cancellation review';
    END IF;

    UPDATE CANCELLATION_REQUESTS
    SET REQUEST_STATUS = v_decision,
        DECIDED_BY = p_admin_user_id,
        DECIDED_AT = CURRENT_TIMESTAMP
    WHERE CANCELLATION_REQUEST_ID = p_request_id;

    IF v_decision = 'APPROVED' THEN
        CALL cancel_booking_workflow(v_request.BOOKING_ID, v_request.REFUND_PERCENT);
        INSERT INTO NOTIFICATIONS (USER_ID, BOOKING_ID, TRIP_ID, TITLE, MESSAGE)
        VALUES (
            v_request.REQUESTED_BY, v_request.BOOKING_ID, v_booking.TRIP_ID,
            'Cancellation approved',
            'Cancellation for booking ' || v_booking.PNR_NUMBER ||
            ' was approved. Refund of ' || v_request.REFUND_AMOUNT || ' is being processed.'
        );
    ELSE
        INSERT INTO NOTIFICATIONS (USER_ID, BOOKING_ID, TRIP_ID, TITLE, MESSAGE)
        VALUES (
            v_request.REQUESTED_BY, v_request.BOOKING_ID, v_booking.TRIP_ID,
            'Cancellation declined',
            'Cancellation for booking ' || v_booking.PNR_NUMBER ||
            ' was declined. Your booking remains confirmed.'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS cancel_booking_workflow(INT);
DROP PROCEDURE IF EXISTS cancel_booking_workflow(INT, NUMERIC);
CREATE PROCEDURE cancel_booking_workflow(
    p_booking_id INT,
    p_refund_percent NUMERIC DEFAULT 100
) AS $$
DECLARE
    v_booking_status VARCHAR(12);
    v_payment_id INT;
BEGIN
    IF p_refund_percent < 0 OR p_refund_percent > 100 THEN
        RAISE EXCEPTION 'Refund percent must be between 0 and 100';
    END IF;

    SELECT BOOKING_STATUS INTO v_booking_status
    FROM BOOKINGS WHERE BOOKING_ID = p_booking_id FOR UPDATE;
    IF v_booking_status IS NULL THEN
        RAISE EXCEPTION 'Booking % not found', p_booking_id;
    END IF;
    IF v_booking_status NOT IN ('PENDING','CONFIRMED') THEN
        RAISE EXCEPTION 'Booking % cannot be cancelled from status %', p_booking_id, v_booking_status;
    END IF;

    IF v_booking_status = 'CONFIRMED' THEN
        SELECT PAYMENT_ID INTO v_payment_id
        FROM PAYMENTS
        WHERE BOOKING_ID = p_booking_id AND PAYMENT_STATUS = 'SUCCESSFUL'
        ORDER BY PAYMENT_TIME DESC
        LIMIT 1;

        IF v_payment_id IS NOT NULL THEN
            INSERT INTO REFUNDS (PAYMENT_ID, TICKET_ID, REFUND_AMOUNT, REFUND_STATUS)
            SELECT v_payment_id, TK.TICKET_ID,
                   ROUND(TK.TICKET_FARE * p_refund_percent / 100, 2), 'REQUESTED'
            FROM PASSENGERS P
            JOIN TICKETS TK ON TK.PASSENGER_ID = P.PASSENGER_ID
            LEFT JOIN REFUNDS RF ON RF.TICKET_ID = TK.TICKET_ID
            WHERE P.BOOKING_ID = p_booking_id
              AND TK.TICKET_STATUS = 'CONFIRMED'
              AND RF.REFUND_ID IS NULL
              AND ROUND(TK.TICKET_FARE * p_refund_percent / 100, 2) > 0;
        END IF;
    END IF;

    UPDATE BOOKINGS SET BOOKING_STATUS = 'CANCELLED'
    WHERE BOOKING_ID = p_booking_id
      AND BOOKING_STATUS IN ('PENDING','CONFIRMED');
    UPDATE SEAT_RESERVATIONS SET RESERVATION_STATUS = 'CANCELLED'
    WHERE BOOKING_ID = p_booking_id AND RESERVATION_STATUS IN ('HELD','BOOKED');
    UPDATE TICKETS SET TICKET_STATUS = 'CANCELLED'
    WHERE PASSENGER_ID IN (SELECT PASSENGER_ID FROM PASSENGERS WHERE BOOKING_ID = p_booking_id)
      AND TICKET_STATUS = 'CONFIRMED';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_no_overlapping_reservation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.RESERVATION_STATUS IN ('HELD','BOOKED') THEN
        PERFORM 1 FROM TRIP_SEATS WHERE TRIP_SEAT_ID = NEW.TRIP_SEAT_ID FOR UPDATE;
        IF EXISTS (
            SELECT 1 FROM SEAT_RESERVATIONS SR
            WHERE SR.TRIP_SEAT_ID = NEW.TRIP_SEAT_ID
              AND SR.RESERVATION_ID <> COALESCE(NEW.RESERVATION_ID, -1)
              AND SR.RESERVATION_STATUS IN ('HELD','BOOKED')
              AND (SR.RESERVATION_STATUS <> 'HELD'
                   OR SR.HOLD_EXPIRES_AT > CURRENT_TIMESTAMP)
              AND NEW.SOURCE_STOP_SEQUENCE < SR.DESTINATION_STOP_SEQUENCE
              AND NEW.DESTINATION_STOP_SEQUENCE > SR.SOURCE_STOP_SEQUENCE
        ) THEN
            RAISE EXCEPTION 'Seat is already reserved for an overlapping route segment';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS TRG_NO_OVERLAPPING_RESERVATION ON SEAT_RESERVATIONS;
CREATE TRIGGER TRG_NO_OVERLAPPING_RESERVATION
BEFORE INSERT OR UPDATE OF TRIP_SEAT_ID, SOURCE_STOP_SEQUENCE,
    DESTINATION_STOP_SEQUENCE, RESERVATION_STATUS, HOLD_EXPIRES_AT
ON SEAT_RESERVATIONS FOR EACH ROW
EXECUTE FUNCTION validate_no_overlapping_reservation();

CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.UPDATED_AT := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS TRG_USERS_UPDATED_AT ON USERS;
CREATE TRIGGER TRG_USERS_UPDATED_AT
BEFORE UPDATE ON USERS FOR EACH ROW EXECUTE FUNCTION update_user_timestamp();

CREATE OR REPLACE FUNCTION update_trainset_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.STATUS IS DISTINCT FROM OLD.STATUS
       OR NEW.CURRENT_STATION_ID IS DISTINCT FROM OLD.CURRENT_STATION_ID THEN
        NEW.STATUS_UPDATED_AT := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS TRG_TRAINSETS_STATUS_UPDATED_AT ON TRAINSETS;
CREATE TRIGGER TRG_TRAINSETS_STATUS_UPDATED_AT
BEFORE UPDATE ON TRAINSETS FOR EACH ROW EXECUTE FUNCTION update_trainset_timestamp();

CREATE OR REPLACE FUNCTION issue_tickets_after_successful_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_reservation_count INT;
BEGIN
    IF NEW.PAYMENT_STATUS <> 'SUCCESSFUL'
       OR (TG_OP = 'UPDATE' AND OLD.PAYMENT_STATUS = 'SUCCESSFUL') THEN
        RETURN NEW;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM BOOKINGS
        WHERE BOOKING_ID = NEW.BOOKING_ID AND BOOKING_STATUS = 'PENDING'
    ) THEN
        RAISE EXCEPTION 'Payment can only confirm a pending booking';
    END IF;

    SELECT COUNT(*) INTO v_reservation_count
    FROM SEAT_RESERVATIONS
    WHERE BOOKING_ID = NEW.BOOKING_ID AND RESERVATION_STATUS = 'HELD'
      AND HOLD_EXPIRES_AT > CURRENT_TIMESTAMP;
    IF v_reservation_count = 0 OR EXISTS (
        SELECT 1 FROM SEAT_RESERVATIONS
        WHERE BOOKING_ID = NEW.BOOKING_ID AND RESERVATION_STATUS = 'HELD'
          AND (HOLD_EXPIRES_AT IS NULL OR HOLD_EXPIRES_AT <= CURRENT_TIMESTAMP)
    ) THEN
        RAISE EXCEPTION 'Booking has no complete set of active seat holds';
    END IF;

    UPDATE BOOKINGS SET BOOKING_STATUS = 'CONFIRMED' WHERE BOOKING_ID = NEW.BOOKING_ID;
    UPDATE SEAT_RESERVATIONS
    SET RESERVATION_STATUS = 'BOOKED', BOOKED_AT = CURRENT_TIMESTAMP
    WHERE BOOKING_ID = NEW.BOOKING_ID AND RESERVATION_STATUS = 'HELD';

    INSERT INTO TICKETS (PASSENGER_ID, RESERVATION_ID, TICKET_FARE, TICKET_STATUS)
    SELECT SR.PASSENGER_ID, SR.RESERVATION_ID,
           ROUND(B.TOTAL_FARE / v_reservation_count, 2), 'CONFIRMED'
    FROM SEAT_RESERVATIONS SR
    JOIN BOOKINGS B ON B.BOOKING_ID = SR.BOOKING_ID
    WHERE SR.BOOKING_ID = NEW.BOOKING_ID AND SR.RESERVATION_STATUS = 'BOOKED'
    ON CONFLICT (PASSENGER_ID) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS TRG_PAYMENT_ISSUE_TICKETS ON PAYMENTS;
CREATE TRIGGER TRG_PAYMENT_ISSUE_TICKETS
AFTER INSERT OR UPDATE OF PAYMENT_STATUS ON PAYMENTS
FOR EACH ROW EXECUTE FUNCTION issue_tickets_after_successful_payment();

CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.BOOKING_STATUS IS NOT DISTINCT FROM OLD.BOOKING_STATUS
       OR NEW.BOOKING_STATUS NOT IN ('CONFIRMED','CANCELLED') THEN
        RETURN NEW;
    END IF;
    IF NEW.BOOKING_STATUS = 'CANCELLED' AND EXISTS (
        SELECT 1 FROM TRIPS WHERE TRIP_ID = NEW.TRIP_ID AND TRIP_STATUS = 'CANCELLED'
    ) THEN
        RETURN NEW;
    END IF;
    INSERT INTO NOTIFICATIONS (USER_ID, BOOKING_ID, TRIP_ID, TITLE, MESSAGE)
    VALUES (
        NEW.USER_ID, NEW.BOOKING_ID, NEW.TRIP_ID,
        CASE NEW.BOOKING_STATUS WHEN 'CONFIRMED' THEN 'Booking confirmed' ELSE 'Booking cancelled' END,
        CASE NEW.BOOKING_STATUS
            WHEN 'CONFIRMED' THEN 'Your booking ' || NEW.PNR_NUMBER || ' is confirmed and your e-ticket is ready.'
            ELSE 'Your booking ' || NEW.PNR_NUMBER || ' was cancelled and its seat reservation was released.'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS TRG_BOOKING_STATUS_NOTIFICATION ON BOOKINGS;
CREATE TRIGGER TRG_BOOKING_STATUS_NOTIFICATION
AFTER UPDATE OF BOOKING_STATUS ON BOOKINGS
FOR EACH ROW EXECUTE FUNCTION notify_booking_status_change();

CREATE OR REPLACE FUNCTION notify_trip_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.TRIP_STATUS IS NOT DISTINCT FROM OLD.TRIP_STATUS
       OR NEW.TRIP_STATUS NOT IN ('DELAYED','CANCELLED') THEN
        RETURN NEW;
    END IF;
    INSERT INTO NOTIFICATIONS (USER_ID, BOOKING_ID, TRIP_ID, TITLE, MESSAGE)
    SELECT DISTINCT B.USER_ID, NULL::INT, NEW.TRIP_ID,
           CASE NEW.TRIP_STATUS WHEN 'DELAYED' THEN 'Trip delayed' ELSE 'Trip cancelled' END,
           CASE NEW.TRIP_STATUS
               WHEN 'DELAYED' THEN 'Trip #' || NEW.TRIP_ID || ' is delayed. Check live train status for updates.'
               ELSE 'Trip #' || NEW.TRIP_ID || ' has been cancelled. Contact support for booking assistance.'
           END
    FROM BOOKINGS B
    WHERE B.TRIP_ID = NEW.TRIP_ID
      AND B.BOOKING_STATUS IN ('PENDING','CONFIRMED');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS TRG_TRIP_STATUS_NOTIFICATION ON TRIPS;
CREATE TRIGGER TRG_TRIP_STATUS_NOTIFICATION
AFTER UPDATE OF TRIP_STATUS ON TRIPS
FOR EACH ROW EXECUTE FUNCTION notify_trip_status_change();

CREATE OR REPLACE FUNCTION sync_trip_stop_operations()
RETURNS TRIGGER AS $$
DECLARE
    v_trip TRIPS%ROWTYPE;
    v_assignment TRAINSET_ASSIGNMENTS%ROWTYPE;
    v_next_trip TRIPS%ROWTYPE;
    v_route ROUTES%ROWTYPE;
    v_spare TRAINSETS%ROWTYPE;
    v_existing TRAINSET_ASSIGNMENTS%ROWTYPE;
    v_delay_minutes INT;
BEGIN
    IF NEW.STOP_STATUS = 'DEPARTED' AND NEW.ACTUAL_DEPARTURE IS NOT NULL
       AND (OLD.STOP_STATUS IS DISTINCT FROM NEW.STOP_STATUS
            OR OLD.ACTUAL_DEPARTURE IS DISTINCT FROM NEW.ACTUAL_DEPARTURE) THEN
        SELECT * INTO v_trip FROM TRIPS WHERE TRIP_ID = NEW.TRIP_ID FOR UPDATE;
        IF NEW.STOP_SEQUENCE = 1 THEN
            UPDATE TRIPS
            SET ACTUAL_DEPARTURE = COALESCE(ACTUAL_DEPARTURE, NEW.ACTUAL_DEPARTURE),
                TRIP_STATUS = CASE WHEN TRIP_STATUS IN ('COMPLETED','CANCELLED')
                    THEN TRIP_STATUS ELSE 'RUNNING' END
            WHERE TRIP_ID = NEW.TRIP_ID;

            UPDATE TRAINSET_ASSIGNMENTS
            SET ASSIGNMENT_STATUS = 'ACTIVE',
                ACTIVATED_AT = COALESCE(ACTIVATED_AT, CURRENT_TIMESTAMP)
            WHERE TRIP_ID = NEW.TRIP_ID AND ASSIGNMENT_STATUS = 'RESERVED'
            RETURNING * INTO v_assignment;
            IF FOUND THEN
                UPDATE TRAINSETS SET STATUS = 'ACTIVE', CURRENT_STATION_ID = NULL
                WHERE TRAINSET_ID = v_assignment.TRAINSET_ID;
            END IF;
        END IF;

        SELECT * INTO v_route FROM ROUTES WHERE ROUTE_ID = v_trip.ROUTE_ID;
        v_delay_minutes := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM
            (NEW.ACTUAL_DEPARTURE - NEW.SCHEDULED_DEPARTURE)) / 60)::INT);
        IF v_delay_minutes >= (
            SELECT TR.SPARE_TRIGGER_DELAY_MIN
            FROM TRIPS T JOIN TRAINS TR ON TR.TRAIN_ID = T.TRAIN_ID
            WHERE T.TRIP_ID = NEW.TRIP_ID
        ) AND v_trip.SPARE_TRIGGERED_AT IS NULL THEN
            UPDATE TRIPS
            SET TRIP_STATUS = CASE WHEN TRIP_STATUS = 'CANCELLED' THEN TRIP_STATUS ELSE 'DELAYED' END,
                SPARE_TRIGGERED_AT = CURRENT_TIMESTAMP
            WHERE TRIP_ID = NEW.TRIP_ID;

            SELECT NEXT_T.* INTO v_next_trip
            FROM TRIPS NEXT_T
            JOIN ROUTES NEXT_R ON NEXT_R.ROUTE_ID = NEXT_T.ROUTE_ID
            JOIN ROUTES THIS_R ON THIS_R.ROUTE_ID = v_trip.ROUTE_ID
            WHERE NEXT_T.TRAIN_ID = v_trip.TRAIN_ID
              AND NEXT_R.DIRECTION <> THIS_R.DIRECTION
              AND NEXT_R.SOURCE_STATION_ID = THIS_R.DESTINATION_STATION_ID
              AND NEXT_T.SCHEDULED_DEPARTURE > v_trip.SCHEDULED_DEPARTURE
              AND NEXT_T.TRIP_STATUS IN ('SCHEDULED','BOARDING')
            ORDER BY NEXT_T.SCHEDULED_DEPARTURE
            LIMIT 1 FOR UPDATE OF NEXT_T;

                        IF FOUND THEN
                                SELECT * INTO v_existing FROM TRAINSET_ASSIGNMENTS
                                WHERE TRIP_ID = v_next_trip.TRIP_ID
                                    AND ASSIGNMENT_STATUS IN ('RESERVED','ACTIVE')
                                LIMIT 1 FOR UPDATE;

                                IF FOUND AND v_existing.ASSIGNMENT_TYPE = 'NORMAL'
                                     AND v_existing.ASSIGNMENT_STATUS = 'RESERVED' THEN
                                        UPDATE TRAINSET_ASSIGNMENTS
                                        SET ASSIGNMENT_STATUS = 'CANCELLED',
                                                REASON = COALESCE(REASON || '; ', '') ||
                                                        'Replaced by spare after delay on trip ' || NEW.TRIP_ID
                                        WHERE ASSIGNMENT_ID = v_existing.ASSIGNMENT_ID;
                                        UPDATE TRAINSETS
                                        SET STATUS = 'SPARE', CURRENT_STATION_ID = v_route.DESTINATION_STATION_ID
                                        WHERE TRAINSET_ID = v_existing.TRAINSET_ID;
                                END IF;

                                IF NOT FOUND OR v_existing.ASSIGNMENT_TYPE = 'NORMAL'
                                     AND v_existing.ASSIGNMENT_STATUS = 'RESERVED' THEN
                SELECT * INTO v_spare FROM TRAINSETS
                WHERE TRAIN_ID = v_trip.TRAIN_ID
                                    AND CURRENT_STATION_ID = v_route.DESTINATION_STATION_ID
                  AND STATUS = 'SPARE'
                ORDER BY TRAINSET_ID
                LIMIT 1 FOR UPDATE SKIP LOCKED;
                IF FOUND THEN
                    INSERT INTO TRAINSET_ASSIGNMENTS
                        (TRIP_ID, TRAINSET_ID, TRAIN_ID, ASSIGNMENT_TYPE, ASSIGNMENT_STATUS, REASON)
                    VALUES
                        (v_next_trip.TRIP_ID, v_spare.TRAINSET_ID, v_trip.TRAIN_ID,
                         'SPARE_REPLACEMENT', 'RESERVED',
                         'Previous trip ' || NEW.TRIP_ID || ' crossed the delay threshold');
                    UPDATE TRAINSETS
                    SET STATUS = 'RESERVED', CURRENT_STATION_ID = v_route.DESTINATION_STATION_ID
                    WHERE TRAINSET_ID = v_spare.TRAINSET_ID;
                END IF;
                END IF;
            END IF;
        END IF;
    END IF;

    IF NEW.STOP_STATUS = 'ARRIVED' AND NEW.ACTUAL_ARRIVAL IS NOT NULL
       AND (OLD.STOP_STATUS IS DISTINCT FROM NEW.STOP_STATUS
            OR OLD.ACTUAL_ARRIVAL IS DISTINCT FROM NEW.ACTUAL_ARRIVAL)
       AND NOT EXISTS (
           SELECT 1 FROM TRIP_STOPS
           WHERE TRIP_ID = NEW.TRIP_ID AND STOP_SEQUENCE > NEW.STOP_SEQUENCE
       ) THEN
        UPDATE TRIPS
        SET ACTUAL_ARRIVAL = COALESCE(ACTUAL_ARRIVAL, NEW.ACTUAL_ARRIVAL),
            TRIP_STATUS = 'COMPLETED'
        WHERE TRIP_ID = NEW.TRIP_ID;

        UPDATE TRAINSET_ASSIGNMENTS
        SET ASSIGNMENT_STATUS = 'COMPLETED', COMPLETED_AT = CURRENT_TIMESTAMP
        WHERE TRIP_ID = NEW.TRIP_ID AND ASSIGNMENT_STATUS = 'ACTIVE'
        RETURNING * INTO v_assignment;
        IF FOUND THEN
            SELECT * INTO v_trip FROM TRIPS WHERE TRIP_ID = NEW.TRIP_ID;
            SELECT * INTO v_route FROM ROUTES WHERE ROUTE_ID = v_trip.ROUTE_ID;
            IF v_trip.SPARE_TRIGGERED_AT IS NULL THEN
                SELECT NEXT_T.* INTO v_next_trip
                FROM TRIPS NEXT_T
                JOIN ROUTES NEXT_R ON NEXT_R.ROUTE_ID = NEXT_T.ROUTE_ID
                WHERE NEXT_T.TRAIN_ID = v_trip.TRAIN_ID
                  AND NEXT_R.DIRECTION <> v_route.DIRECTION
                  AND NEXT_R.SOURCE_STATION_ID = v_route.DESTINATION_STATION_ID
                  AND NEXT_T.SCHEDULED_DEPARTURE > v_trip.SCHEDULED_DEPARTURE
                  AND NEXT_T.TRIP_STATUS IN ('SCHEDULED','BOARDING')
                ORDER BY NEXT_T.SCHEDULED_DEPARTURE
                LIMIT 1;
                IF FOUND AND NOT EXISTS (
                    SELECT 1 FROM TRAINSET_ASSIGNMENTS
                    WHERE TRIP_ID = v_next_trip.TRIP_ID
                      AND ASSIGNMENT_STATUS IN ('RESERVED','ACTIVE')
                ) THEN
                    INSERT INTO TRAINSET_ASSIGNMENTS
                        (TRIP_ID, TRAINSET_ID, TRAIN_ID, ASSIGNMENT_TYPE, ASSIGNMENT_STATUS, REASON)
                    VALUES
                        (v_next_trip.TRIP_ID, v_assignment.TRAINSET_ID, v_trip.TRAIN_ID,
                         'NORMAL', 'RESERVED', 'Normal rotation after trip ' || NEW.TRIP_ID);
                    UPDATE TRAINSETS
                    SET STATUS = 'RESERVED', CURRENT_STATION_ID = NEW.STATION_ID
                    WHERE TRAINSET_ID = v_assignment.TRAINSET_ID;
                ELSE
                    UPDATE TRAINSETS
                    SET STATUS = 'SPARE', CURRENT_STATION_ID = NEW.STATION_ID
                    WHERE TRAINSET_ID = v_assignment.TRAINSET_ID;
                END IF;
            ELSE
                UPDATE TRAINSETS
                SET STATUS = 'SPARE', CURRENT_STATION_ID = NEW.STATION_ID
                WHERE TRAINSET_ID = v_assignment.TRAINSET_ID;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS TRG_SYNC_TRIP_STOP_OPERATIONS ON TRIP_STOPS;
CREATE TRIGGER TRG_SYNC_TRIP_STOP_OPERATIONS
AFTER UPDATE OF ACTUAL_DEPARTURE, STOP_STATUS, ACTUAL_ARRIVAL ON TRIP_STOPS
FOR EACH ROW EXECUTE FUNCTION sync_trip_stop_operations();
