-- ============================================================
-- FERROVIA: INSERT, UPDATE AND DELETE DEMONSTRATION
-- Covers every table defined in database/schema.sql.
--
-- Safe default:
--   The script creates only uniquely named DEMO rows, updates them,
--   deletes them in foreign-key-safe reverse order, and finally runs
--   ROLLBACK. Existing project data is not changed.
--
-- Run in Supabase SQL Editor after schema.sql has been installed.
-- Keep the final ROLLBACK when demonstrating against a real database.
-- ============================================================

BEGIN;
SET LOCAL TIME ZONE 'Asia/Dhaka';

DO $$
DECLARE
    v_tag TEXT := RIGHT(TXID_CURRENT()::TEXT, 6);

    v_passenger_user_id INT;
    v_operator_user_id INT;
    v_admin_user_id INT;

    v_station_1_id INT;
    v_station_2_id INT;
    v_station_3_id INT;
    v_train_id INT;
    v_route_id INT;
    v_route_stop_1_id INT;
    v_route_stop_2_id INT;
    v_route_stop_3_id INT;
    v_running_day_id INT;
    v_trainset_id INT;
    v_trip_id INT;
    v_assignment_id INT;
    v_trip_stop_1_id INT;
    v_trip_stop_2_id INT;
    v_trip_stop_3_id INT;
    v_class_id INT;
    v_coach_id INT;
    v_seat_id INT;
    v_trip_seat_id INT;
    v_fare_rule_id INT;
    v_booking_id INT;
    v_cancellation_request_id INT;
    v_passenger_id INT;
    v_reservation_id INT;
    v_ticket_id INT;
    v_payment_id INT;
    v_refund_id INT;
    v_notification_id INT;
BEGIN
    RAISE NOTICE 'Starting FERROVIA DML demo with tag %', v_tag;

    -- ========================================================
    -- PART 1: INSERT DEMO
    -- Parent rows are inserted before their dependent rows.
    -- ========================================================

    -- 1. USERS
    INSERT INTO USERS
        (FULL_NAME, EMAIL, PHONE, PASSWORD_HASH, ROLE, ACCOUNT_STATUS)
    VALUES
        ('Demo Passenger', 'demo-passenger-' || v_tag || '@ferrovia.test', NULL,
         'demo-only-not-a-login-hash', 'PASSENGER', 'ACTIVE')
    RETURNING USER_ID INTO v_passenger_user_id;

    INSERT INTO USERS
        (FULL_NAME, EMAIL, PHONE, PASSWORD_HASH, ROLE, ACCOUNT_STATUS)
    VALUES
        ('Demo Operator', 'demo-operator-' || v_tag || '@ferrovia.test', NULL,
         'demo-only-not-a-login-hash', 'OPERATOR', 'ACTIVE')
    RETURNING USER_ID INTO v_operator_user_id;

    INSERT INTO USERS
        (FULL_NAME, EMAIL, PHONE, PASSWORD_HASH, ROLE, ACCOUNT_STATUS)
    VALUES
        ('Demo Admin', 'demo-admin-' || v_tag || '@ferrovia.test', NULL,
         'demo-only-not-a-login-hash', 'ADMIN', 'ACTIVE')
    RETURNING USER_ID INTO v_admin_user_id;

    -- 2. STATIONS
    INSERT INTO STATIONS (STATION_NAME, CITY, STATION_CODE, IS_ACTIVE)
    VALUES ('Demo Central ' || v_tag, 'Demo City A', 'A' || v_tag, 1)
    RETURNING STATION_ID INTO v_station_1_id;

    INSERT INTO STATIONS (STATION_NAME, CITY, STATION_CODE, IS_ACTIVE)
    VALUES ('Demo Junction ' || v_tag, 'Demo City B', 'B' || v_tag, 1)
    RETURNING STATION_ID INTO v_station_2_id;

    INSERT INTO STATIONS (STATION_NAME, CITY, STATION_CODE, IS_ACTIVE)
    VALUES ('Demo Terminal ' || v_tag, 'Demo City C', 'C' || v_tag, 1)
    RETURNING STATION_ID INTO v_station_3_id;

    -- 3. TRAINS
    INSERT INTO TRAINS
        (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS,
         SPARE_TRIGGER_DELAY_MIN)
    VALUES
        ('Demo Express ' || v_tag, 'INTERCITY', 'DT-' || v_tag,
         'ACTIVE', 60)
    RETURNING TRAIN_ID INTO v_train_id;

    -- 4. ROUTES
    INSERT INTO ROUTES
        (TRAIN_ID, ROUTE_CODE, TRAIN_NUMBER, DIRECTION,
         SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
    VALUES
        (v_train_id, 'DR-' || v_tag, 'D-' || v_tag, 'UP',
         v_station_1_id, v_station_3_id, 1)
    RETURNING ROUTE_ID INTO v_route_id;

    -- 5. ROUTE_STOPS
    INSERT INTO ROUTE_STOPS
        (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN,
         DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM)
    VALUES
        (v_route_id, v_station_1_id, 1, NULL, 0, 0)
    RETURNING ROUTE_STOP_ID INTO v_route_stop_1_id;

    INSERT INTO ROUTE_STOPS
        (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN,
         DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM)
    VALUES
        (v_route_id, v_station_2_id, 2, 60, 65, 100)
    RETURNING ROUTE_STOP_ID INTO v_route_stop_2_id;

    INSERT INTO ROUTE_STOPS
        (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN,
         DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM)
    VALUES
        (v_route_id, v_station_3_id, 3, 120, NULL, 200)
    RETURNING ROUTE_STOP_ID INTO v_route_stop_3_id;

    -- 6. TRAIN_RUNNING_DAYS
    INSERT INTO TRAIN_RUNNING_DAYS
        (ROUTE_ID, DAY_CODE, DEPARTURE_MINUTE)
    VALUES
        (v_route_id, 'SAT', 480)
    RETURNING RUNNING_DAY_ID INTO v_running_day_id;

    -- 7. TRAINSETS
    INSERT INTO TRAINSETS
        (TRAIN_ID, TRAINSET_CODE, STATUS, CURRENT_STATION_ID)
    VALUES
        (v_train_id, 'DTS-' || v_tag, 'RESERVED', v_station_1_id)
    RETURNING TRAINSET_ID INTO v_trainset_id;

    -- 8. TRIPS
    INSERT INTO TRIPS
        (TRAIN_ID, ROUTE_ID, JOURNEY_DATE, SCHEDULED_DEPARTURE,
         SCHEDULED_ARRIVAL, TRIP_STATUS, OPERATOR_USER_ID)
    VALUES
        (v_train_id, v_route_id, DATE '2099-01-15',
         TIMESTAMP '2099-01-15 08:00:00',
         TIMESTAMP '2099-01-15 10:00:00',
         'SCHEDULED', v_operator_user_id)
    RETURNING TRIP_ID INTO v_trip_id;

    -- 9. TRAINSET_ASSIGNMENTS
    INSERT INTO TRAINSET_ASSIGNMENTS
        (TRIP_ID, TRAINSET_ID, TRAIN_ID, ASSIGNMENT_TYPE,
         ASSIGNMENT_STATUS, REASON)
    VALUES
        (v_trip_id, v_trainset_id, v_train_id, 'MANUAL',
         'RESERVED', 'DML demonstration')
    RETURNING ASSIGNMENT_ID INTO v_assignment_id;

    -- 10. TRIP_STOPS
    INSERT INTO TRIP_STOPS
        (TRIP_ID, ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE,
         SCHEDULED_ARRIVAL, SCHEDULED_DEPARTURE)
    VALUES
        (v_trip_id, v_route_stop_1_id, v_station_1_id, 1,
         NULL, TIMESTAMP '2099-01-15 08:00:00')
    RETURNING TRIP_STOP_ID INTO v_trip_stop_1_id;

    INSERT INTO TRIP_STOPS
        (TRIP_ID, ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE,
         SCHEDULED_ARRIVAL, SCHEDULED_DEPARTURE)
    VALUES
        (v_trip_id, v_route_stop_2_id, v_station_2_id, 2,
         TIMESTAMP '2099-01-15 09:00:00',
         TIMESTAMP '2099-01-15 09:05:00')
    RETURNING TRIP_STOP_ID INTO v_trip_stop_2_id;

    INSERT INTO TRIP_STOPS
        (TRIP_ID, ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE,
         SCHEDULED_ARRIVAL, SCHEDULED_DEPARTURE)
    VALUES
        (v_trip_id, v_route_stop_3_id, v_station_3_id, 3,
         TIMESTAMP '2099-01-15 10:00:00', NULL)
    RETURNING TRIP_STOP_ID INTO v_trip_stop_3_id;

    -- 11. CLASS_TYPES
    INSERT INTO CLASS_TYPES (CLASS_NAME, CLASS_CODE)
    VALUES ('Demo Class ' || v_tag, 'DC' || v_tag)
    RETURNING CLASS_ID INTO v_class_id;

    -- 12. COACHES
    INSERT INTO COACHES
        (TRAIN_ID, CLASS_ID, COACH_CODE, COACH_ORDER)
    VALUES
        (v_train_id, v_class_id, 'D' || v_tag, 1)
    RETURNING COACH_ID INTO v_coach_id;

    -- 13. SEATS
    INSERT INTO SEATS
        (COACH_ID, SEAT_NUMBER, SEAT_TYPE, IS_ACTIVE)
    VALUES
        (v_coach_id, 'D-1', 'WINDOW', 1)
    RETURNING SEAT_ID INTO v_seat_id;

    -- 14. TRIP_SEATS
    INSERT INTO TRIP_SEATS
        (TRIP_ID, SEAT_ID, SEAT_STATUS)
    VALUES
        (v_trip_id, v_seat_id, 'AVAILABLE')
    RETURNING TRIP_SEAT_ID INTO v_trip_seat_id;

    -- 15. FARE_RULES
    INSERT INTO FARE_RULES
        (TRAIN_ID, CLASS_ID, RATE_PER_KM, BASE_FARE)
    VALUES
        (v_train_id, v_class_id, 0.500000, 50.00)
    RETURNING FARE_RULE_ID INTO v_fare_rule_id;

    -- 16. BOOKINGS
    INSERT INTO BOOKINGS
        (PNR_NUMBER, USER_ID, TRIP_ID, SOURCE_STATION_ID,
         DESTINATION_STATION_ID, CLASS_ID, TOTAL_FARE, BOOKING_STATUS)
    VALUES
        ('DPNR' || v_tag, v_passenger_user_id, v_trip_id,
         v_station_1_id, v_station_3_id, v_class_id,
         150.00, 'CONFIRMED')
    RETURNING BOOKING_ID INTO v_booking_id;

    -- 17. CANCELLATION_REQUESTS
    INSERT INTO CANCELLATION_REQUESTS
        (BOOKING_ID, REQUESTED_BY, REQUEST_STATUS,
         REFUND_PERCENT, REFUND_AMOUNT)
    VALUES
        (v_booking_id, v_passenger_user_id, 'REQUESTED', 80.00, 120.00)
    RETURNING CANCELLATION_REQUEST_ID
    INTO v_cancellation_request_id;

    -- 18. PASSENGERS
    INSERT INTO PASSENGERS
        (BOOKING_ID, PASSENGER_NAME, AGE, GENDER)
    VALUES
        (v_booking_id, 'Demo Traveller', 25, 'OTHER')
    RETURNING PASSENGER_ID INTO v_passenger_id;

    -- 19. SEAT_RESERVATIONS
    -- If required_db_features.sql is installed, the overlap trigger also
    -- validates this INSERT before the row is accepted.
    INSERT INTO SEAT_RESERVATIONS
        (BOOKING_ID, PASSENGER_ID, TRIP_SEAT_ID,
         SOURCE_STATION_ID, DESTINATION_STATION_ID,
         SOURCE_STOP_SEQUENCE, DESTINATION_STOP_SEQUENCE,
         RESERVATION_STATUS, BOOKED_AT)
    VALUES
        (v_booking_id, v_passenger_id, v_trip_seat_id,
         v_station_1_id, v_station_3_id, 1, 3,
         'BOOKED', CURRENT_TIMESTAMP)
    RETURNING RESERVATION_ID INTO v_reservation_id;

    -- 20. TICKETS
    INSERT INTO TICKETS
        (PASSENGER_ID, RESERVATION_ID, TICKET_FARE, TICKET_STATUS)
    VALUES
        (v_passenger_id, v_reservation_id, 150.00, 'CONFIRMED')
    RETURNING TICKET_ID INTO v_ticket_id;

    -- 21. PAYMENTS
    INSERT INTO PAYMENTS
        (BOOKING_ID, TRANSACTION_ID, PAYMENT_AMOUNT,
         PAYMENT_METHOD, PAYMENT_STATUS)
    VALUES
        (v_booking_id, 'DTXN-' || v_tag, 150.00,
         'MOBILE_BANKING', 'SUCCESSFUL')
    RETURNING PAYMENT_ID INTO v_payment_id;

    -- 22. REFUNDS
    INSERT INTO REFUNDS
        (PAYMENT_ID, TICKET_ID, REFUND_AMOUNT, REFUND_STATUS)
    VALUES
        (v_payment_id, v_ticket_id, 120.00, 'REQUESTED')
    RETURNING REFUND_ID INTO v_refund_id;

    -- 23. NOTIFICATIONS
    INSERT INTO NOTIFICATIONS
        (USER_ID, BOOKING_ID, TRIP_ID, TITLE, MESSAGE, IS_READ)
    VALUES
        (v_passenger_user_id, v_booking_id, v_trip_id,
         'Demo notification', 'DML demonstration row', 0)
    RETURNING NOTIFICATION_ID INTO v_notification_id;

    RAISE NOTICE 'INSERT demo completed for all 23 tables.';

    -- ========================================================
    -- PART 2: UPDATE DEMO
    -- Every table receives at least one real value change.
    -- ========================================================

    -- 1. USERS
    UPDATE USERS
    SET FULL_NAME = 'Updated Demo Passenger',
        UPDATED_AT = CURRENT_TIMESTAMP
    WHERE USER_ID = v_passenger_user_id;

    -- 2. STATIONS
    UPDATE STATIONS
    SET CITY = 'Updated Demo City B'
    WHERE STATION_ID = v_station_2_id;

    -- 3. TRAINS
    UPDATE TRAINS
    SET SPARE_TRIGGER_DELAY_MIN = 45
    WHERE TRAIN_ID = v_train_id;

    -- 4. ROUTES
    UPDATE ROUTES
    SET TRAIN_NUMBER = 'DU-' || v_tag
    WHERE ROUTE_ID = v_route_id;

    -- 5. ROUTE_STOPS
    UPDATE ROUTE_STOPS
    SET DISTANCE_FROM_SOURCE_KM = 105.00
    WHERE ROUTE_STOP_ID = v_route_stop_2_id;

    -- 6. TRAIN_RUNNING_DAYS
    UPDATE TRAIN_RUNNING_DAYS
    SET DEPARTURE_MINUTE = 490
    WHERE RUNNING_DAY_ID = v_running_day_id;

    -- 7. TRAINSETS
    UPDATE TRAINSETS
    SET STATUS = 'ACTIVE',
        STATUS_UPDATED_AT = CURRENT_TIMESTAMP
    WHERE TRAINSET_ID = v_trainset_id;

    -- 8. TRIPS
    UPDATE TRIPS
    SET TRIP_STATUS = 'RUNNING',
        ACTUAL_DEPARTURE = TIMESTAMP '2099-01-15 08:10:00'
    WHERE TRIP_ID = v_trip_id;

    -- 9. TRAINSET_ASSIGNMENTS
    UPDATE TRAINSET_ASSIGNMENTS
    SET ASSIGNMENT_STATUS = 'ACTIVE',
        ACTIVATED_AT = CURRENT_TIMESTAMP,
        REASON = 'Updated DML demonstration'
    WHERE ASSIGNMENT_ID = v_assignment_id;

    -- 10. TRIP_STOPS
    UPDATE TRIP_STOPS
    SET ACTUAL_DEPARTURE = TIMESTAMP '2099-01-15 08:10:00',
        STOP_STATUS = 'DEPARTED',
        DEPARTURE_MARKED_BY = v_operator_user_id
    WHERE TRIP_STOP_ID = v_trip_stop_1_id;

    -- 11. CLASS_TYPES
    UPDATE CLASS_TYPES
    SET CLASS_NAME = 'Updated Demo Class ' || v_tag
    WHERE CLASS_ID = v_class_id;

    -- 12. COACHES
    UPDATE COACHES
    SET COACH_CODE = 'U' || v_tag
    WHERE COACH_ID = v_coach_id;

    -- 13. SEATS
    UPDATE SEATS
    SET SEAT_TYPE = 'AISLE'
    WHERE SEAT_ID = v_seat_id;

    -- 14. TRIP_SEATS
    UPDATE TRIP_SEATS
    SET SEAT_STATUS = 'BLOCKED'
    WHERE TRIP_SEAT_ID = v_trip_seat_id;

    -- 15. FARE_RULES
    UPDATE FARE_RULES
    SET RATE_PER_KM = 0.550000,
        BASE_FARE = 55.00
    WHERE FARE_RULE_ID = v_fare_rule_id;

    -- 16. BOOKINGS
    UPDATE BOOKINGS
    SET BOOKING_STATUS = 'CANCELLED'
    WHERE BOOKING_ID = v_booking_id;

    -- 17. CANCELLATION_REQUESTS
    UPDATE CANCELLATION_REQUESTS
    SET REQUEST_STATUS = 'APPROVED',
        DECIDED_BY = v_admin_user_id,
        DECIDED_AT = CURRENT_TIMESTAMP
    WHERE CANCELLATION_REQUEST_ID = v_cancellation_request_id;

    -- 18. PASSENGERS
    UPDATE PASSENGERS
    SET PASSENGER_NAME = 'Updated Demo Traveller',
        AGE = 26
    WHERE PASSENGER_ID = v_passenger_id;

    -- 19. SEAT_RESERVATIONS
    UPDATE SEAT_RESERVATIONS
    SET RESERVATION_STATUS = 'CANCELLED'
    WHERE RESERVATION_ID = v_reservation_id;

    -- 20. TICKETS
    UPDATE TICKETS
    SET TICKET_STATUS = 'CANCELLED'
    WHERE TICKET_ID = v_ticket_id;

    -- 21. PAYMENTS
    UPDATE PAYMENTS
    SET PAYMENT_STATUS = 'REFUNDED'
    WHERE PAYMENT_ID = v_payment_id;

    -- 22. REFUNDS
    UPDATE REFUNDS
    SET REFUND_STATUS = 'PROCESSING'
    WHERE REFUND_ID = v_refund_id;

    -- 23. NOTIFICATIONS
    UPDATE NOTIFICATIONS
    SET IS_READ = 1,
        MESSAGE = 'Updated DML demonstration row'
    WHERE NOTIFICATION_ID = v_notification_id;

    RAISE NOTICE 'UPDATE demo completed for all 23 tables.';

    -- ========================================================
    -- PART 3: DELETE DEMO
    -- Child rows are deleted before parent rows so that every
    -- foreign-key constraint remains valid.
    -- ========================================================

    -- 23. NOTIFICATIONS
    DELETE FROM NOTIFICATIONS
    WHERE NOTIFICATION_ID = v_notification_id;

    -- 22. REFUNDS
    DELETE FROM REFUNDS
    WHERE REFUND_ID = v_refund_id;

    -- 17. CANCELLATION_REQUESTS
    DELETE FROM CANCELLATION_REQUESTS
    WHERE CANCELLATION_REQUEST_ID = v_cancellation_request_id;

    -- 20. TICKETS
    DELETE FROM TICKETS
    WHERE TICKET_ID = v_ticket_id;

    -- 19. SEAT_RESERVATIONS
    DELETE FROM SEAT_RESERVATIONS
    WHERE RESERVATION_ID = v_reservation_id;

    -- 18. PASSENGERS
    DELETE FROM PASSENGERS
    WHERE PASSENGER_ID = v_passenger_id;

    -- 21. PAYMENTS
    DELETE FROM PAYMENTS
    WHERE PAYMENT_ID = v_payment_id;

    -- 16. BOOKINGS
    DELETE FROM BOOKINGS
    WHERE BOOKING_ID = v_booking_id;

    -- 14. TRIP_SEATS
    DELETE FROM TRIP_SEATS
    WHERE TRIP_SEAT_ID = v_trip_seat_id;

    -- 13. SEATS
    DELETE FROM SEATS
    WHERE SEAT_ID = v_seat_id;

    -- 12. COACHES
    DELETE FROM COACHES
    WHERE COACH_ID = v_coach_id;

    -- 15. FARE_RULES
    DELETE FROM FARE_RULES
    WHERE FARE_RULE_ID = v_fare_rule_id;

    -- 11. CLASS_TYPES
    DELETE FROM CLASS_TYPES
    WHERE CLASS_ID = v_class_id;

    -- 10. TRIP_STOPS
    DELETE FROM TRIP_STOPS
    WHERE TRIP_ID = v_trip_id;

    -- 9. TRAINSET_ASSIGNMENTS
    DELETE FROM TRAINSET_ASSIGNMENTS
    WHERE ASSIGNMENT_ID = v_assignment_id;

    -- 8. TRIPS
    DELETE FROM TRIPS
    WHERE TRIP_ID = v_trip_id;

    -- 7. TRAINSETS
    DELETE FROM TRAINSETS
    WHERE TRAINSET_ID = v_trainset_id;

    -- 6. TRAIN_RUNNING_DAYS
    DELETE FROM TRAIN_RUNNING_DAYS
    WHERE RUNNING_DAY_ID = v_running_day_id;

    -- 5. ROUTE_STOPS
    DELETE FROM ROUTE_STOPS
    WHERE ROUTE_ID = v_route_id;

    -- 4. ROUTES
    DELETE FROM ROUTES
    WHERE ROUTE_ID = v_route_id;

    -- 3. TRAINS
    DELETE FROM TRAINS
    WHERE TRAIN_ID = v_train_id;

    -- 2. STATIONS
    DELETE FROM STATIONS
    WHERE STATION_ID IN
        (v_station_1_id, v_station_2_id, v_station_3_id);

    -- 1. USERS
    DELETE FROM USERS
    WHERE USER_ID IN
        (v_passenger_user_id, v_operator_user_id, v_admin_user_id);

    RAISE NOTICE 'DELETE demo completed for all 23 tables.';
    RAISE NOTICE 'No demo row remains; the outer transaction will now roll back.';
END;
$$ LANGUAGE plpgsql;

-- This is intentionally ROLLBACK, not COMMIT. It guarantees that even if a
-- later edit accidentally leaves a demo row undeleted, the real database is
-- restored to the state it had before this file was run.
ROLLBACK;

