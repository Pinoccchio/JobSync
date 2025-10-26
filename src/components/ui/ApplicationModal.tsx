'use client';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { FileUploadWithProgress } from './FileUploadWithProgress';
import { Button } from './Button';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
import { CheckCircle, User } from 'lucide-react';

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
  const { showToast } = useToast();

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
    if (!pdsFileUrl || !pdsFileName) {
      showToast('Please upload your PDS before submitting', 'error');
      return;
    }

    if (!job) {
      showToast('Job information is missing', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: job.id,
          pds_file_url: pdsFileUrl,
          pds_file_name: pdsFileName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      showToast(result.message || 'Application submitted successfully!', 'success');

      // Reset and close
      setPdsFileUrl('');
      setPdsFileName('');
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

        {/* PDS Upload Section */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Upload Personal Data Sheet (PDS)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please upload your completed PDS in PDF format. Maximum file size: 10MB.
          </p>

          <FileUploadWithProgress
            bucket="pds-files"
            accept="application/pdf"
            onUploadComplete={handleFileUpload}
            onUploadError={handleFileUploadError}
            label="Drag and drop your PDS (PDF) here"
            maxSizeDisplay="10MB"
          />
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
            disabled={!pdsFileUrl || isSubmitting}
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
