'use client';
import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { formatAddress, formatPermanentAddress } from '@/lib/utils/formatAddress';
import { ensureArray, ensureString } from '@/lib/utils/dataTransformers';
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download
} from 'lucide-react';

interface PDSViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdsData: any;
  applicantName: string;
}

export function PDSViewModal({ isOpen, onClose, pdsData, applicantName }: PDSViewModalProps) {
  if (!pdsData) return null;

  const personalInfo = pdsData.personal_info || {};
  let familyBackground = pdsData.family_background || {};
  const educationalBackground = ensureArray(pdsData.educational_background);
  const workExperience = ensureArray(pdsData.work_experience);
  const eligibility = ensureArray(pdsData.eligibility);
  const trainings = ensureArray(pdsData.trainings);
  const voluntaryWork = ensureArray(pdsData.voluntary_work);
  let otherInformation = pdsData.other_information || {};

  const handleDownloadPDF = () => {
    if (pdsData.id) {
      window.open(`/api/pds/${pdsData.id}/download`, '_blank');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Personal Data Sheet (CS Form 212)"
      showFooter={false}
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Applicant Name Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{applicantName}</h2>
              <p className="text-sm text-gray-600">Civil Service Form 212 - Revised 2025</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleDownloadPDF}
            title="Download PDS as PDF"
          >
            Download PDF
          </Button>
        </div>

        {/* Personal Information */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
            {/* Name Fields */}
            <InfoRow label="Surname" value={personalInfo.surname} />
            <InfoRow label="First Name" value={personalInfo.firstName} />
            <InfoRow label="Middle Name" value={personalInfo.middleName} />
            <InfoRow label="Name Extension" value={personalInfo.nameExtension} />

            {/* Birth Information */}
            <InfoRow label="Date of Birth" value={personalInfo.dateOfBirth} icon={<Calendar className="w-4 h-4 text-gray-400" />} />
            <InfoRow label="Place of Birth" value={personalInfo.placeOfBirth} icon={<MapPin className="w-4 h-4 text-gray-400" />} />
            <InfoRow label="Sex at Birth" value={personalInfo.sexAtBirth} />

            {/* Civil Status */}
            <InfoRow label="Civil Status" value={personalInfo.civilStatus} />
            {personalInfo.civilStatusOthers && (
              <InfoRow label="Civil Status Details" value={personalInfo.civilStatusOthers} />
            )}

            {/* Physical Attributes */}
            <InfoRow label="Height (m)" value={personalInfo.height} />
            <InfoRow label="Weight (kg)" value={personalInfo.weight} />
            <InfoRow label="Blood Type" value={personalInfo.bloodType} />

            {/* Government IDs */}
            <InfoRow label="UMID No." value={personalInfo.umidNo} />
            <InfoRow label="Pag-IBIG No." value={personalInfo.pagibigNo} />
            <InfoRow label="PhilHealth No." value={personalInfo.philhealthNo} />
            <InfoRow label="PhilSys No." value={personalInfo.philsysNo} />
            <InfoRow label="TIN No." value={personalInfo.tinNo} />
            <InfoRow label="Agency Employee No." value={personalInfo.agencyEmployeeNo} />

            {/* Citizenship */}
            <InfoRow label="Citizenship" value={personalInfo.citizenship} />
            {personalInfo.citizenship === 'Dual Citizenship' && (
              <>
                <InfoRow label="Dual Citizenship Type" value={personalInfo.dualCitizenshipType} />
                <InfoRow label="Dual Citizenship Country" value={personalInfo.dualCitizenshipCountry} />
              </>
            )}

            {/* Contact Information */}
            <InfoRow label="Telephone No." value={personalInfo.telephoneNo} icon={<Phone className="w-4 h-4 text-gray-400" />} />
            <InfoRow label="Mobile Number" value={personalInfo.mobileNumber || personalInfo.mobileNo} icon={<Phone className="w-4 h-4 text-gray-400" />} />
            <InfoRow label="Email" value={personalInfo.email || personalInfo.emailAddress} icon={<Mail className="w-4 h-4 text-gray-400" />} />

            {/* Addresses */}
            <InfoRow label="Residential Address" value={formatAddress(personalInfo.residentialAddress)} className="col-span-2" />
            <InfoRow label="Permanent Address" value={formatPermanentAddress(personalInfo.permanentAddress, personalInfo.residentialAddress)} className="col-span-2" />
          </div>
        </section>

        {/* Family Background */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Family Background</h3>
          </div>
          <div className="space-y-4">
            {/* Spouse Information */}
            {familyBackground.spouse && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm font-semibold text-gray-700 mb-3">Spouse Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Surname" value={familyBackground.spouse.surname} />
                  <InfoRow label="First Name" value={familyBackground.spouse.firstName} />
                  <InfoRow label="Middle Name" value={familyBackground.spouse.middleName} />
                  <InfoRow label="Name Extension" value={familyBackground.spouse.nameExtension} />
                  <InfoRow label="Occupation" value={familyBackground.spouse.occupation} className="col-span-2" />
                  <InfoRow label="Employer/Business" value={familyBackground.spouse.employerBusinessName} className="col-span-2" />
                  <InfoRow label="Business Address" value={familyBackground.spouse.businessAddress} className="col-span-2" />
                  <InfoRow label="Telephone No." value={familyBackground.spouse.telephoneNo} icon={<Phone className="w-4 h-4 text-gray-400" />} />
                </div>
              </div>
            )}

            {/* Children */}
            {ensureArray(familyBackground.children).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm font-semibold text-gray-700 mb-3">Children</p>
                <div className="space-y-2">
                  {ensureArray(familyBackground.children).map((child: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-sm font-medium text-gray-900">{child.fullName || 'N/A'}</span>
                      <span className="text-sm text-gray-600">{child.dateOfBirth || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Father Information */}
            {familyBackground.father && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm font-semibold text-gray-700 mb-3">Father Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Surname" value={familyBackground.father.surname} />
                  <InfoRow label="First Name" value={familyBackground.father.firstName} />
                  <InfoRow label="Middle Name" value={familyBackground.father.middleName} />
                  <InfoRow label="Name Extension" value={familyBackground.father.nameExtension} />
                </div>
              </div>
            )}

            {/* Mother Information */}
            {familyBackground.mother && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm font-semibold text-gray-700 mb-3">Mother's Maiden Name</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Surname" value={familyBackground.mother.surname} />
                  <InfoRow label="First Name" value={familyBackground.mother.firstName} />
                  <InfoRow label="Middle Name" value={familyBackground.mother.middleName} />
                </div>
              </div>
            )}

            {!familyBackground.spouse && !familyBackground.father && !familyBackground.mother && (
              <p className="text-gray-500 text-sm">No family background provided</p>
            )}
          </div>
        </section>

        {/* Educational Background */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Educational Background</h3>
          </div>
          {educationalBackground.length > 0 ? (
            <div className="space-y-3">
              {educationalBackground.map((edu: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{edu.level || 'N/A'}</p>
                      <p className="text-sm text-gray-700">{edu.nameOfSchool || edu.schoolName || 'N/A'}</p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {edu.periodOfAttendance?.from || edu.periodFrom} - {edu.periodOfAttendance?.to || edu.periodTo}
                    </span>
                  </div>
                  {(edu.basicEducationDegreeCourse || edu.basicEducation || edu.degreeEarned || edu.basicEdDegreeCourse) && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Course/Degree:</span> {edu.basicEducationDegreeCourse || edu.basicEducation || edu.degreeEarned || edu.basicEdDegreeCourse}
                    </p>
                  )}
                  {(edu.highestLevelUnitsEarned || edu.unitsEarned) && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Highest Level/Units Earned:</span> {edu.highestLevelUnitsEarned || edu.unitsEarned}
                    </p>
                  )}
                  {edu.yearGraduated && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Year Graduated:</span> {edu.yearGraduated}
                    </p>
                  )}
                  {edu.scholarshipAcademicHonors && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Scholarship/Academic Honors:</span> {edu.scholarshipAcademicHonors}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No educational background provided</p>
          )}
        </section>

        {/* Work Experience */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
          </div>
          {workExperience.length > 0 ? (
            <div className="space-y-3">
              {workExperience.map((work: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{work.positionTitle || 'N/A'}</p>
                      <p className="text-sm text-gray-700">{work.departmentAgencyOfficeCompany || work.department || work.company || work.companyName || 'N/A'}</p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {work.periodOfService?.from || work.fromDate || work.periodFrom} - {work.periodOfService?.to || work.toDate || work.periodTo || 'Present'}
                    </span>
                  </div>
                  {work.monthlySalary && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Monthly Salary:</span> ₱{parseFloat(work.monthlySalary).toLocaleString()}
                    </p>
                  )}
                  {work.salaryGrade && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Salary Grade:</span> {work.salaryGrade}
                    </p>
                  )}
                  {(work.statusOfAppointment || work.appointmentStatus) && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status of Appointment:</span> {work.statusOfAppointment || work.appointmentStatus}
                    </p>
                  )}
                  {(work.governmentService !== undefined || work.govtService !== undefined) && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Government Service:</span> {(work.governmentService || work.govtService) ? 'Yes' : 'No'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No work experience provided</p>
          )}
        </section>

        {/* Voluntary Work */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">Voluntary Work & Civic Involvement</h3>
          </div>
          {voluntaryWork.length > 0 ? (
            <div className="space-y-3">
              {voluntaryWork.map((work: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-pink-500">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{work.organizationName || 'N/A'}</p>
                      <p className="text-sm text-gray-700 mb-2">{work.organizationAddress || 'N/A'}</p>
                    </div>
                    <span className="text-sm text-gray-600 ml-4 whitespace-nowrap">
                      {work.periodOfInvolvement?.from || work.fromDate} - {work.periodOfInvolvement?.to || work.toDate || 'Present'}
                    </span>
                  </div>
                  {work.positionNatureOfWork && (
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Position/Nature of Work:</span> {work.positionNatureOfWork}
                    </p>
                  )}
                  {work.numberOfHours && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Hours:</span> {work.numberOfHours} hours
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No voluntary work records provided</p>
          )}
        </section>

        {/* Eligibilities */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Civil Service Eligibility</h3>
          </div>
          {eligibility.length > 0 ? (
            <div className="space-y-3">
              {eligibility.map((elig: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-yellow-500">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900">{elig.careerService || elig.eligibilityTitle || 'N/A'}</p>
                    <span className="text-sm text-gray-600">
                      {elig.dateOfExaminationConferment || elig.examDate}
                    </span>
                  </div>
                  {elig.rating && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Rating:</span> {elig.rating}%
                    </p>
                  )}
                  {(elig.placeOfExaminationConferment || elig.placeOfExam) && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Place of Examination/Conferment:</span> {elig.placeOfExaminationConferment || elig.placeOfExam}
                    </p>
                  )}
                  {elig.licenseNumber && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">License Number:</span> {elig.licenseNumber}
                    </p>
                  )}
                  {elig.licenseValidity && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">License Validity:</span> {elig.licenseValidity}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No eligibility records provided</p>
          )}
        </section>

        {/* Trainings */}
        {trainings.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Learning & Development</h3>
            </div>
            <div className="space-y-3">
              {trainings.map((training: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-teal-500">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900">{training.title || 'N/A'}</p>
                    <span className="text-sm text-gray-600">
                      {training.periodOfAttendance?.from || training.fromDate} - {training.periodOfAttendance?.to || training.toDate}
                    </span>
                  </div>
                  {training.numberOfHours && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Number of Hours:</span> {training.numberOfHours}
                    </p>
                  )}
                  {(training.typeOfLD || training.type) && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type of L&D:</span> {training.typeOfLD || training.type}
                    </p>
                  )}
                  {(training.conductedSponsoredBy || training.conductedBy) && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Conducted/Sponsored By:</span> {training.conductedSponsoredBy || training.conductedBy}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Other Information */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Other Information</h3>
          </div>
          <div className="space-y-4">
            {/* Skills & Hobbies */}
            {ensureArray(otherInformation.skills).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-sm font-semibold text-gray-700 mb-3">Special Skills & Hobbies</p>
                <div className="flex flex-wrap gap-2">
                  {ensureArray(otherInformation.skills).map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {ensureString(skill)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Academic Distinctions/Recognition */}
            {ensureArray(otherInformation.recognitions).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-sm font-semibold text-gray-700 mb-3">Non-Academic Distinctions/Recognition</p>
                <ul className="space-y-2">
                  {ensureArray(otherInformation.recognitions).map((recognition: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <Award className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{ensureString(recognition)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Memberships in Associations/Organizations */}
            {ensureArray(otherInformation.memberships).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-sm font-semibold text-gray-700 mb-3">Memberships in Associations/Organizations</p>
                <ul className="space-y-2">
                  {ensureArray(otherInformation.memberships).map((membership: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <User className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{ensureString(membership)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* References */}
            {ensureArray(otherInformation.references).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-sm font-semibold text-gray-700 mb-3">Character References</p>
                <div className="space-y-3">
                  {ensureArray(otherInformation.references).map((reference: any, index: number) => (
                    <div key={index} className="pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                      <p className="font-medium text-gray-900">{reference.name || 'N/A'}</p>
                      <p className="text-sm text-gray-700">{reference.address || 'N/A'}</p>
                      {reference.telephoneNo && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {reference.telephoneNo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Government Issued ID */}
            {otherInformation.governmentIssuedId && (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-sm font-semibold text-gray-700 mb-3">Government Issued ID</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="ID Type" value={otherInformation.governmentIssuedId.type} />
                  <InfoRow label="ID Number" value={otherInformation.governmentIssuedId.idNumber} />
                  <InfoRow label="Date Issued" value={otherInformation.governmentIssuedId.dateIssued} />
                </div>
              </div>
            )}

            {ensureArray(otherInformation.skills).length === 0 &&
             ensureArray(otherInformation.recognitions).length === 0 &&
             ensureArray(otherInformation.memberships).length === 0 &&
             ensureArray(otherInformation.references).length === 0 &&
             !otherInformation.governmentIssuedId && (
              <p className="text-gray-500 text-sm">No other information provided</p>
            )}
          </div>
        </section>

        {/* Questions */}
        {pdsData.questions && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Related within 3rd degree:</span> {pdsData.questions.relatedThirdDegree ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.relatedThirdDegree && pdsData.questions.relatedThirdDegreeDetails && (
                  <p className="text-sm text-gray-600 pl-4">Details: {pdsData.questions.relatedThirdDegreeDetails}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Related within 4th degree (LGU):</span> {pdsData.questions.relatedFourthDegree ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.relatedFourthDegree && pdsData.questions.relatedFourthDegreeDetails && (
                  <p className="text-sm text-gray-600 pl-4">Details: {pdsData.questions.relatedFourthDegreeDetails}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Guilty of administrative offense:</span> {pdsData.questions.guiltyAdministrativeOffense ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.guiltyAdministrativeOffense && pdsData.questions.guiltyAdministrativeOffenseDetails && (
                  <p className="text-sm text-gray-600 pl-4">Details: {pdsData.questions.guiltyAdministrativeOffenseDetails}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Criminally charged:</span> {pdsData.questions.criminallyCharged ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.criminallyCharged && (
                  <>
                    {pdsData.questions.criminallyChargedDetails && (
                      <p className="text-sm text-gray-600 pl-4">Details: {pdsData.questions.criminallyChargedDetails}</p>
                    )}
                    {pdsData.questions.criminallyChargedDateFiled && (
                      <p className="text-sm text-gray-600 pl-4">Date Filed: {pdsData.questions.criminallyChargedDateFiled}</p>
                    )}
                    {pdsData.questions.criminallyChargedStatus && (
                      <p className="text-sm text-gray-600 pl-4">Status: {pdsData.questions.criminallyChargedStatus}</p>
                    )}
                  </>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Convicted of any crime:</span> {pdsData.questions.convicted ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.convicted && pdsData.questions.convictedDetails && (
                  <p className="text-sm text-gray-600 pl-4">Details: {pdsData.questions.convictedDetails}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Separated from service:</span> {pdsData.questions.separatedFromService ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.separatedFromService && pdsData.questions.separatedFromServiceDetails && (
                  <p className="text-sm text-gray-600 pl-4">Details: {pdsData.questions.separatedFromServiceDetails}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Candidate in national/local election:</span> {pdsData.questions.candidateNationalLocal ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.candidateNationalLocal && pdsData.questions.candidateNationalLocalDetails && (
                  <p className="text-sm text-gray-600 pl-4">Details: {pdsData.questions.candidateNationalLocalDetails}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Resigned for candidacy:</span> {pdsData.questions.resignedForCandidacy ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.resignedForCandidacy && pdsData.questions.resignedForCandidacyDetails && (
                  <p className="text-sm text-gray-600 pl-4">Details: {pdsData.questions.resignedForCandidacyDetails}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Immigrant/permanent resident:</span> {pdsData.questions.immigrantOrPermanentResident ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.immigrantOrPermanentResident && pdsData.questions.immigrantOrPermanentResidentCountry && (
                  <p className="text-sm text-gray-600 pl-4">Country: {pdsData.questions.immigrantOrPermanentResidentCountry}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Member of indigenous group:</span> {pdsData.questions.indigenousGroupMember ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.indigenousGroupMember && pdsData.questions.indigenousGroupName && (
                  <p className="text-sm text-gray-600 pl-4">Group: {pdsData.questions.indigenousGroupName}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Person with disability (PWD):</span> {pdsData.questions.personWithDisability ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.personWithDisability && pdsData.questions.pwdIdNumber && (
                  <p className="text-sm text-gray-600 pl-4">ID Number: {pdsData.questions.pwdIdNumber}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Solo parent:</span> {pdsData.questions.soloParent ? 'Yes' : 'No'}
                </p>
                {pdsData.questions.soloParent && pdsData.questions.soloParentIdNumber && (
                  <p className="text-sm text-gray-600 pl-4">ID Number: {pdsData.questions.soloParentIdNumber}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Signature */}
        {pdsData.signature_url && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Signature & Declaration</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-500">
              <div className="flex items-start gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Applicant's Signature</p>
                  <img
                    src={pdsData.signature_url}
                    alt="Signature"
                    className="border-2 border-gray-300 rounded bg-white p-2"
                    style={{ maxWidth: '300px', height: 'auto' }}
                  />
                  {pdsData.signature_uploaded_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Signed on: {new Date(pdsData.signature_uploaded_at).toLocaleDateString()}
                    </p>
                  )}
                  {otherInformation.declaration?.dateAccomplished && (
                    <p className="text-xs text-gray-500 mt-1">
                      Date Accomplished: {new Date(otherInformation.declaration.dateAccomplished).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Completion Status */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">PDS Completion Status</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full px-3 py-1">
                <span className="text-sm font-semibold text-blue-700">
                  {pdsData.completion_percentage || 0}%
                </span>
              </div>
              {pdsData.is_completed && (
                <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Helper component for displaying info rows
function InfoRow({
  label,
  value,
  icon,
  className = ''
}: {
  label: string;
  value: any;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm text-gray-900">{value || 'N/A'}</p>
      </div>
    </div>
  );
}
