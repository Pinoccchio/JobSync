/**
 * Excel Cell Mapping Configuration for PDS 2025
 * Maps PDS data fields to specific cells in the official CSC template
 *
 * Template Structure:
 * - Sheet C1: Personal Information + Family Background
 * - Sheet C2: Educational Background + Civil Service Eligibility + Work Experience
 * - Sheet C3: Voluntary Work + Training Programs
 * - Sheet C4: Other Information + Questions 34-40 + References
 */

/**
 * SHEET C1 - PERSONAL INFORMATION & FAMILY BACKGROUND
 */
export const SHEET_C1_MAPPING = {
  // Section I: Personal Information
  personalInfo: {
    // Names (Rows 10-12)
    surname: 'C10',
    firstName: 'C11',
    middleName: 'C12',
    nameExtension: 'M10', // JR., SR., III, etc.

    // Birth Information (Rows 13-15)
    dateOfBirth: 'C13', // Format: dd/mm/yyyy
    placeOfBirth: 'C15',

    // Sex (Row 16) - Checkboxes
    sexMale: 'G16',    // ☑ for Male
    sexFemale: 'I16',  // ☑ for Female

    // Civil Status (Row 17) - Checkboxes
    civilStatusSingle: 'G17',
    civilStatusMarried: 'I17',
    civilStatusWidowed: 'K17',
    civilStatusSeparated: 'M17',
    civilStatusOthers: 'O17',
    civilStatusOthersText: 'Q17',

    // Physical Attributes (Rows 18-20)
    height: 'C18',      // in meters -> convert to cm
    weight: 'C19',      // in kg
    bloodType: 'C20',

    // Government IDs (Rows 21-26)
    umidNo: 'C21',
    pagibigNo: 'C22',
    philhealthNo: 'C23',
    sssNo: 'C24',       // May need to check if this exists in new form
    tinNo: 'C25',
    agencyEmployeeNo: 'C26',
    philsysNo: 'M21',   // PhilSys Number (PSN)

    // Citizenship (Rows 27-28) - Checkboxes and details
    citizenshipFilipino: 'G27',
    citizenshipDualByBirth: 'I27',
    citizenshipDualByNaturalization: 'K27',
    dualCitizenshipCountry: 'M27',

    // Residential Address (Rows 29-33)
    residentialHouseNo: 'C29',
    residentialStreet: 'C30',
    residentialSubdivision: 'C31',
    residentialBarangay: 'C32',
    residentialCity: 'C33',
    residentialProvince: 'C34',
    residentialZipCode: 'M34',

    // Permanent Address (Rows 35-40)
    permanentHouseNo: 'C35',
    permanentStreet: 'C36',
    permanentSubdivision: 'C37',
    permanentBarangay: 'C38',
    permanentCity: 'C39',
    permanentProvince: 'C40',
    permanentZipCode: 'M40',

    // Contact Information (Rows 41-43)
    telephoneNo: 'C41',
    mobileNo: 'C42',
    emailAddress: 'C43',
  },

  // Section II: Family Background
  familyBackground: {
    // Spouse Information (Rows 45-50)
    spouseSurname: 'C45',
    spouseFirstName: 'C46',
    spouseMiddleName: 'C47',
    spouseOccupation: 'C48',
    spouseEmployer: 'C49',
    spouseBusinessAddress: 'C50',
    spouseTelephone: 'M50',

    // Father's Name (Rows 52-54)
    fatherSurname: 'C52',
    fatherFirstName: 'C53',
    fatherMiddleName: 'C54',

    // Mother's Maiden Name (Rows 56-58)
    motherSurname: 'C56',
    motherFirstName: 'C57',
    motherMiddleName: 'C58',

    // Children (starts at Row 60)
    childrenStartRow: 60,
    childNameColumn: 'C',
    childDOBColumn: 'M',
  },
};

/**
 * SHEET C2 - EDUCATIONAL BACKGROUND, ELIGIBILITY, WORK EXPERIENCE
 */
export const SHEET_C2_MAPPING = {
  // Section III: Educational Background (Page starts at Row 3 based on analysis)
  // This section is on a different page/continuation
  educationalBackground: {
    startRow: 3, // First data row for education
    columns: {
      level: 'C',              // Elementary, Secondary, etc.
      nameOfSchool: 'D',       // School name
      basicEducation: 'E',     // Degree/Course
      from: 'F',               // Period from (year)
      to: 'G',                 // Period to (year)
      highestLevel: 'H',       // Units earned (if not graduated)
      yearGraduated: 'I',      // Year graduated
      scholarship: 'J',        // Honors/Scholarship
    },
    maxRows: 8, // Maximum rows available in template
  },

  // Section IV: Civil Service Eligibility
  eligibility: {
    startRow: 15, // Based on template structure (after education section)
    columns: {
      careerService: 'C',      // CS/Eligibility title
      rating: 'D',             // Rating (if applicable)
      dateOfExam: 'E',         // Date of exam (dd/mm/yyyy)
      placeOfExam: 'F',        // Place of exam/conferment
      licenseNumber: 'G',      // License number
      licenseValidity: 'H',    // Validity date (dd/mm/yyyy)
    },
    maxRows: 7,
  },

  // Section V: Work Experience
  workExperience: {
    startRow: 28, // After eligibility section
    columns: {
      from: 'C',               // From date (dd/mm/yyyy)
      to: 'D',                 // To date (dd/mm/yyyy or Present)
      positionTitle: 'E',      // Position title
      department: 'F',         // Department/Company
      monthlySalary: 'G',      // Monthly salary
      salaryGrade: 'H',        // Salary grade (optional)
      statusOfAppointment: 'I', // Permanent, Temporary, etc.
      govService: 'J',         // Y/N for government service
    },
    maxRows: 20, // Template has more rows for work experience
  },
};

/**
 * SHEET C3 - VOLUNTARY WORK & TRAINING PROGRAMS
 */
export const SHEET_C3_MAPPING = {
  // Section VI: Voluntary Work
  voluntaryWork: {
    startRow: 5, // First data row
    columns: {
      organizationName: 'C',   // Name & Address
      from: 'D',               // From date (dd/mm/yyyy)
      to: 'E',                 // To date (dd/mm/yyyy)
      numberOfHours: 'F',      // Number of hours
      position: 'G',           // Position/Nature of work
    },
    maxRows: 8,
  },

  // Section VII: Learning & Development (Training)
  trainings: {
    startRow: 17, // After voluntary work section
    columns: {
      title: 'C',              // Training title
      from: 'D',               // From date (dd/mm/yyyy)
      to: 'E',                 // To date (dd/mm/yyyy)
      numberOfHours: 'F',      // Number of hours
      typeOfLD: 'G',           // Type (Managerial, Technical, etc.)
      conductedBy: 'H',        // Conducted/Sponsored by
    },
    maxRows: 20,
  },
};

/**
 * SHEET C4 - OTHER INFORMATION & QUESTIONS
 */
export const SHEET_C4_MAPPING = {
  // Section VIII: Other Information

  // Special Skills and Hobbies (starts Row 2)
  skills: {
    startRow: 2,
    column: 'C',
    maxRows: 7,
  },

  // Non-Academic Distinctions (Row 10+)
  recognitions: {
    startRow: 10,
    column: 'C',
    maxRows: 7,
  },

  // Memberships (Row 18+)
  memberships: {
    startRow: 18,
    column: 'C',
    maxRows: 7,
  },

  // Questions 34-40 (Rows 26-60 approximately)
  questions: {
    // Q34a: Related within 3rd degree
    q34a_yes: 'G26',
    q34a_no: 'I26',
    q34a_details: 'C28',

    // Q34b: Related within 4th degree (LGU)
    q34b_yes: 'G30',
    q34b_no: 'I30',
    q34b_details: 'C32',

    // Q35a: Found guilty of administrative offense
    q35a_yes: 'G34',
    q35a_no: 'I34',
    q35a_details: 'C36',

    // Q35b: Criminally charged
    q35b_yes: 'G38',
    q35b_no: 'I38',
    q35b_details: 'C40',
    q35b_dateFiled: 'C42',
    q35b_status: 'C44',

    // Q36: Convicted of any crime
    q36_yes: 'G46',
    q36_no: 'I46',
    q36_details: 'C48',

    // Q37: Separated from service
    q37_yes: 'G50',
    q37_no: 'I50',
    q37_details: 'C52',

    // Q38a: Candidate in election
    q38a_yes: 'G54',
    q38a_no: 'I54',
    q38a_details: 'C56',

    // Q38b: Resigned for candidacy
    q38b_yes: 'G58',
    q38b_no: 'I58',
    q38b_details: 'C60',

    // Q39: Immigrant or permanent resident
    q39_yes: 'G62',
    q39_no: 'I62',
    q39_country: 'C64',

    // Q40a: Indigenous group member
    q40a_yes: 'G66',
    q40a_no: 'I66',
    q40a_group: 'C68',

    // Q40b: Person with disability
    q40b_yes: 'G70',
    q40b_no: 'I70',
    q40b_id: 'C72',

    // Q40c: Solo parent
    q40c_yes: 'G74',
    q40c_no: 'I74',
    q40c_id: 'C76',
  },

  // References (Row 78+)
  references: {
    startRow: 78,
    columns: {
      name: 'C',
      address: 'E',
      telephone: 'H',
    },
    maxRows: 3, // Minimum 3 references required
  },

  // Government Issued ID (Row 85+)
  governmentId: {
    type: 'C85',
    idNumber: 'E85',
    dateIssued: 'H85',
  },

  // Declaration (Row 90+)
  declaration: {
    date: 'C90',
    // Signature image will be inserted separately
    signaturePlaceholder: 'C92', // Where signature image should be placed
  },
};

/**
 * Helper function to convert column letter to index
 */
export function columnLetterToIndex(letter: string): number {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return index - 1;
}

/**
 * Helper function to convert cell reference to row/col indices
 */
export function cellRefToIndices(cellRef: string): { row: number; col: number } {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell reference: ${cellRef}`);
  }

  const col = columnLetterToIndex(match[1]);
  const row = parseInt(match[2], 10) - 1; // Convert to 0-based index

  return { row, col };
}

/**
 * Helper function to create cell reference from row/col indices
 */
export function indicesToCellRef(row: number, col: number): string {
  let colLetter = '';
  let c = col + 1; // Convert to 1-based

  while (c > 0) {
    const remainder = (c - 1) % 26;
    colLetter = String.fromCharCode('A'.charCodeAt(0) + remainder) + colLetter;
    c = Math.floor((c - 1) / 26);
  }

  return `${colLetter}${row + 1}`;
}

/**
 * Checkbox character constants
 */
export const CHECKBOX = {
  CHECKED: '☑',
  UNCHECKED: '☐',
  YES: '☑',
  NO: '☐',
};
