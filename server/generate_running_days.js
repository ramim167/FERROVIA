import fs from 'fs';
import * as xlsx from 'xlsx';

const fileBuffer = fs.readFileSync('Bangladesh_Railway_Active_Trains_Route_Expanded_2026-08-12_FINAL.xlsx');
const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
const trains = xlsx.utils.sheet_to_json(workbook.Sheets['Trains'], { raw: false });

function timeToMin(t) {
  if (!t) return null;
  const str = String(t).trim();
  if (!str.includes(':')) return null;
  const parts = str.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

const allDays = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];

function getRunningDays(offDayStr) {
  if (!offDayStr || offDayStr.trim() === '' || offDayStr.trim().toLowerCase() === 'none') {
    return allDays; // অফ ডে না থাকলে প্রতিদিন চলবে
  }
  let offDays = offDayStr.split(',').map(d => d.trim().substring(0, 3).toUpperCase());
  return allDays.filter(d => !offDays.includes(d)); // অফ ডে বাদ দিয়ে রানিং ডে বের করা
}

let sql = `
-- =======================================================
-- FERROVIA AUTO GENERATED SQL FOR TRAIN RUNNING DAYS
-- =======================================================
DO $$ 
DECLARE 
  v_route_id INT; 
BEGIN
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

for (let group of trainGroups) {
  for (let i = 0; i < group.length; i++) {
    const t = group[i];
    const sId = t['Service_ID'].replace(/'/g, "''");
    
    // ডিপার্চার টাইম মিনিটে কনভার্ট করা
    const depTime = timeToMin(t['Origin_Departure']);
    if (depTime === null) continue; 
    
    // রানিং ডে বের করা
    const offDay = t['Weekly_Off_Day'];
    const runningDays = getRunningDays(offDay);
    
    // ডাটাবেসের ROUTES টেবিল থেকে ID নিয়ে ডাটা ইনসার্ট করা
    sql += `  SELECT ROUTE_ID INTO v_route_id FROM ROUTES WHERE ROUTE_CODE = '${sId}' LIMIT 1;\n`;
    sql += `  IF FOUND THEN\n`;
    for (let day of runningDays) {
       sql += `    INSERT INTO TRAIN_RUNNING_DAYS (ROUTE_ID, DAY_CODE, DEPARTURE_MINUTE) VALUES (v_route_id, '${day}', ${depTime});\n`;
    }
    sql += `  END IF;\n\n`;
  }
}

sql += `END $$;\n`;
fs.writeFileSync('seed_running_days.sql', sql);
console.log('✅ Train Running Days SQL Generated Successfully!');