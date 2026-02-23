/**
 * One-off script: read Universal_Expense_Tracker_2026.xlsx and output
 * seed expenses as JSON for the app. Run from project root:
 *   node scripts/exportSeedFromExcel.js
 *
 * Expects the Excel file in ~/Downloads/Universal_Expense_Tracker_2026.xlsx
 * or pass path as first argument.
 */

import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const excelPath = process.argv[2] || path.join(process.env.HOME || '', 'Downloads', 'Universal_Expense_Tracker_2026.xlsx');
const outPath = path.join(__dirname, '..', 'src', 'data', 'seedExpenses.json');

if (!fs.existsSync(excelPath)) {
  console.error('Excel file not found:', excelPath);
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0]; // "Expense Tracker"
const sheet = workbook.Sheets[sheetName];

// Table is G3:N15 → columns G=Date, H=Day, I=Category, J=Description, K=Amount, L=Payment Method, M=Notes, N=Daily Total
// We want data rows only (skip header row 3). Use range G4:N15.
const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
const dataRows = [];
for (let R = 3; R <= 14; R++) { // rows 4-15 (0-based 3-14)
  const dateCell = sheet[XLSX.utils.encode_cell({ r: R, c: 6 })];  // G
  const categoryCell = sheet[XLSX.utils.encode_cell({ r: R, c: 8 })]; // I
  const descCell = sheet[XLSX.utils.encode_cell({ r: R, c: 9 })];   // J
  const amountCell = sheet[XLSX.utils.encode_cell({ r: R, c: 10 })]; // K
  const paymentCell = sheet[XLSX.utils.encode_cell({ r: R, c: 11 })]; // L
  const notesCell = sheet[XLSX.utils.encode_cell({ r: R, c: 12 })];   // M

  const rawDate = dateCell && (dateCell.w != null ? dateCell.w : dateCell.v);
  if (!rawDate) continue; // skip empty rows

  let dateStr = rawDate;
  if (typeof rawDate === 'number') {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(rawDate);
    dateStr = [d.y, String(d.m).padStart(2, '0'), String(d.d).padStart(2, '0')].join('-');
  } else if (typeof rawDate === 'string' && rawDate.includes('/')) {
    // "20/02/2026" → "2026-02-20"
    const [d, m, y] = rawDate.split('/');
    dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const amount = amountCell != null ? (amountCell.v != null ? Number(amountCell.v) : 0) : 0;
  if (amount === 0 && !categoryCell && !descCell) continue;

  dataRows.push({
    date: dateStr,
    category: (categoryCell && (categoryCell.w || categoryCell.v)) || 'Other',
    description: (descCell && (descCell.w || descCell.v)) || '',
    amount: String(amount),
    paymentMethod: (paymentCell && (paymentCell.w || paymentCell.v)) || 'Cash',
    notes: (notesCell && (notesCell.w || notesCell.v)) || '',
  });
}

const seed = dataRows.map((row, i) => ({ id: 1700000000000 + i, ...row }));
const outDir = path.dirname(outPath);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(seed, null, 2), 'utf8');
console.log('Wrote', seed.length, 'expenses to', outPath);
