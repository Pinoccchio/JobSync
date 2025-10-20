'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, ApplicationModal } from '@/components/ui';
import { AdminLayout } from '@/components/layout';

interface Job {
  title: string;
  company: string;
  description: string;
  requirements: string[];
}

export default function AuthenticatedJobsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const jobs: Job[] = [
    {
      title: 'IT Assistant Technician',
      company: 'Municipality of Asuncion',
      description: 'Technical support and system maintenance',
      requirements: ['Bachelor\'s Degree in IT', '2 years experience', 'CS Professional eligible']
    },
    {
      title: 'HR Officer',
      company: 'Municipality of Asuncion',
      description: 'Manage recruitment and employee relations',
      requirements: ['Bachelor\'s Degree in Psychology/HRM', '3 years experience']
    },
    {
      title: 'Accountant',
      company: 'Municipality of Asuncion',
      description: 'Financial reporting and budget management',
      requirements: ['Bachelor\'s Degree in Accountancy', 'CPA License', '2 years experience']
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % jobs.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + jobs.length) % jobs.length);
  };

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  return (
    <AdminLayout role="Applicant" userName="User">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">JOB LIST</h1>
          <p className="text-gray-600">Browse and apply for available positions at Municipality of Asuncion</p>
        </div>

        {/* Job Carousel */}
        <div className="relative">
          <div className="flex items-center justify-center gap-8">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="text-4xl text-gray-400 hover:text-gray-600 transition-colors"
            >
              ‹
            </button>

            {/* Current Job Card */}
            <Card className="w-full max-w-4xl bg-white">
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {jobs[currentSlide].title}
                </h2>
                <p className="text-lg text-gray-700 mb-4">{jobs[currentSlide].company}</p>
                <p className="text-gray-600 mb-6">{jobs[currentSlide].description}</p>

                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Requirements:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {jobs[currentSlide].requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <Button
                  size="lg"
                  variant="success"
                  onClick={() => handleApplyClick(jobs[currentSlide])}
                >
                  Apply Now
                </Button>
              </div>
            </Card>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="text-4xl text-gray-400 hover:text-gray-600 transition-colors"
            >
              ›
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {jobs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-[#22A555]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* All Jobs Grid */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Available Positions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <Card key={index} className="bg-white">
                <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{job.company}</p>
                <p className="text-sm text-gray-700 mb-4">{job.description}</p>
                <Button
                  variant="success"
                  className="w-full"
                  onClick={() => handleApplyClick(job)}
                >
                  Apply for this Job
                </Button>
              </Card>
            ))}
          </div>
        </div>
      {/* Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        job={selectedJob}
      />
    </AdminLayout>
  );
}
