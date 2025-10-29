import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDSData } from '@/types/pds.types';

/**
 * Generate a PDF document from PDS data
 * Based on CS Form No. 212, Revised 2025
 * @param pdsData - The PDS data to export
 * @param includeSignature - Whether to include the digital signature image (default: false)
 */
export function generatePDSPDF(pdsData: Partial<PDSData>, includeSignature: boolean = false): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 15;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > 280) {
      doc.addPage();
      yPosition = 15;
      return true;
    }
    return false;
  };

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PERSONAL DATA SHEET', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('(CS Form No. 212, Revised 2025)', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // I. PERSONAL INFORMATION
  if (pdsData.personalInfo) {
    const pi = pdsData.personalInfo;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('I. PERSONAL INFORMATION', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const personalInfoData = [
      ['Full Name:', `${pi.surname}, ${pi.firstName} ${pi.middleName || ''} ${pi.nameExtension || ''}`.trim()],
      ['Date of Birth:', pi.dateOfBirth || 'N/A'],
      ['Place of Birth:', pi.placeOfBirth || 'N/A'],
      ['Sex:', pi.sexAtBirth || 'N/A'],
      ['Civil Status:', pi.civilStatus === 'Others' && pi.civilStatusOthers ? `${pi.civilStatus} (${pi.civilStatusOthers})` : pi.civilStatus || 'N/A'],
      ['Height:', pi.height ? `${pi.height}m` : 'N/A'],
      ['Weight:', pi.weight ? `${pi.weight}kg` : 'N/A'],
      ['Blood Type:', pi.bloodType || 'N/A'],
      ['Citizenship:', pi.citizenship || 'N/A'],
      ...(pi.citizenship === 'Dual Citizenship' ? [
        ['Dual Citizenship Type:', pi.dualCitizenshipType || 'N/A'],
        ['Dual Citizenship Country:', pi.dualCitizenshipCountry || 'N/A'],
      ] : []),
      ['Mobile No.:', pi.mobileNo || 'N/A'],
      ['Telephone No.:', pi.telephoneNo || 'N/A'],
      ['Email:', pi.emailAddress || 'N/A'],
      [
        'Residential Address:',
        [
          pi.residentialAddress?.houseBlockLotNo,
          pi.residentialAddress?.street,
          pi.residentialAddress?.subdivisionVillage,
          pi.residentialAddress?.barangay,
          pi.residentialAddress?.cityMunicipality,
          pi.residentialAddress?.province,
          pi.residentialAddress?.zipCode,
        ].filter(Boolean).join(', ') || 'N/A'
      ],
      [
        'Permanent Address:',
        pi.permanentAddress?.sameAsResidential
          ? 'Same as Residential Address'
          : [
              pi.permanentAddress?.houseBlockLotNo,
              pi.permanentAddress?.street,
              pi.permanentAddress?.subdivisionVillage,
              pi.permanentAddress?.barangay,
              pi.permanentAddress?.cityMunicipality,
              pi.permanentAddress?.province,
              pi.permanentAddress?.zipCode,
            ].filter(Boolean).join(', ') || 'N/A'
      ],
      ['UMID No.:', pi.umidNo || 'N/A'],
      ['Pag-IBIG No.:', pi.pagibigNo || 'N/A'],
      ['PhilHealth No.:', pi.philhealthNo || 'N/A'],
      ['PhilSys No.:', pi.philsysNo || 'N/A'],
      ['TIN No.:', pi.tinNo || 'N/A'],
      ['Agency Employee No.:', pi.agencyEmployeeNo || 'N/A'],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: personalInfoData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 135 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;
  }

  // II. FAMILY BACKGROUND
  if (pdsData.familyBackground) {
    checkPageBreak(50);
    const fb = pdsData.familyBackground;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('II. FAMILY BACKGROUND', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Spouse Information (detailed)
    const spouseData = fb.spouse ? [
      ['Spouse Name:', `${fb.spouse.surname}, ${fb.spouse.firstName} ${fb.spouse.middleName || ''}`.trim()],
      ['Occupation:', fb.spouse.occupation || 'N/A'],
      ['Employer/Business Name:', fb.spouse.employerBusinessName || 'N/A'],
      ['Business Address:', fb.spouse.businessAddress || 'N/A'],
      ['Telephone No.:', fb.spouse.telephoneNo || 'N/A'],
    ] : [
      ['Spouse:', 'N/A'],
    ];

    autoTable(doc, {
      startY: yPosition,
      body: spouseData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 130 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;

    // Children Information (detailed table)
    if (fb.children && fb.children.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Children:', 14, yPosition);
      yPosition += 5;

      const childrenData = fb.children.map((child) => [
        `${child.surname}, ${child.firstName} ${child.middleName || ''}`.trim(),
        child.dateOfBirth || 'N/A',
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Full Name', 'Date of Birth']],
        body: childrenData,
        theme: 'striped',
        headStyles: { fillColor: [34, 165, 85], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 60 },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 5;
    } else {
      doc.setFontSize(9);
      doc.text('Children: None', 14, yPosition);
      yPosition += 5;
    }

    // Parents Information
    const parentsData = [
      ['Father:', fb.father ? `${fb.father.surname}, ${fb.father.firstName} ${fb.father.middleName || ''}`.trim() : 'N/A'],
      ['Mother:', fb.mother ? `${fb.mother.surname}, ${fb.mother.firstName} ${fb.mother.middleName || ''}`.trim() : 'N/A'],
    ];

    autoTable(doc, {
      startY: yPosition,
      body: parentsData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 130 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;
  }

  // III. EDUCATIONAL BACKGROUND
  if (pdsData.educationalBackground && pdsData.educationalBackground.length > 0) {
    checkPageBreak(60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('III. EDUCATIONAL BACKGROUND', 14, yPosition);
    yPosition += 7;

    const educationData = pdsData.educationalBackground.map((edu) => [
      edu.level || 'N/A',
      edu.nameOfSchool || 'N/A',
      edu.basicEducationDegreeCourse || 'N/A',
      `${edu.periodOfAttendance?.from || ''} - ${edu.periodOfAttendance?.to || ''}`,
      edu.yearGraduated || edu.highestLevelUnitsEarned || 'N/A',
      edu.scholarshipAcademicHonors || 'None',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Level', 'School', 'Course/Degree', 'Period', 'Year Grad/Units', 'Honors/Scholarship']],
      body: educationData,
      theme: 'striped',
      headStyles: { fillColor: [34, 165, 85], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 35 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;
  }

  // IV. CIVIL SERVICE ELIGIBILITY
  if (pdsData.eligibility && pdsData.eligibility.length > 0) {
    checkPageBreak(60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('IV. CIVIL SERVICE ELIGIBILITY', 14, yPosition);
    yPosition += 7;

    const eligibilityData = pdsData.eligibility.map((elig) => [
      elig.careerService || 'N/A',
      elig.rating?.toString() || 'N/A',
      elig.dateOfExaminationConferment || 'N/A',
      elig.placeOfExaminationConferment || 'N/A',
      elig.licenseNumber || 'N/A',
      elig.licenseValidity || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Career Service', 'Rating', 'Date of Exam', 'Place', 'License No.', 'Validity']],
      body: eligibilityData,
      theme: 'striped',
      headStyles: { fillColor: [34, 165, 85], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 18 },
        2: { cellWidth: 28 },
        3: { cellWidth: 40 },
        4: { cellWidth: 25 },
        5: { cellWidth: 24 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;
  }

  // V. WORK EXPERIENCE
  if (pdsData.workExperience && pdsData.workExperience.length > 0) {
    checkPageBreak(60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('V. WORK EXPERIENCE', 14, yPosition);
    yPosition += 7;

    const workData = pdsData.workExperience.map((work) => [
      work.positionTitle || 'N/A',
      work.departmentAgencyOfficeCompany || 'N/A',
      `${work.periodOfService?.from || ''} - ${work.periodOfService?.to || ''}`,
      work.monthlySalary || 'N/A',
      work.salaryGrade || 'N/A',
      work.statusOfAppointment || 'N/A',
      work.governmentService ? 'Yes' : 'No',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Position', 'Company/Agency', 'Period', 'Salary', 'SG', 'Status', 'Gov\'t']],
      body: workData,
      theme: 'striped',
      headStyles: { fillColor: [34, 165, 85], fontSize: 6.5 },
      styles: { fontSize: 6.5, cellPadding: 1.5 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20 },
        4: { cellWidth: 12 },
        5: { cellWidth: 25 },
        6: { cellWidth: 13 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;
  }

  // VI. VOLUNTARY WORK
  if (pdsData.voluntaryWork && pdsData.voluntaryWork.length > 0) {
    checkPageBreak(60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('VI. VOLUNTARY WORK', 14, yPosition);
    yPosition += 7;

    const voluntaryData = pdsData.voluntaryWork.map((vol) => [
      vol.organizationName || 'N/A',
      vol.organizationAddress || 'N/A',
      vol.positionNatureOfWork || 'N/A',
      `${vol.periodOfInvolvement?.from || ''} - ${vol.periodOfInvolvement?.to || ''}`,
      vol.numberOfHours ? `${vol.numberOfHours}h` : 'N/A',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Organization', 'Address', 'Position', 'Period', 'Hours']],
      body: voluntaryData,
      theme: 'striped',
      headStyles: { fillColor: [34, 165, 85], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 45 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 15 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;
  }

  // VII. LEARNING & DEVELOPMENT
  if (pdsData.trainings && pdsData.trainings.length > 0) {
    checkPageBreak(60);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('VII. LEARNING & DEVELOPMENT', 14, yPosition);
    yPosition += 7;

    const trainingData = pdsData.trainings.map((training) => [
      training.title || 'N/A',
      training.conductedSponsoredBy || 'N/A',
      `${training.periodOfAttendance?.from || ''} - ${training.periodOfAttendance?.to || ''}`,
      `${training.numberOfHours || 0}h`,
      training.typeOfLD || 'N/A',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Training Title', 'Conducted By', 'Period', 'Hours', 'Type of L&D']],
      body: trainingData,
      theme: 'striped',
      headStyles: { fillColor: [34, 165, 85], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 15 },
        4: { cellWidth: 35 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;
  }

  // VIII. OTHER INFORMATION
  if (pdsData.otherInformation) {
    checkPageBreak(50);
    const oi = pdsData.otherInformation;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('VIII. OTHER INFORMATION', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const otherInfoData = [
      ['Skills:', oi.skills && oi.skills.length > 0 ? oi.skills.join(', ') : 'None'],
      ['Recognitions:', oi.recognitions && oi.recognitions.length > 0 ? oi.recognitions.join(', ') : 'None'],
      ['Memberships:', oi.memberships && oi.memberships.length > 0 ? oi.memberships.join(', ') : 'None'],
    ];

    autoTable(doc, {
      startY: yPosition,
      body: otherInfoData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 135 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;

    // Government Issued ID
    if (oi.governmentIssuedId && oi.governmentIssuedId.type) {
      checkPageBreak(20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Government Issued ID:', 14, yPosition);
      yPosition += 5;

      const govIdData = [
        ['Type:', oi.governmentIssuedId.type || 'N/A'],
        ['ID Number:', oi.governmentIssuedId.idNumber || 'N/A'],
        ['Date Issued:', oi.governmentIssuedId.dateIssued || 'N/A'],
      ];

      autoTable(doc, {
        startY: yPosition,
        body: govIdData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1.5 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45 },
          1: { cellWidth: 135 },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 5;
    }

    // References (detailed table)
    if (oi.references && oi.references.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('References:', 14, yPosition);
      yPosition += 5;

      const referencesData = oi.references.map((ref) => [
        ref.name || 'N/A',
        ref.address || 'N/A',
        ref.telephoneNo || 'N/A',
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Full Name', 'Address', 'Telephone No.']],
        body: referencesData,
        theme: 'striped',
        headStyles: { fillColor: [34, 165, 85], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 80 },
          2: { cellWidth: 40 },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 5;
    } else {
      doc.setFontSize(9);
      doc.text('References: None', 14, yPosition);
      yPosition += 5;
    }

    yPosition += 3;
  }

  // DECLARATION
  checkPageBreak(40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARATION', 14, yPosition);
  yPosition += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const declarationText = 'I declare under oath that this Personal Data Sheet has been accomplished by me, and is a true, correct and complete statement pursuant to the provisions of pertinent laws, rules and regulations of the Republic of the Philippines.';
  const splitText = doc.splitTextToSize(declarationText, pageWidth - 28);
  doc.text(splitText, 14, yPosition);
  yPosition += splitText.length * 4 + 10;

  // Signature
  if (pdsData.otherInformation?.declaration?.dateAccomplished) {
    doc.setFontSize(9);

    // Define consistent layout positions for perfect alignment
    const signatureStartY = yPosition;
    const underlineY = signatureStartY;        // Y position for underlines
    const labelY = signatureStartY + 5;        // Y position for labels (consistent for both sides)

    // Left side - Signature
    if (includeSignature && pdsData.otherInformation.declaration.signatureData) {
      try {
        // Position signature image above where the underline would be
        const imageY = signatureStartY - 10;
        const imageWidth = 50;
        const imageHeight = 12;

        // Embed the actual signature image
        doc.addImage(
          pdsData.otherInformation.declaration.signatureData,
          'PNG',
          14,
          imageY,
          imageWidth,
          imageHeight
        );

        // Draw a subtle line under the signature image for consistency
        doc.setLineWidth(0.3);
        doc.line(14, underlineY, 14 + imageWidth, underlineY);

      } catch (error) {
        console.error('Failed to embed signature image:', error);
        // Fallback to empty line if image embedding fails
        doc.text('______________________________', 14, underlineY);
      }
    } else {
      // No signature or includeSignature is false - show empty line for wet signature
      doc.text('______________________________', 14, underlineY);
    }

    // Signature label - ALWAYS at consistent position
    doc.text('Signature', 14, labelY);

    // Right side - Date (ALWAYS same structure for consistency)
    doc.text('______________________________', pageWidth - 70, underlineY);
    doc.text(`Date: ${pdsData.otherInformation.declaration.dateAccomplished}`, pageWidth - 70, labelY);

    // Move position down after signature section
    yPosition = labelY + 5;
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${totalPages} | Generated by JobSync`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );
  }

  // Generate filename
  const surname = pdsData.personalInfo?.surname || 'Unknown';
  const firstName = pdsData.personalInfo?.firstName || 'User';
  const fileName = `PDS_${surname}_${firstName}_${new Date().getTime()}.pdf`;

  // Save the PDF
  doc.save(fileName);
}
