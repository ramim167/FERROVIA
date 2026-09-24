-- Ticket fare is calculated by the backend as:
-- BASE_FARE + ((destination distance - source distance) * RATE_PER_KM)
-- Distances come from ROUTE_STOPS.DISTANCE_FROM_SOURCE_KM.

INSERT INTO CLASS_TYPES (CLASS_NAME, CLASS_CODE)
VALUES
    ('SHOVAN', 'S_CHAIR'),
    ('SNIGDHA', 'SN'),
    ('AC BERTH', 'AC_B')
ON CONFLICT (CLASS_CODE) DO NOTHING;

-- Network-wide fare policy, calibrated to the supplied 300 km reference:
-- Shovan = 500 / 300, Snigdha = 1100 / 300, AC Berth = 1800 / 300.
INSERT INTO FARE_RULES (TRAIN_ID, CLASS_ID, RATE_PER_KM, BASE_FARE)
SELECT
    t.TRAIN_ID,
    c.CLASS_ID,
    CASE c.CLASS_CODE
        WHEN 'S_CHAIR' THEN 1.666667
        WHEN 'SN' THEN 3.666667
        WHEN 'AC_B' THEN 6.000000
    END AS RATE_PER_KM,
    0 AS BASE_FARE
FROM TRAINS t
JOIN CLASS_TYPES c
    ON c.CLASS_CODE IN ('S_CHAIR', 'SN', 'AC_B')
ON CONFLICT (TRAIN_ID, CLASS_ID) DO UPDATE SET
    RATE_PER_KM = EXCLUDED.RATE_PER_KM,
    BASE_FARE = EXCLUDED.BASE_FARE;

-- Existing passenger fare APIs need seats/classes to exist.
-- For trains imported without a seat layout, create a small default layout.
DO $$
DECLARE
    v_train RECORD;
    v_class RECORD;
    v_coach_id INT;
    v_coach_code VARCHAR(10);
    v_coach_order INT;
    v_seat_count INT;
BEGIN
    FOR v_train IN (
        SELECT t.TRAIN_ID
        FROM TRAINS t
        WHERE NOT EXISTS (
            SELECT 1
            FROM COACHES c
            WHERE c.TRAIN_ID = t.TRAIN_ID
        )
    ) LOOP
        FOR v_class IN (
            SELECT CLASS_ID, CLASS_CODE
            FROM CLASS_TYPES
            WHERE CLASS_CODE IN ('S_CHAIR', 'SN', 'AC_B')
            ORDER BY CASE CLASS_CODE
                WHEN 'S_CHAIR' THEN 1
                WHEN 'SN' THEN 2
                WHEN 'AC_B' THEN 3
            END
        ) LOOP
            v_coach_order := CASE v_class.CLASS_CODE
                WHEN 'S_CHAIR' THEN 1
                WHEN 'SN' THEN 2
                WHEN 'AC_B' THEN 3
            END;

            v_coach_code := CASE v_class.CLASS_CODE
                WHEN 'S_CHAIR' THEN 'A'
                WHEN 'SN' THEN 'B'
                WHEN 'AC_B' THEN 'C'
            END;

            v_seat_count := CASE v_class.CLASS_CODE
                WHEN 'S_CHAIR' THEN 40
                WHEN 'SN' THEN 32
                WHEN 'AC_B' THEN 24
            END;

            INSERT INTO COACHES (TRAIN_ID, CLASS_ID, COACH_CODE, COACH_ORDER)
            VALUES (v_train.TRAIN_ID, v_class.CLASS_ID, v_coach_code, v_coach_order)
            ON CONFLICT (TRAIN_ID, COACH_CODE) DO NOTHING;

            SELECT COACH_ID
            INTO v_coach_id
            FROM COACHES
            WHERE TRAIN_ID = v_train.TRAIN_ID
              AND COACH_CODE = v_coach_code;

            INSERT INTO SEATS (COACH_ID, SEAT_NUMBER, SEAT_TYPE)
            SELECT
                v_coach_id,
                seat_no::VARCHAR,
                CASE
                    WHEN v_class.CLASS_CODE = 'AC_B' THEN 'BERTH'
                    WHEN seat_no % 4 IN (1, 0) THEN 'WINDOW'
                    ELSE 'AISLE'
                END
            FROM generate_series(1, v_seat_count) AS seat_no
            ON CONFLICT (COACH_ID, SEAT_NUMBER) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

DO $$
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
BEGIN
    FOR i IN 0..9 LOOP
        v_date := CURRENT_DATE + i;
        v_day_code := UPPER(TO_CHAR(v_date, 'Dy'));

        FOR v_route IN (
            SELECT r.ROUTE_ID, r.TRAIN_ID, rd.DEPARTURE_MINUTE
            FROM ROUTES r
            JOIN TRAIN_RUNNING_DAYS rd ON r.ROUTE_ID = rd.ROUTE_ID
            WHERE r.IS_ACTIVE = 1
              AND rd.DAY_CODE = v_day_code
        ) LOOP
            v_sched_dep := v_date + (v_route.DEPARTURE_MINUTE || ' minutes')::INTERVAL;

            SELECT v_sched_dep + (MAX(COALESCE(ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN)) || ' minutes')::INTERVAL
            INTO v_sched_arr
            FROM ROUTE_STOPS
            WHERE ROUTE_ID = v_route.ROUTE_ID;

            v_trip_id := NULL;

            INSERT INTO TRIPS
                (TRAIN_ID, ROUTE_ID, JOURNEY_DATE, SCHEDULED_DEPARTURE, SCHEDULED_ARRIVAL, TRIP_STATUS)
            VALUES
                (v_route.TRAIN_ID, v_route.ROUTE_ID, v_date, v_sched_dep, v_sched_arr, 'SCHEDULED')
            ON CONFLICT ON CONSTRAINT UQ_TRIP_ROUTE_DEPARTURE DO NOTHING
            RETURNING TRIP_ID INTO v_trip_id;

            IF v_trip_id IS NULL THEN
                SELECT TRIP_ID
                INTO v_trip_id
                FROM TRIPS
                WHERE ROUTE_ID = v_route.ROUTE_ID
                  AND SCHEDULED_DEPARTURE = v_sched_dep;
            END IF;

            FOR v_stop IN (
                SELECT ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN
                FROM ROUTE_STOPS
                WHERE ROUTE_ID = v_route.ROUTE_ID
                ORDER BY STOP_SEQUENCE
            ) LOOP
                IF v_stop.ARRIVAL_OFFSET_MIN IS NOT NULL THEN
                    v_stop_arr := v_sched_dep + (v_stop.ARRIVAL_OFFSET_MIN || ' minutes')::INTERVAL;
                ELSE
                    v_stop_arr := NULL;
                END IF;

                IF v_stop.DEPARTURE_OFFSET_MIN IS NOT NULL THEN
                    v_stop_dep := v_sched_dep + (v_stop.DEPARTURE_OFFSET_MIN || ' minutes')::INTERVAL;
                ELSE
                    v_stop_dep := NULL;
                END IF;

                INSERT INTO TRIP_STOPS
                    (TRIP_ID, ROUTE_STOP_ID, STATION_ID, STOP_SEQUENCE,
                     SCHEDULED_ARRIVAL, SCHEDULED_DEPARTURE, STOP_STATUS)
                VALUES
                    (v_trip_id, v_stop.ROUTE_STOP_ID, v_stop.STATION_ID, v_stop.STOP_SEQUENCE,
                     v_stop_arr, v_stop_dep, 'UPCOMING')
                ON CONFLICT (TRIP_ID, STOP_SEQUENCE) DO NOTHING;
            END LOOP;

            INSERT INTO TRIP_SEATS (TRIP_ID, SEAT_ID, SEAT_STATUS)
            SELECT v_trip_id, s.SEAT_ID, 'AVAILABLE'
            FROM SEATS s
            JOIN COACHES c ON c.COACH_ID = s.COACH_ID
            WHERE c.TRAIN_ID = v_route.TRAIN_ID
              AND s.IS_ACTIVE = 1
            ON CONFLICT (TRIP_ID, SEAT_ID) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
