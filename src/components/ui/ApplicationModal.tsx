'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FileUploadWithProgress } from './FileUploadWithProgress';
import { Button } from './Button';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
import { CheckCircle, User, FileText, Upload, ExternalLink } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  degree_requirement: string;
  eligibilities: string[];
  skills: string[];
  years_of_experience: number;
  location?: string;
  employment_type?: string;
  created_at?: string;
  profiles?: {
    id: string;
    full_name: string;
    role: string;
  } | null;
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSuccess?: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  job,
  onSuccess
}) => {
  const [pdsFileUrl, setPdsFileUrl] = useState('');
  const [pdsFileName, setPdsFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationMethod, setApplicationMethod] = useState<'pds' | 'upload' | null>(null);
  const [pdsData, setPdsData] = useState<any>(null);
  const [isLoadingPDS, setIsLoadingPDS] = useState(true);
  const { showToast } = useToast();

  // Load user's PDS data on mount
  useEffect(() => {
    if (isOpen) {
      loadPDSData();
    }
  }, [isOpen]);

  const loadPDSData = async () => {
    setIsLoadingPDS(true);
    try {
      const response = await fetch('/api/pds');
      const result = await response.json();

      if (result.success && result.data) {
        setPdsData(result.data);
        // Auto-select PDS method if completed
        if (result.data.is_completed) {
          setApplicationMethod('pds');
        }
      }
    } catch (error) {
      console.error('Error loading PDS:', error);
    } finally {
      setIsLoadingPDS(false);
    }
  };

  const handleFileUpload = (data: {
    fileName: string;
    filePath: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }) => {
    setPdsFileUrl(data.fileUrl);
    setPdsFileName(data.fileName);
  };

  const handleFileUploadError = (error: string) => {
    showToast(error, 'error');
  };

  const handleSubmit = async () => {
    if (!applicationMethod) {
      showToast('Please select an application method', 'error');
      return;
    }

    if (applicationMethod === 'upload' && (!pdsFileUrl || !pdsFileName)) {
      showToast('Please upload your PDS before submitting', 'error');
      return;
    }

    if (applicationMethod === 'pds' && (!pdsData || !pdsData.is_completed)) {
      showToast('Your PDS is not completed yet', 'error');
      return;
    }

    if (!job) {
      showToast('Job information is missing', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody: any = {
        job_id: job.id,
      };

      if (applicationMethod === 'pds') {
        requestBody.pds_id = pdsData.id;
      } else {
        requestBody.pds_file_url = pdsFileUrl;
        requestBody.pds_file_name = pdsFileName;
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      showToast(result.message || 'Application submitted successfully!', 'success');

      // Reset and close
      setPdsFileUrl('');
      setPdsFileName('');
      setApplicationMethod(null);
      onClose();

      // Call success callback to refresh parent data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPdsFileUrl('');
    setPdsFileName('');
    setApplicationMethod(null);
    onClose();
  };

  if (!job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Apply for ${job.title}`}
      size="lg"
      showFooter={false}
    >
      <div className="space-y-6">
        {/* Job Details */}
        <div className="bg-[#22A555]/5 rounded-lg p-4 border border-[#22A555]/20">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{job.title}</h3>
          <p className="text-gray-700 mb-4">{job.description}</p>

          {/* Creator Info */}
          {job.profiles && (
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
              <User className="w-3 h-3" />
              Posted by {job.profiles.full_name}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Degree Requirement:</h4>
              <p className="text-sm text-gray-600">{job.degree_requirement}</p>
            </div>

            {job.years_of_experience > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Experience Required:</h4>
                <p className="text-sm text-gray-600">{job.years_of_experience} years</p>
              </div>
            )}

            {job.eligibilities && job.eligibilities.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Eligibilities:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {job.eligibilities.slice(0, 3).map((elig, index) => (
                    <li key={index}>{elig}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Skills Required:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Application Method Selection */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Choose Application Method</h3>

          {isLoadingPDS ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22A555] mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Checking your PDS...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Use Completed PDS */}
              <button
                type="button"
                onClick={() => setApplicationMethod('pds')}
                disabled={!pdsData || !pdsData.is_completed}
                className={`
                  relative border-2 rounded-lg p-6 text-left transition-all
                  ${
                    applicationMethod === 'pds'
                      ? 'border-[#22A555] bg-[#22A555]/5'
                      : pdsData && pdsData.is_completed
                      ? 'border-gray-300 hover:border-[#22A555]/50'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <FileText className={`w-6 h-6 mt-1 ${applicationMethod === 'pds' ? 'text-[#22A555]' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Use My Completed PDS</h4>
                    {pdsData && pdsData.is_completed ? (
                      <>
                        <p className="text-sm text-gray-600 mb-2">
                          Your PDS is complete and ready to use
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#22A555]">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed on {new Date(pdsData.updated_at).toLocaleDateString()}</span>
                        </div>
                      </>
                    ) : pdsData && !pdsData.is_completed ? (
                      <>
                        <p className="text-sm text-gray-600 mb-2">
                          Your PDS is {pdsData.completion_percentage}% complete
                        </p>
                        <a
                          href="/applicant/pds"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Complete your PDS
                        </a>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-2">
                          You haven't filled out your PDS yet
                        </p>
                        <a
                          href="/applicant/pds"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Fill out PDS online
                        </a>
                      </>
                    )}
                  </div>
                </div>
                {applicationMethod === 'pds' && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-[#22A555] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </button>

              {/* Option 2: Upload PDF */}
              <button
                type="button"
                onClick={() => setApplicationMethod('upload')}
                className={`
                  relative border-2 rounded-lg p-6 text-left transition-all
                  ${
                    applicationMethod === 'upload'
                      ? 'border-[#22A555] bg-[#22A555]/5'
                      : 'border-gray-300 hover:border-[#22A555]/50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <Upload className={`w-6 h-6 mt-1 ${applicationMethod === 'upload' ? 'text-[#22A555]' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Upload PDS File</h4>
                    <p className="text-sm text-gray-600">
                      Upload your completed PDS in PDF format
                    </p>
                  </div>
                </div>
                {applicationMethod === 'upload' && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-[#22A555] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* File Upload (shown if upload method selected) */}
          {applicationMethod === 'upload' && (
            <div className="mt-4">
              <FileUploadWithProgress
                bucket="pds-files"
                accept="application/pdf"
                onUploadComplete={handleFileUpload}
                onUploadError={handleFileUploadError}
                label="Drag and drop your PDS (PDF) here"
                maxSizeDisplay="10MB"
              />
            </div>
          )}
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Important Notice:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Your application will be automatically ranked using our Gemini AI-powered system</li>
            <li>You will receive notifications about your application status</li>
            <li>Make sure all information in your PDS is accurate and up-to-date</li>
            <li>You can only apply once per job posting</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={
              !applicationMethod ||
              (applicationMethod === 'upload' && !pdsFileUrl) ||
              (applicationMethod === 'pds' && (!pdsData || !pdsData.is_completed)) ||
              isSubmitting
            }
            loading={isSubmitting}
            icon={CheckCircle}
          >
            Submit Application
          </Button>
        </div>
      </div>
    </Modal>
  );
};
