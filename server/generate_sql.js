import fs from 'fs';
import { readSheetRows } from './spreadsheet.js';

const sourceFile = 'Bangladesh_Railway_Active_Trains_Route_Expanded_2026-08-12_FINAL.xlsx';
const trains = await readSheetRows(sourceFile, 'Trains');
const stops = await readSheetRows(sourceFile, 'Stop_Times');

function timeToMin(t) {
  if (!t) return null;
  const str = String(t).trim();
  if (!str.includes(':')) return null;
  const parts = str.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

let sql = `
-- =======================================================
-- FERROVIA AUTO GENERATED SQL FOR 301 TRAINS
-- =======================================================

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

`;

let trainGroups = [];
let currentGroup = [];

for (let t of trains) {
  if (currentGroup.length > 0 && (currentGroup.length === 2 || currentGroup[0]['Train_Name'] !== t['Train_Name'])) {
    trainGroups.push(currentGroup);
    currentGroup = [];
  }
  currentGroup.push(t);
}
if (currentGroup.length > 0) {
  trainGroups.push(currentGroup);
}

let nameCounts = {}; 

for (let group of trainGroups) {
  sql += `DO $$ \nDECLARE \n  v_train_id INT; \n  v_route_id INT; \nBEGIN\n`;
  const first = group[0];
  const type = (first['Category'] || 'Intercity').replace(/'/g, "''");
  
  let baseName = first['Train_Name'].replace(/'/g, "''");
  
  if (!nameCounts[baseName]) {
     nameCounts[baseName] = 1;
  } else {
     nameCounts[baseName]++;
  }
  let tName = nameCounts[baseName] > 1 ? `${baseName} (${nameCounts[baseName]})` : baseName;
  
  const tCode = (first['Service_ID'] || 'T-00').replace(/'/g, "''");
  
  sql += `  INSERT INTO TRAINS (TRAIN_NAME, TRAIN_TYPE, TRAIN_CODE, TRAIN_STATUS, SPARE_TRIGGER_DELAY_MIN)
  VALUES ('${tName}', '${type}', '${tCode}', 'ACTIVE', 60) RETURNING TRAIN_ID INTO v_train_id;\n\n`;

  for (let i = 0; i < group.length; i++) {
    const t = group[i];
    const sId = t['Service_ID'];
    const dir = i === 0 ? 'UP' : 'DOWN';
    const rCode = sId.replace(/'/g, "''");
    
    const tStops = stops.filter(s => s['Service_ID'] === sId).sort((a,b) => a['Stop_Sequence'] - b['Stop_Sequence']);
    if (tStops.length < 2) continue;
    
    const src = tStops[0]['Station'].replace(/'/g, "''");
    const dest = tStops[tStops.length-1]['Station'].replace(/'/g, "''");
    
    sql += `  INSERT INTO ROUTES (TRAIN_ID, ROUTE_CODE, DIRECTION, SOURCE_STATION_ID, DESTINATION_STATION_ID, IS_ACTIVE)
  VALUES (v_train_id, '${rCode}', '${dir}', get_or_create_station('${src}'), get_or_create_station('${dest}'), 1) RETURNING ROUTE_ID INTO v_route_id;\n`;
    
    let baseMin = null;
    let prevOffset = 0;
    let dayOffset = 0;
    
    let stopsSql = [];
    for (let j = 0; j < tStops.length; j++) {
      const stp = tStops[j];
      const stpName = stp['Station'].replace(/'/g, "''");
      const seq = j + 1;
      
      let arr = timeToMin(stp['Arrival']);
      let dep = timeToMin(stp['Departure']);
      
      if (j === 0) {
         if (dep !== null) baseMin = dep;
         else if (arr !== null) baseMin = arr;
         else baseMin = 0;
         prevOffset = 0;
      }
      
      const calcOffset = (time) => {
         if (time === null || time === undefined) return null;
         
         let rawOffset = time + dayOffset - baseMin;
         
         while (rawOffset < 0) {
             dayOffset += 1440;
             rawOffset += 1440;
         }
         
         if (rawOffset < prevOffset) {
             let drop = prevOffset - rawOffset;
             if (drop > 300) { 
                 dayOffset += 1440;
                 rawOffset += 1440;
             } else {
                 rawOffset = prevOffset + 2; 
             }
         }
         
         prevOffset = rawOffset;
         return rawOffset;
      };
      
      let arrOffset = calcOffset(arr);
      let depOffset = calcOffset(dep);
      
      if (arrOffset === null && depOffset === null) {
          arrOffset = (j === 0) ? 0 : prevOffset + 15;
          depOffset = arrOffset + 5;
          prevOffset = depOffset;
      }

      if (j === 0) arrOffset = null;
      if (j === tStops.length - 1) depOffset = null;
      
      if (j > 0 && j < tStops.length - 1) {
          if (arrOffset === null && depOffset !== null) arrOffset = depOffset;
          if (depOffset === null && arrOffset !== null) depOffset = arrOffset;
      }

      let sqlArr = arrOffset !== null ? arrOffset : 'NULL';
      let sqlDep = depOffset !== null ? depOffset : 'NULL';
      const dist = j * 10; 
      
      stopsSql.push(`  (v_route_id, get_or_create_station('${stpName}'), ${seq}, ${sqlArr}, ${sqlDep}, ${dist})`);
    }
    if (stopsSql.length > 0) {
        sql += `  INSERT INTO ROUTE_STOPS (ROUTE_ID, STATION_ID, STOP_SEQUENCE, ARRIVAL_OFFSET_MIN, DEPARTURE_OFFSET_MIN, DISTANCE_FROM_SOURCE_KM) VALUES \n` + stopsSql.join(',\n') + `;\n\n`;
    }
  }
  
  sql += `END $$;\n\n`;
}

fs.writeFileSync('seed_trains.sql', sql);
console.log('New SQL file generated successfully.');
