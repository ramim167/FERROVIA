-- ============================================================
-- FERROVIA REQUIRED DATABASE FEATURES
-- Function, procedure and trigger for CSE216 evaluation.
-- Run this file after schema.sql on an existing PostgreSQL/Supabase database.
-- ============================================================

-- FUNCTION: fare calculation for a passenger journey segment.
CREATE OR REPLACE FUNCTION calculate_ticket_fare(
    p_trip_id INT,
    p_source_station_id INT,
    p_destination_station_id INT,
    p_class_id INT
) RETURNS NUMERIC(10,2) AS $$
DECLARE
    v_train_id INT;
    v_source_distance NUMERIC(10,2);
    v_destination_distance NUMERIC(10,2);
    v_distance NUMERIC(10,2);
    v_rate NUMERIC(10,6);
    v_base NUMERIC(10,2);
    v_raw_fare NUMERIC(10,2);
BEGIN
    SELECT
        T.TRAIN_ID,
        RSRC.DISTANCE_FROM_SOURCE_KM,
        RDST.DISTANCE_FROM_SOURCE_KM
    INTO
        v_train_id,
        v_source_distance,
        v_destination_distance
    FROM TRIP_STOPS SRC
    JOIN TRIP_STOPS DST
        ON DST.TRIP_ID = SRC.TRIP_ID
    JOIN ROUTE_STOPS RSRC
        ON RSRC.ROUTE_STOP_ID = SRC.ROUTE_STOP_ID
    JOIN ROUTE_STOPS RDST
        ON RDST.ROUTE_STOP_ID = DST.ROUTE_STOP_ID
    JOIN TRIPS T
        ON T.TRIP_ID = SRC.TRIP_ID
    WHERE SRC.TRIP_ID = p_trip_id
      AND SRC.STATION_ID = p_source_station_id
      AND DST.STATION_ID = p_destination_station_id
      AND SRC.STOP_SEQUENCE < DST.STOP_SEQUENCE;

    IF v_train_id IS NULL THEN
        RAISE EXCEPTION 'Invalid journey segment for trip %', p_trip_id;
    END IF;

    v_distance := v_destination_distance - v_source_distance;

    IF v_distance <= 0 THEN
        RAISE EXCEPTION 'Invalid route distance for trip %', p_trip_id;
    END IF;

    SELECT RATE_PER_KM, BASE_FARE
    INTO v_rate, v_base
    FROM FARE_RULES
    WHERE TRAIN_ID = v_train_id
      AND CLASS_ID = p_class_id;

    IF v_rate IS NULL THEN
        RAISE EXCEPTION 'No fare rule for train % and class %', v_train_id, p_class_id;
    END IF;

    v_raw_fare := ROUND((v_base + (v_distance * v_rate))::NUMERIC, 2);

    RETURN CEIL(v_raw_fare / 10) * 10;
END;
$$ LANGUAGE plpgsql STABLE;


-- PROCEDURE: complete the multi-table cancellation workflow.
CREATE OR REPLACE PROCEDURE cancel_booking_workflow(
    p_booking_id INT
) AS $$
DECLARE
    v_booking_status VARCHAR(12);
    v_payment_id INT;
    v_payment_amount NUMERIC(10,2);
    v_refund_count INT;
    v_refund_amount NUMERIC(10,2);
BEGIN
    SELECT BOOKING_STATUS
    INTO v_booking_status
    FROM BOOKINGS
    WHERE BOOKING_ID = p_booking_id
    FOR UPDATE;

    IF v_booking_status IS NULL THEN
        RAISE EXCEPTION 'Booking % not found', p_booking_id;
    END IF;

    IF v_booking_status NOT IN ('PENDING','CONFIRMED') THEN
        RAISE EXCEPTION 'Booking % cannot be cancelled from status %', p_booking_id, v_booking_status;
    END IF;

    IF v_booking_status = 'CONFIRMED' THEN
        SELECT PAYMENT_ID, PAYMENT_AMOUNT
        INTO v_payment_id, v_payment_amount
        FROM PAYMENTS
        WHERE BOOKING_ID = p_booking_id
          AND PAYMENT_STATUS = 'SUCCESSFUL'
        ORDER BY PAYMENT_TIME DESC
        LIMIT 1;

        IF v_payment_id IS NOT NULL THEN
            SELECT COUNT(*)
            INTO v_refund_count
            FROM PASSENGERS P
            JOIN TICKETS TK
                ON TK.PASSENGER_ID = P.PASSENGER_ID
            LEFT JOIN REFUNDS RF
                ON RF.TICKET_ID = TK.TICKET_ID
            WHERE P.BOOKING_ID = p_booking_id
              AND TK.TICKET_STATUS = 'CONFIRMED'
              AND RF.REFUND_ID IS NULL;

            IF v_refund_count > 0 THEN
                v_refund_amount := ROUND((v_payment_amount / v_refund_count)::NUMERIC, 2);

                INSERT INTO REFUNDS
                    (PAYMENT_ID, TICKET_ID, REFUND_AMOUNT, REFUND_STATUS)
                SELECT
                    v_payment_id,
                    TK.TICKET_ID,
                    v_refund_amount,
                    'REQUESTED'
                FROM PASSENGERS P
                JOIN TICKETS TK
                    ON TK.PASSENGER_ID = P.PASSENGER_ID
                LEFT JOIN REFUNDS RF
                    ON RF.TICKET_ID = TK.TICKET_ID
                WHERE P.BOOKING_ID = p_booking_id
                  AND TK.TICKET_STATUS = 'CONFIRMED'
                  AND RF.REFUND_ID IS NULL;
            END IF;
        END IF;
    END IF;

    UPDATE BOOKINGS
    SET BOOKING_STATUS = 'CANCELLED'
    WHERE BOOKING_ID = p_booking_id
      AND BOOKING_STATUS IN ('PENDING','CONFIRMED');

    UPDATE SEAT_RESERVATIONS
    SET RESERVATION_STATUS = 'CANCELLED'
    WHERE BOOKING_ID = p_booking_id
      AND RESERVATION_STATUS IN ('HELD','BOOKED');

    UPDATE TICKETS
    SET TICKET_STATUS = 'CANCELLED'
    WHERE PASSENGER_ID IN (
        SELECT PASSENGER_ID
        FROM PASSENGERS
        WHERE BOOKING_ID = p_booking_id
    )
      AND TICKET_STATUS = 'CONFIRMED';
END;
$$ LANGUAGE plpgsql;


-- TRIGGER: database-level validation against overlapping seat reservations.
CREATE OR REPLACE FUNCTION validate_no_overlapping_reservation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.RESERVATION_STATUS IN ('HELD','BOOKED') THEN
        PERFORM 1
        FROM TRIP_SEATS
        WHERE TRIP_SEAT_ID = NEW.TRIP_SEAT_ID
        FOR UPDATE;

        IF EXISTS (
            SELECT 1
            FROM SEAT_RESERVATIONS SR
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
ON SEAT_RESERVATIONS
FOR EACH ROW
EXECUTE FUNCTION validate_no_overlapping_reservation();
