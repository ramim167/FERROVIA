-- Apply the supplied national fare reference to existing databases.
-- Reference journey: Dhaka -> Rangpur = 300 km.
-- Shovan = 500, Snigdha = 1100, AC Berth = 1800.

ALTER TABLE FARE_RULES
    ALTER COLUMN RATE_PER_KM TYPE NUMERIC(10,6);

INSERT INTO CLASS_TYPES (CLASS_NAME, CLASS_CODE)
VALUES ('AC BERTH', 'AC_B')
ON CONFLICT (CLASS_CODE) DO UPDATE SET CLASS_NAME = EXCLUDED.CLASS_NAME;

INSERT INTO FARE_RULES (TRAIN_ID, CLASS_ID, RATE_PER_KM, BASE_FARE)
SELECT
    t.TRAIN_ID,
    c.CLASS_ID,
    CASE c.CLASS_CODE
        WHEN 'S_CHAIR' THEN 1.666667
        WHEN 'SN' THEN 3.666667
        WHEN 'AC_B' THEN 6.000000
    END,
    0
FROM TRAINS t
JOIN CLASS_TYPES c ON c.CLASS_CODE IN ('S_CHAIR', 'SN', 'AC_B')
ON CONFLICT (TRAIN_ID, CLASS_ID) DO UPDATE SET
    RATE_PER_KM = EXCLUDED.RATE_PER_KM,
    BASE_FARE = EXCLUDED.BASE_FARE;

-- The workbook contains these two routes as direct endpoint-only services.
-- Preserve the user-supplied 300 km reference in both directions.
UPDATE ROUTE_STOPS rs
SET DISTANCE_FROM_SOURCE_KM = CASE
    WHEN rs.STOP_SEQUENCE = 1 THEN 0
    ELSE 300
END
WHERE rs.ROUTE_ID IN (
    SELECT r.ROUTE_ID
    FROM ROUTES r
    JOIN STATIONS src ON src.STATION_ID = r.SOURCE_STATION_ID
    JOIN STATIONS dst ON dst.STATION_ID = r.DESTINATION_STATION_ID
    WHERE (UPPER(src.STATION_NAME) = 'DHAKA' AND UPPER(dst.STATION_NAME) = 'RANGPUR')
       OR (UPPER(src.STATION_NAME) = 'RANGPUR' AND UPPER(dst.STATION_NAME) = 'DHAKA')
)
AND rs.STOP_SEQUENCE IN (1, 2);

DO $$
DECLARE
    v_train RECORD;
    v_class_id INT;
    v_coach_id INT;
    v_coach_code VARCHAR(10);
    v_try INT;
BEGIN
    SELECT CLASS_ID INTO v_class_id FROM CLASS_TYPES WHERE CLASS_CODE = 'AC_B';

    FOR v_train IN (SELECT TRAIN_ID FROM TRAINS ORDER BY TRAIN_ID) LOOP
        SELECT COACH_ID INTO v_coach_id
        FROM COACHES
        WHERE TRAIN_ID = v_train.TRAIN_ID AND CLASS_ID = v_class_id
        ORDER BY COACH_ORDER
        LIMIT 1;

        IF v_coach_id IS NULL THEN
            v_coach_code := 'C';
            v_try := 1;
            WHILE EXISTS (
                SELECT 1 FROM COACHES
                WHERE TRAIN_ID = v_train.TRAIN_ID AND COACH_CODE = v_coach_code
            ) LOOP
                v_try := v_try + 1;
                v_coach_code := 'C' || v_try::TEXT;
            END LOOP;

            INSERT INTO COACHES (TRAIN_ID, CLASS_ID, COACH_CODE, COACH_ORDER)
            SELECT v_train.TRAIN_ID, v_class_id, v_coach_code,
                   COALESCE(MAX(COACH_ORDER), 0) + 1
            FROM COACHES
            WHERE TRAIN_ID = v_train.TRAIN_ID
            RETURNING COACH_ID INTO v_coach_id;
        END IF;

        INSERT INTO SEATS (COACH_ID, SEAT_NUMBER, SEAT_TYPE, IS_ACTIVE)
        SELECT v_coach_id, seat_no::VARCHAR, 'BERTH', 1
        FROM generate_series(1, 24) AS seat_no
        ON CONFLICT (COACH_ID, SEAT_NUMBER) DO NOTHING;
    END LOOP;
END $$;

