/**
 * PDS Excel Generator
 * Main module for generating PDS 2025 Excel files from applicant data
 */

import type { PDSData } from '@/types/pds.types';
import {
  loadPDSTemplate,
  setCellValue,
  setCheckbox,
  setYesNoCheckbox,
  insertArrayData,
  insertTextArray,
  formatAddress,
  setCivilStatusCheckbox,
  setSexCheckbox,
  setCitizenshipCheckbox,
  getWorksheet,
  writeWorkbookToBuffer,
} from './excelTemplateInjector';
import {
  SHEET_C1_MAPPING,
  SHEET_C2_MAPPING,
  SHEET_C3_MAPPING,
  SHEET_C4_MAPPING,
} from './excelMapper';
import {
  formatDateForCSC,
  formatYearForCSC,
  formatDateRangeForCSC,
  formatHeight,
  formatWeight,
  formatHours,
  formatSalary,
  getCurrentDateCSC,
} from './dateFormatters';

/**
 * Main function to generate PDS Excel file
 * @param pdsData - Complete PDS data object
 * @returns Buffer containing the Excel file
 */
export async function generatePDSExcel(pdsData: PDSData): Promise<Buffer> {
  try {
    // Load the official template
    const workbook = loadPDSTemplate();

    // Inject data into each sheet
    injectSheetC1(workbook, pdsData);
    injectSheetC2(workbook, pdsData);
    injectSheetC3(workbook, pdsData);
    injectSheetC4(workbook, pdsData);

    // Write to buffer
    const buffer = writeWorkbookToBuffer(workbook);

    return buffer;
  } catch (error) {
    console.error('Error generating PDS Excel:', error);
    throw new Error(`Failed to generate PDS Excel: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Inject data into Sheet C1 (Personal Information & Family Background)
 */
function injectSheetC1(workbook: any, pdsData: PDSData): void {
  const worksheet = getWorksheet(workbook, 'C1');
  const { personalInfo, familyBackground } = pdsData;
  const mapping = SHEET_C1_MAPPING;

  // === SECTION I: PERSONAL INFORMATION ===

  // Names
  setCellValue(worksheet, mapping.personalInfo.surname, personalInfo.surname);
  setCellValue(worksheet, mapping.personalInfo.firstName, personalInfo.firstName);
  setCellValue(worksheet, mapping.personalInfo.middleName, personalInfo.middleName);
  setCellValue(worksheet, mapping.personalInfo.nameExtension, personalInfo.nameExtension || '');

  // Birth Information
  setCellValue(worksheet, mapping.personalInfo.dateOfBirth, formatDateForCSC(personalInfo.dateOfBirth));
  setCellValue(worksheet, mapping.personalInfo.placeOfBirth, personalInfo.placeOfBirth);

  // Sex
  setSexCheckbox(
    worksheet,
    personalInfo.sexAtBirth,
    mapping.personalInfo.sexMale,
    mapping.personalInfo.sexFemale
  );

  // Civil Status
  setCivilStatusCheckbox(
    worksheet,
    personalInfo.civilStatus,
    {
      single: mapping.personalInfo.civilStatusSingle,
      married: mapping.personalInfo.civilStatusMarried,
      widowed: mapping.personalInfo.civilStatusWidowed,
      separated: mapping.personalInfo.civilStatusSeparated,
      others: mapping.personalInfo.civilStatusOthers,
    },
    personalInfo.civilStatusOthers
  );

  if (personalInfo.civilStatus === 'Others' && personalInfo.civilStatusOthers) {
    setCellValue(worksheet, mapping.personalInfo.civilStatusOthersText, personalInfo.civilStatusOthers);
  }

  // Physical Attributes
  setCellValue(worksheet, mapping.personalInfo.height, formatHeight(personalInfo.height));
  setCellValue(worksheet, mapping.personalInfo.weight, formatWeight(personalInfo.weight));
  setCellValue(worksheet, mapping.personalInfo.bloodType, personalInfo.bloodType || '');

  // Government IDs
  setCellValue(worksheet, mapping.personalInfo.umidNo, personalInfo.umidNo || '');
  setCellValue(worksheet, mapping.personalInfo.pagibigNo, personalInfo.pagibigNo || '');
  setCellValue(worksheet, mapping.personalInfo.philhealthNo, personalInfo.philhealthNo || '');
  setCellValue(worksheet, mapping.personalInfo.tinNo, personalInfo.tinNo || '');
  setCellValue(worksheet, mapping.personalInfo.agencyEmployeeNo, personalInfo.agencyEmployeeNo || '');
  setCellValue(worksheet, mapping.personalInfo.philsysNo, personalInfo.philsysNo || '');

  // Citizenship
  setCitizenshipCheckbox(
    worksheet,
    personalInfo.citizenship,
    mapping.personalInfo.citizenshipFilipino,
    mapping.personalInfo.citizenshipDualByBirth,
    mapping.personalInfo.citizenshipDualByNaturalization,
    mapping.personalInfo.dualCitizenshipCountry,
    personalInfo.dualCitizenshipType,
    personalInfo.dualCitizenshipCountry
  );

  // Residential Address
  setCellValue(worksheet, mapping.personalInfo.residentialHouseNo, personalInfo.residentialAddress.houseBlockLotNo || '');
  setCellValue(worksheet, mapping.personalInfo.residentialStreet, personalInfo.residentialAddress.street || '');
  setCellValue(worksheet, mapping.personalInfo.residentialSubdivision, personalInfo.residentialAddress.subdivisionVillage || '');
  setCellValue(worksheet, mapping.personalInfo.residentialBarangay, personalInfo.residentialAddress.barangay);
  setCellValue(worksheet, mapping.personalInfo.residentialCity, personalInfo.residentialAddress.cityMunicipality);
  setCellValue(worksheet, mapping.personalInfo.residentialProvince, personalInfo.residentialAddress.province);
  setCellValue(worksheet, mapping.personalInfo.residentialZipCode, personalInfo.residentialAddress.zipCode);

  // Permanent Address
  if (personalInfo.permanentAddress.sameAsResidential) {
    // Copy residential address
    setCellValue(worksheet, mapping.personalInfo.permanentHouseNo, personalInfo.residentialAddress.houseBlockLotNo || '');
    setCellValue(worksheet, mapping.personalInfo.permanentStreet, personalInfo.residentialAddress.street || '');
    setCellValue(worksheet, mapping.personalInfo.permanentSubdivision, personalInfo.residentialAddress.subdivisionVillage || '');
    setCellValue(worksheet, mapping.personalInfo.permanentBarangay, personalInfo.residentialAddress.barangay);
    setCellValue(worksheet, mapping.personalInfo.permanentCity, personalInfo.residentialAddress.cityMunicipality);
    setCellValue(worksheet, mapping.personalInfo.permanentProvince, personalInfo.residentialAddress.province);
    setCellValue(worksheet, mapping.personalInfo.permanentZipCode, personalInfo.residentialAddress.zipCode);
  } else {
    setCellValue(worksheet, mapping.personalInfo.permanentHouseNo, personalInfo.permanentAddress.houseBlockLotNo || '');
    setCellValue(worksheet, mapping.personalInfo.permanentStreet, personalInfo.permanentAddress.street || '');
    setCellValue(worksheet, mapping.personalInfo.permanentSubdivision, personalInfo.permanentAddress.subdivisionVillage || '');
    setCellValue(worksheet, mapping.personalInfo.permanentBarangay, personalInfo.permanentAddress.barangay || '');
    setCellValue(worksheet, mapping.personalInfo.permanentCity, personalInfo.permanentAddress.cityMunicipality || '');
    setCellValue(worksheet, mapping.permanentProvince, personalInfo.permanentAddress.province || '');
    setCellValue(worksheet, mapping.personalInfo.permanentZipCode, personalInfo.permanentAddress.zipCode || '');
  }

  // Contact Information
  setCellValue(worksheet, mapping.personalInfo.telephoneNo, personalInfo.telephoneNo || '');
  setCellValue(worksheet, mapping.personalInfo.mobileNo, personalInfo.mobileNo);
  setCellValue(worksheet, mapping.personalInfo.emailAddress, personalInfo.emailAddress);

  // === SECTION II: FAMILY BACKGROUND ===

  // Spouse (if married/widowed)
  if (familyBackground.spouse) {
    setCellValue(worksheet, mapping.familyBackground.spouseSurname, familyBackground.spouse.surname);
    setCellValue(worksheet, mapping.familyBackground.spouseFirstName, familyBackground.spouse.firstName);
    setCellValue(worksheet, mapping.familyBackground.spouseMiddleName, familyBackground.spouse.middleName);
    setCellValue(worksheet, mapping.familyBackground.spouseOccupation, familyBackground.spouse.occupation || '');
    setCellValue(worksheet, mapping.familyBackground.spouseEmployer, familyBackground.spouse.employerBusinessName || '');
    setCellValue(worksheet, mapping.familyBackground.spouseBusinessAddress, familyBackground.spouse.businessAddress || '');
    setCellValue(worksheet, mapping.familyBackground.spouseTelephone, familyBackground.spouse.telephoneNo || '');
  }

  // Children
  if (familyBackground.children && familyBackground.children.length > 0) {
    familyBackground.children.forEach((child, index) => {
      const currentRow = mapping.familyBackground.childrenStartRow + index;

      setCellValue(
        worksheet,
        `${mapping.familyBackground.childNameColumn}${currentRow}`,
        child.fullName
      );

      setCellValue(
        worksheet,
        `${mapping.familyBackground.childDOBColumn}${currentRow}`,
        formatDateForCSC(child.dateOfBirth)
      );
    });
  }

  // Father
  setCellValue(worksheet, mapping.familyBackground.fatherSurname, familyBackground.father.surname);
  setCellValue(worksheet, mapping.familyBackground.fatherFirstName, familyBackground.father.firstName);
  setCellValue(worksheet, mapping.familyBackground.fatherMiddleName, familyBackground.father.middleName);

  // Mother
  setCellValue(worksheet, mapping.familyBackground.motherSurname, familyBackground.mother.surname);
  setCellValue(worksheet, mapping.familyBackground.motherFirstName, familyBackground.mother.firstName);
  setCellValue(worksheet, mapping.familyBackground.motherMiddleName, familyBackground.mother.middleName);
}

/**
 * Inject data into Sheet C2 (Educational Background, Eligibility, Work Experience)
 */
function injectSheetC2(workbook: any, pdsData: PDSData): void {
  const worksheet = getWorksheet(workbook, 'C2');
  const { educationalBackground, eligibility, workExperience } = pdsData;
  const mapping = SHEET_C2_MAPPING;

  // === SECTION III: EDUCATIONAL BACKGROUND ===
  if (educationalBackground && educationalBackground.length > 0) {
    const eduData = educationalBackground.map((edu) => ({
      level: edu.level,
      nameOfSchool: edu.nameOfSchool,
      basicEducation: edu.basicEducationDegreeCourse,
      from: formatYearForCSC(edu.periodOfAttendance.from),
      to: formatYearForCSC(edu.periodOfAttendance.to),
      highestLevel: edu.highestLevelUnitsEarned || '',
      yearGraduated: edu.yearGraduated || '',
      scholarship: edu.scholarshipAcademicHonors || '',
    }));

    insertArrayData(
      worksheet,
      mapping.educationalBackground.startRow - 1, // Convert to 0-based
      mapping.educationalBackground.columns,
      eduData,
      mapping.educationalBackground.maxRows
    );
  }

  // === SECTION IV: CIVIL SERVICE ELIGIBILITY ===
  if (eligibility && eligibility.length > 0) {
    const eligData = eligibility.map((elig) => ({
      careerService: elig.careerService,
      rating: elig.rating || '',
      dateOfExam: formatDateForCSC(elig.dateOfExaminationConferment),
      placeOfExam: elig.placeOfExaminationConferment,
      licenseNumber: elig.licenseNumber || '',
      licenseValidity: formatDateForCSC(elig.licenseValidity),
    }));

    insertArrayData(
      worksheet,
      mapping.eligibility.startRow - 1,
      mapping.eligibility.columns,
      eligData,
      mapping.eligibility.maxRows
    );
  }

  // === SECTION V: WORK EXPERIENCE ===
  if (workExperience && workExperience.length > 0) {
    const workData = workExperience.map((work) => {
      const dateRange = formatDateRangeForCSC(work.periodOfService.from, work.periodOfService.to);

      return {
        from: dateRange.from,
        to: dateRange.to,
        positionTitle: work.positionTitle,
        department: work.departmentAgencyOfficeCompany,
        monthlySalary: work.monthlySalary ? formatSalary(work.monthlySalary) : '',
        salaryGrade: work.salaryGrade || '',
        statusOfAppointment: work.statusOfAppointment || '',
        govService: work.governmentService ? 'Y' : 'N',
      };
    });

    insertArrayData(
      worksheet,
      mapping.workExperience.startRow - 1,
      mapping.workExperience.columns,
      workData,
      mapping.workExperience.maxRows
    );
  }
}

/**
 * Inject data into Sheet C3 (Voluntary Work & Training Programs)
 */
function injectSheetC3(workbook: any, pdsData: PDSData): void {
  const worksheet = getWorksheet(workbook, 'C3');
  const { voluntaryWork, trainings } = pdsData;
  const mapping = SHEET_C3_MAPPING;

  // === SECTION VI: VOLUNTARY WORK ===
  if (voluntaryWork && voluntaryWork.length > 0) {
    const volData = voluntaryWork.map((vol) => {
      const dateRange = formatDateRangeForCSC(vol.periodOfInvolvement.from, vol.periodOfInvolvement.to);

      // Combine organization name and address
      const orgNameAndAddress = vol.organizationAddress
        ? `${vol.organizationName} - ${vol.organizationAddress}`
        : vol.organizationName;

      return {
        organizationName: orgNameAndAddress,
        from: dateRange.from,
        to: dateRange.to,
        numberOfHours: formatHours(vol.numberOfHours),
        position: vol.positionNatureOfWork,
      };
    });

    insertArrayData(
      worksheet,
      mapping.voluntaryWork.startRow - 1,
      mapping.voluntaryWork.columns,
      volData,
      mapping.voluntaryWork.maxRows
    );
  }

  // === SECTION VII: LEARNING & DEVELOPMENT (TRAINING) ===
  if (trainings && trainings.length > 0) {
    const trainingData = trainings.map((training) => {
      const dateRange = formatDateRangeForCSC(training.periodOfAttendance.from, training.periodOfAttendance.to);

      return {
        title: training.title,
        from: dateRange.from,
        to: dateRange.to,
        numberOfHours: formatHours(training.numberOfHours),
        typeOfLD: training.typeOfLD,
        conductedBy: training.conductedSponsoredBy,
      };
    });

    insertArrayData(
      worksheet,
      mapping.trainings.startRow - 1,
      mapping.trainings.columns,
      trainingData,
      mapping.trainings.maxRows
    );
  }
}

/**
 * Inject data into Sheet C4 (Other Information & Questions)
 */
function injectSheetC4(workbook: any, pdsData: PDSData): void {
  const worksheet = getWorksheet(workbook, 'C4');
  const { otherInformation } = pdsData;
  const mapping = SHEET_C4_MAPPING;

  // === SPECIAL SKILLS & HOBBIES ===
  if (otherInformation.skills && otherInformation.skills.length > 0) {
    insertTextArray(
      worksheet,
      mapping.skills.startRow - 1,
      mapping.skills.column,
      otherInformation.skills,
      mapping.skills.maxRows
    );
  }

  // === NON-ACADEMIC DISTINCTIONS ===
  if (otherInformation.recognitions && otherInformation.recognitions.length > 0) {
    insertTextArray(
      worksheet,
      mapping.recognitions.startRow - 1,
      mapping.recognitions.column,
      otherInformation.recognitions,
      mapping.recognitions.maxRows
    );
  }

  // === MEMBERSHIPS ===
  if (otherInformation.memberships && otherInformation.memberships.length > 0) {
    insertTextArray(
      worksheet,
      mapping.memberships.startRow - 1,
      mapping.memberships.column,
      otherInformation.memberships,
      mapping.memberships.maxRows
    );
  }

  // === QUESTIONS 34-40 ===

  // Q34a: Related within 3rd degree
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q34a_yes,
    mapping.questions.q34a_no,
    otherInformation.relatedThirdDegree
  );
  if (otherInformation.relatedThirdDegree && otherInformation.relatedThirdDegreeDetails) {
    setCellValue(worksheet, mapping.questions.q34a_details, otherInformation.relatedThirdDegreeDetails);
  }

  // Q34b: Related within 4th degree (LGU)
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q34b_yes,
    mapping.questions.q34b_no,
    otherInformation.relatedFourthDegree
  );
  if (otherInformation.relatedFourthDegree && otherInformation.relatedFourthDegreeDetails) {
    setCellValue(worksheet, mapping.questions.q34b_details, otherInformation.relatedFourthDegreeDetails);
  }

  // Q35a: Found guilty of administrative offense
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q35a_yes,
    mapping.questions.q35a_no,
    otherInformation.guiltyAdministrativeOffense
  );
  if (otherInformation.guiltyAdministrativeOffense && otherInformation.guiltyAdministrativeOffenseDetails) {
    setCellValue(worksheet, mapping.questions.q35a_details, otherInformation.guiltyAdministrativeOffenseDetails);
  }

  // Q35b: Criminally charged
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q35b_yes,
    mapping.questions.q35b_no,
    otherInformation.criminallyCharged
  );
  if (otherInformation.criminallyCharged) {
    if (otherInformation.criminallyChargedDetails) {
      setCellValue(worksheet, mapping.questions.q35b_details, otherInformation.criminallyChargedDetails);
    }
    if (otherInformation.criminallyChargedDateFiled) {
      setCellValue(worksheet, mapping.questions.q35b_dateFiled, formatDateForCSC(otherInformation.criminallyChargedDateFiled));
    }
    if (otherInformation.criminallyChargedStatus) {
      setCellValue(worksheet, mapping.questions.q35b_status, otherInformation.criminallyChargedStatus);
    }
  }

  // Q36: Convicted
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q36_yes,
    mapping.questions.q36_no,
    otherInformation.convicted
  );
  if (otherInformation.convicted && otherInformation.convictedDetails) {
    setCellValue(worksheet, mapping.questions.q36_details, otherInformation.convictedDetails);
  }

  // Q37: Separated from service
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q37_yes,
    mapping.questions.q37_no,
    otherInformation.separatedFromService
  );
  if (otherInformation.separatedFromService && otherInformation.separatedFromServiceDetails) {
    setCellValue(worksheet, mapping.questions.q37_details, otherInformation.separatedFromServiceDetails);
  }

  // Q38a: Candidate in election
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q38a_yes,
    mapping.questions.q38a_no,
    otherInformation.candidateNationalLocal
  );
  if (otherInformation.candidateNationalLocal && otherInformation.candidateNationalLocalDetails) {
    setCellValue(worksheet, mapping.questions.q38a_details, otherInformation.candidateNationalLocalDetails);
  }

  // Q38b: Resigned for candidacy
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q38b_yes,
    mapping.questions.q38b_no,
    otherInformation.resignedForCandidacy
  );
  if (otherInformation.resignedForCandidacy && otherInformation.resignedForCandidacyDetails) {
    setCellValue(worksheet, mapping.questions.q38b_details, otherInformation.resignedForCandidacyDetails);
  }

  // Q39: Immigrant or permanent resident
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q39_yes,
    mapping.questions.q39_no,
    otherInformation.immigrantOrPermanentResident
  );
  if (otherInformation.immigrantOrPermanentResident && otherInformation.immigrantOrPermanentResidentCountry) {
    setCellValue(worksheet, mapping.questions.q39_country, otherInformation.immigrantOrPermanentResidentCountry);
  }

  // Q40a: Indigenous group member
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q40a_yes,
    mapping.questions.q40a_no,
    otherInformation.indigenousGroupMember
  );
  if (otherInformation.indigenousGroupMember && otherInformation.indigenousGroupName) {
    setCellValue(worksheet, mapping.questions.q40a_group, otherInformation.indigenousGroupName);
  }

  // Q40b: Person with disability
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q40b_yes,
    mapping.questions.q40b_no,
    otherInformation.personWithDisability
  );
  if (otherInformation.personWithDisability && otherInformation.pwdIdNumber) {
    setCellValue(worksheet, mapping.questions.q40b_id, otherInformation.pwdIdNumber);
  }

  // Q40c: Solo parent
  setYesNoCheckbox(
    worksheet,
    mapping.questions.q40c_yes,
    mapping.questions.q40c_no,
    otherInformation.soloParent
  );
  if (otherInformation.soloParent && otherInformation.soloParentIdNumber) {
    setCellValue(worksheet, mapping.questions.q40c_id, otherInformation.soloParentIdNumber);
  }

  // === REFERENCES ===
  if (otherInformation.references && otherInformation.references.length > 0) {
    const refData = otherInformation.references.map((ref) => ({
      name: ref.name,
      address: ref.address,
      telephone: ref.telephoneNo,
    }));

    insertArrayData(
      worksheet,
      mapping.references.startRow - 1,
      mapping.references.columns,
      refData,
      Math.min(refData.length, mapping.references.maxRows) // Use actual count or max, whichever is smaller
    );
  }

  // === GOVERNMENT ISSUED ID ===
  if (otherInformation.governmentIssuedId) {
    setCellValue(worksheet, mapping.governmentId.type, otherInformation.governmentIssuedId.type);
    setCellValue(worksheet, mapping.governmentId.idNumber, otherInformation.governmentIssuedId.idNumber);
    if (otherInformation.governmentIssuedId.dateIssued) {
      setCellValue(worksheet, mapping.governmentId.dateIssued, formatDateForCSC(otherInformation.governmentIssuedId.dateIssued));
    }
  }

  // === DECLARATION ===
  if (otherInformation.declaration) {
    const declarationDate = otherInformation.declaration.dateAccomplished || getCurrentDateCSC();
    setCellValue(worksheet, mapping.declaration.date, declarationDate);

    // Note: Signature image insertion would require additional image handling
    // For now, we'll note the signature URL/path if available
    if (otherInformation.declaration.signatureUrl) {
      // Signature image handling can be added here if needed
      // This would require the xlsx library's image insertion capabilities
      // For MVP, we'll skip actual image insertion and just note it's available
    }
  }
}

/**
 * Generate filename for the exported PDS Excel
 * Format: CS_Form_212_LASTNAME_FIRSTNAME_2025.xlsx
 * @param personalInfo - Personal information from PDS
 * @returns Formatted filename
 */
export function generatePDSFilename(personalInfo: { surname: string; firstName: string }): string {
  const lastName = personalInfo.surname.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
  const firstName = personalInfo.firstName.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');

  return `CS_Form_212_${lastName}_${firstName}_2025.xlsx`;
}
