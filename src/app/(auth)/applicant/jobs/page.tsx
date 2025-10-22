'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, ApplicationModal, Container, Badge } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { ChevronLeft, ChevronRight, Briefcase, MapPin, Clock, CheckCircle2 } from 'lucide-react';

interface Job {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location?: string;
  type?: string;
}

export default function AuthenticatedJobsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const jobs: Job[] = [
    {
      title: 'IT Assistant Technician',
      company: 'Municipality of Asuncion',
      description: 'Technical support and system maintenance for municipal operations',
      requirements: ['Bachelor\'s Degree in IT', '2 years experience', 'CS Professional eligible'],
      location: 'Asuncion Municipal Hall',
      type: 'Full-time'
    },
    {
      title: 'HR Officer',
      company: 'Municipality of Asuncion',
      description: 'Manage recruitment and employee relations',
      requirements: ['Bachelor\'s Degree in Psychology/HRM', '3 years experience'],
      location: 'Asuncion Municipal Hall',
      type: 'Full-time'
    },
    {
      title: 'Accountant',
      company: 'Municipality of Asuncion',
      description: 'Financial reporting and budget management',
      requirements: ['Bachelor\'s Degree in Accountancy', 'CPA License', '2 years experience'],
      location: 'Asuncion Municipal Hall',
      type: 'Full-time'
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
    <AdminLayout role="Applicant" userName="User" pageTitle="Job Opportunities" pageDescription="Browse and apply for available positions">
      <Container size="xl">

        {/* Job Carousel */}
        <div className="relative mb-20">
          <div className="flex items-center justify-center gap-6">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-[#22A555] hover:text-white transition-all duration-200 group"
              aria-label="Previous job"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Current Job Card */}
            <Card variant="elevated" className="w-full max-w-4xl">
              <div className="p-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">
                      {jobs[currentSlide].title}
                    </h2>
                    <p className="text-xl text-gray-700 mb-4">{jobs[currentSlide].company}</p>
                  </div>
                  <div className="w-16 h-16 bg-[#22A555]/10 rounded-2xl flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-[#22A555]" />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge variant="success" icon={MapPin}>
                    {jobs[currentSlide].location}
                  </Badge>
                  <Badge variant="info" icon={Clock}>
                    {jobs[currentSlide].type}
                  </Badge>
                </div>

                <p className="text-gray-600 text-lg mb-8 leading-relaxed">{jobs[currentSlide].description}</p>

                <div className="mb-8">
                  <h3 className="font-semibold text-xl mb-4 text-gray-900">Requirements:</h3>
                  <ul className="space-y-3">
                    {jobs[currentSlide].requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-[#22A555] mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  size="lg"
                  variant="success"
                  onClick={() => handleApplyClick(jobs[currentSlide])}
                  className="text-lg"
                >
                  Apply for this Position
                </Button>
              </div>
            </Card>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-[#22A555] hover:text-white transition-all duration-200 group"
              aria-label="Next job"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {jobs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-[#22A555] w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'
                }`}
                aria-label={`Go to job ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* All Jobs Grid */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">All Available Positions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <Card key={index} variant="interactive" noPadding className="group">
                <div className="p-6 space-y-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-[#22A555]/10 rounded-xl flex items-center justify-center group-hover:bg-[#22A555] transition-colors">
                    <Briefcase className="w-6 h-6 text-[#22A555] group-hover:text-white transition-colors" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-xl mb-2 text-gray-900 group-hover:text-[#22A555] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{job.company}</p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge size="sm" variant="default">
                      {job.type}
                    </Badge>
                  </div>

                  {/* Button */}
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={() => handleApplyClick(job)}
                  >
                    Apply Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        job={selectedJob}
      />
    </AdminLayout>
  );
}
