'use client';
import React, { useState } from 'react';
import { Modal } from './Modal';
import { FileUpload } from './FileUpload';
import { useToast } from '@/contexts/ToastContext';

interface Job {
  title: string;
  company: string;
  description: string;
  requirements: string[];
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  job
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showToast('Please upload your PDS before submitting', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - Replace with actual API endpoint later
      await new Promise(resolve => setTimeout(resolve, 1500));

      showToast(`Application submitted successfully for ${job?.title}!`, 'success');

      // Reset and close
      setSelectedFile(null);
      onClose();
    } catch (error) {
      showToast('Failed to submit application. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
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
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{job.title}</h3>
          <p className="text-gray-600 mb-3">{job.company}</p>
          <p className="text-gray-700 mb-4">{job.description}</p>

          <div>
            <h4 className="font-semibold text-md mb-2">Requirements:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* PDS Upload Section */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Upload Personal Data Sheet (PDS)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please upload your completed PDS in PDF format. Don't have a PDS? You can download the blank template from your dashboard.
          </p>

          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".pdf"
          />
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Important Notice:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Your application will be automatically ranked using our Gemini AI-powered system</li>
            <li>You will receive notifications about your application status</li>
            <li>Make sure all information in your PDS is accurate and up-to-date</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedFile && !isSubmitting
                ? 'bg-[#22A555] text-white hover:bg-[#1a8044]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
