/**
 * Excel Template Injection Utilities
 * Provides functions to read template and inject data while preserving formatting
 */

import * as XLSX from 'xlsx';
import { cellRefToIndices, indicesToCellRef, CHECKBOX } from './excelMapper';
import path from 'path';
import fs from 'fs';

/**
 * Load the official PDS 2025 template
 * @returns Workbook object
 */
export function loadPDSTemplate(): XLSX.WorkBook {
  // Use public directory for reliable Next.js path handling
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'PDS_2025_Template.xlsx');

  // Verify file exists with detailed diagnostics
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Template file not found!');
    console.error('Expected path:', templatePath);
    console.error('process.cwd():', process.cwd());
    console.error('Directory contents:', fs.existsSync(path.join(process.cwd(), 'public', 'templates'))
      ? fs.readdirSync(path.join(process.cwd(), 'public', 'templates'))
      : 'public/templates directory does not exist');

    throw new Error(
      `Template file not found at ${templatePath}. ` +
      `Please ensure PDS_2025_Template.xlsx exists in public/templates/ directory.`
    );
  }

  try {
    // Read file as buffer first (more reliable in Next.js API routes)
    console.log('📂 Reading template file into buffer...');
    const buffer = fs.readFileSync(templatePath);
    console.log(`✅ File read successfully (${buffer.length} bytes)`);

    // Parse buffer instead of reading file directly
    console.log('📊 Parsing Excel workbook from buffer...');
    const workbook = XLSX.read(buffer, {
      type: 'buffer',  // Specify we're passing a buffer
      cellStyles: true,
      cellNF: true,
      cellDates: true,
    });

    console.log('✅ PDS template loaded successfully');
    console.log(`   Sheets found: ${workbook.SheetNames.join(', ')}`);
    return workbook;
  } catch (error) {
    console.error('❌ Failed to read/parse template file:', error);

    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error(`File not found: ${templatePath}`);
      } else if (error.message.includes('EACCES') || error.message.includes('EPERM')) {
        throw new Error(`Permission denied accessing: ${templatePath}`);
      } else if (error.message.includes('EMFILE')) {
        throw new Error(`Too many open files. Please try again.`);
      }
    }

    throw new Error(
      `Failed to load template: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Set cell value while preserving existing formatting
 * @param worksheet - The worksheet to modify
 * @param cellRef - Cell reference (e.g., "C10")
 * @param value - Value to set
 */
export function setCellValue(
  worksheet: XLSX.WorkSheet,
  cellRef: string,
  value: string | number | boolean | null | undefined
): void {
  if (!worksheet[cellRef]) {
    worksheet[cellRef] = {};
  }

  const cell = worksheet[cellRef];

  // Handle different value types
  if (value === null || value === undefined || value === '') {
    cell.v = '';
    cell.t = 's'; // string type
  } else if (typeof value === 'boolean') {
    cell.v = value;
    cell.t = 'b';
  } else if (typeof value === 'number') {
    cell.v = value;
    cell.t = 'n';
  } else {
    cell.v = String(value);
    cell.t = 's';
  }

  // Preserve existing formatting (cell.s is the style object)
  // xlsx library automatically preserves styles when cellStyles: true
}

/**
 * Set checkbox value (Yes/No)
 * @param worksheet - The worksheet
 * @param cellRef - Cell reference for checkbox
 * @param isChecked - Whether the checkbox should be checked
 */
export function setCheckbox(
  worksheet: XLSX.WorkSheet,
  cellRef: string,
  isChecked: boolean
): void {
  setCellValue(worksheet, cellRef, isChecked ? CHECKBOX.CHECKED : CHECKBOX.UNCHECKED);
}

/**
 * Set yes/no checkboxes (typically in pairs)
 * @param worksheet - The worksheet
 * @param yesCellRef - Cell reference for "Yes" checkbox
 * @param noCellRef - Cell reference for "No" checkbox
 * @param value - Boolean value (true = Yes, false = No)
 */
export function setYesNoCheckbox(
  worksheet: XLSX.WorkSheet,
  yesCellRef: string,
  noCellRef: string,
  value: boolean | undefined | null
): void {
  if (value === true) {
    setCheckbox(worksheet, yesCellRef, true);
    setCheckbox(worksheet, noCellRef, false);
  } else if (value === false) {
    setCheckbox(worksheet, yesCellRef, false);
    setCheckbox(worksheet, noCellRef, true);
  } else {
    // If undefined/null, leave both unchecked
    setCheckbox(worksheet, yesCellRef, false);
    setCheckbox(worksheet, noCellRef, false);
  }
}

/**
 * Insert array data into worksheet starting from a specific row
 * Each array item will occupy one row
 * @param worksheet - The worksheet
 * @param startRow - Starting row index (0-based)
 * @param columnMapping - Object mapping field names to column letters
 * @param dataArray - Array of objects to insert
 * @param maxRows - Maximum number of rows to insert (template limitation)
 */
export function insertArrayData<T extends Record<string, any>>(
  worksheet: XLSX.WorkSheet,
  startRow: number,
  columnMapping: Record<string, string>,
  dataArray: T[],
  maxRows: number
): void {
  const itemsToInsert = dataArray.slice(0, maxRows); // Limit to max rows

  itemsToInsert.forEach((item, index) => {
    const currentRow = startRow + index;

    // Insert each field according to column mapping
    Object.entries(columnMapping).forEach(([fieldName, columnLetter]) => {
      const cellRef = `${columnLetter}${currentRow + 1}`; // +1 for 1-based Excel rows
      const value = item[fieldName];

      setCellValue(worksheet, cellRef, value);
    });
  });

  // Clear remaining rows if data array is smaller than maxRows
  if (itemsToInsert.length < maxRows) {
    for (let i = itemsToInsert.length; i < maxRows; i++) {
      const currentRow = startRow + i;

      Object.values(columnMapping).forEach((columnLetter) => {
        const cellRef = `${columnLetter}${currentRow + 1}`;
        setCellValue(worksheet, cellRef, '');
      });
    }
  }
}

/**
 * Insert text array (e.g., skills, recognitions) into a single column
 * @param worksheet - The worksheet
 * @param startRow - Starting row index (0-based)
 * @param column - Column letter
 * @param textArray - Array of strings
 * @param maxRows - Maximum rows to use
 * @param separator - Separator for overflow (if array > maxRows)
 */
export function insertTextArray(
  worksheet: XLSX.WorkSheet,
  startRow: number,
  column: string,
  textArray: string[],
  maxRows: number,
  separator: string = ', '
): void {
  if (!textArray || textArray.length === 0) {
    return;
  }

  if (textArray.length <= maxRows) {
    // Each item gets its own row
    textArray.forEach((text, index) => {
      const cellRef = `${column}${startRow + index + 1}`;
      setCellValue(worksheet, cellRef, text);
    });

    // Clear remaining rows
    for (let i = textArray.length; i < maxRows; i++) {
      const cellRef = `${column}${startRow + i + 1}`;
      setCellValue(worksheet, cellRef, '');
    }
  } else {
    // Overflow: combine multiple items per row
    const itemsPerRow = Math.ceil(textArray.length / maxRows);

    for (let row = 0; row < maxRows; row++) {
      const startIndex = row * itemsPerRow;
      const endIndex = Math.min(startIndex + itemsPerRow, textArray.length);
      const items = textArray.slice(startIndex, endIndex);
      const cellRef = `${column}${startRow + row + 1}`;

      setCellValue(worksheet, cellRef, items.join(separator));
    }
  }
}

/**
 * Concatenate address components into a single string
 * @param address - Address object with components
 * @returns Formatted address string
 */
export function formatAddress(address: {
  houseBlockLotNo?: string;
  street?: string;
  subdivisionVillage?: string;
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
  zipCode?: string;
}): string {
  const parts = [
    address.houseBlockLotNo,
    address.street,
    address.subdivisionVillage,
    address.barangay,
    address.cityMunicipality,
    address.province,
    address.zipCode,
  ].filter(Boolean); // Remove empty/undefined parts

  return parts.join(', ');
}

/**
 * Set civil status checkbox (Single, Married, Widowed, etc.)
 * @param worksheet - The worksheet
 * @param status - Civil status value
 * @param cellMapping - Mapping of status values to cell references
 */
export function setCivilStatusCheckbox(
  worksheet: XLSX.WorkSheet,
  status: string,
  cellMapping: {
    single: string;
    married: string;
    widowed: string;
    separated: string;
    others: string;
  },
  othersText?: string
): void {
  // Clear all checkboxes first
  Object.values(cellMapping).forEach((cellRef) => {
    setCheckbox(worksheet, cellRef, false);
  });

  // Set the appropriate checkbox
  const statusLower = status.toLowerCase();

  if (statusLower.includes('single')) {
    setCheckbox(worksheet, cellMapping.single, true);
  } else if (statusLower.includes('married')) {
    setCheckbox(worksheet, cellMapping.married, true);
  } else if (statusLower.includes('widowed')) {
    setCheckbox(worksheet, cellMapping.widowed, true);
  } else if (statusLower.includes('separated') || statusLower.includes('annulled')) {
    setCheckbox(worksheet, cellMapping.separated, true);
  } else {
    // Others (Solo Parent, etc.)
    setCheckbox(worksheet, cellMapping.others, true);
    if (othersText) {
      // Assuming there's a cell for "Others" text, which should be defined in cellMapping
      // We'll handle this in the actual injection
    }
  }
}

/**
 * Set sex checkbox (Male/Female)
 * @param worksheet - The worksheet
 * @param sex - Sex value ("Male" or "Female")
 * @param maleCell - Cell reference for Male checkbox
 * @param femaleCell - Cell reference for Female checkbox
 */
export function setSexCheckbox(
  worksheet: XLSX.WorkSheet,
  sex: string,
  maleCell: string,
  femaleCell: string
): void {
  const sexLower = sex.toLowerCase();

  if (sexLower === 'male') {
    setCheckbox(worksheet, maleCell, true);
    setCheckbox(worksheet, femaleCell, false);
  } else if (sexLower === 'female') {
    setCheckbox(worksheet, maleCell, false);
    setCheckbox(worksheet, femaleCell, true);
  } else {
    // Default or unclear
    setCheckbox(worksheet, maleCell, false);
    setCheckbox(worksheet, femaleCell, false);
  }
}

/**
 * Set citizenship checkboxes
 * @param worksheet - The worksheet
 * @param citizenship - Citizenship value
 * @param filipinoCell - Cell for Filipino checkbox
 * @param dualByBirthCell - Cell for Dual by birth
 * @param dualByNaturalizationCell - Cell for Dual by naturalization
 * @param countryCell - Cell for country (if dual)
 * @param country - Country value (if dual citizenship)
 */
export function setCitizenshipCheckbox(
  worksheet: XLSX.WorkSheet,
  citizenship: string,
  filipinoCell: string,
  dualByBirthCell: string,
  dualByNaturalizationCell: string,
  countryCell?: string,
  dualType?: string,
  country?: string
): void {
  // Clear all checkboxes
  setCheckbox(worksheet, filipinoCell, false);
  setCheckbox(worksheet, dualByBirthCell, false);
  setCheckbox(worksheet, dualByNaturalizationCell, false);

  const citizenshipLower = citizenship.toLowerCase();

  if (citizenshipLower === 'filipino') {
    setCheckbox(worksheet, filipinoCell, true);
  } else if (citizenshipLower.includes('dual')) {
    if (dualType?.toLowerCase() === 'by birth') {
      setCheckbox(worksheet, dualByBirthCell, true);
    } else if (dualType?.toLowerCase() === 'by naturalization') {
      setCheckbox(worksheet, dualByNaturalizationCell, true);
    }

    // Set country if provided
    if (countryCell && country) {
      setCellValue(worksheet, countryCell, country);
    }
  }
}

/**
 * Get worksheet by name with error handling
 * @param workbook - The workbook
 * @param sheetName - Sheet name to retrieve
 * @returns Worksheet object
 */
export function getWorksheet(workbook: XLSX.WorkBook, sheetName: string): XLSX.WorkSheet {
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook. Available sheets: ${workbook.SheetNames.join(', ')}`);
  }

  return worksheet;
}

/**
 * Write workbook to buffer
 * @param workbook - The workbook to write
 * @returns Buffer containing Excel file
 */
export function writeWorkbookToBuffer(workbook: XLSX.WorkBook): Buffer {
  const excelBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
    cellStyles: true, // Preserve styles
  });

  return excelBuffer;
}

/**
 * Safely get cell value (returns empty string if cell doesn't exist)
 * @param worksheet - The worksheet
 * @param cellRef - Cell reference
 * @returns Cell value as string
 */
export function getCellValue(worksheet: XLSX.WorkSheet, cellRef: string): string {
  const cell = worksheet[cellRef];

  if (!cell || cell.v === undefined || cell.v === null) {
    return '';
  }

  return String(cell.v);
}
