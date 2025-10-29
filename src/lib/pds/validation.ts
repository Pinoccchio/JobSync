/**
 * Zod Validation Schemas for PDS Form
 * Based on CS Form No. 212, Revised 2025
 */

import { z } from 'zod';

// Section I: Personal Information Validation
export const personalInformationSchema = z.object({
  // Name
  surname: z.string().min(1, 'Surname is required'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().min(1, 'Middle name is required'),
  nameExtension: z.string().optional(),

  // Birth Information
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  placeOfBirth: z.string().min(1, 'Place of birth is required'),
  sexAtBirth: z.enum(['Male', 'Female'], {
    errorMap: () => ({ message: 'Sex at birth is required' }),
  }),

  // Civil Status
  civilStatus: z.enum(['Single', 'Married', 'Widowed', 'Separated', 'Annulled', 'Solo Parent', 'Others'], {
    errorMap: () => ({ message: 'Civil status is required' }),
  }),
  civilStatusOthers: z.string().optional(),

  // Physical Attributes
  height: z.number().positive('Height must be greater than 0').max(3, 'Please enter height in meters'),
  weight: z.number().positive('Weight must be greater than 0').max(500, 'Please enter a valid weight'),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),

  // Government IDs
  umidNo: z.string().optional(),
  pagibigNo: z.string().optional(),
  philhealthNo: z.string().optional(),
  philsysNo: z.string().optional(),
  tinNo: z.string().optional(),
  agencyEmployeeNo: z.string().optional(),

  // Citizenship
  citizenship: z.enum(['Filipino', 'Dual Citizenship']),
  dualCitizenshipType: z.enum(['by birth', 'by naturalization']).optional(),
  dualCitizenshipCountry: z.string().optional(),

  // Residential Address
  residentialAddress: z.object({
    houseBlockLotNo: z.string().optional(),
    street: z.string().optional(),
    subdivisionVillage: z.string().optional(),
    barangay: z.string().min(1, 'Barangay is required'),
    cityMunicipality: z.string().min(1, 'City/Municipality is required'),
    province: z.string().min(1, 'Province is required'),
    zipCode: z.string().min(4, 'ZIP Code is required'),
  }),

  // Permanent Address
  permanentAddress: z.object({
    sameAsResidential: z.boolean(),
    houseBlockLotNo: z.string().optional(),
    street: z.string().optional(),
    subdivisionVillage: z.string().optional(),
    barangay: z.string().optional(),
    cityMunicipality: z.string().optional(),
    province: z.string().optional(),
    zipCode: z.string().optional(),
  }),

  // Contact Information
  telephoneNo: z.string().optional(),
  mobileNo: z.string().min(1, 'Mobile number is required'),
  emailAddress: z.string().email('Invalid email address').min(1, 'Email address is required'),
});

// Section II: Family Background Validation
export const familyBackgroundSchema = z.object({
  spouse: z.object({
    surname: z.string().optional(),
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    nameExtension: z.string().optional(),
    occupation: z.string().optional(),
    employerBusinessName: z.string().optional(),
    businessAddress: z.string().optional(),
    telephoneNo: z.string().optional(),
  }).optional(),

  children: z.array(
    z.object({
      fullName: z.string().min(1, 'Child name is required'),
      dateOfBirth: z.string().min(1, 'Date of birth is required'),
    })
  ).default([]),

  father: z.object({
    surname: z.string().min(1, 'Father\'s surname is required'),
    firstName: z.string().min(1, 'Father\'s first name is required'),
    middleName: z.string().min(1, 'Father\'s middle name is required'),
    nameExtension: z.string().optional(),
  }),

  mother: z.object({
    surname: z.string().min(1, 'Mother\'s surname is required'),
    firstName: z.string().min(1, 'Mother\'s first name is required'),
    middleName: z.string().min(1, 'Mother\'s middle name is required'),
  }),
});

// Section III: Educational Background Validation
export const educationalBackgroundSchema = z.object({
  level: z.enum(['Elementary', 'Secondary', 'Vocational/Trade Course', 'College', 'Graduate Studies']),
  nameOfSchool: z.string().min(1, 'School name is required'),
  basicEducationDegreeCourse: z.string().min(1, 'Course/Degree is required'),
  periodOfAttendance: z.object({
    from: z.string().min(1, 'Start year is required'),
    to: z.string().min(1, 'End year is required'),
  }),
  highestLevelUnitsEarned: z.string().optional(),
  yearGraduated: z.string().optional(),
  scholarshipAcademicHonors: z.string().optional(),
});

// Section IV: Civil Service Eligibility Validation
export const eligibilitySchema = z.object({
  careerService: z.string().min(1, 'Career service/eligibility is required'),
  rating: z.string().optional(),
  dateOfExaminationConferment: z.string().min(1, 'Date of examination/conferment is required'),
  placeOfExaminationConferment: z.string().min(1, 'Place of examination/conferment is required'),
  licenseNumber: z.string().optional(),
  licenseValidity: z.string().optional(),
});

// Section V: Work Experience Validation
export const workExperienceSchema = z.object({
  positionTitle: z.string().min(1, 'Position title is required'),
  departmentAgencyOfficeCompany: z.string().min(1, 'Department/Agency/Company is required'),
  monthlySalary: z.number().optional(),
  salaryGrade: z.string().optional(),
  stepIncrement: z.string().optional(),
  statusOfAppointment: z.string().optional(),
  governmentService: z.boolean(),
  periodOfService: z.object({
    from: z.string().min(1, 'Start date is required'),
    to: z.string().min(1, 'End date is required'),
  }),
});

// Section VI: Voluntary Work Validation
export const voluntaryWorkSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationAddress: z.string().optional(),
  periodOfInvolvement: z.object({
    from: z.string().min(1, 'Start date is required'),
    to: z.string().min(1, 'End date is required'),
  }),
  numberOfHours: z.number().optional(),
  positionNatureOfWork: z.string().min(1, 'Position/Nature of work is required'),
});

// Section VII: Learning & Development Validation
export const trainingSchema = z.object({
  title: z.string().min(1, 'Training title is required'),
  periodOfAttendance: z.object({
    from: z.string().min(1, 'Start date is required'),
    to: z.string().min(1, 'End date is required'),
  }),
  numberOfHours: z.number().min(1, 'Number of hours is required'),
  typeOfLD: z.string().min(1, 'Type of L&D is required'),
  conductedSponsoredBy: z.string().min(1, 'Conducted/Sponsored By is required'),
});

// Section VIII: Other Information Validation
export const otherInformationSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  recognitions: z.array(z.string()).default([]),
  memberships: z.array(z.string()).default([]),
  references: z.array(
    z.object({
      name: z.string().min(1, 'Reference name is required'),
      address: z.string().min(1, 'Reference address is required'),
      telephoneNo: z.string().min(1, 'Reference telephone number is required'),
    })
  ).min(3, 'At least 3 references are required'),
  governmentIssuedId: z.object({
    type: z.string().optional(),
    idNumber: z.string().optional(),
    dateIssued: z.string().optional(),
  }).optional(),
  declaration: z.object({
    agreed: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the declaration',
    }),
    signatureData: z.string().optional(),
    dateAccomplished: z.string().min(1, 'Date accomplished is required'),
  }),
});

// Complete PDS Validation Schema
export const pdsDataSchema = z.object({
  personalInfo: personalInformationSchema,
  familyBackground: familyBackgroundSchema,
  educationalBackground: z.array(educationalBackgroundSchema).min(1, 'At least one educational background entry is required'),
  eligibility: z.array(eligibilitySchema).default([]),
  workExperience: z.array(workExperienceSchema).default([]),
  voluntaryWork: z.array(voluntaryWorkSchema).default([]),
  trainings: z.array(trainingSchema).default([]),
  otherInformation: otherInformationSchema,
});

// Type inference
export type PersonalInformationFormData = z.infer<typeof personalInformationSchema>;
export type FamilyBackgroundFormData = z.infer<typeof familyBackgroundSchema>;
export type EducationalBackgroundFormData = z.infer<typeof educationalBackgroundSchema>;
export type EligibilityFormData = z.infer<typeof eligibilitySchema>;
export type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;
export type VoluntaryWorkFormData = z.infer<typeof voluntaryWorkSchema>;
export type TrainingFormData = z.infer<typeof trainingSchema>;
export type OtherInformationFormData = z.infer<typeof otherInformationSchema>;
export type PDSDataFormData = z.infer<typeof pdsDataSchema>;
