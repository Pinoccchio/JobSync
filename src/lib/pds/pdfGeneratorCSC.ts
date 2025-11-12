import jsPDF from 'jspdf';
import { PDSData } from '@/types/pds.types';
import { formatDateOnly } from '@/lib/utils/dateFormatters';

/**
 * Generate a CSC-compliant PDF document from PDS data
 * Exact replica of CS Form No. 212, Revised 2025
 * Box-based layout matching official CSC format
 *
 * @param pdsData - The PDS data to export
 * @param includeSignature - Whether to include the digital signature image
 * @param returnDoc - Whether to return the document instead of auto-downloading
 * @param useCurrentDate - Whether to use current date instead of original PDS date
 */
export async function generateCSCFormatPDF(
  pdsData: Partial<PDSData>,
  includeSignature: boolean = false,
  returnDoc: boolean = false,
  useCurrentDate: boolean = false
): Promise<jsPDF | void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;
  let pageNumber = 1;

  // Helper: Check if new page needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 15) {
      addPageNumber();
      doc.addPage();
      pageNumber++;
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper: Add page number
  const addPageNumber = () => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${pageNumber}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  };

  // Helper: Draw box
  const drawBox = (x: number, y: number, width: number, height: number) => {
    doc.rect(x, y, width, height);
  };

  // Helper: Draw text in box
  const drawTextInBox = (
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fontSize: number = 8,
    bold: boolean = false
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');

    // Word wrap if text is too long
    const lines = doc.splitTextToSize(text, width - 2);
    const lineHeight = fontSize * 0.35;
    const textY = y + height / 2 + (lines.length * lineHeight) / 4;

    lines.forEach((line: string, index: number) => {
      doc.text(line, x + 1, textY + index * lineHeight);
    });
  };

  // Helper: Draw label + value box
  const drawLabelValueBox = (
    label: string,
    value: string,
    x: number,
    y: number,
    labelWidth: number,
    valueWidth: number,
    height: number = 7
  ) => {
    // Label box
    drawBox(x, y, labelWidth, height);
    doc.setFillColor(240, 240, 240);
    doc.rect(x, y, labelWidth, height, 'F');
    drawTextInBox(label, x, y, labelWidth, height, 7, true);

    // Value box
    drawBox(x + labelWidth, y, valueWidth, height);
    drawTextInBox(value, x + labelWidth, y, valueWidth, height, 8);

    return y + height;
  };

  // ============================================================================
  // HEADER
  // ============================================================================
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PERSONAL DATA SHEET', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('(CS Form No. 212, Revised 2025)', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Warning text
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const warningText = 'WARNING: Any misrepresentation made in the Personal Data Sheet and the Work Experience Sheet shall cause the filing of administrative/criminal case/s against the person concerned.';
  const warningLines = doc.splitTextToSize(warningText, contentWidth);
  warningLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 3;
  });
  yPosition += 5;

  // Instruction text
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  const instructionText = 'READ THE ATTACHED GUIDE TO FILLING OUT THE PERSONAL DATA SHEET (PDS) BEFORE ACCOMPLISHING THE PDS FORM.';
  doc.text(instructionText, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // ============================================================================
  // I. PERSONAL INFORMATION
  // ============================================================================
  checkPageBreak(80);

  // Section header
  drawBox(margin, yPosition, contentWidth, 7);
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPosition, contentWidth, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('I. PERSONAL INFORMATION', margin + 2, yPosition + 5);
  yPosition += 7;

  if (pdsData.personalInfo) {
    const pi = pdsData.personalInfo;

    // Name fields (row 1)
    drawBox(margin, yPosition, contentWidth, 7);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth / 4, 7, 'F');
    doc.rect(margin + contentWidth / 4, yPosition, contentWidth / 4, 7, 'F');
    doc.rect(margin + contentWidth / 2, yPosition, contentWidth / 4, 7, 'F');
    doc.rect(margin + 3 * contentWidth / 4, yPosition, contentWidth / 4, 7, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('2. SURNAME', margin + 1, yPosition + 5);
    doc.text('FIRST NAME', margin + contentWidth / 4 + 1, yPosition + 5);
    doc.text('MIDDLE NAME', margin + contentWidth / 2 + 1, yPosition + 5);
    doc.text('NAME EXTENSION (JR., SR)', margin + 3 * contentWidth / 4 + 1, yPosition + 5);
    yPosition += 7;

    // Name values (row 2)
    drawBox(margin, yPosition, contentWidth / 4, 8);
    drawBox(margin + contentWidth / 4, yPosition, contentWidth / 4, 8);
    drawBox(margin + contentWidth / 2, yPosition, contentWidth / 4, 8);
    drawBox(margin + 3 * contentWidth / 4, yPosition, contentWidth / 4, 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text((pi.surname || '').toUpperCase(), margin + 1, yPosition + 5);
    doc.text((pi.firstName || '').toUpperCase(), margin + contentWidth / 4 + 1, yPosition + 5);
    doc.text((pi.middleName || '').toUpperCase(), margin + contentWidth / 2 + 1, yPosition + 5);
    doc.text((pi.nameExtension || '').toUpperCase(), margin + 3 * contentWidth / 4 + 1, yPosition + 5);
    yPosition += 8;

    // Date of birth row
    yPosition = drawLabelValueBox('3. DATE OF BIRTH', formatDateOnly(pi.dateOfBirth) || 'N/A', margin, yPosition, 40, contentWidth - 40);

    // Place of birth row
    yPosition = drawLabelValueBox('4. PLACE OF BIRTH', pi.placeOfBirth || 'N/A', margin, yPosition, 40, contentWidth - 40);

    // Sex, Civil Status, Height, Weight, Blood Type (row)
    const infoBoxWidth = contentWidth / 5;
    yPosition = drawLabelValueBox('5. SEX', pi.sexAtBirth || 'N/A', margin, yPosition, 20, infoBoxWidth - 20, 7);
    yPosition -= 7;
    yPosition = drawLabelValueBox('6. CIVIL STATUS', pi.civilStatus || 'N/A', margin + infoBoxWidth, yPosition, 22, infoBoxWidth - 22, 7);
    yPosition -= 7;
    yPosition = drawLabelValueBox('7. HEIGHT (m)', pi.height?.toString() || 'N/A', margin + 2 * infoBoxWidth, yPosition, 25, infoBoxWidth - 25, 7);
    yPosition -= 7;
    yPosition = drawLabelValueBox('8. WEIGHT (kg)', pi.weight?.toString() || 'N/A', margin + 3 * infoBoxWidth, yPosition, 25, infoBoxWidth - 25, 7);
    yPosition -= 7;
    yPosition = drawLabelValueBox('9. BLOOD TYPE', pi.bloodType || 'N/A', margin + 4 * infoBoxWidth, yPosition, 25, infoBoxWidth - 25, 7);

    // Citizenship
    yPosition = drawLabelValueBox('10. CITIZENSHIP', pi.citizenship || 'Filipino', margin, yPosition, 40, contentWidth - 40);

    if (pi.citizenship === 'Dual Citizenship') {
      yPosition = drawLabelValueBox('    DUAL CITIZENSHIP TYPE', pi.dualCitizenshipType || 'N/A', margin, yPosition, 50, contentWidth - 50, 6);
      yPosition = drawLabelValueBox('    COUNTRY', pi.dualCitizenshipCountry || 'N/A', margin, yPosition, 50, contentWidth - 50, 6);
    }

    // Residential Address
    yPosition = drawLabelValueBox(
      '11. RESIDENTIAL ADDRESS',
      [
        pi.residentialAddress?.houseBlockLotNo,
        pi.residentialAddress?.street,
        pi.residentialAddress?.subdivisionVillage,
        pi.residentialAddress?.barangay,
        pi.residentialAddress?.cityMunicipality,
        pi.residentialAddress?.province,
        pi.residentialAddress?.zipCode,
      ].filter(Boolean).join(', ') || 'N/A',
      margin,
      yPosition,
      40,
      contentWidth - 40,
      12
    );

    // ZIP CODE
    yPosition = drawLabelValueBox('    ZIP CODE', pi.residentialAddress?.zipCode || 'N/A', margin, yPosition, 40, contentWidth - 40);

    // Permanent Address
    const permAddress = pi.permanentAddress?.sameAsResidential
      ? 'Same as Residential Address'
      : [
          pi.permanentAddress?.houseBlockLotNo,
          pi.permanentAddress?.street,
          pi.permanentAddress?.subdivisionVillage,
          pi.permanentAddress?.barangay,
          pi.permanentAddress?.cityMunicipality,
          pi.permanentAddress?.province,
          pi.permanentAddress?.zipCode,
        ].filter(Boolean).join(', ') || 'N/A';

    yPosition = drawLabelValueBox('12. PERMANENT ADDRESS', permAddress, margin, yPosition, 40, contentWidth - 40, 12);
    yPosition = drawLabelValueBox('    ZIP CODE', pi.permanentAddress?.sameAsResidential ? pi.residentialAddress?.zipCode || 'N/A' : pi.permanentAddress?.zipCode || 'N/A', margin, yPosition, 40, contentWidth - 40);

    // Contact Info
    yPosition = drawLabelValueBox('13. TELEPHONE NO.', pi.telephoneNo || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('14. MOBILE NO.', pi.mobileNo || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('15. E-MAIL ADDRESS', pi.emailAddress || 'N/A', margin, yPosition, 40, contentWidth - 40);

    // Government IDs
    checkPageBreak(40);
    yPosition = drawLabelValueBox('16. GSIS ID NO.', pi.umidNo || 'N/A', margin, yPosition, 40, contentWidth / 2 - 40);
    yPosition -= 7;
    yPosition = drawLabelValueBox('17. PAG-IBIG ID NO.', pi.pagibigNo || 'N/A', margin + contentWidth / 2, yPosition, 40, contentWidth / 2 - 40);

    yPosition = drawLabelValueBox('18. PHILHEALTH NO.', pi.philhealthNo || 'N/A', margin, yPosition, 40, contentWidth / 2 - 40);
    yPosition -= 7;
    yPosition = drawLabelValueBox('19. SSS NO.', pi.philsysNo || 'N/A', margin + contentWidth / 2, yPosition, 40, contentWidth / 2 - 40);

    yPosition = drawLabelValueBox('20. TIN NO.', pi.tinNo || 'N/A', margin, yPosition, 40, contentWidth / 2 - 40);
    yPosition -= 7;
    yPosition = drawLabelValueBox('21. AGENCY EMPLOYEE NO.', pi.agencyEmployeeNo || 'N/A', margin + contentWidth / 2, yPosition, 40, contentWidth / 2 - 40);
  }

  yPosition += 3;

  // ============================================================================
  // II. FAMILY BACKGROUND
  // ============================================================================
  checkPageBreak(60);

  drawBox(margin, yPosition, contentWidth, 7);
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPosition, contentWidth, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('II. FAMILY BACKGROUND', margin + 2, yPosition + 5);
  yPosition += 7;

  if (pdsData.familyBackground) {
    const fb = pdsData.familyBackground;

    // Spouse's information
    yPosition = drawLabelValueBox('22. SPOUSE\'S SURNAME', fb.spouse?.surname || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    FIRST NAME', fb.spouse?.firstName || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    MIDDLE NAME', fb.spouse?.middleName || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    NAME EXTENSION', fb.spouse?.nameExtension || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    OCCUPATION', fb.spouse?.occupation || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    EMPLOYER/BUSINESS NAME', fb.spouse?.employerBusinessName || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    BUSINESS ADDRESS', fb.spouse?.businessAddress || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    TELEPHONE NO.', fb.spouse?.telephoneNo || 'N/A', margin, yPosition, 40, contentWidth - 40);

    // Father's information
    yPosition = drawLabelValueBox('23. FATHER\'S SURNAME', fb.father?.surname || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    FIRST NAME', fb.father?.firstName || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    MIDDLE NAME', fb.father?.middleName || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    NAME EXTENSION', fb.father?.nameExtension || 'N/A', margin, yPosition, 40, contentWidth - 40);

    // Mother's maiden name
    yPosition = drawLabelValueBox('24. MOTHER\'S MAIDEN SURNAME', fb.mother?.surname || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    FIRST NAME', fb.mother?.firstName || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    MIDDLE NAME', fb.mother?.middleName || 'N/A', margin, yPosition, 40, contentWidth - 40);

    // Children
    if (fb.children && fb.children.length > 0) {
      checkPageBreak(30 + fb.children.length * 7);

      drawBox(margin, yPosition, contentWidth, 7);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, contentWidth, 7, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('25. NAME OF CHILDREN (Write full name and list all)', margin + 1, yPosition + 5);
      yPosition += 7;

      // Children header
      drawBox(margin, yPosition, contentWidth * 0.7, 6);
      drawBox(margin + contentWidth * 0.7, yPosition, contentWidth * 0.3, 6);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, contentWidth * 0.7, 6, 'F');
      doc.rect(margin + contentWidth * 0.7, yPosition, contentWidth * 0.3, 6, 'F');
      doc.setFontSize(7);
      doc.text('NAME', margin + 1, yPosition + 4);
      doc.text('DATE OF BIRTH (mm/dd/yyyy)', margin + contentWidth * 0.7 + 1, yPosition + 4);
      yPosition += 6;

      fb.children.forEach((child) => {
        drawBox(margin, yPosition, contentWidth * 0.7, 6);
        drawBox(margin + contentWidth * 0.7, yPosition, contentWidth * 0.3, 6);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text((child.fullName || '').toUpperCase(), margin + 1, yPosition + 4);
        doc.text(formatDateOnly(child.dateOfBirth) || 'N/A', margin + contentWidth * 0.7 + 1, yPosition + 4);
        yPosition += 6;
      });
    }
  }

  yPosition += 3;

  // ============================================================================
  // III. EDUCATIONAL BACKGROUND
  // ============================================================================
  checkPageBreak(80);

  drawBox(margin, yPosition, contentWidth, 7);
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPosition, contentWidth, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('III. EDUCATIONAL BACKGROUND', margin + 2, yPosition + 5);
  yPosition += 7;

  // Table header
  const colWidths = {
    level: contentWidth * 0.15,
    school: contentWidth * 0.30,
    course: contentWidth * 0.25,
    period: contentWidth * 0.15,
    units: contentWidth * 0.08,
    year: contentWidth * 0.07,
  };

  drawBox(margin, yPosition, colWidths.level, 12);
  drawBox(margin + colWidths.level, yPosition, colWidths.school, 12);
  drawBox(margin + colWidths.level + colWidths.school, yPosition, colWidths.course, 12);
  drawBox(margin + colWidths.level + colWidths.school + colWidths.course, yPosition, colWidths.period, 12);
  drawBox(margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period, yPosition, colWidths.units, 12);
  drawBox(margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period + colWidths.units, yPosition, colWidths.year, 12);

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, colWidths.level, 12, 'F');
  doc.rect(margin + colWidths.level, yPosition, colWidths.school, 12, 'F');
  doc.rect(margin + colWidths.level + colWidths.school, yPosition, colWidths.course, 12, 'F');
  doc.rect(margin + colWidths.level + colWidths.school + colWidths.course, yPosition, colWidths.period, 12, 'F');
  doc.rect(margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period, yPosition, colWidths.units, 12, 'F');
  doc.rect(margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period + colWidths.units, yPosition, colWidths.year, 12, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('26. LEVEL', margin + 1, yPosition + 6);
  doc.text('27. NAME OF SCHOOL', margin + colWidths.level + 1, yPosition + 6);
  doc.text('28. BASIC EDUCATION/DEGREE/COURSE', margin + colWidths.level + colWidths.school + 1, yPosition + 6);
  doc.text('29. PERIOD OF', margin + colWidths.level + colWidths.school + colWidths.course + 1, yPosition + 4);
  doc.text('ATTENDANCE', margin + colWidths.level + colWidths.school + colWidths.course + 1, yPosition + 8);
  doc.text('(From-To)', margin + colWidths.level + colWidths.school + colWidths.course + 1, yPosition + 11);
  doc.text('30. HIGHEST', margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period + 1, yPosition + 4);
  doc.text('LEVEL/', margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period + 1, yPosition + 7);
  doc.text('UNITS', margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period + 1, yPosition + 10);
  doc.text('31. YEAR', margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period + colWidths.units + 1, yPosition + 4);
  doc.text('GRAD.', margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period + colWidths.units + 1, yPosition + 8);
  yPosition += 12;

  if (pdsData.educationalBackground && pdsData.educationalBackground.length > 0) {
    pdsData.educationalBackground.forEach((edu) => {
      checkPageBreak(10);

      const rowHeight = 10;
      drawBox(margin, yPosition, colWidths.level, rowHeight);
      drawBox(margin + colWidths.level, yPosition, colWidths.school, rowHeight);
      drawBox(margin + colWidths.level + colWidths.school, yPosition, colWidths.course, rowHeight);
      drawBox(margin + colWidths.level + colWidths.school + colWidths.course, yPosition, colWidths.period, rowHeight);
      drawBox(margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period, yPosition, colWidths.units, rowHeight);
      drawBox(margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period + colWidths.units, yPosition, colWidths.year, rowHeight);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');

      // Level
      doc.text(edu.level || '', margin + 1, yPosition + 6);

      // School name (wrap if needed)
      const schoolLines = doc.splitTextToSize(edu.nameOfSchool || 'N/A', colWidths.school - 2);
      schoolLines.forEach((line: string, index: number) => {
        doc.text(line, margin + colWidths.level + 1, yPosition + 4 + index * 3);
      });

      // Course
      const courseLines = doc.splitTextToSize(edu.basicEducationDegreeCourse || 'N/A', colWidths.course - 2);
      courseLines.forEach((line: string, index: number) => {
        doc.text(line, margin + colWidths.level + colWidths.school + 1, yPosition + 4 + index * 3);
      });

      // Period
      const period = edu.periodOfAttendance
        ? `${edu.periodOfAttendance.from || ''}-${edu.periodOfAttendance.to || ''}`
        : 'N/A';
      doc.text(period, margin + colWidths.level + colWidths.school + colWidths.course + 1, yPosition + 6);

      // Units
      doc.text(edu.highestLevelUnitsEarned || 'N/A', margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period + 1, yPosition + 6);

      // Year graduated
      doc.text(edu.yearGraduated || 'N/A', margin + colWidths.level + colWidths.school + colWidths.course + colWidths.period + colWidths.units + 1, yPosition + 6);

      yPosition += rowHeight;
    });
  }

  yPosition += 3;

  // ============================================================================
  // IV. CIVIL SERVICE ELIGIBILITY
  // ============================================================================
  checkPageBreak(50);

  drawBox(margin, yPosition, contentWidth, 7);
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPosition, contentWidth, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('IV. CIVIL SERVICE ELIGIBILITY', margin + 2, yPosition + 5);
  yPosition += 7;

  // Table header
  const eligColWidths = {
    career: contentWidth * 0.30,
    rating: contentWidth * 0.10,
    dateExam: contentWidth * 0.15,
    placeExam: contentWidth * 0.20,
    license: contentWidth * 0.15,
    validity: contentWidth * 0.10,
  };

  drawBox(margin, yPosition, eligColWidths.career, 10);
  drawBox(margin + eligColWidths.career, yPosition, eligColWidths.rating, 10);
  drawBox(margin + eligColWidths.career + eligColWidths.rating, yPosition, eligColWidths.dateExam, 10);
  drawBox(margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam, yPosition, eligColWidths.placeExam, 10);
  drawBox(margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + eligColWidths.placeExam, yPosition, eligColWidths.license, 10);
  drawBox(margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + eligColWidths.placeExam + eligColWidths.license, yPosition, eligColWidths.validity, 10);

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, contentWidth, 10, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('32. CAREER SERVICE/', margin + 1, yPosition + 4);
  doc.text('RA 1080 (BOARD/', margin + 1, yPosition + 7);
  doc.text('BAR) UNDER SPECIAL LAWS/', margin + 1, yPosition + 9.5);

  doc.text('33. RATING', margin + eligColWidths.career + 1, yPosition + 6);
  doc.text('(If Applicable)', margin + eligColWidths.career + 1, yPosition + 9);

  doc.text('34. DATE OF', margin + eligColWidths.career + eligColWidths.rating + 1, yPosition + 4);
  doc.text('EXAMINATION /', margin + eligColWidths.career + eligColWidths.rating + 1, yPosition + 7);
  doc.text('CONFERMENT', margin + eligColWidths.career + eligColWidths.rating + 1, yPosition + 9.5);

  doc.text('35. PLACE OF', margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + 1, yPosition + 4);
  doc.text('EXAMINATION /', margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + 1, yPosition + 7);
  doc.text('CONFERMENT', margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + 1, yPosition + 9.5);

  doc.text('36. LICENSE', margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + eligColWidths.placeExam + 1, yPosition + 5);
  doc.text('NUMBER', margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + eligColWidths.placeExam + 1, yPosition + 8);

  doc.text('37. DATE OF', margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + eligColWidths.placeExam + eligColWidths.license + 1, yPosition + 5);
  doc.text('VALIDITY', margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + eligColWidths.placeExam + eligColWidths.license + 1, yPosition + 8);

  yPosition += 10;

  if (pdsData.eligibility && pdsData.eligibility.length > 0) {
    pdsData.eligibility.forEach((elig) => {
      checkPageBreak(8);

      const rowHeight = 8;
      drawBox(margin, yPosition, eligColWidths.career, rowHeight);
      drawBox(margin + eligColWidths.career, yPosition, eligColWidths.rating, rowHeight);
      drawBox(margin + eligColWidths.career + eligColWidths.rating, yPosition, eligColWidths.dateExam, rowHeight);
      drawBox(margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam, yPosition, eligColWidths.placeExam, rowHeight);
      drawBox(margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + eligColWidths.placeExam, yPosition, eligColWidths.license, rowHeight);
      drawBox(margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + eligColWidths.placeExam + eligColWidths.license, yPosition, eligColWidths.validity, rowHeight);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');

      const careerLines = doc.splitTextToSize(elig.careerService || 'N/A', eligColWidths.career - 2);
      careerLines.forEach((line: string, index: number) => {
        doc.text(line, margin + 1, yPosition + 4 + index * 2.5);
      });

      doc.text(elig.rating || 'N/A', margin + eligColWidths.career + 1, yPosition + 5);
      doc.text(formatDateOnly(elig.dateOfExaminationConferment) || 'N/A', margin + eligColWidths.career + eligColWidths.rating + 1, yPosition + 5);

      const placeLines = doc.splitTextToSize(elig.placeOfExaminationConferment || 'N/A', eligColWidths.placeExam - 2);
      placeLines.forEach((line: string, index: number) => {
        doc.text(line, margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + 1, yPosition + 4 + index * 2.5);
      });

      // License Number with text wrapping
      const licenseLines = doc.splitTextToSize(elig.licenseNumber || 'N/A', eligColWidths.license - 2);
      licenseLines.forEach((line: string, index: number) => {
        doc.text(line, margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + eligColWidths.placeExam + 1, yPosition + 5 + index * 2.5);
      });

      // Date of Validity with text wrapping
      const validityText = formatDateOnly(elig.dateOfValidity) || 'N/A';
      const validityLines = doc.splitTextToSize(validityText, eligColWidths.validity - 2);
      validityLines.forEach((line: string, index: number) => {
        doc.text(line, margin + eligColWidths.career + eligColWidths.rating + eligColWidths.dateExam + eligColWidths.placeExam + eligColWidths.license + 1, yPosition + 5 + index * 2.5);
      });

      yPosition += rowHeight;
    });
  }

  yPosition += 3;

  // ============================================================================
  // V. WORK EXPERIENCE
  // ============================================================================
  checkPageBreak(50);

  drawBox(margin, yPosition, contentWidth, 7);
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPosition, contentWidth, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('V. WORK EXPERIENCE', margin + 2, yPosition + 5);
  yPosition += 7;

  // Work Experience table header
  const workColWidths = {
    period: contentWidth * 0.15,
    position: contentWidth * 0.25,
    company: contentWidth * 0.25,
    salary: contentWidth * 0.12,
    grade: contentWidth * 0.08,
    status: contentWidth * 0.08,
    govt: contentWidth * 0.07,
  };

  drawBox(margin, yPosition, workColWidths.period, 12);
  drawBox(margin + workColWidths.period, yPosition, workColWidths.position, 12);
  drawBox(margin + workColWidths.period + workColWidths.position, yPosition, workColWidths.company, 12);
  drawBox(margin + workColWidths.period + workColWidths.position + workColWidths.company, yPosition, workColWidths.salary, 12);
  drawBox(margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary, yPosition, workColWidths.grade, 12);
  drawBox(margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade, yPosition, workColWidths.status, 12);
  drawBox(margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade + workColWidths.status, yPosition, workColWidths.govt, 12);

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, contentWidth, 12, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('38. INCLUSIVE', margin + 1, yPosition + 4);
  doc.text('DATES', margin + 1, yPosition + 7);
  doc.text('(mm/dd/yyyy)', margin + 1, yPosition + 10);

  doc.text('39. POSITION', margin + workColWidths.period + 1, yPosition + 4);
  doc.text('TITLE', margin + workColWidths.period + 1, yPosition + 7);

  doc.text('40. DEPARTMENT/', margin + workColWidths.period + workColWidths.position + 1, yPosition + 3);
  doc.text('AGENCY/', margin + workColWidths.period + workColWidths.position + 1, yPosition + 6);
  doc.text('OFFICE/', margin + workColWidths.period + workColWidths.position + 1, yPosition + 9);
  doc.text('COMPANY', margin + workColWidths.period + workColWidths.position + 1, yPosition + 11.5);

  doc.text('41. MONTHLY', margin + workColWidths.period + workColWidths.position + workColWidths.company + 1, yPosition + 5);
  doc.text('SALARY', margin + workColWidths.period + workColWidths.position + workColWidths.company + 1, yPosition + 8);

  doc.text('42.', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + 1, yPosition + 4);
  doc.text('SALARY', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + 1, yPosition + 7);
  doc.text('GRADE', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + 1, yPosition + 10);

  doc.text('43.', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade + 1, yPosition + 4);
  doc.text('STATUS', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade + 1, yPosition + 7);
  doc.text('OF APPT.', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade + 1, yPosition + 10);

  doc.text('44.', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade + workColWidths.status + 1, yPosition + 5);
  doc.text('GOV\'T', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade + workColWidths.status + 1, yPosition + 8);
  doc.text('SERVICE', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade + workColWidths.status + 1, yPosition + 10.5);

  yPosition += 12;

  if (pdsData.workExperience && pdsData.workExperience.length > 0) {
    pdsData.workExperience.forEach((work) => {
      checkPageBreak(10);

      const rowHeight = 10;
      drawBox(margin, yPosition, workColWidths.period, rowHeight);
      drawBox(margin + workColWidths.period, yPosition, workColWidths.position, rowHeight);
      drawBox(margin + workColWidths.period + workColWidths.position, yPosition, workColWidths.company, rowHeight);
      drawBox(margin + workColWidths.period + workColWidths.position + workColWidths.company, yPosition, workColWidths.salary, rowHeight);
      drawBox(margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary, yPosition, workColWidths.grade, rowHeight);
      drawBox(margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade, yPosition, workColWidths.status, rowHeight);
      drawBox(margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade + workColWidths.status, yPosition, workColWidths.govt, rowHeight);

      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');

      // Period
      const period = work.periodOfService
        ? `${formatDateOnly(work.periodOfService.from) || ''}\n${work.periodOfService.to === 'Present' ? 'Present' : formatDateOnly(work.periodOfService.to) || ''}`
        : 'N/A';
      const periodLines = period.split('\n');
      periodLines.forEach((line, index) => {
        doc.text(line, margin + 1, yPosition + 4 + index * 3);
      });

      // Position
      const posLines = doc.splitTextToSize(work.positionTitle || 'N/A', workColWidths.position - 2);
      posLines.forEach((line: string, index: number) => {
        doc.text(line, margin + workColWidths.period + 1, yPosition + 4 + index * 2.5);
      });

      // Company
      const companyLines = doc.splitTextToSize(work.departmentAgencyOfficeCompany || 'N/A', workColWidths.company - 2);
      companyLines.forEach((line: string, index: number) => {
        doc.text(line, margin + workColWidths.period + workColWidths.position + 1, yPosition + 4 + index * 2.5);
      });

      // Salary - Convert number to string for jsPDF
      doc.text(work.monthlySalary ? String(work.monthlySalary) : 'N/A', margin + workColWidths.period + workColWidths.position + workColWidths.company + 1, yPosition + 6);

      // Grade
      doc.text(work.salaryGrade || 'N/A', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + 1, yPosition + 6);

      // Status
      doc.text(work.statusOfAppointment || 'N/A', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade + 1, yPosition + 6);

      // Govt Service
      doc.text(work.governmentService ? 'Y' : 'N', margin + workColWidths.period + workColWidths.position + workColWidths.company + workColWidths.salary + workColWidths.grade + workColWidths.status + 1, yPosition + 6);

      yPosition += rowHeight;
    });
  }

  yPosition += 3;

  // ============================================================================
  // VI. VOLUNTARY WORK
  // ============================================================================
  checkPageBreak(50);

  drawBox(margin, yPosition, contentWidth, 7);
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPosition, contentWidth, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('VI. VOLUNTARY WORK OR INVOLVEMENT IN CIVIC / NON-GOVERNMENT / PEOPLE / VOLUNTARY ORGANIZATION/S', margin + 2, yPosition + 5);
  yPosition += 7;

  // Voluntary Work table header
  const volColWidths = {
    org: contentWidth * 0.40,
    period: contentWidth * 0.20,
    hours: contentWidth * 0.15,
    position: contentWidth * 0.25,
  };

  drawBox(margin, yPosition, volColWidths.org, 10);
  drawBox(margin + volColWidths.org, yPosition, volColWidths.period, 10);
  drawBox(margin + volColWidths.org + volColWidths.period, yPosition, volColWidths.hours, 10);
  drawBox(margin + volColWidths.org + volColWidths.period + volColWidths.hours, yPosition, volColWidths.position, 10);

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, contentWidth, 10, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('45. NAME & ADDRESS OF', margin + 1, yPosition + 4);
  doc.text('ORGANIZATION', margin + 1, yPosition + 7);

  doc.text('46. INCLUSIVE DATES', margin + volColWidths.org + 1, yPosition + 4);
  doc.text('(mm/dd/yyyy)', margin + volColWidths.org + 1, yPosition + 7);

  doc.text('47. NUMBER OF', margin + volColWidths.org + volColWidths.period + 1, yPosition + 4);
  doc.text('HOURS', margin + volColWidths.org + volColWidths.period + 1, yPosition + 7);

  doc.text('48. POSITION / NATURE', margin + volColWidths.org + volColWidths.period + volColWidths.hours + 1, yPosition + 4);
  doc.text('OF WORK', margin + volColWidths.org + volColWidths.period + volColWidths.hours + 1, yPosition + 7);

  yPosition += 10;

  if (pdsData.voluntaryWork && pdsData.voluntaryWork.length > 0) {
    pdsData.voluntaryWork.forEach((vol) => {
      // Calculate required height for each column BEFORE drawing
      const orgAddress = [vol.organizationName, vol.organizationAddress].filter(Boolean).join(', ');
      doc.setFontSize(7); // Ensure 7pt font for accurate organization text splitting
      const orgLines = doc.splitTextToSize(orgAddress || 'N/A', volColWidths.org - 2);

      // For position, temporarily set font size 6 to calculate accurate split
      doc.setFontSize(6);
      const posLines = doc.splitTextToSize(vol.positionNatureOfWork || 'N/A', volColWidths.position - 2);
      doc.setFontSize(7); // Restore for other calculations

      // Find maximum lines among all columns
      const maxLines = Math.max(orgLines.length, posLines.length, 2); // Minimum 2 lines

      // Calculate dynamic row height
      const lineHeight = 3.5; // mm per line (increased for 7pt font with descenders)
      const paddingTop = 4; // mm - initial text offset
      const paddingBottom = 4; // mm - bottom padding (increased to prevent text overlap with border)
      const rowHeight = paddingTop + (maxLines * lineHeight) + paddingBottom;

      checkPageBreak(rowHeight);

      // Draw boxes with dynamic height
      drawBox(margin, yPosition, volColWidths.org, rowHeight);
      drawBox(margin + volColWidths.org, yPosition, volColWidths.period, rowHeight);
      drawBox(margin + volColWidths.org + volColWidths.period, yPosition, volColWidths.hours, rowHeight);
      drawBox(margin + volColWidths.org + volColWidths.period + volColWidths.hours, yPosition, volColWidths.position, rowHeight);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');

      // Organization - already split above
      orgLines.forEach((line: string, index: number) => {
        doc.text(line, margin + 1, yPosition + 4 + index * lineHeight);
      });

      // Period
      const period = vol.periodOfInvolvement
        ? `${formatDateOnly(vol.periodOfInvolvement.from) || ''} to ${formatDateOnly(vol.periodOfInvolvement.to) || ''}`
        : 'N/A';
      doc.text(period, margin + volColWidths.org + 1, yPosition + 6);

      // Hours
      doc.text(vol.numberOfHours?.toString() || 'N/A', margin + volColWidths.org + volColWidths.period + 1, yPosition + 6);

      // Position - Use font size 6 for better fit and readability
      doc.setFontSize(6);
      // Already split above - posLines
      posLines.forEach((line: string, index: number) => {
        doc.text(line, margin + volColWidths.org + volColWidths.period + volColWidths.hours + 1, yPosition + 4 + index * 3);
      });
      doc.setFontSize(7); // Restore to 7 for consistency

      yPosition += rowHeight;
    });
  }

  yPosition += 3;

  // ============================================================================
  // VII. LEARNING AND DEVELOPMENT (L&D) INTERVENTIONS/TRAINING PROGRAMS ATTENDED
  // ============================================================================
  checkPageBreak(50);

  drawBox(margin, yPosition, contentWidth, 7);
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPosition, contentWidth, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('VII. LEARNING AND DEVELOPMENT (L&D) INTERVENTIONS/TRAINING PROGRAMS ATTENDED', margin + 2, yPosition + 5);
  yPosition += 7;

  // Training table header
  const trainColWidths = {
    title: contentWidth * 0.30,
    period: contentWidth * 0.15,
    hours: contentWidth * 0.12,
    type: contentWidth * 0.18,
    sponsor: contentWidth * 0.25,
  };

  drawBox(margin, yPosition, trainColWidths.title, 10);
  drawBox(margin + trainColWidths.title, yPosition, trainColWidths.period, 10);
  drawBox(margin + trainColWidths.title + trainColWidths.period, yPosition, trainColWidths.hours, 10);
  drawBox(margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours, yPosition, trainColWidths.type, 10);
  drawBox(margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours + trainColWidths.type, yPosition, trainColWidths.sponsor, 10);

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, contentWidth, 10, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('49. TITLE OF LEARNING', margin + 1, yPosition + 4);
  doc.text('AND DEVELOPMENT', margin + 1, yPosition + 7);

  doc.text('50. INCLUSIVE DATES', margin + trainColWidths.title + 1, yPosition + 4);
  doc.text('(mm/dd/yyyy)', margin + trainColWidths.title + 1, yPosition + 7);

  doc.text('51. NUMBER', margin + trainColWidths.title + trainColWidths.period + 1, yPosition + 4);
  doc.text('OF HOURS', margin + trainColWidths.title + trainColWidths.period + 1, yPosition + 7);

  doc.text('52. TYPE OF LD', margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours + 1, yPosition + 4);
  doc.text('(Managerial/', margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours + 1, yPosition + 7);
  doc.text('Supervisory/Technical/etc)', margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours + 1, yPosition + 9.5);

  doc.text('53. CONDUCTED/', margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours + trainColWidths.type + 1, yPosition + 4);
  doc.text('SPONSORED BY', margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours + trainColWidths.type + 1, yPosition + 7);

  yPosition += 10;

  if (pdsData.trainings && pdsData.trainings.length > 0) {
    pdsData.trainings.forEach((training) => {
      // Calculate required height for each column BEFORE drawing
      const titleLines = doc.splitTextToSize(training.title || 'N/A', trainColWidths.title - 2);

      // For sponsor, temporarily set font size 6 to calculate accurate split
      doc.setFontSize(6);
      const sponsorLines = doc.splitTextToSize(training.conductedSponsoredBy || 'N/A', trainColWidths.sponsor - 2);
      doc.setFontSize(7); // Restore for other calculations

      // Find maximum lines among all columns
      const maxLines = Math.max(titleLines.length, sponsorLines.length, 2); // Minimum 2 lines

      // Calculate dynamic row height
      const lineHeight = 3; // mm per line
      const paddingTop = 4; // mm - initial text offset
      const paddingBottom = 2; // mm - bottom padding
      const rowHeight = paddingTop + (maxLines * lineHeight) + paddingBottom;

      checkPageBreak(rowHeight);

      drawBox(margin, yPosition, trainColWidths.title, rowHeight);
      drawBox(margin + trainColWidths.title, yPosition, trainColWidths.period, rowHeight);
      drawBox(margin + trainColWidths.title + trainColWidths.period, yPosition, trainColWidths.hours, rowHeight);
      drawBox(margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours, yPosition, trainColWidths.type, rowHeight);
      drawBox(margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours + trainColWidths.type, yPosition, trainColWidths.sponsor, rowHeight);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');

      // Title - already split above
      titleLines.forEach((line: string, index: number) => {
        doc.text(line, margin + 1, yPosition + 4 + index * lineHeight);
      });

      // Period
      const period = training.periodOfAttendance
        ? `${formatDateOnly(training.periodOfAttendance.from) || ''} to ${formatDateOnly(training.periodOfAttendance.to) || ''}`
        : 'N/A';
      doc.text(period, margin + trainColWidths.title + 1, yPosition + 6);

      // Hours
      doc.text(training.numberOfHours?.toString() || 'N/A', margin + trainColWidths.title + trainColWidths.period + 1, yPosition + 6);

      // Type
      doc.text(training.typeOfLD || 'N/A', margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours + 1, yPosition + 6);

      // Sponsor - Use font size 6 for better fit and readability
      doc.setFontSize(6);
      // Already split above - sponsorLines
      sponsorLines.forEach((line: string, index: number) => {
        doc.text(line, margin + trainColWidths.title + trainColWidths.period + trainColWidths.hours + trainColWidths.type + 1, yPosition + 4 + index * lineHeight);
      });
      doc.setFontSize(7); // Restore to 7 for consistency

      yPosition += rowHeight;
    });
  }

  yPosition += 3;

  // ============================================================================
  // VIII. OTHER INFORMATION
  // ============================================================================
  checkPageBreak(100);

  drawBox(margin, yPosition, contentWidth, 7);
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPosition, contentWidth, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('VIII. OTHER INFORMATION', margin + 2, yPosition + 5);
  yPosition += 7;

  if (pdsData.otherInformation) {
    const oi = pdsData.otherInformation;

    // Special Skills/Hobbies - Dynamic row height
    if (oi.skills && oi.skills.length > 0) {
      const labelText = '54. SPECIAL SKILLS AND HOBBIES';
      const valueText = oi.skills.join(', ');
      const labelWidth = 50;
      const valueWidth = contentWidth - 50;

      // Pre-calculate text split for value
      doc.setFontSize(7);
      const valueLines = doc.splitTextToSize(valueText, valueWidth - 2);

      // Calculate dynamic height
      const maxLines = Math.max(valueLines.length, 2); // Minimum 2 lines
      const lineHeight = 3; // mm per line
      const paddingTop = 4; // mm
      const paddingBottom = 2; // mm
      const rowHeight = paddingTop + (maxLines * lineHeight) + paddingBottom;

      // Check page break
      checkPageBreak(rowHeight);

      // Draw label box
      drawBox(margin, yPosition, labelWidth, rowHeight);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, labelWidth, rowHeight, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(labelText, margin + 1, yPosition + 4);

      // Draw value box
      drawBox(margin + labelWidth, yPosition, valueWidth, rowHeight);
      doc.setFont('helvetica', 'normal');

      // Render text lines
      valueLines.forEach((line: string, index: number) => {
        doc.text(line, margin + labelWidth + 1, yPosition + 4 + index * lineHeight);
      });

      yPosition += rowHeight;
    }

    // Recognitions - Dynamic row height
    if (oi.recognitions && oi.recognitions.length > 0) {
      const labelText = '55. NON-ACADEMIC DISTINCTIONS / RECOGNITION';
      const valueText = oi.recognitions.join(', ');
      const labelWidth = 50;
      const valueWidth = contentWidth - 50;

      // Pre-calculate text split for value
      doc.setFontSize(7);
      const valueLines = doc.splitTextToSize(valueText, valueWidth - 2);

      // Calculate dynamic height
      const maxLines = Math.max(valueLines.length, 2); // Minimum 2 lines
      const lineHeight = 3; // mm per line
      const paddingTop = 4; // mm
      const paddingBottom = 2; // mm
      const rowHeight = paddingTop + (maxLines * lineHeight) + paddingBottom;

      // Check page break
      checkPageBreak(rowHeight);

      // Draw label box
      drawBox(margin, yPosition, labelWidth, rowHeight);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, labelWidth, rowHeight, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(labelText, margin + 1, yPosition + 4);

      // Draw value box
      drawBox(margin + labelWidth, yPosition, valueWidth, rowHeight);
      doc.setFont('helvetica', 'normal');

      // Render text lines
      valueLines.forEach((line: string, index: number) => {
        doc.text(line, margin + labelWidth + 1, yPosition + 4 + index * lineHeight);
      });

      yPosition += rowHeight;
    }

    // Memberships - Dynamic row height
    if (oi.memberships && oi.memberships.length > 0) {
      const labelText = '56. MEMBERSHIP IN ASSOCIATION/ORGANIZATION';
      const valueText = oi.memberships.join(', ');
      const labelWidth = 50;
      const valueWidth = contentWidth - 50;

      // Pre-calculate text split for value
      doc.setFontSize(7);
      const valueLines = doc.splitTextToSize(valueText, valueWidth - 2);

      // Calculate dynamic height
      const maxLines = Math.max(valueLines.length, 2); // Minimum 2 lines
      const lineHeight = 3; // mm per line
      const paddingTop = 4; // mm
      const paddingBottom = 2; // mm
      const rowHeight = paddingTop + (maxLines * lineHeight) + paddingBottom;

      // Check page break
      checkPageBreak(rowHeight);

      // Draw label box
      drawBox(margin, yPosition, labelWidth, rowHeight);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, labelWidth, rowHeight, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(labelText, margin + 1, yPosition + 4);

      // Draw value box
      drawBox(margin + labelWidth, yPosition, valueWidth, rowHeight);
      doc.setFont('helvetica', 'normal');

      // Render text lines
      valueLines.forEach((line: string, index: number) => {
        doc.text(line, margin + labelWidth + 1, yPosition + 4 + index * lineHeight);
      });

      yPosition += rowHeight;
    }

    // Questions 34-40 (Critical compliance questions)
    checkPageBreak(80);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('ANSWER THE FOLLOWING QUESTIONS:', margin, yPosition);
    yPosition += 5;

    const questions = [
      { num: '34', q: 'Are you related by consanguinity or affinity to the appointing or recommending authority, or to the chief of bureau or office or to the person who has immediate supervision over you in the Office, Bureau or Department where you will be appointed?', answer: oi.question34?.answer || 'N/A', details: oi.question34?.details },
      { num: '35', q: 'Have you ever been found guilty of any administrative offense?', answer: oi.question35a?.answer || 'N/A', details: oi.question35a?.details },
      { num: '36', q: 'Have you been criminally charged before any court?', answer: oi.question35b?.answer || 'N/A', details: oi.question35b?.details },
      { num: '37', q: 'Have you ever been convicted of any crime or violation of any law, decree, ordinance or regulation by any court or tribunal?', answer: oi.question36?.answer || 'N/A', details: oi.question36?.details },
      { num: '38', q: 'Have you ever been separated from the service in any of the following modes: resignation, retirement, dropped from the rolls, dismissal, termination, end of term, finished contract or phased out (abolition) in the public or private sector?', answer: oi.question37?.answer || 'N/A', details: oi.question37?.details },
      { num: '39', q: 'Have you ever been a candidate in a national or local election held within the last year (except Barangay election)?', answer: oi.question38a?.answer || 'N/A', details: oi.question38a?.details },
      { num: '40', q: 'Have you resigned from the government service during the three (3)-month period before the last election to promote/actively campaign for a national or local candidate?', answer: oi.question38b?.answer || 'N/A', details: oi.question38b?.details },
    ];

    questions.forEach((q) => {
      checkPageBreak(15);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(`${q.num}.`, margin, yPosition);

      const qLines = doc.splitTextToSize(q.q, contentWidth - 30);
      doc.setFont('helvetica', 'normal');
      qLines.forEach((line: string, index: number) => {
        doc.text(line, margin + 5, yPosition + index * 3);
      });

      yPosition += qLines.length * 3 + 2;

      doc.setFont('helvetica', 'bold');
      doc.text('Answer:', margin + 10, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(q.answer.toUpperCase(), margin + 25, yPosition);
      yPosition += 4;

      if (q.details) {
        doc.setFont('helvetica', 'italic');
        doc.text('Details:', margin + 10, yPosition);
        const detailLines = doc.splitTextToSize(q.details, contentWidth - 30);
        detailLines.forEach((line: string, index: number) => {
          doc.text(line, margin + 25, yPosition + index * 3);
        });
        yPosition += detailLines.length * 3 + 2;
      }

      yPosition += 3;
    });

    // References
    if (oi.references && oi.references.length > 0) {
      checkPageBreak(40);

      yPosition = drawLabelValueBox('57. REFERENCES (Person not related by consanguinity or affinity to applicant / appointee)', '', margin, yPosition, contentWidth, 0, 7);

      // References table header
      drawBox(margin, yPosition, contentWidth / 3, 6);
      drawBox(margin + contentWidth / 3, yPosition, contentWidth / 3, 6);
      drawBox(margin + 2 * contentWidth / 3, yPosition, contentWidth / 3, 6);

      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, contentWidth, 6, 'F');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('NAME', margin + 1, yPosition + 4);
      doc.text('ADDRESS', margin + contentWidth / 3 + 1, yPosition + 4);
      doc.text('TEL. NO.', margin + 2 * contentWidth / 3 + 1, yPosition + 4);
      yPosition += 6;

      oi.references.forEach((ref) => {
        checkPageBreak(8);

        drawBox(margin, yPosition, contentWidth / 3, 8);
        drawBox(margin + contentWidth / 3, yPosition, contentWidth / 3, 8);
        drawBox(margin + 2 * contentWidth / 3, yPosition, contentWidth / 3, 8);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(ref.name || '', margin + 1, yPosition + 5);
        doc.text(ref.address || '', margin + contentWidth / 3 + 1, yPosition + 5);
        doc.text(ref.telephoneNo || '', margin + 2 * contentWidth / 3 + 1, yPosition + 5);
        yPosition += 8;
      });
    }

    // Government Issued ID
    yPosition = drawLabelValueBox('58. GOVERNMENT ISSUED ID', oi.governmentIssuedId?.idType || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    ID/LICENSE/PASSPORT NO.', oi.governmentIssuedId?.idNo || 'N/A', margin, yPosition, 40, contentWidth - 40);
    yPosition = drawLabelValueBox('    DATE/PLACE OF ISSUANCE', oi.governmentIssuedId?.dateIssued ? formatDateOnly(oi.governmentIssuedId.dateIssued) : 'N/A', margin, yPosition, 40, contentWidth - 40);
  }

  yPosition += 3;

  // ============================================================================
  // IX. DECLARATION
  // ============================================================================
  checkPageBreak(60);

  drawBox(margin, yPosition, contentWidth, 7);
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPosition, contentWidth, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('IX. DECLARATION', margin + 2, yPosition + 5);
  yPosition += 7;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  const declarationText = 'I declare under oath that I have personally accomplished this Personal Data Sheet which is a true, correct and complete statement pursuant to the provisions of pertinent laws, rules and regulations of the Republic of the Philippines. I authorize the agency head/authorized representative to verify/validate the contents stated herein. I agree that any misrepresentation made in this document and its attachments shall cause the filing of administrative/criminal case/s against me.';
  const declLines = doc.splitTextToSize(declarationText, contentWidth - 4);
  declLines.forEach((line: string, index: number) => {
    doc.text(line, margin + 2, yPosition + index * 4);
  });
  yPosition += declLines.length * 4 + 5;

  // ============================================================================
  // Add page number to last page
  // ============================================================================
  addPageNumber();

  // ============================================================================
  // Signature section (if included)
  // ============================================================================
  if (includeSignature && pdsData.otherInformation?.declaration?.signatureData) {
    checkPageBreak(30);

    // Add signature box
    drawBox(margin, yPosition, contentWidth / 2, 25);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURE', margin + 1, yPosition + 5);

    try {
      // Try to add signature image
      const signatureData = pdsData.otherInformation.declaration.signatureData;
      if (signatureData.startsWith('data:image') || signatureData.startsWith('http')) {
        doc.addImage(signatureData, 'PNG', margin + 2, yPosition + 7, 40, 15);
      }
    } catch (error) {
      console.error('Error adding signature to PDF:', error);
    }

    yPosition += 25;
  }

  // Date accomplished
  const dateAccomplished = useCurrentDate
    ? new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    : pdsData.otherInformation?.declaration?.dateAccomplished || new Date().toISOString().split('T')[0];

  const formattedDate = formatDateOnly(dateAccomplished);
  yPosition = drawLabelValueBox('DATE', formattedDate, margin, yPosition, 30, contentWidth / 2 - 30);

  // ============================================================================
  // Download or return
  // ============================================================================
  if (returnDoc) {
    return doc;
  } else {
    const filename = `PDS_CSC_Format_${pdsData.personalInfo?.surname || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }
}
