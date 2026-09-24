
-- =======================================================
-- FERROVIA AUTO GENERATED SQL FOR 301 TRAINS
-- =======================================================
-- WARNING: this legacy generated file used placeholder 10 km stop increments.
-- Do not treat its distances as verified. Regenerate only after the source
-- workbook contains Distance_From_Source_KM; generate_sql.js now enforces it.

CREATE OR REPLACE FUNCTION get_or_create_station(p_name VARCHAR) RETURNS INT AS $$
DECLARE
    v_id INT;
    v_code VARCHAR;
BEGIN
    SELECT STATION_ID INTO v_id FROM STATIONS WHERE UPPER(STATION_NAME) = UPPER(p_name) LIMIT 1;
    IF v_id IS NULL THEN
        v_code := 'FVN' || FLOOR(RANDOM() * 900000 + 100000)::TEXT;
        INSERT INTO STATIONS (STATION_NAME, CITY, STATION_CODE, IS_ACTIVE) 
        VALUES (p_name, p_name, v_code, 1) RETURNING STATION_ID INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narsingdi Commuter', 'Commuter', 'E-NC1-2025', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NC1-2025', 'UP', get_or_create_station('Bhairab Bazar Junction'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Bhairab Bazar Junction'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Daulatkandi'), 2, 8, 10, 10),
  (v_route_id, get_or_create_station('Methikanda'), 3, 23, 25, 20),
  (v_route_id, get_or_create_station('Narsingdi'), 4, 48, 50, 30),
  (v_route_id, get_or_create_station('Ghorashal Flag'), 5, 63, 65, 40),
  (v_route_id, get_or_create_station('Arikhola'), 6, 70, 72, 50),
  (v_route_id, get_or_create_station('Tongi Junction'), 7, 90, 92, 60),
  (v_route_id, get_or_create_station('Dhaka Airport'), 8, 100, 102, 70),
  (v_route_id, get_or_create_station('Dhaka Cantonment'), 9, 110, 112, 80),
  (v_route_id, get_or_create_station('Tejgaon'), 10, 125, 127, 90),
  (v_route_id, get_or_create_station('Dhaka'), 11, 140, NULL, 100);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Karnaphuli Commuter', 'Commuter', 'E-3', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-3', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 515, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-4', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chattogram'), 2, 545, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narsingdi Commuter (2)', 'Commuter', 'E-NC4-2025', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NC4-2025', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Bhairab Bazar Junction'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Tejgaon'), 2, 11, 13, 10),
  (v_route_id, get_or_create_station('Dhaka Airport'), 3, 27, 32, 20),
  (v_route_id, get_or_create_station('Tongi Junction'), 4, 40, 42, 30),
  (v_route_id, get_or_create_station('Pubail'), 5, 73, 75, 40),
  (v_route_id, get_or_create_station('Arikhola'), 6, 86, 88, 50),
  (v_route_id, get_or_create_station('Ghorashal Flag'), 7, 96, 98, 60),
  (v_route_id, get_or_create_station('Narsingdi'), 8, 110, 112, 70),
  (v_route_id, get_or_create_station('Methikanda'), 9, 130, 132, 80),
  (v_route_id, get_or_create_station('Bhairab Bazar Junction'), 10, 160, NULL, 90);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Sagarika Commuter', 'Commuter', 'E-29', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-29', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Chandpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chandpur'), 2, 290, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-30', 'DOWN', get_or_create_station('Chandpur'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chandpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chattogram'), 2, 295, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Titas Commuter', 'Commuter', 'E-33', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-33', 'UP', get_or_create_station('Akhaura'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Akhaura'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 215, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-34', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Brahmanbaria'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Brahmanbaria'), 2, 165, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Titas Commuter (2)', 'Commuter', 'E-35', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-35', 'UP', get_or_create_station('Brahmanbaria'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Brahmanbaria'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 110, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-36', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Akhaura'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Akhaura'), 2, 195, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mahua Commuter', 'Commuter', 'E-43', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-43', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Mohanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Mohanganj'), 2, 390, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-44', 'DOWN', get_or_create_station('Mohanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Mohanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 430, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Dewanganj Commuter', 'Commuter', 'E-47', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-47', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Dewanganj Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dewanganj Bazar'), 2, 335, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-48', 'DOWN', get_or_create_station('Dewanganj Bazar'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dewanganj Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 360, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Balaka Commuter', 'Commuter', 'E-49', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-49', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Bariaranchil'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bariaranchil'), 2, 355, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-50', 'DOWN', get_or_create_station('Bariaranchil'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Bariaranchil'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 350, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Jamalpur Commuter', 'Commuter', 'E-51', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-51', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Dewanganj Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dewanganj Bazar'), 2, 400, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-52', 'DOWN', get_or_create_station('Dewanganj Bazar'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dewanganj Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 350, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Tangail Commuter-1', 'Commuter', 'E-107', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-107', 'UP', get_or_create_station('Ibrahimabad'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Ibrahimabad'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 185, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Tangail Commuter-2', 'Commuter', 'E-108', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-108', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Ibrahimabad'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ibrahimabad'), 2, 140, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Joydebpur Commuter-1', 'Commuter', 'E-JOY-1', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JOY-1', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Joydebpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Joydebpur'), 2, 60, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Joydebpur Commuter-2', 'Commuter', 'E-JOY-2', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JOY-2', 'UP', get_or_create_station('Joydebpur'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Joydebpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 70, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Joydebpur Commuter-3', 'Commuter', 'E-JOY-3', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JOY-3', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Joydebpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Joydebpur'), 2, 65, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Joydebpur Commuter-4', 'Commuter', 'E-JOY-4', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JOY-4', 'UP', get_or_create_station('Joydebpur'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Joydebpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 70, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-1', 'Commuter', 'E-NAR-01', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-01', 'UP', get_or_create_station('Narayanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Narayanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-2', 'Commuter', 'E-NAR-02', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-02', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Narayanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Narayanganj'), 2, 55, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-3', 'Commuter', 'E-NAR-03', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-03', 'UP', get_or_create_station('Narayanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Narayanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-4', 'Commuter', 'E-NAR-04', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-04', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Narayanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Narayanganj'), 2, 45, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-5', 'Commuter', 'E-NAR-05', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-05', 'UP', get_or_create_station('Narayanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Narayanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-6', 'Commuter', 'E-NAR-06', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-06', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Narayanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Narayanganj'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-7', 'Commuter', 'E-NAR-07', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-07', 'UP', get_or_create_station('Narayanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Narayanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-8', 'Commuter', 'E-NAR-08', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-08', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Narayanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Narayanganj'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-9', 'Commuter', 'E-NAR-09', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-09', 'UP', get_or_create_station('Narayanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Narayanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-10', 'Commuter', 'E-NAR-10', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-10', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Narayanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Narayanganj'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-11', 'Commuter', 'E-NAR-11', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-11', 'UP', get_or_create_station('Narayanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Narayanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 55, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-12', 'Commuter', 'E-NAR-12', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-12', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Narayanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Narayanganj'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-13', 'Commuter', 'E-NAR-13', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-13', 'UP', get_or_create_station('Narayanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Narayanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-14', 'Commuter', 'E-NAR-14', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-14', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Narayanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Narayanganj'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-15', 'Commuter', 'E-NAR-15', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-15', 'UP', get_or_create_station('Narayanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Narayanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 55, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Narayanganj Commuter-16', 'Commuter', 'E-NAR-16', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAR-16', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Narayanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Narayanganj'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Turag Commuter-1', 'Commuter', 'E-TURAG-1', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-TURAG-1', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Joydebpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Joydebpur'), 2, 60, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Turag Commuter-2', 'Commuter', 'E-TURAG-2', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-TURAG-2', 'UP', get_or_create_station('Joydebpur'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Joydebpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 75, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Turag Commuter-3', 'Commuter', 'E-TURAG-3', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-TURAG-3', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Joydebpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Joydebpur'), 2, 80, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Turag Commuter-4', 'Commuter', 'E-TURAG-4', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-TURAG-4', 'UP', get_or_create_station('Joydebpur'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Joydebpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 70, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Suborno Express', 'Intercity', 'E-701', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-701', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 295, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-702', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Chattogram'), 3, 295, NULL, 20);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mahanagar Godhuli', 'Intercity', 'E-703', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-703', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Feni'), 2, 80, 82, 10),
  (v_route_id, get_or_create_station('Gunabati'), 3, 96, 98, 20),
  (v_route_id, get_or_create_station('Laksam'), 4, 124, 126, 30),
  (v_route_id, get_or_create_station('Cumilla'), 5, 147, 149, 40),
  (v_route_id, get_or_create_station('Akhaura'), 6, 200, 203, 50),
  (v_route_id, get_or_create_station('Brahmanbaria'), 7, 221, 225, 60),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 8, 245, 248, 70),
  (v_route_id, get_or_create_station('Narsingdi'), 9, 276, 278, 80),
  (v_route_id, get_or_create_station('Dhaka'), 10, 345, NULL, 90);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mahanagar Provati', 'Intercity', 'E-704', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-704', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 22, 27, 10),
  (v_route_id, get_or_create_station('Narsingdi'), 3, 66, 68, 20),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 4, 94, 97, 30),
  (v_route_id, get_or_create_station('Brahmanbaria'), 5, 115, 119, 40),
  (v_route_id, get_or_create_station('Akhaura'), 6, 140, 143, 50),
  (v_route_id, get_or_create_station('Cumilla'), 7, 186, 188, 60),
  (v_route_id, get_or_create_station('Laksam'), 8, 210, 212, 70),
  (v_route_id, get_or_create_station('Gunabati'), 9, 238, 240, 80),
  (v_route_id, get_or_create_station('Feni'), 10, 255, 257, 90),
  (v_route_id, get_or_create_station('Chattogram'), 11, 350, NULL, 100);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Tista Express', 'Intercity', 'E-707', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-707', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Dewanganj Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 53, 56, 20),
  (v_route_id, get_or_create_station('Gafargaon'), 4, 134, 137, 30),
  (v_route_id, get_or_create_station('Mymensingh'), 5, 182, 185, 40),
  (v_route_id, get_or_create_station('Piyarpur'), 6, 213, 215, 50),
  (v_route_id, get_or_create_station('Jamalpur Town'), 7, 246, 250, 60),
  (v_route_id, get_or_create_station('Melandah Bazar'), 8, 266, 268, 70),
  (v_route_id, get_or_create_station('Islampur Bazar'), 9, 286, 288, 80),
  (v_route_id, get_or_create_station('Dewanganj Bazar'), 10, 320, NULL, 90);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-708', 'DOWN', get_or_create_station('Dewanganj Bazar'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dewanganj Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Islampur Bazar'), 2, 14, 16, 10),
  (v_route_id, get_or_create_station('Melandah Bazar'), 3, 31, 33, 20),
  (v_route_id, get_or_create_station('Jamalpur Town'), 4, 51, 56, 30),
  (v_route_id, get_or_create_station('Piyarpur'), 5, 86, 88, 40),
  (v_route_id, get_or_create_station('Mymensingh'), 6, 123, 126, 50),
  (v_route_id, get_or_create_station('Gafargaon'), 7, 172, 174, 60),
  (v_route_id, get_or_create_station('Biman Bandar'), 8, 287, 287, 70),
  (v_route_id, get_or_create_station('Dhaka'), 9, 330, NULL, 80);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Parabat Express', 'Intercity', 'E-709', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-709', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Sylhet'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 3, 93, 96, 20),
  (v_route_id, get_or_create_station('Brahmanbaria'), 4, 116, 119, 30),
  (v_route_id, get_or_create_station('Azampur'), 5, 140, 142, 40),
  (v_route_id, get_or_create_station('Nayapara'), 6, 180, 182, 50),
  (v_route_id, get_or_create_station('Shaistaganj'), 7, 202, 205, 60),
  (v_route_id, get_or_create_station('Sreemangal'), 8, 242, 245, 70),
  (v_route_id, get_or_create_station('Bhanugach'), 9, 264, 266, 80),
  (v_route_id, get_or_create_station('Kulaura'), 10, 295, 298, 90),
  (v_route_id, get_or_create_station('Maijgaon'), 11, 325, 327, 100),
  (v_route_id, get_or_create_station('Sylhet'), 12, 390, NULL, 110);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-710', 'DOWN', get_or_create_station('Sylhet'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Sylhet'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Maijgaon'), 2, 39, 41, 10),
  (v_route_id, get_or_create_station('Kulaura'), 3, 66, 69, 20),
  (v_route_id, get_or_create_station('Bhanugach'), 4, 99, 101, 30),
  (v_route_id, get_or_create_station('Sreemangal'), 5, 119, 122, 40),
  (v_route_id, get_or_create_station('Shaistaganj'), 6, 166, 169, 50),
  (v_route_id, get_or_create_station('Nayapara'), 7, 190, 192, 60),
  (v_route_id, get_or_create_station('Azampur'), 8, 245, 247, 70),
  (v_route_id, get_or_create_station('Brahmanbaria'), 9, 270, 274, 80),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 10, 295, 298, 90),
  (v_route_id, get_or_create_station('Biman Bandar'), 11, 372, 372, 100),
  (v_route_id, get_or_create_station('Dhaka'), 12, 400, NULL, 110);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Upakul Express', 'Intercity', 'E-711', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-711', 'UP', get_or_create_station('Noakhali'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Noakhali'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Maijdi Court'), 2, 7, 9, 10),
  (v_route_id, get_or_create_station('Choumuhani'), 3, 23, 25, 20),
  (v_route_id, get_or_create_station('Bajra'), 4, 34, 36, 30),
  (v_route_id, get_or_create_station('Sonaimuri'), 5, 45, 47, 40),
  (v_route_id, get_or_create_station('Natherpetua'), 6, 60, 62, 50),
  (v_route_id, get_or_create_station('Laksam'), 7, 85, 90, 60),
  (v_route_id, get_or_create_station('Cumilla'), 8, 112, 114, 70),
  (v_route_id, get_or_create_station('Quasba'), 9, 144, 146, 80),
  (v_route_id, get_or_create_station('Akhaura'), 10, 170, 173, 90),
  (v_route_id, get_or_create_station('Brahmanbaria'), 11, 191, 195, 100),
  (v_route_id, get_or_create_station('Ashuganj'), 12, 210, 212, 110),
  (v_route_id, get_or_create_station('Narsingdi'), 13, 245, 247, 120),
  (v_route_id, get_or_create_station('Biman Bandar'), 14, 287, 287, 130),
  (v_route_id, get_or_create_station('Dhaka'), 15, 320, NULL, 140);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-712', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Noakhali'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Narsingdi'), 3, 67, 70, 20),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 4, 100, 103, 30),
  (v_route_id, get_or_create_station('Ashuganj'), 5, 110, 113, 40),
  (v_route_id, get_or_create_station('Brahmanbaria'), 6, 127, 131, 50),
  (v_route_id, get_or_create_station('Akhaura'), 7, 157, 160, 60),
  (v_route_id, get_or_create_station('Quasba'), 8, 176, 178, 70),
  (v_route_id, get_or_create_station('Cumilla'), 9, 208, 210, 80),
  (v_route_id, get_or_create_station('Laksam'), 10, 233, 236, 90),
  (v_route_id, get_or_create_station('Natherpetua'), 11, 258, 258, 100),
  (v_route_id, get_or_create_station('Sonaimuri'), 12, 272, 272, 110),
  (v_route_id, get_or_create_station('Bajra'), 13, 283, 283, 120),
  (v_route_id, get_or_create_station('Choumuhani'), 14, 294, 296, 130),
  (v_route_id, get_or_create_station('Maijdi Court'), 15, 310, 310, 140),
  (v_route_id, get_or_create_station('Noakhali'), 16, 330, NULL, 150);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Jayantika Express', 'Intercity', 'E-717', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-717', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Sylhet'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Ashuganj'), 3, 100, 102, 20),
  (v_route_id, get_or_create_station('Brahmanbaria'), 4, 116, 120, 30),
  (v_route_id, get_or_create_station('Azampur'), 5, 142, 144, 40),
  (v_route_id, get_or_create_station('Mukundapur'), 6, 157, 159, 50),
  (v_route_id, get_or_create_station('Harashpur'), 7, 169, 171, 60),
  (v_route_id, get_or_create_station('Montola'), 8, 195, 198, 70),
  (v_route_id, get_or_create_station('Nayapara'), 9, 212, 214, 80),
  (v_route_id, get_or_create_station('Shahaji Bazar'), 10, 225, 227, 90),
  (v_route_id, get_or_create_station('Shaistaganj'), 11, 246, 249, 100),
  (v_route_id, get_or_create_station('Sreemangal'), 12, 286, 289, 110),
  (v_route_id, get_or_create_station('Bhanugach'), 13, 308, 310, 120),
  (v_route_id, get_or_create_station('Kulaura'), 14, 350, 354, 130),
  (v_route_id, get_or_create_station('Maijgaon'), 15, 378, 380, 140),
  (v_route_id, get_or_create_station('Sylhet'), 16, 465, NULL, 150);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-718', 'DOWN', get_or_create_station('Sylhet'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Sylhet'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Maijgaon'), 2, 48, 50, 10),
  (v_route_id, get_or_create_station('Kulaura'), 3, 77, 80, 20),
  (v_route_id, get_or_create_station('Bhanugach'), 4, 139, 141, 30),
  (v_route_id, get_or_create_station('Sreemangal'), 5, 160, 165, 40),
  (v_route_id, get_or_create_station('Shaistaganj'), 6, 202, 205, 50),
  (v_route_id, get_or_create_station('Shahaji Bazar'), 7, 217, 219, 60),
  (v_route_id, get_or_create_station('Nayapara'), 8, 230, 232, 70),
  (v_route_id, get_or_create_station('Montola'), 9, 247, 249, 80),
  (v_route_id, get_or_create_station('Harashpur'), 10, 258, 260, 90),
  (v_route_id, get_or_create_station('Mukundapur'), 11, 270, 272, 100),
  (v_route_id, get_or_create_station('Azampur'), 12, 286, 288, 110),
  (v_route_id, get_or_create_station('Brahmanbaria'), 13, 309, 313, 120),
  (v_route_id, get_or_create_station('Ashuganj'), 14, 328, 330, 130),
  (v_route_id, get_or_create_station('Biman Bandar'), 15, 400, 400, 140),
  (v_route_id, get_or_create_station('Dhaka'), 16, 435, NULL, 150);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Paharika Express', 'Intercity', 'E-719', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-719', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Sylhet'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Feni'), 2, 84, 86, 10),
  (v_route_id, get_or_create_station('Nangolkot'), 3, 113, 115, 20),
  (v_route_id, get_or_create_station('Laksam'), 4, 130, 133, 30),
  (v_route_id, get_or_create_station('Cumilla'), 5, 156, 158, 40),
  (v_route_id, get_or_create_station('Quasba'), 6, 188, 190, 50),
  (v_route_id, get_or_create_station('Akhaura'), 7, 220, 225, 60),
  (v_route_id, get_or_create_station('Harashpur'), 8, 255, 257, 70),
  (v_route_id, get_or_create_station('Nayapara'), 9, 278, 280, 80),
  (v_route_id, get_or_create_station('Shaistaganj'), 10, 300, 303, 90),
  (v_route_id, get_or_create_station('Sreemangal'), 11, 340, 345, 100),
  (v_route_id, get_or_create_station('Bhanugach'), 12, 365, 367, 110),
  (v_route_id, get_or_create_station('Shamshernagar'), 13, 376, 378, 120),
  (v_route_id, get_or_create_station('Kulaura'), 14, 402, 405, 130),
  (v_route_id, get_or_create_station('Baramchal'), 15, 418, 420, 140),
  (v_route_id, get_or_create_station('Maijgaon'), 16, 434, 436, 150),
  (v_route_id, get_or_create_station('Sylhet'), 17, 485, NULL, 160);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-720', 'DOWN', get_or_create_station('Sylhet'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Sylhet'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Maijgaon'), 2, 39, 41, 10),
  (v_route_id, get_or_create_station('Kulaura'), 3, 85, 88, 20),
  (v_route_id, get_or_create_station('Shamshernagar'), 4, 111, 113, 30),
  (v_route_id, get_or_create_station('Bhanugach'), 5, 122, 124, 40),
  (v_route_id, get_or_create_station('Sreemangal'), 6, 147, 152, 50),
  (v_route_id, get_or_create_station('Shaistaganj'), 7, 204, 207, 60),
  (v_route_id, get_or_create_station('Nayapara'), 8, 227, 229, 70),
  (v_route_id, get_or_create_station('Harashpur'), 9, 249, 251, 80),
  (v_route_id, get_or_create_station('Akhaura'), 10, 290, 295, 90),
  (v_route_id, get_or_create_station('Quasba'), 11, 311, 313, 100),
  (v_route_id, get_or_create_station('Cumilla'), 12, 343, 345, 110),
  (v_route_id, get_or_create_station('Laksam'), 13, 368, 370, 120),
  (v_route_id, get_or_create_station('Nangolkot'), 14, 385, 387, 130),
  (v_route_id, get_or_create_station('Feni'), 15, 414, 416, 140),
  (v_route_id, get_or_create_station('Chattogram'), 16, 505, NULL, 150);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mahanagar Express', 'Intercity', 'E-721', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-721', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kumira'), 2, 26, 28, 10),
  (v_route_id, get_or_create_station('Feni'), 3, 87, 89, 20),
  (v_route_id, get_or_create_station('Nangolkot'), 4, 114, 116, 30),
  (v_route_id, get_or_create_station('Laksam'), 5, 132, 134, 40),
  (v_route_id, get_or_create_station('Cumilla'), 6, 156, 158, 50),
  (v_route_id, get_or_create_station('Quasba'), 7, 188, 190, 60),
  (v_route_id, get_or_create_station('Akhaura'), 8, 215, 218, 70),
  (v_route_id, get_or_create_station('Brahmanbaria'), 9, 236, 240, 80),
  (v_route_id, get_or_create_station('Ashuganj'), 10, 255, 257, 90),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 11, 265, 267, 100),
  (v_route_id, get_or_create_station('Narsingdi'), 12, 297, 299, 110),
  (v_route_id, get_or_create_station('Dhaka'), 13, 370, NULL, 120);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-722', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Narsingdi'), 3, 67, 70, 20),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 4, 100, 103, 30),
  (v_route_id, get_or_create_station('Ashuganj'), 5, 111, 113, 40),
  (v_route_id, get_or_create_station('Brahmanbaria'), 6, 128, 131, 50),
  (v_route_id, get_or_create_station('Akhaura'), 7, 155, 158, 60),
  (v_route_id, get_or_create_station('Quasba'), 8, 174, 176, 70),
  (v_route_id, get_or_create_station('Cumilla'), 9, 206, 208, 80),
  (v_route_id, get_or_create_station('Laksam'), 10, 230, 232, 90),
  (v_route_id, get_or_create_station('Nangolkot'), 11, 246, 248, 100),
  (v_route_id, get_or_create_station('Feni'), 12, 273, 275, 110),
  (v_route_id, get_or_create_station('Kumira'), 13, 335, 335, 120),
  (v_route_id, get_or_create_station('Chattogram'), 14, 370, NULL, 130);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Udayan Express', 'Intercity', 'E-723', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-723', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Sylhet'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Feni'), 2, 79, 82, 10),
  (v_route_id, get_or_create_station('Laksam'), 3, 120, 122, 20),
  (v_route_id, get_or_create_station('Cumilla'), 4, 144, 147, 30),
  (v_route_id, get_or_create_station('Akhaura'), 5, 200, 205, 40),
  (v_route_id, get_or_create_station('Shaistaganj'), 6, 284, 287, 50),
  (v_route_id, get_or_create_station('Sreemangal'), 7, 325, 328, 60),
  (v_route_id, get_or_create_station('Shamshernagar'), 8, 353, 355, 70),
  (v_route_id, get_or_create_station('Kulaura'), 9, 379, 382, 80),
  (v_route_id, get_or_create_station('Maijgaon'), 10, 410, 412, 90),
  (v_route_id, get_or_create_station('Sylhet'), 11, 480, NULL, 100);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-724', 'DOWN', get_or_create_station('Sylhet'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Sylhet'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Maijgaon'), 2, 39, 41, 10),
  (v_route_id, get_or_create_station('Baramchal'), 3, 58, 60, 20),
  (v_route_id, get_or_create_station('Kulaura'), 4, 73, 76, 30),
  (v_route_id, get_or_create_station('Shamshernagar'), 5, 100, 102, 40),
  (v_route_id, get_or_create_station('Sreemangal'), 6, 128, 133, 50),
  (v_route_id, get_or_create_station('Shaistaganj'), 7, 170, 173, 60),
  (v_route_id, get_or_create_station('Akhaura'), 8, 255, 260, 70),
  (v_route_id, get_or_create_station('Cumilla'), 9, 303, 305, 80),
  (v_route_id, get_or_create_station('Laksam'), 10, 327, 329, 90),
  (v_route_id, get_or_create_station('Feni'), 11, 367, 369, 100),
  (v_route_id, get_or_create_station('Chattogram'), 12, 455, NULL, 110);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Meghna Express', 'Intercity', 'E-729', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-729', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Chandpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kumira'), 2, 25, 27, 10),
  (v_route_id, get_or_create_station('Feni'), 3, 85, 88, 20),
  (v_route_id, get_or_create_station('Hasanpur'), 4, 110, 112, 30),
  (v_route_id, get_or_create_station('Nangolkot'), 5, 120, 122, 40),
  (v_route_id, get_or_create_station('Laksam'), 6, 140, 160, 50),
  (v_route_id, get_or_create_station('Chitoshi Road'), 7, 175, 177, 60),
  (v_route_id, get_or_create_station('Meher'), 8, 186, 188, 70),
  (v_route_id, get_or_create_station('Hajiganj'), 9, 202, 204, 80),
  (v_route_id, get_or_create_station('Modhu Road'), 10, 217, 219, 90),
  (v_route_id, get_or_create_station('Chandpur Court'), 11, 233, 233, 100),
  (v_route_id, get_or_create_station('Chandpur'), 12, 250, NULL, 110);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-730', 'DOWN', get_or_create_station('Chandpur'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chandpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chandpur Court'), 2, 5, 7, 10),
  (v_route_id, get_or_create_station('Modhu Road'), 3, 22, 24, 20),
  (v_route_id, get_or_create_station('Hajiganj'), 4, 35, 37, 30),
  (v_route_id, get_or_create_station('Meher'), 5, 50, 52, 40),
  (v_route_id, get_or_create_station('Chitoshi Road'), 6, 64, 66, 50),
  (v_route_id, get_or_create_station('Laksam'), 7, 80, 100, 60),
  (v_route_id, get_or_create_station('Nangolkot'), 8, 114, 116, 70),
  (v_route_id, get_or_create_station('Hasanpur'), 9, 123, 125, 80),
  (v_route_id, get_or_create_station('Feni'), 10, 147, 150, 90),
  (v_route_id, get_or_create_station('Kumira'), 11, 210, 212, 100),
  (v_route_id, get_or_create_station('Chattogram'), 12, 240, NULL, 110);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Agnibina Express', 'Intercity', 'E-735', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-735', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Tarakandi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Gafargaon'), 3, 135, 137, 20),
  (v_route_id, get_or_create_station('Mymensingh'), 4, 185, 188, 30),
  (v_route_id, get_or_create_station('Narundi'), 5, 226, 228, 40),
  (v_route_id, get_or_create_station('Jamalpur Town'), 6, 248, 252, 50),
  (v_route_id, get_or_create_station('Kendua Bazar'), 7, 270, 272, 60),
  (v_route_id, get_or_create_station('Sarishabari'), 8, 303, 305, 70),
  (v_route_id, get_or_create_station('Tarakandi'), 9, 330, NULL, 80);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-736', 'DOWN', get_or_create_station('Tarakandi'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Tarakandi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Sarishabari'), 2, 15, 17, 10),
  (v_route_id, get_or_create_station('Kendua Bazar'), 3, 47, 49, 20),
  (v_route_id, get_or_create_station('Jamalpur Town'), 4, 68, 71, 30),
  (v_route_id, get_or_create_station('Narundi'), 5, 93, 95, 40),
  (v_route_id, get_or_create_station('Mymensingh'), 6, 135, 138, 50),
  (v_route_id, get_or_create_station('Gafargaon'), 7, 184, 187, 60),
  (v_route_id, get_or_create_station('Biman Bandar'), 8, 292, 292, 70),
  (v_route_id, get_or_create_station('Dhaka'), 9, 325, NULL, 80);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Egarosindhur Provati', 'Intercity', 'E-737', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-737', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Kishorganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Narsingdi'), 3, 67, 69, 20),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 4, 98, 118, 30),
  (v_route_id, get_or_create_station('Kuliarchar'), 5, 137, 139, 40),
  (v_route_id, get_or_create_station('Bajitpur'), 6, 147, 149, 50),
  (v_route_id, get_or_create_station('Sararchar'), 7, 157, 159, 60),
  (v_route_id, get_or_create_station('Manikkhali'), 8, 175, 177, 70),
  (v_route_id, get_or_create_station('Gachihata'), 9, 187, 189, 80),
  (v_route_id, get_or_create_station('Kishorganj'), 10, 235, NULL, 90);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-738', 'DOWN', get_or_create_station('Kishorganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Kishorganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Gachihata'), 2, 15, 17, 10),
  (v_route_id, get_or_create_station('Manikkhali'), 3, 27, 29, 20),
  (v_route_id, get_or_create_station('Sararchar'), 4, 45, 47, 30),
  (v_route_id, get_or_create_station('Bajitpur'), 5, 55, 57, 40),
  (v_route_id, get_or_create_station('Kuliarchar'), 6, 65, 67, 50),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 7, 90, 110, 60),
  (v_route_id, get_or_create_station('Methikanda'), 8, 128, 130, 70),
  (v_route_id, get_or_create_station('Narsingdi'), 9, 152, 154, 80),
  (v_route_id, get_or_create_station('Biman Bandar'), 10, 203, 203, 90),
  (v_route_id, get_or_create_station('Dhaka'), 11, 245, NULL, 100);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Upaban Express', 'Intercity', 'E-739', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-739', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Sylhet'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Narsingdi'), 3, 69, 71, 20),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 4, 100, 103, 30),
  (v_route_id, get_or_create_station('Shaistaganj'), 5, 202, 205, 40),
  (v_route_id, get_or_create_station('Sreemangal'), 6, 249, 251, 50),
  (v_route_id, get_or_create_station('Bhanugach'), 7, 270, 272, 60),
  (v_route_id, get_or_create_station('Shamshernagar'), 8, 281, 283, 70),
  (v_route_id, get_or_create_station('Kulaura'), 9, 308, 311, 80),
  (v_route_id, get_or_create_station('Baramchal'), 10, 325, 327, 90),
  (v_route_id, get_or_create_station('Maijgaon'), 11, 343, 345, 100),
  (v_route_id, get_or_create_station('Sylhet'), 12, 420, NULL, 110);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-740', 'DOWN', get_or_create_station('Sylhet'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Sylhet'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Maijgaon'), 2, 39, 41, 10),
  (v_route_id, get_or_create_station('Baramchal'), 3, 58, 60, 20),
  (v_route_id, get_or_create_station('Kulaura'), 4, 73, 76, 30),
  (v_route_id, get_or_create_station('Shamshernagar'), 5, 99, 101, 40),
  (v_route_id, get_or_create_station('Bhanugach'), 6, 110, 112, 50),
  (v_route_id, get_or_create_station('Sreemangal'), 7, 131, 134, 60),
  (v_route_id, get_or_create_station('Shaistaganj'), 8, 180, 183, 70),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 9, 273, 276, 80),
  (v_route_id, get_or_create_station('Biman Bandar'), 10, 342, 342, 90),
  (v_route_id, get_or_create_station('Dhaka'), 11, 370, NULL, 100);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Turna Express', 'Intercity', 'E-741', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-741', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Feni'), 2, 80, 82, 10),
  (v_route_id, get_or_create_station('Laksam'), 3, 120, 122, 20),
  (v_route_id, get_or_create_station('Cumilla'), 4, 145, 147, 30),
  (v_route_id, get_or_create_station('Akhaura'), 5, 197, 200, 40),
  (v_route_id, get_or_create_station('Brahmanbaria'), 6, 217, 220, 50),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 7, 240, 243, 60),
  (v_route_id, get_or_create_station('Dhaka'), 8, 340, NULL, 70);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-742', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 3, 94, 97, 20),
  (v_route_id, get_or_create_station('Brahmanbaria'), 4, 117, 121, 30),
  (v_route_id, get_or_create_station('Akhaura'), 5, 152, 155, 40),
  (v_route_id, get_or_create_station('Cumilla'), 6, 198, 200, 50),
  (v_route_id, get_or_create_station('Laksam'), 7, 223, 225, 60),
  (v_route_id, get_or_create_station('Feni'), 8, 265, 267, 70),
  (v_route_id, get_or_create_station('Chattogram'), 9, 360, NULL, 80);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Brahmaputra Express', 'Intercity', 'E-743', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-743', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Dewanganj Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 59, 63, 20),
  (v_route_id, get_or_create_station('Gafargaon'), 4, 140, 142, 30),
  (v_route_id, get_or_create_station('Mymensingh'), 5, 188, 193, 40),
  (v_route_id, get_or_create_station('Piyarpur'), 6, 223, 225, 50),
  (v_route_id, get_or_create_station('Nandina'), 7, 247, 249, 60),
  (v_route_id, get_or_create_station('Jamalpur Town'), 8, 264, 267, 70),
  (v_route_id, get_or_create_station('Melandah Bazar'), 9, 283, 285, 80),
  (v_route_id, get_or_create_station('Islampur Bazar'), 10, 301, 303, 90),
  (v_route_id, get_or_create_station('Dewanganj Bazar'), 11, 335, NULL, 100);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-744', 'DOWN', get_or_create_station('Dewanganj Bazar'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dewanganj Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Islampur Bazar'), 2, 14, 19, 10),
  (v_route_id, get_or_create_station('Melandah Bazar'), 3, 35, 40, 20),
  (v_route_id, get_or_create_station('Jamalpur Town'), 4, 56, 61, 30),
  (v_route_id, get_or_create_station('Nandina'), 5, 74, 76, 40),
  (v_route_id, get_or_create_station('Piyarpur'), 6, 96, 98, 50),
  (v_route_id, get_or_create_station('Mymensingh'), 7, 130, 135, 60),
  (v_route_id, get_or_create_station('Gafargaon'), 8, 185, 187, 70),
  (v_route_id, get_or_create_station('Biman Bandar'), 9, 300, 300, 80),
  (v_route_id, get_or_create_station('Dhaka'), 10, 335, NULL, 90);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Jamuna Express', 'Intercity', 'E-745', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-745', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Tarakandi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 53, 56, 20),
  (v_route_id, get_or_create_station('Sreepur'), 4, 92, 92, 30),
  (v_route_id, get_or_create_station('Kaoraid'), 5, 131, 131, 40),
  (v_route_id, get_or_create_station('Gafargaon'), 6, 157, 160, 50),
  (v_route_id, get_or_create_station('Mymensingh'), 7, 227, 232, 60),
  (v_route_id, get_or_create_station('Bidyaganj'), 8, 268, 268, 70),
  (v_route_id, get_or_create_station('Piyarpur'), 9, 283, 285, 80),
  (v_route_id, get_or_create_station('Narundi'), 10, 296, 298, 90),
  (v_route_id, get_or_create_station('Jamalpur Town'), 11, 320, 324, 100),
  (v_route_id, get_or_create_station('Sarishabari'), 12, 373, 376, 110),
  (v_route_id, get_or_create_station('Tarakandi'), 13, 405, NULL, 120);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-746', 'DOWN', get_or_create_station('Tarakandi'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Tarakandi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Sarishabari'), 2, 15, 18, 10),
  (v_route_id, get_or_create_station('Jamalpur Town'), 3, 66, 71, 20),
  (v_route_id, get_or_create_station('Narundi'), 4, 93, 95, 30),
  (v_route_id, get_or_create_station('Piyarpur'), 5, 106, 108, 40),
  (v_route_id, get_or_create_station('Bidyaganj'), 6, 121, 121, 50),
  (v_route_id, get_or_create_station('Mymensingh'), 7, 145, 150, 60),
  (v_route_id, get_or_create_station('Gafargaon'), 8, 196, 198, 70),
  (v_route_id, get_or_create_station('Kaoraid'), 9, 222, 222, 80),
  (v_route_id, get_or_create_station('Sreepur'), 10, 255, 255, 90),
  (v_route_id, get_or_create_station('Joydebpur'), 11, 295, 297, 100),
  (v_route_id, get_or_create_station('Biman Bandar'), 12, 323, 323, 110),
  (v_route_id, get_or_create_station('Dhaka'), 13, 360, NULL, 120);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Egarosindhur Godhuli', 'Intercity', 'E-749', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-749', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Kishorganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Narsingdi'), 3, 68, 70, 20),
  (v_route_id, get_or_create_station('Methikanda'), 4, 87, 89, 30),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 5, 105, 125, 40),
  (v_route_id, get_or_create_station('Kuliarchar'), 6, 144, 146, 50),
  (v_route_id, get_or_create_station('Bajitpur'), 7, 155, 157, 60),
  (v_route_id, get_or_create_station('Sararchar'), 8, 165, 167, 70),
  (v_route_id, get_or_create_station('Manikkhali'), 9, 183, 185, 80),
  (v_route_id, get_or_create_station('Gachihata'), 10, 195, 197, 90),
  (v_route_id, get_or_create_station('Kishorganj'), 11, 235, NULL, 100);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-750', 'DOWN', get_or_create_station('Kishorganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Kishorganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Gachihata'), 2, 16, 18, 10),
  (v_route_id, get_or_create_station('Manikkhali'), 3, 41, 43, 20),
  (v_route_id, get_or_create_station('Sararchar'), 4, 62, 64, 30),
  (v_route_id, get_or_create_station('Bajitpur'), 5, 73, 75, 40),
  (v_route_id, get_or_create_station('Kuliarchar'), 6, 83, 85, 50),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 7, 110, 130, 60),
  (v_route_id, get_or_create_station('Narsingdi'), 8, 159, 161, 70),
  (v_route_id, get_or_create_station('Biman Bandar'), 9, 202, 202, 80),
  (v_route_id, get_or_create_station('Dhaka'), 10, 235, NULL, 90);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Kalni Express', 'Intercity', 'E-773', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-773', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Sylhet'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 22, 27, 10),
  (v_route_id, get_or_create_station('Brahmanbaria'), 3, 111, 114, 20),
  (v_route_id, get_or_create_station('Azampur'), 4, 137, 139, 30),
  (v_route_id, get_or_create_station('Harashpur'), 5, 159, 161, 40),
  (v_route_id, get_or_create_station('Shaistaganj'), 6, 197, 200, 50),
  (v_route_id, get_or_create_station('Sreemangal'), 7, 237, 240, 60),
  (v_route_id, get_or_create_station('Shamshernagar'), 8, 267, 271, 70),
  (v_route_id, get_or_create_station('Kulaura'), 9, 294, 296, 80),
  (v_route_id, get_or_create_station('Maijgaon'), 10, 325, 328, 90),
  (v_route_id, get_or_create_station('Sylhet'), 11, 395, NULL, 100);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-774', 'DOWN', get_or_create_station('Sylhet'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Sylhet'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Maijgaon'), 2, 40, 42, 10),
  (v_route_id, get_or_create_station('Kulaura'), 3, 68, 71, 20),
  (v_route_id, get_or_create_station('Shamshernagar'), 4, 95, 97, 30),
  (v_route_id, get_or_create_station('Sreemangal'), 5, 122, 125, 40),
  (v_route_id, get_or_create_station('Shaistaganj'), 6, 162, 164, 50),
  (v_route_id, get_or_create_station('Harashpur'), 7, 217, 219, 60),
  (v_route_id, get_or_create_station('Azampur'), 8, 245, 247, 70),
  (v_route_id, get_or_create_station('Brahmanbaria'), 9, 273, 276, 80),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 10, 295, 298, 90),
  (v_route_id, get_or_create_station('Narsingdi'), 11, 328, 330, 100),
  (v_route_id, get_or_create_station('Biman Bandar'), 12, 369, 369, 110),
  (v_route_id, get_or_create_station('Dhaka'), 13, 400, NULL, 120);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Haor Express', 'Intercity', 'E-777', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-777', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Mohanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 53, 55, 20),
  (v_route_id, get_or_create_station('Gafargaon'), 4, 132, 134, 30),
  (v_route_id, get_or_create_station('Mymensingh'), 5, 180, 200, 40),
  (v_route_id, get_or_create_station('Gouripur Myn'), 6, 225, 230, 50),
  (v_route_id, get_or_create_station('Shyamgonj'), 7, 243, 246, 60),
  (v_route_id, get_or_create_station('Netrakona'), 8, 265, 268, 70),
  (v_route_id, get_or_create_station('Thakrokona'), 9, 282, 282, 80),
  (v_route_id, get_or_create_station('Barhatta'), 10, 295, 298, 90),
  (v_route_id, get_or_create_station('Mohanganj'), 11, 355, NULL, 100);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-778', 'DOWN', get_or_create_station('Mohanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Mohanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Barhatta'), 2, 14, 16, 10),
  (v_route_id, get_or_create_station('Thakrokona'), 3, 26, 26, 20),
  (v_route_id, get_or_create_station('Netrakona'), 4, 47, 52, 30),
  (v_route_id, get_or_create_station('Shyamgonj'), 5, 75, 78, 40),
  (v_route_id, get_or_create_station('Gouripur Myn'), 6, 91, 94, 50),
  (v_route_id, get_or_create_station('Mymensingh'), 7, 134, 154, 60),
  (v_route_id, get_or_create_station('Gafargaon'), 8, 199, 202, 70),
  (v_route_id, get_or_create_station('Joydebpur'), 9, 293, 295, 80),
  (v_route_id, get_or_create_station('Biman Bandar'), 10, 322, 325, 90),
  (v_route_id, get_or_create_station('Dhaka'), 11, 355, NULL, 100);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Kishoreganj Express', 'Intercity', 'E-781', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-781', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Kishorganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 22, 27, 10),
  (v_route_id, get_or_create_station('Narsingdi'), 3, 66, 69, 20),
  (v_route_id, get_or_create_station('Methikanda'), 4, 87, 89, 30),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 5, 105, 125, 40),
  (v_route_id, get_or_create_station('Kuliarchar'), 6, 144, 146, 50),
  (v_route_id, get_or_create_station('Bajitpur'), 7, 154, 156, 60),
  (v_route_id, get_or_create_station('Sararchar'), 8, 164, 166, 70),
  (v_route_id, get_or_create_station('Manikkhali'), 9, 181, 183, 80),
  (v_route_id, get_or_create_station('Gachihata'), 10, 190, 192, 90),
  (v_route_id, get_or_create_station('Kishorganj'), 11, 220, NULL, 100);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-782', 'DOWN', get_or_create_station('Kishorganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Kishorganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Gachihata'), 2, 15, 17, 10),
  (v_route_id, get_or_create_station('Manikkhali'), 3, 27, 29, 20),
  (v_route_id, get_or_create_station('Sararchar'), 4, 45, 47, 30),
  (v_route_id, get_or_create_station('Bajitpur'), 5, 55, 57, 40),
  (v_route_id, get_or_create_station('Kuliarchar'), 6, 65, 67, 50),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 7, 88, 108, 60),
  (v_route_id, get_or_create_station('Methikanda'), 8, 124, 126, 70),
  (v_route_id, get_or_create_station('Narsingdi'), 9, 147, 150, 80),
  (v_route_id, get_or_create_station('Biman Bandar'), 10, 200, 200, 90),
  (v_route_id, get_or_create_station('Dhaka'), 11, 240, NULL, 100);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Bijoy Express', 'Intercity', 'E-785', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-785', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Jamalpur Town'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bhatiary'), 2, 16, 18, 10),
  (v_route_id, get_or_create_station('Feni'), 3, 84, 86, 20),
  (v_route_id, get_or_create_station('Laksam'), 4, 123, 125, 30),
  (v_route_id, get_or_create_station('Cumilla'), 5, 147, 149, 40),
  (v_route_id, get_or_create_station('Akhaura'), 6, 200, 205, 50),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 7, 240, 245, 60),
  (v_route_id, get_or_create_station('Sararchar'), 8, 277, 279, 70),
  (v_route_id, get_or_create_station('Kishorganj'), 9, 313, 318, 80),
  (v_route_id, get_or_create_station('Atharabari'), 10, 350, 350, 90),
  (v_route_id, get_or_create_station('Gouripur Myn'), 11, 380, 400, 100),
  (v_route_id, get_or_create_station('Mymensingh'), 12, 428, 433, 110),
  (v_route_id, get_or_create_station('Piyarpur'), 13, 471, 473, 120),
  (v_route_id, get_or_create_station('Jamalpur Town'), 14, 525, NULL, 130);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-786', 'DOWN', get_or_create_station('Jamalpur Town'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Jamalpur Town'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Piyarpur'), 2, 30, 32, 10),
  (v_route_id, get_or_create_station('Mymensingh'), 3, 65, 95, 20),
  (v_route_id, get_or_create_station('Gouripur Myn'), 4, 120, 140, 30),
  (v_route_id, get_or_create_station('Atharabari'), 5, 167, 167, 40),
  (v_route_id, get_or_create_station('Kishorganj'), 6, 201, 206, 50),
  (v_route_id, get_or_create_station('Sararchar'), 7, 239, 241, 60),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 8, 270, 275, 70),
  (v_route_id, get_or_create_station('Akhaura'), 9, 320, 325, 80),
  (v_route_id, get_or_create_station('Cumilla'), 10, 368, 370, 90),
  (v_route_id, get_or_create_station('Laksam'), 11, 392, 395, 100),
  (v_route_id, get_or_create_station('Feni'), 12, 435, 437, 110),
  (v_route_id, get_or_create_station('Bhatiary'), 13, 505, 507, 120),
  (v_route_id, get_or_create_station('Chattogram'), 14, 540, NULL, 130);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Sonar Bangla Express', 'Intercity', 'E-787', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-787', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 295, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-788', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 22, 27, 10),
  (v_route_id, get_or_create_station('Chattogram'), 3, 295, NULL, 20);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mohanganj Express', 'Intercity', 'E-789', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-789', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Mohanganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 22, 27, 10),
  (v_route_id, get_or_create_station('Gafargaon'), 3, 126, 129, 20),
  (v_route_id, get_or_create_station('Mymensingh'), 4, 175, 195, 30),
  (v_route_id, get_or_create_station('Gouripur Myn'), 5, 219, 222, 40),
  (v_route_id, get_or_create_station('Shyamgonj'), 6, 236, 239, 50),
  (v_route_id, get_or_create_station('Netrakona'), 7, 258, 261, 60),
  (v_route_id, get_or_create_station('Thakrokona'), 8, 275, 278, 70),
  (v_route_id, get_or_create_station('Barhatta'), 9, 286, 289, 80),
  (v_route_id, get_or_create_station('Mohanganj'), 10, 325, NULL, 90);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-790', 'DOWN', get_or_create_station('Mohanganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Mohanganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Barhatta'), 2, 16, 19, 10),
  (v_route_id, get_or_create_station('Thakrokona'), 3, 29, 32, 20),
  (v_route_id, get_or_create_station('Netrakona'), 4, 50, 53, 30),
  (v_route_id, get_or_create_station('Shyamgonj'), 5, 75, 78, 40),
  (v_route_id, get_or_create_station('Gouripur Myn'), 6, 92, 95, 50),
  (v_route_id, get_or_create_station('Mymensingh'), 7, 130, 150, 60),
  (v_route_id, get_or_create_station('Gafargaon'), 8, 198, 201, 70),
  (v_route_id, get_or_create_station('Dhaka'), 9, 355, NULL, 80);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Jamalpur Express', 'Intercity', 'E-799', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-799', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Bhuapur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 22, 27, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 53, 56, 20),
  (v_route_id, get_or_create_station('Gafargaon'), 4, 134, 137, 30),
  (v_route_id, get_or_create_station('Mymensingh'), 5, 185, 190, 40),
  (v_route_id, get_or_create_station('Bidyaganj'), 6, 212, 212, 50),
  (v_route_id, get_or_create_station('Narundi'), 7, 214, 214, 60),
  (v_route_id, get_or_create_station('Nandina'), 8, 248, 252, 70),
  (v_route_id, get_or_create_station('Jamalpur Town'), 9, 265, 268, 80),
  (v_route_id, get_or_create_station('Jaforshahi'), 10, 299, 299, 90),
  (v_route_id, get_or_create_station('Sarishabari'), 11, 321, 324, 100),
  (v_route_id, get_or_create_station('Tarakandi'), 12, 342, 345, 110),
  (v_route_id, get_or_create_station('Jagannathgonj Bazar'), 13, 356, 356, 120),
  (v_route_id, get_or_create_station('Hemnagar'), 14, 376, 376, 130),
  (v_route_id, get_or_create_station('Bhuapur'), 15, 405, NULL, 140);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-800', 'DOWN', get_or_create_station('Bhuapur'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Bhuapur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Hemnagar'), 2, 17, 17, 10),
  (v_route_id, get_or_create_station('Jagannathgonj Bazar'), 3, 36, 36, 20),
  (v_route_id, get_or_create_station('Tarakandi'), 4, 51, 56, 30),
  (v_route_id, get_or_create_station('Sarishabari'), 5, 72, 75, 40),
  (v_route_id, get_or_create_station('Jaforshahi'), 6, 95, 95, 50),
  (v_route_id, get_or_create_station('Jamalpur Town'), 7, 127, 130, 60),
  (v_route_id, get_or_create_station('Nandina'), 8, 143, 145, 70),
  (v_route_id, get_or_create_station('Narundi'), 9, 147, 147, 80),
  (v_route_id, get_or_create_station('Bidyaganj'), 10, 176, 176, 90),
  (v_route_id, get_or_create_station('Mymensingh'), 11, 200, 205, 100),
  (v_route_id, get_or_create_station('Gafargaon'), 12, 262, 264, 110),
  (v_route_id, get_or_create_station('Joydebpur'), 13, 341, 343, 120),
  (v_route_id, get_or_create_station('Dhaka'), 14, 400, NULL, 130);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Chattala Express', 'Intercity', 'E-801', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-801', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kumira'), 2, 26, 28, 10),
  (v_route_id, get_or_create_station('Feni'), 3, 88, 91, 20),
  (v_route_id, get_or_create_station('Hasanpur'), 4, 112, 114, 30),
  (v_route_id, get_or_create_station('Nangolkot'), 5, 122, 124, 40),
  (v_route_id, get_or_create_station('Laksam'), 6, 137, 140, 50),
  (v_route_id, get_or_create_station('Cumilla'), 7, 161, 164, 60),
  (v_route_id, get_or_create_station('Shashidal'), 8, 185, 187, 70),
  (v_route_id, get_or_create_station('Quasba'), 9, 219, 221, 80),
  (v_route_id, get_or_create_station('Akhaura'), 10, 245, 248, 90),
  (v_route_id, get_or_create_station('Brahmanbaria'), 11, 266, 269, 100),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 12, 290, 293, 110),
  (v_route_id, get_or_create_station('Methikanda'), 13, 308, 310, 120),
  (v_route_id, get_or_create_station('Narsingdi'), 14, 327, 330, 130),
  (v_route_id, get_or_create_station('Biman Bandar'), 15, 370, 373, 140),
  (v_route_id, get_or_create_station('Dhaka'), 16, 400, NULL, 150);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-802', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Narsingdi'), 3, 65, 68, 20),
  (v_route_id, get_or_create_station('Methikanda'), 4, 86, 88, 30),
  (v_route_id, get_or_create_station('Bhairab Bazar'), 5, 102, 105, 40),
  (v_route_id, get_or_create_station('Brahmanbaria'), 6, 124, 128, 50),
  (v_route_id, get_or_create_station('Akhaura'), 7, 147, 150, 60),
  (v_route_id, get_or_create_station('Quasba'), 8, 166, 168, 70),
  (v_route_id, get_or_create_station('Shashidal'), 9, 181, 183, 80),
  (v_route_id, get_or_create_station('Cumilla'), 10, 205, 207, 90),
  (v_route_id, get_or_create_station('Laksam'), 11, 229, 232, 100),
  (v_route_id, get_or_create_station('Nangolkot'), 12, 246, 248, 110),
  (v_route_id, get_or_create_station('Hasanpur'), 13, 255, 257, 120),
  (v_route_id, get_or_create_station('Feni'), 14, 278, 280, 130),
  (v_route_id, get_or_create_station('Kumira'), 15, 341, 343, 140),
  (v_route_id, get_or_create_station('Chattogram'), 16, 375, NULL, 150);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Cox''s Bazar Express', 'Intercity', 'E-813', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-813', 'UP', get_or_create_station('Cox''s Bazar'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Cox''s Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chattogram'), 2, 190, 210, 10),
  (v_route_id, get_or_create_station('Dhaka'), 3, 510, NULL, 20);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-814', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Cox''s Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Chattogram'), 3, 280, 320, 20),
  (v_route_id, get_or_create_station('Cox''s Bazar'), 4, 500, NULL, 30);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Parjotak Express', 'Intercity', 'E-815', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-815', 'UP', get_or_create_station('Cox''s Bazar'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Cox''s Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chattogram'), 2, 180, 210, 10),
  (v_route_id, get_or_create_station('Dhaka'), 3, 515, NULL, 20);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-816', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Cox''s Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Chattogram'), 3, 305, 325, 20),
  (v_route_id, get_or_create_station('Cox''s Bazar'), 4, 505, NULL, 30);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Shaikat Express', 'Intercity', 'E-821', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-821', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Cox''s Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Sholoshohor'), 2, 10, 12, 10),
  (v_route_id, get_or_create_station('Janali Hat'), 3, 24, 26, 20),
  (v_route_id, get_or_create_station('Patiya'), 4, 50, 52, 30),
  (v_route_id, get_or_create_station('Dohazari'), 5, 74, 76, 40),
  (v_route_id, get_or_create_station('Satkania'), 6, 87, 89, 50),
  (v_route_id, get_or_create_station('Chakaria'), 7, 140, 142, 60),
  (v_route_id, get_or_create_station('Dulahazara'), 8, 163, 165, 70),
  (v_route_id, get_or_create_station('Ramu'), 9, 196, 198, 80),
  (v_route_id, get_or_create_station('Cox''s Bazar'), 10, 215, NULL, 90);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Probal Express', 'Intercity', 'E-822', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-822', 'UP', get_or_create_station('Cox''s Bazar'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Cox''s Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ramu'), 2, 13, 15, 10),
  (v_route_id, get_or_create_station('ISLAMABAD'), 3, 31, 33, 20),
  (v_route_id, get_or_create_station('Dulahazara'), 4, 50, 52, 30),
  (v_route_id, get_or_create_station('Chakaria'), 5, 71, 73, 40),
  (v_route_id, get_or_create_station('HARBANG'), 6, 82, 84, 50),
  (v_route_id, get_or_create_station('LOHAGARA'), 7, 111, 113, 60),
  (v_route_id, get_or_create_station('Satkania'), 8, 126, 128, 70),
  (v_route_id, get_or_create_station('Dohazari'), 9, 142, 144, 80),
  (v_route_id, get_or_create_station('Patiya'), 10, 166, 168, 90),
  (v_route_id, get_or_create_station('GOMDANDI'), 11, 186, 188, 100),
  (v_route_id, get_or_create_station('Sholoshohor'), 12, 210, 210, 110),
  (v_route_id, get_or_create_station('Chattogram'), 13, 230, NULL, 120);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-823', 'DOWN', get_or_create_station('Chattogram'), get_or_create_station('Cox''s Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Sholoshohor'), 2, 11, 13, 10),
  (v_route_id, get_or_create_station('GOMDANDI'), 3, 30, 32, 20),
  (v_route_id, get_or_create_station('Patiya'), 4, 50, 52, 30),
  (v_route_id, get_or_create_station('Dohazari'), 5, 72, 74, 40),
  (v_route_id, get_or_create_station('Satkania'), 6, 85, 87, 50),
  (v_route_id, get_or_create_station('LOHAGARA'), 7, 100, 102, 60),
  (v_route_id, get_or_create_station('HARBANG'), 8, 128, 130, 70),
  (v_route_id, get_or_create_station('Chakaria'), 9, 142, 144, 80),
  (v_route_id, get_or_create_station('Dulahazara'), 10, 166, 168, 90),
  (v_route_id, get_or_create_station('ISLAMABAD'), 11, 185, 187, 100),
  (v_route_id, get_or_create_station('Ramu'), 12, 204, 206, 110),
  (v_route_id, get_or_create_station('Cox''s Bazar'), 13, 230, NULL, 120);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Shaikat Express (2)', 'Intercity', 'E-824', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-824', 'UP', get_or_create_station('Cox''s Bazar'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Cox''s Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ramu'), 2, 15, 17, 10),
  (v_route_id, get_or_create_station('Dulahazara'), 3, 48, 50, 20),
  (v_route_id, get_or_create_station('Chakaria'), 4, 72, 74, 30),
  (v_route_id, get_or_create_station('Satkania'), 5, 125, 127, 40),
  (v_route_id, get_or_create_station('Dohazari'), 6, 138, 140, 50),
  (v_route_id, get_or_create_station('Patiya'), 7, 162, 164, 60),
  (v_route_id, get_or_create_station('Janali Hat'), 8, 190, 192, 70),
  (v_route_id, get_or_create_station('Chattogram'), 9, 230, NULL, 80);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Nazirhat Local', 'Local', 'E-NAZ-123', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAZ-123', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Nazirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 5, 0),
  (v_route_id, get_or_create_station('Nazirhat'), 2, 20, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-NAZ-124', 'DOWN', get_or_create_station('Nazirhat'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Nazirhat'), 1, NULL, 5, 0),
  (v_route_id, get_or_create_station('Chattogram'), 2, 20, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Jaria Local', 'Local', 'E-JARIA-271', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JARIA-271', 'UP', get_or_create_station('Jaria Jhanjail'), get_or_create_station('Mymensingh Junction'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Jaria Jhanjail'), 1, NULL, 5, 0),
  (v_route_id, get_or_create_station('Mymensingh Junction'), 2, 20, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JARIA-272', 'DOWN', get_or_create_station('Mymensingh Junction'), get_or_create_station('Jaria Jhanjail'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Mymensingh Junction'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Jaria Jhanjail'), 2, 100, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Jaria Local (2)', 'Local', 'E-JARIA-273', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JARIA-273', 'UP', get_or_create_station('Jaria Jhanjail'), get_or_create_station('Mymensingh Junction'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Jaria Jhanjail'), 1, NULL, 5, 0),
  (v_route_id, get_or_create_station('Mymensingh Junction'), 2, 20, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JARIA-274', 'DOWN', get_or_create_station('Mymensingh Junction'), get_or_create_station('Jaria Jhanjail'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Mymensingh Junction'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Jaria Jhanjail'), 2, 125, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Jaria Local (3)', 'Local', 'E-JARIA-275', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JARIA-275', 'UP', get_or_create_station('Jaria Jhanjail'), get_or_create_station('Mymensingh Junction'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Jaria Jhanjail'), 1, NULL, 5, 0),
  (v_route_id, get_or_create_station('Mymensingh Junction'), 2, 20, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JARIA-276', 'DOWN', get_or_create_station('Mymensingh Junction'), get_or_create_station('Jaria Jhanjail'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Mymensingh Junction'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Jaria Jhanjail'), 2, 105, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Jaria Local (4)', 'Local', 'E-JARIA-277', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JARIA-277', 'UP', get_or_create_station('Jaria Jhanjail'), get_or_create_station('Mymensingh Junction'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Jaria Jhanjail'), 1, NULL, 5, 0),
  (v_route_id, get_or_create_station('Mymensingh Junction'), 2, 20, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-JARIA-278', 'DOWN', get_or_create_station('Mymensingh Junction'), get_or_create_station('Jaria Jhanjail'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Mymensingh Junction'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Jaria Jhanjail'), 2, 95, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Dhaka Mail', 'Mail', 'E-1', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-1', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 435, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Chattogram Mail', 'Mail', 'E-2', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-2', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chattogram'), 2, 445, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Surma Mail', 'Mail', 'E-9', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-9', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Sylhet'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Sylhet'), 2, 720, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-10', 'DOWN', get_or_create_station('Sylhet'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Sylhet'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 815, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Noakhali Mail', 'Mail', 'E-11', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-11', 'UP', get_or_create_station('Noakhali'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Noakhali'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 570, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-12', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Noakhali'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Noakhali'), 2, 465, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Jalalabad Mail', 'Mail', 'E-13', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-13', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Sylhet'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Sylhet'), 2, 1370, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-14', 'DOWN', get_or_create_station('Sylhet'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Sylhet'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chattogram'), 2, 860, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mymensingh Mail', 'Mail', 'E-37', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-37', 'UP', get_or_create_station('Chattogram'), get_or_create_station('Ibrahimabad'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chattogram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ibrahimabad'), 2, 1005, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-38', 'DOWN', get_or_create_station('Ibrahimabad'), get_or_create_station('Chattogram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Ibrahimabad'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chattogram'), 2, 1040, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Isha Khan Mail', 'Mail', 'E-39', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-39', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Mymensingh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Mymensingh'), 2, 545, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-40', 'DOWN', get_or_create_station('Mymensingh'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Mymensingh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 625, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Samatat Mail', 'Mail', 'E-45', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-45', 'UP', get_or_create_station('Noakhali'), get_or_create_station('Laksam'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Noakhali'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Laksam'), 2, 110, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-46', 'DOWN', get_or_create_station('Laksam'), get_or_create_station('Noakhali'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Laksam'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Noakhali'), 2, 115, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Bhawal Mail', 'Mail', 'E-55', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-55', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Dewanganj Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dewanganj Bazar'), 2, 440, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-56', 'DOWN', get_or_create_station('Dewanganj Bazar'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dewanganj Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 500, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Dholeswari Mail', 'Mail', 'E-75', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-75', 'UP', get_or_create_station('Mymensingh'), get_or_create_station('Ibrahimabad'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Mymensingh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ibrahimabad'), 2, 260, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'E-76', 'DOWN', get_or_create_station('Ibrahimabad'), get_or_create_station('Mymensingh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Ibrahimabad'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Mymensingh'), 2, 50, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rajshahi Commuter', 'Commuter', 'W-5', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-5', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Chapainawabganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chapainawabganj'), 2, 585, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-6', 'DOWN', get_or_create_station('Chapainawabganj'), get_or_create_station('Ishwardi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chapainawabganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ishwardi'), 2, 250, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Bogura Commuter', 'Commuter', 'W-19', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-19', 'UP', get_or_create_station('Santahar'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Santahar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bogura'), 2, 15, 20, 10),
  (v_route_id, get_or_create_station('Sonatola'), 3, 35, 40, 20),
  (v_route_id, get_or_create_station('Bonarpara'), 4, 55, 60, 30),
  (v_route_id, get_or_create_station('Gaibandha'), 5, 75, 80, 40),
  (v_route_id, get_or_create_station('Bamondanga'), 6, 95, 100, 50),
  (v_route_id, get_or_create_station('Pirgacha'), 7, 115, 120, 60),
  (v_route_id, get_or_create_station('Kaunia'), 8, 135, 140, 70),
  (v_route_id, get_or_create_station('Lalmonirhat'), 9, 430, NULL, 80);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-20', 'DOWN', get_or_create_station('Lalmonirhat'), get_or_create_station('Santahar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kaunia'), 2, 15, 20, 10),
  (v_route_id, get_or_create_station('Pirgacha'), 3, 35, 40, 20),
  (v_route_id, get_or_create_station('Bamondanga'), 4, 55, 60, 30),
  (v_route_id, get_or_create_station('Gaibandha'), 5, 75, 80, 40),
  (v_route_id, get_or_create_station('Bonarpara'), 6, 95, 100, 50),
  (v_route_id, get_or_create_station('Sonatola'), 7, 115, 120, 60),
  (v_route_id, get_or_create_station('Bogura'), 8, 135, 140, 70),
  (v_route_id, get_or_create_station('Santahar'), 9, 365, NULL, 80);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Padmarag Commuter', 'Commuter', 'W-21', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-21', 'UP', get_or_create_station('Santahar'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Santahar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 375, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-22', 'DOWN', get_or_create_station('Lalmonirhat'), get_or_create_station('Santahar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Santahar'), 2, 405, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Nakshikantha Commuter', 'Commuter', 'W-25', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-25', 'UP', get_or_create_station('Khulna'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 610, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-26', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Khulna'), 2, 585, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Kanchan Commuter', 'Commuter', 'W-41', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-41', 'UP', get_or_create_station('Parbatipur'), get_or_create_station('Panchagarh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Panchagarh'), 2, 260, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-42', 'DOWN', get_or_create_station('Panchagarh'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Panchagarh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 225, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Betna Commuter', 'Commuter', 'W-53', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-53', 'UP', get_or_create_station('Khulna'), get_or_create_station('Benapole'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Daulatpur'), 2, 15, 20, 10),
  (v_route_id, get_or_create_station('Jashore'), 3, 35, 40, 20),
  (v_route_id, get_or_create_station('Jhikargacha'), 4, 55, 60, 30),
  (v_route_id, get_or_create_station('Benapole'), 5, 135, NULL, 40);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-54', 'DOWN', get_or_create_station('Benapole'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Benapole'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Jhikargacha'), 2, 15, 20, 10),
  (v_route_id, get_or_create_station('Jashore'), 3, 35, 40, 20),
  (v_route_id, get_or_create_station('Daulatpur'), 4, 55, 60, 30),
  (v_route_id, get_or_create_station('Khulna'), 5, 150, NULL, 40);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Ishwardi Commuter', 'Commuter', 'W-57', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-57', 'UP', get_or_create_station('Ishwardi'), get_or_create_station('Rohanpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Ishwardi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Azim Nagar'), 2, 15, 20, 10),
  (v_route_id, get_or_create_station('Abdulpur'), 3, 35, 40, 20),
  (v_route_id, get_or_create_station('Lokmanpur'), 4, 55, 60, 30),
  (v_route_id, get_or_create_station('Arani'), 5, 75, 80, 40),
  (v_route_id, get_or_create_station('Sardah_Road'), 6, 95, 100, 50),
  (v_route_id, get_or_create_station('Rajshahi'), 7, 115, 120, 60),
  (v_route_id, get_or_create_station('Rajshahi_Court'), 8, 135, 140, 70),
  (v_route_id, get_or_create_station('Kakonhat'), 9, 155, 160, 80),
  (v_route_id, get_or_create_station('Lolitnagar'), 10, 175, 180, 90),
  (v_route_id, get_or_create_station('Amnura'), 11, 195, 200, 100),
  (v_route_id, get_or_create_station('Nachole'), 12, 215, 220, 110),
  (v_route_id, get_or_create_station('Rohanpur'), 13, 250, NULL, 120);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-58', 'DOWN', get_or_create_station('Rohanpur'), get_or_create_station('Ishwardi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rohanpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Nachole'), 2, 15, 20, 10),
  (v_route_id, get_or_create_station('Amnura'), 3, 35, 40, 20),
  (v_route_id, get_or_create_station('Lolitnagar'), 4, 55, 60, 30),
  (v_route_id, get_or_create_station('Kakonhat'), 5, 75, 80, 40),
  (v_route_id, get_or_create_station('Rajshahi_Court'), 6, 95, 100, 50),
  (v_route_id, get_or_create_station('Rajshahi'), 7, 115, 120, 60),
  (v_route_id, get_or_create_station('Sardah_Road'), 8, 135, 140, 70),
  (v_route_id, get_or_create_station('Arani'), 9, 155, 160, 80),
  (v_route_id, get_or_create_station('Lokmanpur'), 10, 175, 180, 90),
  (v_route_id, get_or_create_station('Abdulpur'), 11, 195, 200, 100),
  (v_route_id, get_or_create_station('Azim Nagar'), 12, 215, 220, 110),
  (v_route_id, get_or_create_station('Ishwardi'), 13, 222, NULL, 120);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Dinajpur Commuter', 'Commuter', 'W-61', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-61', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Birol'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Birol'), 2, 260, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-62', 'DOWN', get_or_create_station('Birol'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Birol'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 220, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Lalmoni Commuter-1', 'Commuter', 'W-63', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-63', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 140, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Lalmoni Commuter-2', 'Commuter', 'W-64', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-64', 'UP', get_or_create_station('Parbatipur'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 150, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Burimari Commuter-1', 'Commuter', 'W-65', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-65', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Burimari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Burimari'), 2, 140, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Burimari Commuter-2', 'Commuter', 'W-66', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-66', 'UP', get_or_create_station('Burimari'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Burimari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 140, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Parbatipur Commuter', 'Commuter', 'W-69', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-69', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 155, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-70', 'DOWN', get_or_create_station('Parbatipur'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 125, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Burimari Commuter-3', 'Commuter', 'W-71', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-71', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Burimari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Burimari'), 2, 160, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Burimari Commuter-4', 'Commuter', 'W-72', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-72', 'UP', get_or_create_station('Burimari'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Burimari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 185, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rohanpur Commuter', 'Commuter', 'W-77', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-77', 'UP', get_or_create_station('Rajshahi'), get_or_create_station('Rohanpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rohanpur'), 2, 90, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-78', 'DOWN', get_or_create_station('Rohanpur'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rohanpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rajshahi'), 2, 100, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mongla Commuter', 'Commuter', 'W-95', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-95', 'UP', get_or_create_station('Mongla'), get_or_create_station('Benapole'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Mongla'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Benapole'), 2, 215, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-96', 'DOWN', get_or_create_station('Benapole'), get_or_create_station('Mongla'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Benapole'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Mongla'), 2, 195, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Dhaka Commuter', 'Commuter', 'W-99', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-99', 'UP', get_or_create_station('Ishwardi'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Ishwardi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 365, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Lalmoni Commuter-3', 'Commuter', 'W-100', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-100', 'UP', get_or_create_station('Rangpur'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rangpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 60, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Chilmari Commuter-1', 'Commuter', 'W-119', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-119', 'UP', get_or_create_station('Kaunia'), get_or_create_station('Ramna Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Kaunia'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ramna Bazar'), 2, 150, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Chilmari Commuter-2', 'Commuter', 'W-120', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-120', 'UP', get_or_create_station('Ramna Bazar'), get_or_create_station('Rangpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Ramna Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rangpur'), 2, 175, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Chandana Commuter', 'Commuter', 'W-121', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-121', 'UP', get_or_create_station('Rajbari'), get_or_create_station('Bhanga'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajbari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bhanga'), 2, 75, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Bhanga Commuter', 'Commuter', 'W-122', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-122', 'UP', get_or_create_station('Bhanga'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Bhanga'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 120, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-123', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Bhanga'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bhanga'), 2, 120, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Chandana Commuter (2)', 'Commuter', 'W-124', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-124', 'UP', get_or_create_station('Bhanga'), get_or_create_station('Rajbari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Bhanga'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rajbari'), 2, 80, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Punarbhaba Commuter', 'Commuter', 'W-125', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-125', 'UP', get_or_create_station('Rajshahi'), get_or_create_station('Rohanpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rohanpur'), 2, 140, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-126', 'DOWN', get_or_create_station('Rohanpur'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rohanpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rajshahi'), 2, 140, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mallika Commuter', 'Commuter', 'W-127', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-127', 'UP', get_or_create_station('Rajshahi'), get_or_create_station('Chapainawabganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chapainawabganj'), 2, 120, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-128', 'DOWN', get_or_create_station('Chapainawabganj'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chapainawabganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rajshahi'), 2, 105, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Aparajita Commuter', 'Commuter', 'W-129', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-129', 'UP', get_or_create_station('Rohanpur'), get_or_create_station('Chapainawabganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rohanpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chapainawabganj'), 2, 65, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-130', 'DOWN', get_or_create_station('Chapainawabganj'), get_or_create_station('Rohanpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chapainawabganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rohanpur'), 2, 85, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Abhijatri Commuter', 'Commuter', 'W-135-2026', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-135-2026', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Gopalganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Keraniganj'), 2, 15, 20, 10),
  (v_route_id, get_or_create_station('Sreenagar'), 3, 35, 40, 20),
  (v_route_id, get_or_create_station('Mawa'), 4, 55, 60, 30),
  (v_route_id, get_or_create_station('Bhanga Junction'), 5, 75, 80, 40),
  (v_route_id, get_or_create_station('Nagarkanda'), 6, 95, 100, 50),
  (v_route_id, get_or_create_station('Maheshpur'), 7, 115, 120, 60),
  (v_route_id, get_or_create_station('Kashiani Junction'), 8, 135, 140, 70),
  (v_route_id, get_or_create_station('Gopalganj'), 9, 195, NULL, 80);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-136-2026', 'DOWN', get_or_create_station('Gopalganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Gopalganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kashiani Junction'), 2, 15, 20, 10),
  (v_route_id, get_or_create_station('Maheshpur'), 3, 35, 40, 20),
  (v_route_id, get_or_create_station('Nagarkanda'), 4, 55, 60, 30),
  (v_route_id, get_or_create_station('Bhanga Junction'), 5, 75, 80, 40),
  (v_route_id, get_or_create_station('Mawa'), 6, 95, 100, 50),
  (v_route_id, get_or_create_station('Sreenagar'), 7, 115, 120, 60),
  (v_route_id, get_or_create_station('Keraniganj'), 8, 135, 140, 70),
  (v_route_id, get_or_create_station('Dhaka'), 9, 190, NULL, 80);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Panchagarh Commuter-1 (DEMU)', 'Commuter', 'W-DEMU-PANCHAGARH-1', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-DEMU-PANCHAGARH-1', 'UP', get_or_create_station('Parbatipur'), get_or_create_station('Panchagarh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Panchagarh'), 2, 170, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Panchagarh Commuter-2 (DEMU)', 'Commuter', 'W-DEMU-PANCHAGARH-2', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-DEMU-PANCHAGARH-2', 'UP', get_or_create_station('Panchagarh'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Panchagarh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 200, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rangpur Commuter-1 (DEMU)', 'Commuter', 'W-DEMU-RANGPUR-1', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-DEMU-RANGPUR-1', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 130, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rangpur Commuter-2 (DEMU)', 'Commuter', 'W-DEMU-RANGPUR-2', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-DEMU-RANGPUR-2', 'UP', get_or_create_station('Parbatipur'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 110, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Ekota Express', 'Intercity', 'W-705', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-705', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Panchagarh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 51, 54, 20),
  (v_route_id, get_or_create_station('Tangail'), 4, 108, 110, 30),
  (v_route_id, get_or_create_station('Ibrahimabad'), 5, 130, 132, 40),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 6, 148, 150, 50),
  (v_route_id, get_or_create_station('Ullapara'), 7, 166, 169, 60),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 8, 234, 236, 70),
  (v_route_id, get_or_create_station('Natore'), 9, 278, 282, 80),
  (v_route_id, get_or_create_station('Santahar'), 10, 345, 350, 90),
  (v_route_id, get_or_create_station('Akkelpur'), 11, 370, 372, 100),
  (v_route_id, get_or_create_station('Joypurhat'), 12, 395, 398, 110),
  (v_route_id, get_or_create_station('Panchbibi'), 13, 417, 419, 120),
  (v_route_id, get_or_create_station('Birampur'), 14, 439, 442, 130),
  (v_route_id, get_or_create_station('Fulbari'), 15, 453, 456, 140),
  (v_route_id, get_or_create_station('Parbatipur'), 16, 480, 490, 150),
  (v_route_id, get_or_create_station('Chirirbandar'), 17, 505, 507, 160),
  (v_route_id, get_or_create_station('Dinajpur'), 18, 525, 530, 170),
  (v_route_id, get_or_create_station('Setabganj'), 19, 560, 562, 180),
  (v_route_id, get_or_create_station('Pirganj'), 20, 576, 578, 190),
  (v_route_id, get_or_create_station('Thakurgaon Road'), 21, 600, 603, 200),
  (v_route_id, get_or_create_station('Ruhia'), 22, 618, 620, 210),
  (v_route_id, get_or_create_station('Kismat'), 23, 627, 629, 220),
  (v_route_id, get_or_create_station('Panchagarh'), 24, 645, NULL, 230);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-706', 'DOWN', get_or_create_station('Panchagarh'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Panchagarh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kismat'), 2, 15, 17, 10),
  (v_route_id, get_or_create_station('Ruhia'), 3, 24, 26, 20),
  (v_route_id, get_or_create_station('Thakurgaon Road'), 4, 41, 44, 30),
  (v_route_id, get_or_create_station('Pirganj'), 5, 66, 68, 40),
  (v_route_id, get_or_create_station('Setabganj'), 6, 82, 84, 50),
  (v_route_id, get_or_create_station('Dinajpur'), 7, 115, 123, 60),
  (v_route_id, get_or_create_station('Chirirbandar'), 8, 140, 142, 70),
  (v_route_id, get_or_create_station('Parbatipur'), 9, 160, 165, 80),
  (v_route_id, get_or_create_station('Fulbari'), 10, 198, 201, 90),
  (v_route_id, get_or_create_station('Birampur'), 11, 212, 215, 100),
  (v_route_id, get_or_create_station('Panchbibi'), 12, 235, 237, 110),
  (v_route_id, get_or_create_station('Joypurhat'), 13, 248, 251, 120),
  (v_route_id, get_or_create_station('Akkelpur'), 14, 265, 267, 130),
  (v_route_id, get_or_create_station('Santahar'), 15, 285, 290, 140),
  (v_route_id, get_or_create_station('Natore'), 16, 331, 334, 150),
  (v_route_id, get_or_create_station('Ullapara'), 17, 422, 425, 160),
  (v_route_id, get_or_create_station('Ibrahimabad'), 18, 460, 462, 170),
  (v_route_id, get_or_create_station('Tangail'), 19, 482, 484, 180),
  (v_route_id, get_or_create_station('Joydebpur'), 20, 548, 551, 190),
  (v_route_id, get_or_create_station('Dhaka'), 21, 610, NULL, 200);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Korotoa Express', 'Intercity', 'W-713', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-713', 'UP', get_or_create_station('Santahar'), get_or_create_station('Burimari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Santahar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bogura'), 2, 44, 54, 10),
  (v_route_id, get_or_create_station('Sonatola'), 3, 86, 88, 20),
  (v_route_id, get_or_create_station('Mahimaganj'), 4, 98, 100, 30),
  (v_route_id, get_or_create_station('Bonar Para'), 5, 110, 115, 40),
  (v_route_id, get_or_create_station('Gaibandha'), 6, 154, 159, 50),
  (v_route_id, get_or_create_station('Bamondanga'), 7, 188, 190, 60),
  (v_route_id, get_or_create_station('Pirgacha'), 8, 208, 210, 70),
  (v_route_id, get_or_create_station('Kaunia'), 9, 227, 230, 80),
  (v_route_id, get_or_create_station('Teesta Junction'), 10, 237, 237, 90),
  (v_route_id, get_or_create_station('Lalmonirhat'), 11, 255, 265, 100),
  (v_route_id, get_or_create_station('Aditmari'), 12, 280, 282, 110),
  (v_route_id, get_or_create_station('Kankina'), 13, 300, 302, 120),
  (v_route_id, get_or_create_station('Tushbhandar'), 14, 309, 311, 130),
  (v_route_id, get_or_create_station('Hatibandha'), 15, 337, 339, 140),
  (v_route_id, get_or_create_station('Barkhata'), 16, 351, 353, 150),
  (v_route_id, get_or_create_station('Baura'), 17, 362, 362, 160),
  (v_route_id, get_or_create_station('Patgram'), 18, 379, 382, 170),
  (v_route_id, get_or_create_station('Burimari'), 19, 395, NULL, 180);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-714', 'DOWN', get_or_create_station('Burimari'), get_or_create_station('Santahar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Burimari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Patgram'), 2, 13, 16, 10),
  (v_route_id, get_or_create_station('Baura'), 3, 31, 31, 20),
  (v_route_id, get_or_create_station('Barkhata'), 4, 42, 44, 30),
  (v_route_id, get_or_create_station('Hatibandha'), 5, 56, 59, 40),
  (v_route_id, get_or_create_station('Tushbhandar'), 6, 83, 85, 50),
  (v_route_id, get_or_create_station('Kankina'), 7, 92, 94, 60),
  (v_route_id, get_or_create_station('Aditmari'), 8, 108, 110, 70),
  (v_route_id, get_or_create_station('Lalmonirhat'), 9, 125, 145, 80),
  (v_route_id, get_or_create_station('Teesta Junction'), 10, 161, 161, 90),
  (v_route_id, get_or_create_station('Kaunia'), 11, 170, 173, 100),
  (v_route_id, get_or_create_station('Pirgacha'), 12, 188, 191, 110),
  (v_route_id, get_or_create_station('Bamondanga'), 13, 208, 210, 120),
  (v_route_id, get_or_create_station('Gaibandha'), 14, 240, 243, 130),
  (v_route_id, get_or_create_station('Bonar Para'), 15, 265, 270, 140),
  (v_route_id, get_or_create_station('Mahimaganj'), 16, 280, 282, 150),
  (v_route_id, get_or_create_station('Sonatola'), 17, 291, 293, 160),
  (v_route_id, get_or_create_station('Bogura'), 18, 325, 330, 170),
  (v_route_id, get_or_create_station('Santahar'), 19, 380, NULL, 180);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Kapotaksha Express', 'Intercity', 'W-715', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-715', 'UP', get_or_create_station('Khulna'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Noapara'), 2, 33, 35, 10),
  (v_route_id, get_or_create_station('Jashore'), 3, 63, 66, 20),
  (v_route_id, get_or_create_station('Mubarakganj'), 4, 93, 95, 30),
  (v_route_id, get_or_create_station('Kotchandpur'), 5, 106, 108, 40),
  (v_route_id, get_or_create_station('Safdarpur'), 6, 117, 117, 50),
  (v_route_id, get_or_create_station('Darshana Halt'), 7, 137, 140, 60),
  (v_route_id, get_or_create_station('Chuadanga'), 8, 159, 162, 70),
  (v_route_id, get_or_create_station('Alamdanga'), 9, 177, 179, 80),
  (v_route_id, get_or_create_station('Poradaha'), 10, 195, 198, 90),
  (v_route_id, get_or_create_station('Mirpur'), 11, 208, 210, 100),
  (v_route_id, get_or_create_station('Bheramara'), 12, 220, 222, 110),
  (v_route_id, get_or_create_station('Paksey'), 13, 234, 236, 120),
  (v_route_id, get_or_create_station('Ishwardi'), 14, 245, 265, 130),
  (v_route_id, get_or_create_station('Azim Nagar'), 15, 277, 279, 140),
  (v_route_id, get_or_create_station('Abdulpur'), 16, 300, 300, 150),
  (v_route_id, get_or_create_station('Rajshahi'), 17, 335, NULL, 160);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-716', 'DOWN', get_or_create_station('Rajshahi'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Azim Nagar'), 2, 46, 48, 10),
  (v_route_id, get_or_create_station('Ishwardi'), 3, 60, 75, 20),
  (v_route_id, get_or_create_station('Paksey'), 4, 85, 87, 30),
  (v_route_id, get_or_create_station('Bheramara'), 5, 99, 102, 40),
  (v_route_id, get_or_create_station('Mirpur'), 6, 112, 114, 50),
  (v_route_id, get_or_create_station('Poradaha'), 7, 124, 127, 60),
  (v_route_id, get_or_create_station('Alamdanga'), 8, 143, 145, 70),
  (v_route_id, get_or_create_station('Chuadanga'), 9, 161, 164, 80),
  (v_route_id, get_or_create_station('Darshana Halt'), 10, 184, 187, 90),
  (v_route_id, get_or_create_station('Safdarpur'), 11, 205, 208, 100),
  (v_route_id, get_or_create_station('Kotchandpur'), 12, 224, 226, 110),
  (v_route_id, get_or_create_station('Mubarakganj'), 13, 238, 240, 120),
  (v_route_id, get_or_create_station('Jashore'), 14, 275, 280, 130),
  (v_route_id, get_or_create_station('Noapara'), 15, 308, 311, 140),
  (v_route_id, get_or_create_station('Khulna'), 16, 355, NULL, 150);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Sundarban Express', 'Intercity', 'W-725', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-725', 'UP', get_or_create_station('Khulna'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Daulatpur'), 2, 12, 14, 10),
  (v_route_id, get_or_create_station('Noapara'), 3, 37, 40, 20),
  (v_route_id, get_or_create_station('Jashore'), 4, 68, 72, 30),
  (v_route_id, get_or_create_station('Mubarakganj'), 5, 99, 101, 40),
  (v_route_id, get_or_create_station('Kotchandpur'), 6, 113, 115, 50),
  (v_route_id, get_or_create_station('Chuadanga'), 7, 156, 159, 60),
  (v_route_id, get_or_create_station('Alamdanga'), 8, 175, 177, 70),
  (v_route_id, get_or_create_station('Poradaha'), 9, 193, 195, 80),
  (v_route_id, get_or_create_station('Kushtia Court'), 10, 207, 210, 90),
  (v_route_id, get_or_create_station('Pangsha'), 11, 246, 248, 100),
  (v_route_id, get_or_create_station('Rajbari'), 12, 285, 295, 110),
  (v_route_id, get_or_create_station('Faridpur'), 13, 327, 330, 120),
  (v_route_id, get_or_create_station('Bhanga'), 14, 360, 362, 130),
  (v_route_id, get_or_create_station('Dhaka'), 15, 445, NULL, 140);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-726', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bhanga'), 2, 67, 69, 10),
  (v_route_id, get_or_create_station('Faridpur'), 3, 99, 102, 20),
  (v_route_id, get_or_create_station('Rajbari'), 4, 135, 145, 30),
  (v_route_id, get_or_create_station('Pangsha'), 5, 179, 181, 40),
  (v_route_id, get_or_create_station('Kushtia Court'), 6, 215, 218, 50),
  (v_route_id, get_or_create_station('Poradaha'), 7, 230, 233, 60),
  (v_route_id, get_or_create_station('Alamdanga'), 8, 249, 251, 70),
  (v_route_id, get_or_create_station('Chuadanga'), 9, 267, 270, 80),
  (v_route_id, get_or_create_station('Darshana Halt'), 10, 290, 293, 90),
  (v_route_id, get_or_create_station('Kotchandpur'), 11, 316, 318, 100),
  (v_route_id, get_or_create_station('Mubarakganj'), 12, 330, 333, 110),
  (v_route_id, get_or_create_station('Jashore'), 13, 364, 368, 120),
  (v_route_id, get_or_create_station('Noapara'), 14, 401, 404, 130),
  (v_route_id, get_or_create_station('Daulatpur'), 15, 428, 430, 140),
  (v_route_id, get_or_create_station('Khulna'), 16, 460, NULL, 150);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rupsha Express', 'Intercity', 'W-727', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-727', 'UP', get_or_create_station('Khulna'), get_or_create_station('Chilahati'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Noapara'), 2, 33, 36, 10),
  (v_route_id, get_or_create_station('Jashore'), 3, 64, 68, 20),
  (v_route_id, get_or_create_station('Mubarakganj'), 4, 95, 97, 30),
  (v_route_id, get_or_create_station('Kotchandpur'), 5, 108, 110, 40),
  (v_route_id, get_or_create_station('Darshana Halt'), 6, 146, 149, 50),
  (v_route_id, get_or_create_station('Chuadanga'), 7, 168, 171, 60),
  (v_route_id, get_or_create_station('Alamdanga'), 8, 186, 188, 70),
  (v_route_id, get_or_create_station('Poradaha'), 9, 204, 207, 80),
  (v_route_id, get_or_create_station('Bheramara'), 10, 224, 227, 90),
  (v_route_id, get_or_create_station('Paksey'), 11, 239, 241, 100),
  (v_route_id, get_or_create_station('Ishwardi'), 12, 250, 265, 110),
  (v_route_id, get_or_create_station('Natore'), 13, 298, 301, 120),
  (v_route_id, get_or_create_station('Ahsanganj'), 14, 342, 345, 130),
  (v_route_id, get_or_create_station('Santahar'), 15, 370, 375, 140),
  (v_route_id, get_or_create_station('Akkelpur'), 16, 395, 397, 150),
  (v_route_id, get_or_create_station('Joypurhat'), 17, 410, 413, 160),
  (v_route_id, get_or_create_station('Birampur'), 18, 441, 443, 170),
  (v_route_id, get_or_create_station('Fulbari'), 19, 454, 456, 180),
  (v_route_id, get_or_create_station('Parbatipur'), 20, 475, 485, 190),
  (v_route_id, get_or_create_station('Saidpur'), 21, 502, 507, 200),
  (v_route_id, get_or_create_station('Nilphamari'), 22, 530, 533, 210),
  (v_route_id, get_or_create_station('Domar'), 23, 549, 552, 220),
  (v_route_id, get_or_create_station('Chilahati'), 24, 585, NULL, 230);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-728', 'DOWN', get_or_create_station('Chilahati'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chilahati'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Domar'), 2, 18, 21, 10),
  (v_route_id, get_or_create_station('Nilphamari'), 3, 37, 40, 20),
  (v_route_id, get_or_create_station('Saidpur'), 4, 60, 65, 30),
  (v_route_id, get_or_create_station('Parbatipur'), 5, 85, 105, 40),
  (v_route_id, get_or_create_station('Fulbari'), 6, 126, 129, 50),
  (v_route_id, get_or_create_station('Birampur'), 7, 140, 143, 60),
  (v_route_id, get_or_create_station('Joypurhat'), 8, 172, 175, 70),
  (v_route_id, get_or_create_station('Akkelpur'), 9, 189, 191, 80),
  (v_route_id, get_or_create_station('Santahar'), 10, 210, 215, 90),
  (v_route_id, get_or_create_station('Ahsanganj'), 11, 238, 241, 100),
  (v_route_id, get_or_create_station('Natore'), 12, 265, 270, 110),
  (v_route_id, get_or_create_station('Ishwardi'), 13, 310, 330, 120),
  (v_route_id, get_or_create_station('Paksey'), 14, 340, 342, 130),
  (v_route_id, get_or_create_station('Bheramara'), 15, 354, 357, 140),
  (v_route_id, get_or_create_station('Poradaha'), 16, 374, 377, 150),
  (v_route_id, get_or_create_station('Alamdanga'), 17, 392, 394, 160),
  (v_route_id, get_or_create_station('Chuadanga'), 18, 410, 413, 170),
  (v_route_id, get_or_create_station('Darshana Halt'), 19, 435, 438, 180),
  (v_route_id, get_or_create_station('Kotchandpur'), 20, 464, 466, 190),
  (v_route_id, get_or_create_station('Mubarakganj'), 21, 478, 480, 200),
  (v_route_id, get_or_create_station('Jashore'), 22, 508, 518, 210),
  (v_route_id, get_or_create_station('Noapara'), 23, 546, 549, 220),
  (v_route_id, get_or_create_station('Khulna'), 24, 595, NULL, 230);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Barendra Express', 'Intercity', 'W-731', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-731', 'UP', get_or_create_station('Rajshahi'), get_or_create_station('Chilahati'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Abdulpur'), 2, 40, 60, 10),
  (v_route_id, get_or_create_station('Natore'), 3, 77, 80, 20),
  (v_route_id, get_or_create_station('Ahsanganj'), 4, 101, 104, 30),
  (v_route_id, get_or_create_station('Santahar'), 5, 140, 150, 40),
  (v_route_id, get_or_create_station('Akkelpur'), 6, 170, 172, 50),
  (v_route_id, get_or_create_station('Joypurhat'), 7, 187, 190, 60),
  (v_route_id, get_or_create_station('Panchbibi'), 8, 208, 210, 70),
  (v_route_id, get_or_create_station('Birampur'), 9, 230, 233, 80),
  (v_route_id, get_or_create_station('Fulbari'), 10, 244, 247, 90),
  (v_route_id, get_or_create_station('Parbatipur'), 11, 265, 285, 100),
  (v_route_id, get_or_create_station('Saidpur'), 12, 311, 314, 110),
  (v_route_id, get_or_create_station('Nilphamari'), 13, 333, 336, 120),
  (v_route_id, get_or_create_station('Domar'), 14, 358, 361, 130),
  (v_route_id, get_or_create_station('Chilahati'), 15, 390, NULL, 140);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-732', 'DOWN', get_or_create_station('Chilahati'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chilahati'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Domar'), 2, 18, 21, 10),
  (v_route_id, get_or_create_station('Nilphamari'), 3, 36, 39, 20),
  (v_route_id, get_or_create_station('Saidpur'), 4, 64, 68, 30),
  (v_route_id, get_or_create_station('Parbatipur'), 5, 85, 105, 40),
  (v_route_id, get_or_create_station('Fulbari'), 6, 123, 126, 50),
  (v_route_id, get_or_create_station('Birampur'), 7, 137, 140, 60),
  (v_route_id, get_or_create_station('Hili'), 8, 153, 153, 70),
  (v_route_id, get_or_create_station('Panchbibi'), 9, 165, 167, 80),
  (v_route_id, get_or_create_station('Joypurhat'), 10, 178, 181, 90),
  (v_route_id, get_or_create_station('Akkelpur'), 11, 195, 197, 100),
  (v_route_id, get_or_create_station('Santahar'), 12, 220, 225, 110),
  (v_route_id, get_or_create_station('Ahsanganj'), 13, 247, 250, 120),
  (v_route_id, get_or_create_station('Natore'), 14, 272, 275, 130),
  (v_route_id, get_or_create_station('Abdulpur'), 15, 295, 315, 140),
  (v_route_id, get_or_create_station('Rajshahi'), 16, 370, NULL, 150);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Titumir Express', 'Intercity', 'W-733', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-733', 'UP', get_or_create_station('Rajshahi'), get_or_create_station('Chilahati'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Abdulpur'), 2, 40, 60, 10),
  (v_route_id, get_or_create_station('Natore'), 3, 87, 91, 20),
  (v_route_id, get_or_create_station('Madhnagar'), 4, 105, 107, 30),
  (v_route_id, get_or_create_station('Ahsanganj'), 5, 116, 119, 40),
  (v_route_id, get_or_create_station('Santahar'), 6, 145, 150, 50),
  (v_route_id, get_or_create_station('Akkelpur'), 7, 170, 172, 60),
  (v_route_id, get_or_create_station('Jamalganj'), 8, 180, 182, 70),
  (v_route_id, get_or_create_station('Joypurhat'), 9, 190, 193, 80),
  (v_route_id, get_or_create_station('Panchbibi'), 10, 204, 206, 90),
  (v_route_id, get_or_create_station('Hili'), 11, 216, 218, 100),
  (v_route_id, get_or_create_station('Birampur'), 12, 230, 233, 110),
  (v_route_id, get_or_create_station('Fulbari'), 13, 251, 254, 120),
  (v_route_id, get_or_create_station('Parbatipur'), 14, 290, 310, 130),
  (v_route_id, get_or_create_station('Saidpur'), 15, 327, 332, 140),
  (v_route_id, get_or_create_station('Nilphamari'), 16, 351, 354, 150),
  (v_route_id, get_or_create_station('Domar'), 17, 370, 373, 160),
  (v_route_id, get_or_create_station('Chilahati'), 18, 400, NULL, 170);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-734', 'DOWN', get_or_create_station('Chilahati'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chilahati'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Domar'), 2, 21, 24, 10),
  (v_route_id, get_or_create_station('Nilphamari'), 3, 41, 44, 20),
  (v_route_id, get_or_create_station('Saidpur'), 4, 75, 79, 30),
  (v_route_id, get_or_create_station('Parbatipur'), 5, 95, 115, 40),
  (v_route_id, get_or_create_station('Fulbari'), 6, 133, 136, 50),
  (v_route_id, get_or_create_station('Birampur'), 7, 147, 150, 60),
  (v_route_id, get_or_create_station('Panchbibi'), 8, 179, 181, 70),
  (v_route_id, get_or_create_station('Joypurhat'), 9, 192, 195, 80),
  (v_route_id, get_or_create_station('Jamalganj'), 10, 203, 205, 90),
  (v_route_id, get_or_create_station('Akkelpur'), 11, 213, 215, 100),
  (v_route_id, get_or_create_station('Santahar'), 12, 235, 240, 110),
  (v_route_id, get_or_create_station('Ahsanganj'), 13, 262, 264, 120),
  (v_route_id, get_or_create_station('Madhnagar'), 14, 273, 275, 130),
  (v_route_id, get_or_create_station('Natore'), 15, 290, 293, 140),
  (v_route_id, get_or_create_station('Abdulpur'), 16, 310, 330, 150),
  (v_route_id, get_or_create_station('Rajshahi'), 17, 390, NULL, 160);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Simanta Express', 'Intercity', 'W-747', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-747', 'UP', get_or_create_station('Khulna'), get_or_create_station('Chilahati'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Daulatpur'), 2, 12, 14, 10),
  (v_route_id, get_or_create_station('Noapara'), 3, 37, 40, 20),
  (v_route_id, get_or_create_station('Jashore'), 4, 68, 72, 30),
  (v_route_id, get_or_create_station('Mubarakganj'), 5, 99, 101, 40),
  (v_route_id, get_or_create_station('Kotchandpur'), 6, 113, 115, 50),
  (v_route_id, get_or_create_station('Darshana Halt'), 7, 140, 143, 60),
  (v_route_id, get_or_create_station('Chuadanga'), 8, 162, 165, 70),
  (v_route_id, get_or_create_station('Alamdanga'), 9, 181, 183, 80),
  (v_route_id, get_or_create_station('Poradaha'), 10, 199, 202, 90),
  (v_route_id, get_or_create_station('Bheramara'), 11, 219, 222, 100),
  (v_route_id, get_or_create_station('Ishwardi'), 12, 245, 255, 110),
  (v_route_id, get_or_create_station('Natore'), 13, 290, 293, 120),
  (v_route_id, get_or_create_station('Santahar'), 14, 350, 355, 130),
  (v_route_id, get_or_create_station('Akkelpur'), 15, 375, 377, 140),
  (v_route_id, get_or_create_station('Joypurhat'), 16, 391, 394, 150),
  (v_route_id, get_or_create_station('Birampur'), 17, 422, 424, 160),
  (v_route_id, get_or_create_station('Fulbari'), 18, 435, 437, 170),
  (v_route_id, get_or_create_station('Parbatipur'), 19, 455, 465, 180),
  (v_route_id, get_or_create_station('Saidpur'), 20, 482, 487, 190),
  (v_route_id, get_or_create_station('Nilphamari'), 21, 506, 510, 200),
  (v_route_id, get_or_create_station('Domar'), 22, 526, 548, 210),
  (v_route_id, get_or_create_station('Chilahati'), 23, 570, NULL, 220);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-748', 'DOWN', get_or_create_station('Chilahati'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chilahati'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Domar'), 2, 18, 21, 10),
  (v_route_id, get_or_create_station('Nilphamari'), 3, 37, 40, 20),
  (v_route_id, get_or_create_station('Saidpur'), 4, 59, 64, 30),
  (v_route_id, get_or_create_station('Parbatipur'), 5, 80, 100, 40),
  (v_route_id, get_or_create_station('Fulbari'), 6, 118, 121, 50),
  (v_route_id, get_or_create_station('Birampur'), 7, 132, 135, 60),
  (v_route_id, get_or_create_station('Joypurhat'), 8, 164, 167, 70),
  (v_route_id, get_or_create_station('Akkelpur'), 9, 181, 183, 80),
  (v_route_id, get_or_create_station('Santahar'), 10, 205, 210, 90),
  (v_route_id, get_or_create_station('Natore'), 11, 250, 253, 100),
  (v_route_id, get_or_create_station('Ishwardi'), 12, 290, 310, 110),
  (v_route_id, get_or_create_station('Bheramara'), 13, 330, 333, 120),
  (v_route_id, get_or_create_station('Poradaha'), 14, 351, 354, 130),
  (v_route_id, get_or_create_station('Alamdanga'), 15, 370, 372, 140),
  (v_route_id, get_or_create_station('Chuadanga'), 16, 390, 393, 150),
  (v_route_id, get_or_create_station('Darshana Halt'), 17, 414, 416, 160),
  (v_route_id, get_or_create_station('Kotchandpur'), 18, 440, 442, 170),
  (v_route_id, get_or_create_station('Mubarakganj'), 19, 454, 456, 180),
  (v_route_id, get_or_create_station('Jashore'), 20, 491, 495, 190),
  (v_route_id, get_or_create_station('Noapara'), 21, 523, 526, 200),
  (v_route_id, get_or_create_station('Daulatpur'), 22, 551, 553, 210),
  (v_route_id, get_or_create_station('Khulna'), 23, 580, NULL, 220);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Lalmoni Express', 'Intercity', 'W-751', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-751', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 51, 53, 20),
  (v_route_id, get_or_create_station('Tangail'), 4, 107, 109, 30),
  (v_route_id, get_or_create_station('Ibrahimabad'), 5, 129, 131, 40),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 6, 147, 149, 50),
  (v_route_id, get_or_create_station('Ullapara'), 7, 166, 168, 60),
  (v_route_id, get_or_create_station('Boral Bridge'), 8, 188, 190, 70),
  (v_route_id, get_or_create_station('Azim Nagar'), 9, 262, 264, 80),
  (v_route_id, get_or_create_station('Natore'), 10, 290, 293, 90),
  (v_route_id, get_or_create_station('Santahar'), 11, 350, 355, 100),
  (v_route_id, get_or_create_station('Bogura'), 12, 395, 398, 110),
  (v_route_id, get_or_create_station('Sonatola'), 13, 428, 430, 120),
  (v_route_id, get_or_create_station('Bonar Para'), 14, 446, 449, 130),
  (v_route_id, get_or_create_station('Gaibandha'), 15, 472, 475, 140),
  (v_route_id, get_or_create_station('Bamondanga'), 16, 504, 506, 150),
  (v_route_id, get_or_create_station('Pirgacha'), 17, 524, 526, 160),
  (v_route_id, get_or_create_station('Kaunia'), 18, 543, 546, 170),
  (v_route_id, get_or_create_station('Teesta Junction'), 19, 553, 555, 180),
  (v_route_id, get_or_create_station('Lalmonirhat'), 20, 575, NULL, 190);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-752', 'DOWN', get_or_create_station('Lalmonirhat'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Teesta Junction'), 2, 16, 18, 10),
  (v_route_id, get_or_create_station('Kaunia'), 3, 25, 28, 20),
  (v_route_id, get_or_create_station('Pirgacha'), 4, 44, 46, 30),
  (v_route_id, get_or_create_station('Bamondanga'), 5, 62, 65, 40),
  (v_route_id, get_or_create_station('Gaibandha'), 6, 94, 97, 50),
  (v_route_id, get_or_create_station('Bonar Para'), 7, 119, 122, 60),
  (v_route_id, get_or_create_station('Sonatola'), 8, 139, 141, 70),
  (v_route_id, get_or_create_station('Bogura'), 9, 171, 174, 80),
  (v_route_id, get_or_create_station('Santahar'), 10, 220, 225, 90),
  (v_route_id, get_or_create_station('Natore'), 11, 268, 271, 100),
  (v_route_id, get_or_create_station('Azim Nagar'), 12, 298, 300, 110),
  (v_route_id, get_or_create_station('Boral Bridge'), 13, 347, 349, 120),
  (v_route_id, get_or_create_station('Ullapara'), 14, 369, 373, 130),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 15, 392, 395, 140),
  (v_route_id, get_or_create_station('Ibrahimabad'), 16, 413, 420, 150),
  (v_route_id, get_or_create_station('Tangail'), 17, 440, 448, 160),
  (v_route_id, get_or_create_station('Joydebpur'), 18, 526, 530, 170),
  (v_route_id, get_or_create_station('Dhaka'), 19, 595, NULL, 180);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Silkcity Express', 'Intercity', 'W-753', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-753', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 51, 54, 20),
  (v_route_id, get_or_create_station('Mirzapur'), 4, 87, 89, 30),
  (v_route_id, get_or_create_station('Tangail'), 5, 116, 118, 40),
  (v_route_id, get_or_create_station('Ibrahimabad'), 6, 138, 140, 50),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 7, 156, 159, 60),
  (v_route_id, get_or_create_station('Jamtail'), 8, 167, 169, 70),
  (v_route_id, get_or_create_station('Ullapara'), 9, 181, 184, 80),
  (v_route_id, get_or_create_station('Boral Bridge'), 10, 216, 219, 90),
  (v_route_id, get_or_create_station('Chatmohar'), 11, 233, 238, 100),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 12, 258, 261, 110),
  (v_route_id, get_or_create_station('Abdulpur'), 13, 276, 279, 120),
  (v_route_id, get_or_create_station('Rajshahi'), 14, 350, NULL, 130);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-754', 'DOWN', get_or_create_station('Rajshahi'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Abdulpur'), 2, 40, 42, 10),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 3, 57, 59, 20),
  (v_route_id, get_or_create_station('Chatmohar'), 4, 78, 81, 30),
  (v_route_id, get_or_create_station('Boral Bridge'), 5, 94, 97, 40),
  (v_route_id, get_or_create_station('Ullapara'), 6, 116, 119, 50),
  (v_route_id, get_or_create_station('Jamtail'), 7, 131, 133, 60),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 8, 141, 144, 70),
  (v_route_id, get_or_create_station('Ibrahimabad'), 9, 160, 162, 80),
  (v_route_id, get_or_create_station('Tangail'), 10, 182, 184, 90),
  (v_route_id, get_or_create_station('Mirzapur'), 11, 208, 210, 100),
  (v_route_id, get_or_create_station('Joydebpur'), 12, 265, 268, 110),
  (v_route_id, get_or_create_station('Dhaka'), 13, 330, NULL, 120);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Madhumati Express', 'Intercity', 'W-755', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-755', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Mawa'), 2, 36, 38, 10),
  (v_route_id, get_or_create_station('Padma'), 3, 51, 53, 20),
  (v_route_id, get_or_create_station('Shibchar'), 4, 63, 65, 30),
  (v_route_id, get_or_create_station('Bhanga'), 5, 88, 90, 40),
  (v_route_id, get_or_create_station('Pukuria'), 6, 105, 105, 50),
  (v_route_id, get_or_create_station('Talma'), 7, 106, 106, 60),
  (v_route_id, get_or_create_station('Faridpur'), 8, 123, 126, 70),
  (v_route_id, get_or_create_station('Amirabad'), 9, 138, 138, 80),
  (v_route_id, get_or_create_station('Pachuria'), 10, 155, 155, 90),
  (v_route_id, get_or_create_station('Rajbari'), 11, 165, 180, 100),
  (v_route_id, get_or_create_station('Kalukhali'), 12, 203, 205, 110),
  (v_route_id, get_or_create_station('Pangsha'), 13, 215, 217, 120),
  (v_route_id, get_or_create_station('Khoksha'), 14, 231, 233, 130),
  (v_route_id, get_or_create_station('Kumarkhali'), 15, 243, 245, 140),
  (v_route_id, get_or_create_station('Kushtia Court'), 16, 262, 265, 150),
  (v_route_id, get_or_create_station('Poradaha'), 17, 285, 310, 160),
  (v_route_id, get_or_create_station('Mirpur'), 18, 320, 322, 170),
  (v_route_id, get_or_create_station('Bheramara'), 19, 332, 335, 180),
  (v_route_id, get_or_create_station('Paksey'), 20, 347, 349, 190),
  (v_route_id, get_or_create_station('Ishwardi'), 21, 365, 385, 200),
  (v_route_id, get_or_create_station('Rajshahi'), 22, 450, NULL, 210);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-756', 'DOWN', get_or_create_station('Rajshahi'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ishwardi'), 2, 60, 80, 10),
  (v_route_id, get_or_create_station('Paksey'), 3, 90, 92, 20),
  (v_route_id, get_or_create_station('Bheramara'), 4, 104, 107, 30),
  (v_route_id, get_or_create_station('Mirpur'), 5, 117, 119, 40),
  (v_route_id, get_or_create_station('Poradaha'), 6, 130, 150, 50),
  (v_route_id, get_or_create_station('Kushtia Court'), 7, 162, 165, 60),
  (v_route_id, get_or_create_station('Kumarkhali'), 8, 182, 184, 70),
  (v_route_id, get_or_create_station('Khoksha'), 9, 201, 203, 80),
  (v_route_id, get_or_create_station('Pangsha'), 10, 218, 220, 90),
  (v_route_id, get_or_create_station('Kalukhali'), 11, 229, 231, 100),
  (v_route_id, get_or_create_station('Rajbari'), 12, 250, 265, 110),
  (v_route_id, get_or_create_station('Pachuria'), 13, 274, 274, 120),
  (v_route_id, get_or_create_station('Amirabad'), 14, 292, 292, 130),
  (v_route_id, get_or_create_station('Faridpur'), 15, 307, 309, 140),
  (v_route_id, get_or_create_station('Talma'), 16, 325, 325, 150),
  (v_route_id, get_or_create_station('Pukuria'), 17, 330, 330, 160),
  (v_route_id, get_or_create_station('Bhanga'), 18, 344, 346, 170),
  (v_route_id, get_or_create_station('Shibchar'), 19, 367, 369, 180),
  (v_route_id, get_or_create_station('Padma'), 20, 379, 381, 190),
  (v_route_id, get_or_create_station('Mawa'), 21, 394, 396, 200),
  (v_route_id, get_or_create_station('Dhaka'), 22, 440, NULL, 210);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Drutojan Express', 'Intercity', 'W-757', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-757', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Panchagarh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 51, 53, 20),
  (v_route_id, get_or_create_station('Tangail'), 4, 107, 109, 30),
  (v_route_id, get_or_create_station('Ibrahimabad'), 5, 129, 131, 40),
  (v_route_id, get_or_create_station('Jamtail'), 6, 152, 154, 50),
  (v_route_id, get_or_create_station('Chatmohar'), 7, 191, 193, 60),
  (v_route_id, get_or_create_station('Natore'), 8, 244, 247, 70),
  (v_route_id, get_or_create_station('Ahsanganj'), 9, 268, 271, 80),
  (v_route_id, get_or_create_station('Santahar'), 10, 300, 315, 90),
  (v_route_id, get_or_create_station('Akkelpur'), 11, 335, 337, 100),
  (v_route_id, get_or_create_station('Joypurhat'), 12, 352, 354, 110),
  (v_route_id, get_or_create_station('Panchbibi'), 13, 365, 367, 120),
  (v_route_id, get_or_create_station('Birampur'), 14, 387, 389, 130),
  (v_route_id, get_or_create_station('Fulbari'), 15, 400, 402, 140),
  (v_route_id, get_or_create_station('Parbatipur'), 16, 425, 445, 150),
  (v_route_id, get_or_create_station('Chirirbandar'), 17, 460, 462, 160),
  (v_route_id, get_or_create_station('Dinajpur'), 18, 480, 485, 170),
  (v_route_id, get_or_create_station('Setabganj'), 19, 515, 517, 180),
  (v_route_id, get_or_create_station('Pirganj'), 20, 531, 534, 190),
  (v_route_id, get_or_create_station('Thakurgaon Road'), 21, 557, 560, 200),
  (v_route_id, get_or_create_station('Ruhia'), 22, 577, 593, 210),
  (v_route_id, get_or_create_station('Kismat'), 23, 602, 604, 220),
  (v_route_id, get_or_create_station('Panchagarh'), 24, 625, NULL, 230);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-758', 'DOWN', get_or_create_station('Panchagarh'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Panchagarh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kismat'), 2, 16, 18, 10),
  (v_route_id, get_or_create_station('Ruhia'), 3, 26, 28, 20),
  (v_route_id, get_or_create_station('Thakurgaon Road'), 4, 42, 45, 30),
  (v_route_id, get_or_create_station('Pirganj'), 5, 86, 88, 40),
  (v_route_id, get_or_create_station('Setabganj'), 6, 102, 104, 50),
  (v_route_id, get_or_create_station('Dinajpur'), 7, 136, 146, 60),
  (v_route_id, get_or_create_station('Chirirbandar'), 8, 165, 167, 70),
  (v_route_id, get_or_create_station('Parbatipur'), 9, 185, 205, 80),
  (v_route_id, get_or_create_station('Fulbari'), 10, 223, 226, 90),
  (v_route_id, get_or_create_station('Birampur'), 11, 237, 240, 100),
  (v_route_id, get_or_create_station('Panchbibi'), 12, 260, 262, 110),
  (v_route_id, get_or_create_station('Joypurhat'), 13, 273, 276, 120),
  (v_route_id, get_or_create_station('Akkelpur'), 14, 289, 291, 130),
  (v_route_id, get_or_create_station('Santahar'), 15, 315, 320, 140),
  (v_route_id, get_or_create_station('Ahsanganj'), 16, 354, 356, 150),
  (v_route_id, get_or_create_station('Natore'), 17, 378, 381, 160),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 18, 426, 428, 170),
  (v_route_id, get_or_create_station('Chatmohar'), 19, 448, 451, 180),
  (v_route_id, get_or_create_station('Jamtail'), 20, 488, 490, 190),
  (v_route_id, get_or_create_station('Ibrahimabad'), 21, 516, 518, 200),
  (v_route_id, get_or_create_station('Tangail'), 22, 538, 548, 210),
  (v_route_id, get_or_create_station('Joydebpur'), 23, 628, 633, 220),
  (v_route_id, get_or_create_station('Dhaka'), 24, 695, NULL, 230);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Padma Express', 'Intercity', 'W-759', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-759', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 51, 53, 20),
  (v_route_id, get_or_create_station('Tangail'), 4, 107, 109, 30),
  (v_route_id, get_or_create_station('Ibrahimabad'), 5, 129, 131, 40),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 6, 146, 149, 50),
  (v_route_id, get_or_create_station('Ullapara'), 7, 165, 168, 60),
  (v_route_id, get_or_create_station('Boral Bridge'), 8, 186, 188, 70),
  (v_route_id, get_or_create_station('Chatmohar'), 9, 202, 205, 80),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 10, 225, 228, 90),
  (v_route_id, get_or_create_station('Abdulpur'), 11, 243, 245, 100),
  (v_route_id, get_or_create_station('Sardah Road'), 12, 271, 273, 110),
  (v_route_id, get_or_create_station('Rajshahi'), 13, 315, NULL, 120);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-760', 'DOWN', get_or_create_station('Rajshahi'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Sardah Road'), 2, 17, 19, 10),
  (v_route_id, get_or_create_station('Abdulpur'), 3, 45, 47, 20),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 4, 61, 63, 30),
  (v_route_id, get_or_create_station('Chatmohar'), 5, 82, 85, 40),
  (v_route_id, get_or_create_station('Boral Bridge'), 6, 98, 100, 50),
  (v_route_id, get_or_create_station('Ullapara'), 7, 119, 122, 60),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 8, 138, 141, 70),
  (v_route_id, get_or_create_station('Ibrahimabad'), 9, 158, 160, 80),
  (v_route_id, get_or_create_station('Tangail'), 10, 180, 182, 90),
  (v_route_id, get_or_create_station('Joydebpur'), 11, 254, 258, 100),
  (v_route_id, get_or_create_station('Dhaka'), 12, 315, NULL, 110);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Sagardari Express', 'Intercity', 'W-761', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-761', 'UP', get_or_create_station('Khulna'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Noapara'), 2, 33, 36, 10),
  (v_route_id, get_or_create_station('Jashore'), 3, 63, 68, 20),
  (v_route_id, get_or_create_station('Mubarakganj'), 4, 95, 97, 30),
  (v_route_id, get_or_create_station('Kotchandpur'), 5, 109, 111, 40),
  (v_route_id, get_or_create_station('Safdarpur'), 6, 120, 122, 50),
  (v_route_id, get_or_create_station('Darshana Halt'), 7, 141, 144, 60),
  (v_route_id, get_or_create_station('Chuadanga'), 8, 163, 166, 70),
  (v_route_id, get_or_create_station('Alamdanga'), 9, 182, 184, 80),
  (v_route_id, get_or_create_station('Poradaha'), 10, 200, 203, 90),
  (v_route_id, get_or_create_station('Mirpur'), 11, 213, 215, 100),
  (v_route_id, get_or_create_station('Bheramara'), 12, 225, 227, 110),
  (v_route_id, get_or_create_station('Paksey'), 13, 239, 241, 120),
  (v_route_id, get_or_create_station('Ishwardi'), 14, 250, 270, 130),
  (v_route_id, get_or_create_station('Azim Nagar'), 15, 283, 285, 140),
  (v_route_id, get_or_create_station('Abdulpur'), 16, 293, 296, 150),
  (v_route_id, get_or_create_station('Rajshahi'), 17, 360, NULL, 160);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-762', 'DOWN', get_or_create_station('Rajshahi'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Abdulpur'), 2, 40, 42, 10),
  (v_route_id, get_or_create_station('Azim Nagar'), 3, 51, 53, 20),
  (v_route_id, get_or_create_station('Ishwardi'), 4, 70, 90, 30),
  (v_route_id, get_or_create_station('Paksey'), 5, 100, 102, 40),
  (v_route_id, get_or_create_station('Bheramara'), 6, 114, 117, 50),
  (v_route_id, get_or_create_station('Mirpur'), 7, 127, 129, 60),
  (v_route_id, get_or_create_station('Poradaha'), 8, 139, 142, 70),
  (v_route_id, get_or_create_station('Alamdanga'), 9, 158, 160, 80),
  (v_route_id, get_or_create_station('Chuadanga'), 10, 176, 179, 90),
  (v_route_id, get_or_create_station('Darshana Halt'), 11, 200, 203, 100),
  (v_route_id, get_or_create_station('Safdarpur'), 12, 220, 222, 110),
  (v_route_id, get_or_create_station('Kotchandpur'), 13, 231, 233, 120),
  (v_route_id, get_or_create_station('Mubarakganj'), 14, 245, 247, 130),
  (v_route_id, get_or_create_station('Jashore'), 15, 275, 279, 140),
  (v_route_id, get_or_create_station('Noapara'), 16, 307, 310, 150),
  (v_route_id, get_or_create_station('Khulna'), 17, 370, NULL, 160);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Chitra Express', 'Intercity', 'W-763', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-763', 'UP', get_or_create_station('Khulna'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Noapara'), 2, 33, 36, 10),
  (v_route_id, get_or_create_station('Jashore'), 3, 64, 68, 20),
  (v_route_id, get_or_create_station('Mubarakganj'), 4, 109, 111, 30),
  (v_route_id, get_or_create_station('Kotchandpur'), 5, 122, 124, 40),
  (v_route_id, get_or_create_station('Darshana Halt'), 6, 148, 151, 50),
  (v_route_id, get_or_create_station('Chuadanga'), 7, 170, 173, 60),
  (v_route_id, get_or_create_station('Alamdanga'), 8, 189, 191, 70),
  (v_route_id, get_or_create_station('Poradaha'), 9, 207, 210, 80),
  (v_route_id, get_or_create_station('Mirpur'), 10, 220, 222, 90),
  (v_route_id, get_or_create_station('Bheramara'), 11, 232, 235, 100),
  (v_route_id, get_or_create_station('Ishwardi'), 12, 255, 265, 110),
  (v_route_id, get_or_create_station('Chatmohar'), 13, 288, 291, 120),
  (v_route_id, get_or_create_station('Boral Bridge'), 14, 306, 309, 130),
  (v_route_id, get_or_create_station('Ullapara'), 15, 327, 330, 140),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 16, 345, 348, 150),
  (v_route_id, get_or_create_station('Ibrahimabad'), 17, 389, 392, 160),
  (v_route_id, get_or_create_station('Tangail'), 18, 412, 414, 170),
  (v_route_id, get_or_create_station('Joydebpur'), 19, 484, 487, 180),
  (v_route_id, get_or_create_station('Biman Bandar'), 20, 513, 516, 190),
  (v_route_id, get_or_create_station('Dhaka'), 21, 545, NULL, 200);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-764', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 51, 53, 20),
  (v_route_id, get_or_create_station('Tangail'), 4, 116, 118, 30),
  (v_route_id, get_or_create_station('Ibrahimabad'), 5, 138, 140, 40),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 6, 156, 159, 50),
  (v_route_id, get_or_create_station('Ullapara'), 7, 176, 179, 60),
  (v_route_id, get_or_create_station('Boral Bridge'), 8, 197, 200, 70),
  (v_route_id, get_or_create_station('Chatmohar'), 9, 214, 217, 80),
  (v_route_id, get_or_create_station('Ishwardi'), 10, 255, 265, 90),
  (v_route_id, get_or_create_station('Bheramara'), 11, 295, 298, 100),
  (v_route_id, get_or_create_station('Poradaha'), 12, 316, 319, 110),
  (v_route_id, get_or_create_station('Alamdanga'), 13, 335, 337, 120),
  (v_route_id, get_or_create_station('Chuadanga'), 14, 354, 357, 130),
  (v_route_id, get_or_create_station('Kotchandpur'), 15, 406, 408, 140),
  (v_route_id, get_or_create_station('Mubarakganj'), 16, 420, 422, 150),
  (v_route_id, get_or_create_station('Jashore'), 17, 457, 462, 160),
  (v_route_id, get_or_create_station('Noapara'), 18, 490, 493, 170),
  (v_route_id, get_or_create_station('Khulna'), 19, 550, NULL, 180);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Nilsagar Express', 'Intercity', 'W-765', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-765', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Chilahati'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 51, 54, 20),
  (v_route_id, get_or_create_station('Ibrahimabad'), 4, 129, 138, 30),
  (v_route_id, get_or_create_station('Muladhuli'), 5, 211, 213, 40),
  (v_route_id, get_or_create_station('Natore'), 6, 252, 255, 50),
  (v_route_id, get_or_create_station('Ahsanganj'), 7, 275, 277, 60),
  (v_route_id, get_or_create_station('Santahar'), 8, 310, 320, 70),
  (v_route_id, get_or_create_station('Akkelpur'), 9, 353, 355, 80),
  (v_route_id, get_or_create_station('Joypurhat'), 10, 369, 372, 90),
  (v_route_id, get_or_create_station('Birampur'), 11, 400, 403, 100),
  (v_route_id, get_or_create_station('Fulbari'), 12, 414, 417, 110),
  (v_route_id, get_or_create_station('Parbatipur'), 13, 435, 445, 120),
  (v_route_id, get_or_create_station('Saidpur'), 14, 462, 466, 130),
  (v_route_id, get_or_create_station('Nilphamari'), 15, 485, 490, 140),
  (v_route_id, get_or_create_station('Domar'), 16, 511, 521, 150),
  (v_route_id, get_or_create_station('Chilahati'), 17, 555, NULL, 160);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-766', 'DOWN', get_or_create_station('Chilahati'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chilahati'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Domar'), 2, 18, 21, 10),
  (v_route_id, get_or_create_station('Nilphamari'), 3, 37, 40, 20),
  (v_route_id, get_or_create_station('Saidpur'), 4, 59, 64, 30),
  (v_route_id, get_or_create_station('Parbatipur'), 5, 80, 100, 40),
  (v_route_id, get_or_create_station('Fulbari'), 6, 118, 120, 50),
  (v_route_id, get_or_create_station('Birampur'), 7, 131, 134, 60),
  (v_route_id, get_or_create_station('Joypurhat'), 8, 163, 166, 70),
  (v_route_id, get_or_create_station('Akkelpur'), 9, 180, 182, 80),
  (v_route_id, get_or_create_station('Santahar'), 10, 200, 205, 90),
  (v_route_id, get_or_create_station('Ahsanganj'), 11, 227, 229, 100),
  (v_route_id, get_or_create_station('Natore'), 12, 250, 253, 110),
  (v_route_id, get_or_create_station('Muladhuli'), 13, 312, 314, 120),
  (v_route_id, get_or_create_station('Ibrahimabad'), 14, 406, 409, 130),
  (v_route_id, get_or_create_station('Joydebpur'), 15, 491, 495, 140),
  (v_route_id, get_or_create_station('Dhaka'), 16, 565, NULL, 150);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Dolonchapa Express', 'Intercity', 'W-767', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-767', 'UP', get_or_create_station('Santahar'), get_or_create_station('Panchagarh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Santahar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Talora'), 2, 28, 28, 10),
  (v_route_id, get_or_create_station('Bogura'), 3, 53, 61, 20),
  (v_route_id, get_or_create_station('Sonatola'), 4, 110, 110, 30),
  (v_route_id, get_or_create_station('Mahimaganj'), 5, 122, 122, 40),
  (v_route_id, get_or_create_station('Bonar Para'), 6, 133, 138, 50),
  (v_route_id, get_or_create_station('Badiakhali'), 7, 148, 150, 60),
  (v_route_id, get_or_create_station('Gaibandha'), 8, 165, 170, 70),
  (v_route_id, get_or_create_station('Bamondanga'), 9, 201, 204, 80),
  (v_route_id, get_or_create_station('Pirgacha'), 10, 222, 225, 90),
  (v_route_id, get_or_create_station('Kaunia'), 11, 245, 265, 100),
  (v_route_id, get_or_create_station('Rangpur'), 12, 288, 298, 110),
  (v_route_id, get_or_create_station('Badarganj'), 13, 326, 329, 120),
  (v_route_id, get_or_create_station('Kholahati'), 14, 340, 340, 130),
  (v_route_id, get_or_create_station('Parbatipur'), 15, 355, 380, 140),
  (v_route_id, get_or_create_station('Chirirbandar'), 16, 400, 403, 150),
  (v_route_id, get_or_create_station('Dinajpur'), 17, 425, 433, 160),
  (v_route_id, get_or_create_station('Setabganj'), 18, 468, 470, 170),
  (v_route_id, get_or_create_station('Pirganj'), 19, 486, 488, 180),
  (v_route_id, get_or_create_station('Bhomradah'), 20, 498, 500, 190),
  (v_route_id, get_or_create_station('Thakurgaon Road'), 21, 518, 521, 200),
  (v_route_id, get_or_create_station('Ruhia'), 22, 540, 542, 210),
  (v_route_id, get_or_create_station('Kismat'), 23, 552, 552, 220),
  (v_route_id, get_or_create_station('Panchagarh'), 24, 580, NULL, 230);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-768', 'DOWN', get_or_create_station('Panchagarh'), get_or_create_station('Santahar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Panchagarh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kismat'), 2, 21, 21, 10),
  (v_route_id, get_or_create_station('Ruhia'), 3, 33, 35, 20),
  (v_route_id, get_or_create_station('Thakurgaon Road'), 4, 51, 54, 30),
  (v_route_id, get_or_create_station('Bhomradah'), 5, 73, 75, 40),
  (v_route_id, get_or_create_station('Pirganj'), 6, 85, 87, 50),
  (v_route_id, get_or_create_station('Setabganj'), 7, 103, 106, 60),
  (v_route_id, get_or_create_station('Dinajpur'), 8, 141, 151, 70),
  (v_route_id, get_or_create_station('Chirirbandar'), 9, 170, 172, 80),
  (v_route_id, get_or_create_station('Parbatipur'), 10, 195, 220, 90),
  (v_route_id, get_or_create_station('Kholahati'), 11, 232, 232, 100),
  (v_route_id, get_or_create_station('Badarganj'), 12, 245, 248, 110),
  (v_route_id, get_or_create_station('Rangpur'), 13, 275, 280, 120),
  (v_route_id, get_or_create_station('Kaunia'), 14, 305, 325, 130),
  (v_route_id, get_or_create_station('Pirgacha'), 15, 342, 345, 140),
  (v_route_id, get_or_create_station('Bamondanga'), 16, 364, 367, 150),
  (v_route_id, get_or_create_station('Gaibandha'), 17, 412, 417, 160),
  (v_route_id, get_or_create_station('Badiakhali'), 18, 433, 453, 170),
  (v_route_id, get_or_create_station('Bonar Para'), 19, 463, 468, 180),
  (v_route_id, get_or_create_station('Mahimaganj'), 20, 477, 477, 190),
  (v_route_id, get_or_create_station('Sonatola'), 21, 490, 492, 200),
  (v_route_id, get_or_create_station('Bogura'), 22, 529, 545, 210),
  (v_route_id, get_or_create_station('Talora'), 23, 583, 583, 220),
  (v_route_id, get_or_create_station('Santahar'), 24, 615, NULL, 230);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Dhumketu Express', 'Intercity', 'W-769', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-769', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 51, 53, 20),
  (v_route_id, get_or_create_station('Tangail'), 4, 107, 109, 30),
  (v_route_id, get_or_create_station('Ibrahimabad'), 5, 129, 131, 40),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 6, 147, 150, 50),
  (v_route_id, get_or_create_station('Jamtail'), 7, 158, 164, 60),
  (v_route_id, get_or_create_station('Ullapara'), 8, 176, 179, 70),
  (v_route_id, get_or_create_station('Boral Bridge'), 9, 208, 211, 80),
  (v_route_id, get_or_create_station('Chatmohar'), 10, 224, 227, 90),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 11, 252, 255, 100),
  (v_route_id, get_or_create_station('Abdulpur'), 12, 273, 276, 110),
  (v_route_id, get_or_create_station('Arani'), 13, 287, 289, 120),
  (v_route_id, get_or_create_station('Rajshahi'), 14, 340, NULL, 130);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-770', 'DOWN', get_or_create_station('Rajshahi'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Arani'), 2, 31, 31, 10),
  (v_route_id, get_or_create_station('Abdulpur'), 3, 45, 47, 20),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 4, 62, 65, 30),
  (v_route_id, get_or_create_station('Chatmohar'), 5, 85, 88, 40),
  (v_route_id, get_or_create_station('Boral Bridge'), 6, 105, 108, 50),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 7, 157, 159, 60),
  (v_route_id, get_or_create_station('Ibrahimabad'), 8, 176, 178, 70),
  (v_route_id, get_or_create_station('Joydebpur'), 9, 252, 255, 80),
  (v_route_id, get_or_create_station('Dhaka'), 10, 320, NULL, 90);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rangpur Express', 'Intercity', 'W-771', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-771', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Rangpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rangpur'), 2, 590, NULL, 300);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-772', 'DOWN', get_or_create_station('Rangpur'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rangpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 600, NULL, 300);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Sirajganj Express', 'Intercity', 'W-775', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-775', 'UP', get_or_create_station('Sirajganj Bazar'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Sirajganj Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Sirajganjraipur'), 2, 8, 10, 10),
  (v_route_id, get_or_create_station('Jamtail'), 3, 25, 45, 20),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 4, 53, 56, 30),
  (v_route_id, get_or_create_station('SOYDABAD'), 5, 63, 66, 40),
  (v_route_id, get_or_create_station('Ibrahimabad'), 6, 78, 80, 50),
  (v_route_id, get_or_create_station('Tangail'), 7, 100, 108, 60),
  (v_route_id, get_or_create_station('Mirzapur'), 8, 132, 132, 70),
  (v_route_id, get_or_create_station('Hi-Tech City'), 9, 151, 153, 80),
  (v_route_id, get_or_create_station('Joydebpur'), 10, 194, 197, 90),
  (v_route_id, get_or_create_station('Biman Bandar'), 11, 223, 226, 100),
  (v_route_id, get_or_create_station('Dhaka'), 12, 255, NULL, 110);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-776', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Sirajganj Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 51, 54, 20),
  (v_route_id, get_or_create_station('Mirzapur'), 4, 87, 87, 30),
  (v_route_id, get_or_create_station('Tangail'), 5, 116, 118, 40),
  (v_route_id, get_or_create_station('Ibrahimabad'), 6, 138, 144, 50),
  (v_route_id, get_or_create_station('SH M Monsur Ali'), 7, 160, 162, 60),
  (v_route_id, get_or_create_station('Jamtail'), 8, 170, 195, 70),
  (v_route_id, get_or_create_station('Sirajganjraipur'), 9, 208, 210, 80),
  (v_route_id, get_or_create_station('Sirajganj Bazar'), 10, 235, NULL, 90);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Dhalarchar Express', 'Intercity', 'W-779', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-779', 'UP', get_or_create_station('Dhalarchar'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhalarchar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Badherhat'), 2, 11, 11, 10),
  (v_route_id, get_or_create_station('Kashinathpur'), 3, 27, 27, 20),
  (v_route_id, get_or_create_station('Sathia Rajapur'), 4, 43, 43, 30),
  (v_route_id, get_or_create_station('Tantibandha'), 5, 56, 56, 40),
  (v_route_id, get_or_create_station('Dublia'), 6, 66, 66, 50),
  (v_route_id, get_or_create_station('Raghabpur'), 7, 77, 77, 60),
  (v_route_id, get_or_create_station('Pabna'), 8, 91, 94, 70),
  (v_route_id, get_or_create_station('Tebunia'), 9, 106, 106, 80),
  (v_route_id, get_or_create_station('Dashuria'), 10, 120, 120, 90),
  (v_route_id, get_or_create_station('Majhgram'), 11, 133, 133, 100),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 12, 150, 153, 110),
  (v_route_id, get_or_create_station('Azim Nagar'), 13, 162, 165, 120),
  (v_route_id, get_or_create_station('Abdulpur'), 14, 174, 177, 130),
  (v_route_id, get_or_create_station('Arani'), 15, 188, 188, 140),
  (v_route_id, get_or_create_station('Sardah Road'), 16, 206, 208, 150),
  (v_route_id, get_or_create_station('Rajshahi'), 17, 235, NULL, 160);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-780', 'DOWN', get_or_create_station('Rajshahi'), get_or_create_station('Dhalarchar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Sardah Road'), 2, 17, 19, 10),
  (v_route_id, get_or_create_station('Arani'), 3, 35, 35, 20),
  (v_route_id, get_or_create_station('Abdulpur'), 4, 49, 51, 30),
  (v_route_id, get_or_create_station('Azim Nagar'), 5, 59, 61, 40),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 6, 70, 72, 50),
  (v_route_id, get_or_create_station('Majhgram'), 7, 78, 78, 60),
  (v_route_id, get_or_create_station('Dashuria'), 8, 92, 92, 70),
  (v_route_id, get_or_create_station('Tebunia'), 9, 108, 108, 80),
  (v_route_id, get_or_create_station('Pabna'), 10, 123, 125, 90),
  (v_route_id, get_or_create_station('Raghabpur'), 11, 135, 135, 100),
  (v_route_id, get_or_create_station('Dublia'), 12, 149, 149, 110),
  (v_route_id, get_or_create_station('Tantibandha'), 13, 158, 158, 120),
  (v_route_id, get_or_create_station('Sathia Rajapur'), 14, 172, 172, 130),
  (v_route_id, get_or_create_station('Kashinathpur'), 15, 190, 190, 140),
  (v_route_id, get_or_create_station('Badherhat'), 16, 208, 208, 150),
  (v_route_id, get_or_create_station('Dhalarchar'), 17, 235, NULL, 160);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Tungipara Express', 'Intercity', 'W-783', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-783', 'UP', get_or_create_station('Gobra'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Gobra'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Borashi'), 2, 9, 11, 10),
  (v_route_id, get_or_create_station('Gopalganj'), 3, 20, 23, 20),
  (v_route_id, get_or_create_station('Chandradighalia'), 4, 35, 37, 30),
  (v_route_id, get_or_create_station('Choto Bahirbag'), 5, 48, 50, 40),
  (v_route_id, get_or_create_station('Chapta'), 6, 62, 64, 50),
  (v_route_id, get_or_create_station('Kashiani'), 7, 74, 77, 60),
  (v_route_id, get_or_create_station('Boalmari Bazar'), 8, 99, 101, 70),
  (v_route_id, get_or_create_station('Madhukhali'), 9, 120, 122, 80),
  (v_route_id, get_or_create_station('Baharpur'), 10, 145, 147, 90),
  (v_route_id, get_or_create_station('Kalukhali'), 11, 160, 162, 100),
  (v_route_id, get_or_create_station('Pangsha'), 12, 171, 173, 110),
  (v_route_id, get_or_create_station('Khoksha'), 13, 186, 188, 120),
  (v_route_id, get_or_create_station('Kumarkhali'), 14, 197, 199, 130),
  (v_route_id, get_or_create_station('Kushtia Court'), 15, 216, 219, 140),
  (v_route_id, get_or_create_station('Poradaha'), 16, 240, 270, 150),
  (v_route_id, get_or_create_station('Bheramara'), 17, 287, 290, 160),
  (v_route_id, get_or_create_station('Ishwardi'), 18, 310, 330, 170),
  (v_route_id, get_or_create_station('Rajshahi'), 19, 405, NULL, 180);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-784', 'DOWN', get_or_create_station('Rajshahi'), get_or_create_station('Gobra'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Gobra'), 2, 400, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Banalata Express', 'Intercity', 'W-791', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-791', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Chapainawabganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Rajshahi'), 3, 255, 275, 20),
  (v_route_id, get_or_create_station('Chapainawabganj'), 4, 345, NULL, 30);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-792', 'DOWN', get_or_create_station('Chapainawabganj'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chapainawabganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rajshahi'), 2, 50, 60, 10),
  (v_route_id, get_or_create_station('Dhaka'), 3, 335, NULL, 20);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Panchagarh Express', 'Intercity', 'W-793', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-793', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Panchagarh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Natore'), 3, 237, 240, 20),
  (v_route_id, get_or_create_station('Santahar'), 4, 295, 300, 30),
  (v_route_id, get_or_create_station('Joypurhat'), 5, 331, 334, 40),
  (v_route_id, get_or_create_station('Parbatipur'), 6, 395, 415, 50),
  (v_route_id, get_or_create_station('Dinajpur'), 7, 448, 453, 60),
  (v_route_id, get_or_create_station('Pirganj'), 8, 515, 518, 70),
  (v_route_id, get_or_create_station('Thakurgaon Road'), 9, 543, 546, 80),
  (v_route_id, get_or_create_station('Panchagarh'), 10, 620, NULL, 90);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-794', 'DOWN', get_or_create_station('Panchagarh'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Panchagarh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Thakurgaon Road'), 2, 40, 45, 10),
  (v_route_id, get_or_create_station('Pirganj'), 3, 70, 73, 20),
  (v_route_id, get_or_create_station('Dinajpur'), 4, 122, 130, 30),
  (v_route_id, get_or_create_station('Parbatipur'), 5, 170, 190, 40),
  (v_route_id, get_or_create_station('Joypurhat'), 6, 243, 246, 50),
  (v_route_id, get_or_create_station('Santahar'), 7, 280, 285, 60),
  (v_route_id, get_or_create_station('Natore'), 8, 326, 329, 70),
  (v_route_id, get_or_create_station('Dhaka'), 9, 600, NULL, 80);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Benapole Express', 'Intercity', 'W-795', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-795', 'UP', get_or_create_station('Benapole'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Benapole'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Jhikargacha'), 2, 30, 32, 10),
  (v_route_id, get_or_create_station('Jashore'), 3, 55, 75, 20),
  (v_route_id, get_or_create_station('Mubarakganj'), 4, 114, 116, 30),
  (v_route_id, get_or_create_station('Kotchandpur'), 5, 128, 130, 40),
  (v_route_id, get_or_create_station('Darshana Halt'), 6, 154, 157, 50),
  (v_route_id, get_or_create_station('Chuadanga'), 7, 181, 184, 60),
  (v_route_id, get_or_create_station('Poradaha'), 8, 212, 215, 70),
  (v_route_id, get_or_create_station('Kushtia Court'), 9, 227, 230, 80),
  (v_route_id, get_or_create_station('Khoksha'), 10, 264, 266, 90),
  (v_route_id, get_or_create_station('Rajbari'), 11, 305, 325, 100),
  (v_route_id, get_or_create_station('Faridpur'), 12, 357, 360, 110),
  (v_route_id, get_or_create_station('Bhanga'), 13, 391, 393, 120),
  (v_route_id, get_or_create_station('Dhaka'), 14, 485, NULL, 130);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-796', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Benapole'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bhanga'), 2, 70, 72, 10),
  (v_route_id, get_or_create_station('Faridpur'), 3, 103, 106, 20),
  (v_route_id, get_or_create_station('Rajbari'), 4, 140, 150, 30),
  (v_route_id, get_or_create_station('Khoksha'), 5, 186, 188, 40),
  (v_route_id, get_or_create_station('Kushtia Court'), 6, 211, 214, 50),
  (v_route_id, get_or_create_station('Poradaha'), 7, 230, 233, 60),
  (v_route_id, get_or_create_station('Chuadanga'), 8, 262, 265, 70),
  (v_route_id, get_or_create_station('Darshana Halt'), 9, 286, 289, 80),
  (v_route_id, get_or_create_station('Kotchandpur'), 10, 314, 316, 90),
  (v_route_id, get_or_create_station('Mubarakganj'), 11, 328, 330, 100),
  (v_route_id, get_or_create_station('Jashore'), 12, 365, 390, 110),
  (v_route_id, get_or_create_station('Jhikargacha'), 13, 409, 411, 120),
  (v_route_id, get_or_create_station('Benapole'), 14, 450, NULL, 130);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Kurigram Express', 'Intercity', 'W-797', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-797', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Kurigram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Natore'), 3, 255, 257, 20),
  (v_route_id, get_or_create_station('Madhnagar'), 4, 271, 273, 30),
  (v_route_id, get_or_create_station('Santahar'), 5, 305, 310, 40),
  (v_route_id, get_or_create_station('Joypurhat'), 6, 355, 358, 50),
  (v_route_id, get_or_create_station('Parbatipur'), 7, 420, 430, 60),
  (v_route_id, get_or_create_station('Badarganj'), 8, 449, 451, 70),
  (v_route_id, get_or_create_station('Rangpur'), 9, 478, 483, 80),
  (v_route_id, get_or_create_station('Kaunia'), 10, 505, 508, 90),
  (v_route_id, get_or_create_station('Kurigram'), 11, 550, NULL, 100);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-798', 'DOWN', get_or_create_station('Kurigram'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Kurigram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kaunia'), 2, 40, 43, 10),
  (v_route_id, get_or_create_station('Rangpur'), 3, 63, 73, 20),
  (v_route_id, get_or_create_station('Badarganj'), 4, 101, 104, 30),
  (v_route_id, get_or_create_station('Parbatipur'), 5, 135, 155, 40),
  (v_route_id, get_or_create_station('Joypurhat'), 6, 212, 215, 50),
  (v_route_id, get_or_create_station('Santahar'), 7, 250, 260, 60),
  (v_route_id, get_or_create_station('Madhnagar'), 8, 292, 294, 70),
  (v_route_id, get_or_create_station('Natore'), 9, 309, 312, 80),
  (v_route_id, get_or_create_station('Dhaka'), 10, 595, NULL, 90);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Banglabandha Express', 'Intercity', 'W-803', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-803', 'UP', get_or_create_station('Rajshahi'), get_or_create_station('Panchagarh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Abdulpur'), 2, 40, 60, 10),
  (v_route_id, get_or_create_station('Natore'), 3, 77, 80, 20),
  (v_route_id, get_or_create_station('Madhnagar'), 4, 106, 108, 30),
  (v_route_id, get_or_create_station('Ahsanganj'), 5, 117, 119, 40),
  (v_route_id, get_or_create_station('Santahar'), 6, 141, 145, 50),
  (v_route_id, get_or_create_station('Akkelpur'), 7, 165, 167, 60),
  (v_route_id, get_or_create_station('Joypurhat'), 8, 182, 184, 70),
  (v_route_id, get_or_create_station('Panchbibi'), 9, 195, 197, 80),
  (v_route_id, get_or_create_station('Birampur'), 10, 217, 220, 90),
  (v_route_id, get_or_create_station('Fulbari'), 11, 238, 241, 100),
  (v_route_id, get_or_create_station('Parbatipur'), 12, 270, 290, 110),
  (v_route_id, get_or_create_station('Chirirbandar'), 13, 305, 307, 120),
  (v_route_id, get_or_create_station('Dinajpur'), 14, 325, 330, 130),
  (v_route_id, get_or_create_station('Setabganj'), 15, 361, 363, 140),
  (v_route_id, get_or_create_station('Pirganj'), 16, 377, 379, 150),
  (v_route_id, get_or_create_station('Shibganj'), 17, 394, 396, 160),
  (v_route_id, get_or_create_station('Thakurgaon Road'), 18, 403, 407, 170),
  (v_route_id, get_or_create_station('Ruhia'), 19, 422, 424, 180),
  (v_route_id, get_or_create_station('Kismat'), 20, 435, 437, 190),
  (v_route_id, get_or_create_station('Panchagarh'), 21, 460, NULL, 200);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-804', 'DOWN', get_or_create_station('Panchagarh'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Panchagarh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kismat'), 2, 18, 20, 10),
  (v_route_id, get_or_create_station('Ruhia'), 3, 29, 31, 20),
  (v_route_id, get_or_create_station('Thakurgaon Road'), 4, 47, 50, 30),
  (v_route_id, get_or_create_station('Shibganj'), 5, 57, 59, 40),
  (v_route_id, get_or_create_station('Pirganj'), 6, 75, 77, 50),
  (v_route_id, get_or_create_station('Setabganj'), 7, 94, 96, 60),
  (v_route_id, get_or_create_station('Dinajpur'), 8, 127, 135, 70),
  (v_route_id, get_or_create_station('Chirirbandar'), 9, 154, 156, 80),
  (v_route_id, get_or_create_station('Parbatipur'), 10, 180, 200, 90),
  (v_route_id, get_or_create_station('Fulbari'), 11, 218, 221, 100),
  (v_route_id, get_or_create_station('Birampur'), 12, 232, 235, 110),
  (v_route_id, get_or_create_station('Panchbibi'), 13, 270, 272, 120),
  (v_route_id, get_or_create_station('Joypurhat'), 14, 283, 286, 130),
  (v_route_id, get_or_create_station('Akkelpur'), 15, 312, 314, 140),
  (v_route_id, get_or_create_station('Santahar'), 16, 340, 345, 150),
  (v_route_id, get_or_create_station('Ahsanganj'), 17, 367, 369, 160),
  (v_route_id, get_or_create_station('Madhnagar'), 18, 378, 380, 170),
  (v_route_id, get_or_create_station('Natore'), 19, 395, 397, 180),
  (v_route_id, get_or_create_station('Abdulpur'), 20, 415, 435, 190),
  (v_route_id, get_or_create_station('Rajshahi'), 21, 495, NULL, 200);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Chilahati Express', 'Intercity', 'W-805', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-805', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Chilahati'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Biman Bandar'), 2, 23, 28, 10),
  (v_route_id, get_or_create_station('Joydebpur'), 3, 51, 54, 20),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 4, 235, 237, 30),
  (v_route_id, get_or_create_station('Natore'), 5, 267, 270, 40),
  (v_route_id, get_or_create_station('Santahar'), 6, 330, 335, 50),
  (v_route_id, get_or_create_station('Joypurhat'), 7, 379, 382, 60),
  (v_route_id, get_or_create_station('Birampur'), 8, 411, 413, 70),
  (v_route_id, get_or_create_station('Fulbari'), 9, 424, 426, 80),
  (v_route_id, get_or_create_station('Parbatipur'), 10, 460, 480, 90),
  (v_route_id, get_or_create_station('Saidpur'), 11, 497, 502, 100),
  (v_route_id, get_or_create_station('Nilphamari'), 12, 521, 524, 110),
  (v_route_id, get_or_create_station('Domar'), 13, 540, 543, 120),
  (v_route_id, get_or_create_station('Chilahati'), 14, 585, NULL, 130);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-806', 'DOWN', get_or_create_station('Chilahati'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chilahati'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Domar'), 2, 18, 21, 10),
  (v_route_id, get_or_create_station('Nilphamari'), 3, 37, 40, 20),
  (v_route_id, get_or_create_station('Saidpur'), 4, 59, 64, 30),
  (v_route_id, get_or_create_station('Parbatipur'), 5, 80, 90, 40),
  (v_route_id, get_or_create_station('Fulbari'), 6, 108, 110, 50),
  (v_route_id, get_or_create_station('Birampur'), 7, 121, 123, 60),
  (v_route_id, get_or_create_station('Joypurhat'), 8, 152, 155, 70),
  (v_route_id, get_or_create_station('Santahar'), 9, 195, 200, 80),
  (v_route_id, get_or_create_station('Natore'), 10, 241, 244, 90),
  (v_route_id, get_or_create_station('Ishwardi Bypass'), 11, 274, 276, 100),
  (v_route_id, get_or_create_station('Joydebpur'), 12, 472, 475, 110),
  (v_route_id, get_or_create_station('Dhaka'), 13, 535, NULL, 120);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Burimari Express', 'Intercity', 'W-809', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-809', 'UP', get_or_create_station('Dhaka'), get_or_create_station('Burimari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Burimari'), 2, 710, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-810', 'DOWN', get_or_create_station('Burimari'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Burimari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Dhaka'), 2, 690, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Jahanabad Express', 'Intercity', 'W-825', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-825', 'UP', get_or_create_station('Khulna'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Noapara'), 2, 33, 36, 10),
  (v_route_id, get_or_create_station('Singia'), 3, 51, 53, 20),
  (v_route_id, get_or_create_station('Narail'), 4, 73, 76, 30),
  (v_route_id, get_or_create_station('Lohagora'), 5, 89, 91, 40),
  (v_route_id, get_or_create_station('Kashiani'), 6, 101, 104, 50),
  (v_route_id, get_or_create_station('Bhanga Junction'), 7, 133, 136, 60),
  (v_route_id, get_or_create_station('Dhaka'), 8, 225, NULL, 70);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-826', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bhanga Junction'), 2, 63, 66, 10),
  (v_route_id, get_or_create_station('Kashiani'), 3, 94, 97, 20),
  (v_route_id, get_or_create_station('Lohagora'), 4, 108, 110, 30),
  (v_route_id, get_or_create_station('Narail'), 5, 123, 126, 40),
  (v_route_id, get_or_create_station('Singia'), 6, 154, 160, 50),
  (v_route_id, get_or_create_station('Noapara'), 7, 174, 176, 60),
  (v_route_id, get_or_create_station('Khulna'), 8, 225, NULL, 70);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Ruposhi Bangla Express', 'Intercity', 'W-827', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-827', 'UP', get_or_create_station('Benapole'), get_or_create_station('Dhaka'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Benapole'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Jashore'), 2, 47, 50, 10),
  (v_route_id, get_or_create_station('Narail'), 3, 78, 81, 20),
  (v_route_id, get_or_create_station('Kashiani'), 4, 103, 106, 30),
  (v_route_id, get_or_create_station('Bhanga Junction'), 5, 139, 142, 40),
  (v_route_id, get_or_create_station('Dhaka'), 6, 215, NULL, 50);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-828', 'DOWN', get_or_create_station('Dhaka'), get_or_create_station('Benapole'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Dhaka'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bhanga Junction'), 2, 62, 65, 10),
  (v_route_id, get_or_create_station('Kashiani'), 3, 94, 97, 20),
  (v_route_id, get_or_create_station('Narail'), 4, 117, 120, 30),
  (v_route_id, get_or_create_station('Jashore'), 5, 150, 160, 40),
  (v_route_id, get_or_create_station('Benapole'), 6, 220, NULL, 50);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local', 'Local', 'W-411', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-411', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 150, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-412', 'DOWN', get_or_create_station('Parbatipur'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 135, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (2)', 'Local', 'W-415', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-415', 'UP', get_or_create_station('Ramna Bazar'), get_or_create_station('Rangpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Ramna Bazar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rangpur'), 2, 195, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-416', 'DOWN', get_or_create_station('Rangpur'), get_or_create_station('Kurigram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rangpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kurigram'), 2, 85, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (3)', 'Local', 'W-421', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-421', 'UP', get_or_create_station('Kurigram'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Kurigram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 180, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-422', 'DOWN', get_or_create_station('Parbatipur'), get_or_create_station('Ramna Bazar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ramna Bazar'), 2, 290, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (4)', 'Local', 'W-431', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-431', 'UP', get_or_create_station('Parbatipur'), get_or_create_station('Panchagarh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Panchagarh'), 2, 285, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-434', 'DOWN', get_or_create_station('Panchagarh'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Panchagarh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 220, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (5)', 'Local', 'W-453', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-453', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Burimari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Burimari'), 2, 190, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-454', 'DOWN', get_or_create_station('Burimari'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Burimari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 170, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (6)', 'Local', 'W-455', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-455', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Burimari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Burimari'), 2, 170, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-456', 'DOWN', get_or_create_station('Burimari'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Burimari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 145, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (7)', 'Local', 'W-461', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-461', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 150, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-462', 'DOWN', get_or_create_station('Parbatipur'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 130, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (8)', 'Local', 'W-481', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-481', 'UP', get_or_create_station('Santahar'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Santahar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 435, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-482', 'DOWN', get_or_create_station('Lalmonirhat'), get_or_create_station('Santahar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Santahar'), 2, 470, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (9)', 'Local', 'W-491', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-491', 'UP', get_or_create_station('Santahar'), get_or_create_station('Bonarpara'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Santahar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bonarpara'), 2, 210, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-492', 'DOWN', get_or_create_station('Bonarpara'), get_or_create_station('Santahar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Bonarpara'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Santahar'), 2, 200, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (10)', 'Local', 'W-505', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-505', 'UP', get_or_create_station('Poradah'), get_or_create_station('Goalanda Ghat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Poradah'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Goalanda Ghat'), 2, 210, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-506', 'DOWN', get_or_create_station('Goalanda Ghat'), get_or_create_station('Poradah'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Goalanda Ghat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Poradah'), 2, 225, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (11)', 'Local', 'W-507', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-507', 'UP', get_or_create_station('Poradah'), get_or_create_station('Rajbari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Poradah'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rajbari'), 2, 140, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-508', 'DOWN', get_or_create_station('Goalanda Ghat'), get_or_create_station('Poradah'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Goalanda Ghat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Poradah'), 2, 205, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (12)', 'Local', 'W-513', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-513', 'UP', get_or_create_station('Rajbari'), get_or_create_station('Goalanda Ghat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajbari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Goalanda Ghat'), 2, 45, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-515', 'DOWN', get_or_create_station('Rajbari'), get_or_create_station('Goalanda Ghat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajbari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Goalanda Ghat'), 2, 45, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (13)', 'Local', 'W-541', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-541', 'UP', get_or_create_station('Ishwardi'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Ishwardi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 540, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-542', 'DOWN', get_or_create_station('Parbatipur'), get_or_create_station('Ishwardi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ishwardi'), 2, 580, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Local (14)', 'Local', 'W-585', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-585', 'UP', get_or_create_station('Chapainawabganj'), get_or_create_station('Rohanpur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chapainawabganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rohanpur'), 2, 95, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Uttarbang Mail', 'Mail', 'W-7', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-7', 'UP', get_or_create_station('Santahar'), get_or_create_station('Panchagarh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Santahar'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Panchagarh'), 2, 740, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-8', 'DOWN', get_or_create_station('Panchagarh'), get_or_create_station('Santahar'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Panchagarh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Santahar'), 2, 815, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mahananda Mail', 'Mail', 'W-15', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-15', 'UP', get_or_create_station('Khulna'), get_or_create_station('Chapainawabganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chapainawabganj'), 2, 600, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-16', 'DOWN', get_or_create_station('Rohanpur'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rohanpur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Khulna'), 2, 640, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rocket Mail', 'Mail', 'W-23', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-23', 'UP', get_or_create_station('Khulna'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Khulna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 700, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-24', 'DOWN', get_or_create_station('Parbatipur'), get_or_create_station('Khulna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Khulna'), 2, 835, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Ghaghat Mail', 'Mail', 'W-27', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-27', 'UP', get_or_create_station('Parbatipur'), get_or_create_station('Chilahati'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chilahati'), 2, 100, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-28', 'DOWN', get_or_create_station('Chilahati'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chilahati'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 105, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Uttara Mail', 'Mail', 'W-31', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-31', 'UP', get_or_create_station('Rajshahi'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 495, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-32', 'DOWN', get_or_create_station('Parbatipur'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rajshahi'), 2, 400, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Ramsagar Mail', 'Mail', 'W-59', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-59', 'UP', get_or_create_station('Bonarpara'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Bonarpara'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 290, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-60', 'DOWN', get_or_create_station('Parbatipur'), get_or_create_station('Bonarpara'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bonarpara'), 2, 305, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rajbari Mail-1', 'Mail', 'W-101', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-101', 'UP', get_or_create_station('Rajbari'), get_or_create_station('Bhanga'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajbari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bhanga'), 2, 105, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rajbari Mail-2', 'Mail', 'W-102', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-102', 'UP', get_or_create_station('Bhanga'), get_or_create_station('Kalukhali'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Bhanga'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kalukhali'), 2, 140, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Bhatiapara Mail', 'Mail', 'W-103', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-103', 'UP', get_or_create_station('Kalukhali'), get_or_create_station('Bhatiapara Ghat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Kalukhali'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bhatiapara Ghat'), 2, 135, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-104', 'DOWN', get_or_create_station('Bhatiapara Ghat'), get_or_create_station('Kalukhali'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Bhatiapara Ghat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kalukhali'), 2, 130, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rajbari Mail-3', 'Mail', 'W-105', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-105', 'UP', get_or_create_station('Kalukhali'), get_or_create_station('Bhanga'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Kalukhali'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Bhanga'), 2, 140, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Rajbari Mail-4', 'Mail', 'W-106', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-106', 'UP', get_or_create_station('Bhanga'), get_or_create_station('Rajbari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Bhanga'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rajbari'), 2, 105, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mixed', 'Mixed', 'W-413', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-413', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 205, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-414', 'DOWN', get_or_create_station('Parbatipur'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 220, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mixed (2)', 'Mixed', 'W-432', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-432', 'UP', get_or_create_station('Panchagarh'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Panchagarh'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 760, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-433', 'DOWN', get_or_create_station('Parbatipur'), get_or_create_station('Panchagarh'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Panchagarh'), 2, 480, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mixed (3)', 'Mixed', 'W-451', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-451', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Burimari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Burimari'), 2, 295, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-452', 'DOWN', get_or_create_station('Burimari'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Burimari'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 330, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mixed (4)', 'Mixed', 'W-511', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-511', 'UP', get_or_create_station('Goalanda Ghat'), get_or_create_station('Ishwardi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Goalanda Ghat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ishwardi'), 2, 450, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-512', 'DOWN', get_or_create_station('Ishwardi'), get_or_create_station('Rajbari'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Ishwardi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Rajbari'), 2, 320, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Mixed (5)', 'Mixed', 'W-591', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-591', 'UP', get_or_create_station('Parbatipur'), get_or_create_station('Chilahati'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Parbatipur'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Chilahati'), 2, 220, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-592', 'DOWN', get_or_create_station('Chilahati'), get_or_create_station('Parbatipur'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chilahati'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Parbatipur'), 2, 190, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Kurigram Shuttle', 'Shuttle', 'W-97', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-97', 'UP', get_or_create_station('Lalmonirhat'), get_or_create_station('Kurigram'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Lalmonirhat'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kurigram'), 2, 120, NULL, 10);

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-98', 'DOWN', get_or_create_station('Kurigram'), get_or_create_station('Lalmonirhat'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Kurigram'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Lalmonirhat'), 2, 110, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Chapainawabganj Shuttle-1', 'Shuttle', 'W-109', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-109', 'UP', get_or_create_station('Rajshahi'), get_or_create_station('Chapainawabganj'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Rajshahi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Kakonhat'), 2, 28, 30, 10),
  (v_route_id, get_or_create_station('Lolitnagar'), 3, 38, 40, 20),
  (v_route_id, get_or_create_station('Amnura Bypass'), 4, 49, 51, 30),
  (v_route_id, get_or_create_station('Chapainawabganj'), 5, 75, NULL, 40);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Chapainawabganj Shuttle-2', 'Shuttle', 'W-110', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-110', 'UP', get_or_create_station('Chapainawabganj'), get_or_create_station('Rajshahi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Chapainawabganj'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Amnura Bypass'), 2, 17, 20, 10),
  (v_route_id, get_or_create_station('Lolitnagar'), 3, 30, 32, 20),
  (v_route_id, get_or_create_station('Kakonhat'), 4, 40, 42, 30),
  (v_route_id, get_or_create_station('Rajshahi'), 5, 85, NULL, 40);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Pabna Shuttle-1', 'Shuttle', 'W-111', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-111', 'UP', get_or_create_station('Ishwardi'), get_or_create_station('Pabna'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Ishwardi'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Pabna'), 2, 60, NULL, 10);

END $$;

DO $$ 
DECLARE 
  v_train_id INT; 
  v_route_id INT; 
BEGIN
  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('Pabna Shuttle-2', 'Shuttle', 'W-112', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;

  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, 'W-112', 'UP', get_or_create_station('Pabna'), get_or_create_station('Ishwardi'), 1) RETURNING ROUTE_ID INTO v_route_id;
  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES 
  (v_route_id, get_or_create_station('Pabna'), 1, NULL, 0, 0),
  (v_route_id, get_or_create_station('Ishwardi'), 2, 60, NULL, 10);

END $$;
