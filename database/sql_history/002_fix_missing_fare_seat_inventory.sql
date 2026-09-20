-- Fix trips that show "No fare/seat inventory configured for this trip."
-- This is safe to run more than once in Supabase.

INSERT INTO CLASS_TYPES (CLASS_NAME, CLASS_CODE)
VALUES
    ('SHOVAN', 'S_CHAIR'),
    ('SNIGDHA', 'SN'),
    ('AC SEAT', 'AC_S')
ON CONFLICT (CLASS_CODE) DO NOTHING;

INSERT INTO FARE_RULES (TRAIN_ID, CLASS_ID, RATE_PER_KM, BASE_FARE)
SELECT
    t.TRAIN_ID,
    c.CLASS_ID,
    CASE c.CLASS_CODE
        WHEN 'S_CHAIR' THEN
            CASE
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%INTERCITY%' THEN 1.50
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%COMMUTER%' THEN 1.00
                ELSE 1.20
            END
        WHEN 'SN' THEN
            CASE
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%INTERCITY%' THEN 2.50
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%COMMUTER%' THEN 1.80
                ELSE 2.00
            END
        WHEN 'AC_S' THEN
            CASE
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%INTERCITY%' THEN 3.50
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%COMMUTER%' THEN 2.70
                ELSE 3.00
            END
    END,
    CASE c.CLASS_CODE
        WHEN 'S_CHAIR' THEN
            CASE
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%INTERCITY%' THEN 50
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%COMMUTER%' THEN 30
                ELSE 40
            END
        WHEN 'SN' THEN
            CASE
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%INTERCITY%' THEN 100
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%COMMUTER%' THEN 70
                ELSE 80
            END
        WHEN 'AC_S' THEN
            CASE
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%INTERCITY%' THEN 150
                WHEN UPPER(t.TRAIN_TYPE) LIKE '%COMMUTER%' THEN 110
                ELSE 120
            END
    END
FROM TRAINS t
JOIN CLASS_TYPES c
    ON c.CLASS_CODE IN ('S_CHAIR', 'SN', 'AC_S')
ON CONFLICT (TRAIN_ID, CLASS_ID) DO NOTHING;

DO $$
DECLARE
    v_train RECORD;
    v_class RECORD;
    v_coach_id INT;
    v_coach_code VARCHAR(10);
    v_coach_order INT;
    v_base_code VARCHAR(10);
    v_try INT;
    v_seat_count INT;
BEGIN
    FOR v_train IN (
        SELECT TRAIN_ID
        FROM TRAINS
        ORDER BY TRAIN_ID
    ) LOOP
        FOR v_class IN (
            SELECT CLASS_ID, CLASS_CODE
            FROM CLASS_TYPES
            WHERE CLASS_CODE IN ('S_CHAIR', 'SN', 'AC_S')
            ORDER BY CASE CLASS_CODE
                WHEN 'S_CHAIR' THEN 1
                WHEN 'SN' THEN 2
                WHEN 'AC_S' THEN 3
            END
        ) LOOP
            SELECT COACH_ID
            INTO v_coach_id
            FROM COACHES
            WHERE TRAIN_ID = v_train.TRAIN_ID
              AND CLASS_ID = v_class.CLASS_ID
            ORDER BY COACH_ORDER
            LIMIT 1;

            IF v_coach_id IS NULL THEN
                v_base_code := CASE v_class.CLASS_CODE
                    WHEN 'S_CHAIR' THEN 'A'
                    WHEN 'SN' THEN 'B'
                    WHEN 'AC_S' THEN 'C'
                END;

                v_coach_code := v_base_code;
                v_try := 1;

                WHILE EXISTS (
                    SELECT 1
                    FROM COACHES
                    WHERE TRAIN_ID = v_train.TRAIN_ID
                      AND COACH_CODE = v_coach_code
                ) LOOP
                    v_try := v_try + 1;
                    v_coach_code := v_base_code || v_try::TEXT;
                END LOOP;

                SELECT COALESCE(MAX(COACH_ORDER), 0) + 1
                INTO v_coach_order
                FROM COACHES
                WHERE TRAIN_ID = v_train.TRAIN_ID;

                INSERT INTO COACHES (TRAIN_ID, CLASS_ID, COACH_CODE, COACH_ORDER)
                VALUES (v_train.TRAIN_ID, v_class.CLASS_ID, v_coach_code, v_coach_order)
                RETURNING COACH_ID INTO v_coach_id;
            END IF;

            IF NOT EXISTS (
                SELECT 1
                FROM SEATS
                WHERE COACH_ID = v_coach_id
            ) THEN
                v_seat_count := CASE v_class.CLASS_CODE
                    WHEN 'S_CHAIR' THEN 40
                    WHEN 'SN' THEN 32
                    WHEN 'AC_S' THEN 24
                END;

                INSERT INTO SEATS (COACH_ID, SEAT_NUMBER, SEAT_TYPE, IS_ACTIVE)
                SELECT
                    v_coach_id,
                    seat_no::VARCHAR,
                    CASE WHEN seat_no % 4 IN (1, 0) THEN 'WINDOW' ELSE 'AISLE' END,
                    1
                FROM generate_series(1, v_seat_count) AS seat_no
                ON CONFLICT (COACH_ID, SEAT_NUMBER) DO NOTHING;
            END IF;

            v_coach_id := NULL;
        END LOOP;
    END LOOP;
END $$;

INSERT INTO TRIP_SEATS (TRIP_ID, SEAT_ID, SEAT_STATUS)
SELECT
    t.TRIP_ID,
    s.SEAT_ID,
    'AVAILABLE'
FROM TRIPS t
JOIN COACHES c
    ON c.TRAIN_ID = t.TRAIN_ID
JOIN SEATS s
    ON s.COACH_ID = c.COACH_ID
WHERE s.IS_ACTIVE = 1
ON CONFLICT (TRIP_ID, SEAT_ID) DO NOTHING;

SELECT
    (SELECT COUNT(*) FROM FARE_RULES) AS fare_rules,
    (SELECT COUNT(*) FROM COACHES) AS coaches,
    (SELECT COUNT(*) FROM SEATS) AS seats,
    (SELECT COUNT(*) FROM TRIP_SEATS) AS trip_seats,
    (
        SELECT COUNT(*)
        FROM TRIPS t
        WHERE NOT EXISTS (
            SELECT 1
            FROM TRIP_SEATS ts
            WHERE ts.TRIP_ID = t.TRIP_ID
        )
    ) AS trips_still_missing_seats;
