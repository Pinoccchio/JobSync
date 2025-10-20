'use client';
import React from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { AdminLayout } from '@/components/layout';

export default function ApplicantDashboard() {
  return (
    <AdminLayout role="Applicant" userName="User">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Section - Illustration */}
          <div className="flex justify-center">
            <svg viewBox="0 0 500 400" className="w-full h-auto max-w-md">
              <rect x="50" y="50" width="400" height="300" rx="10" fill="#FF6B35" opacity="0.1"/>
              <circle cx="250" cy="200" r="80" fill="#22A555" opacity="0.2"/>
              <rect x="100" y="120" width="300" height="200" rx="8" fill="#FDB912" opacity="0.15"/>
              <text x="250" y="210" textAnchor="middle" fill="#22A555" fontSize="24" fontWeight="bold">
                Your Career
              </text>
            </svg>
          </div>

          {/* Right Section - Content */}
          <div>
            <h1 className="text-5xl font-bold mb-4">
              Welcome to <span className="text-[#22A555]">JOBSYNC</span>
            </h1>

            <p className="text-gray-700 text-lg mb-8">
              Your smarter way to streamline hiring.
            </p>

            <p className="text-gray-600 mb-8">
              At Jobsync, we simplify and accelerate the hiring process for both employers and job
              seekers. Our intelligent screening platform quickly analyzes resumes, highlights top
              candidates, and matches qualifications with job requirements — helping companies find
              the right talent with ease.
            </p>

            <div className="flex gap-4">
              <Link href="/applicant/jobs">
                <Button size="lg">
                  DRAG & DROP FILES HERE
                </Button>
              </Link>
              <Button size="lg" variant="success">
                PDS FORM DOWNLOAD
              </Button>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Latest Announcements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Job Fair Announcement</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Hiring! Hiring! Hiring!</h3>
              <p className="text-sm text-gray-600">
                We are seeking a skilled and reliable IT Technician to join our team...
              </p>
            </Card>

            <Card>
              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Training Program</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Web Development Training</h3>
              <p className="text-sm text-gray-600">
                Learn modern web development technologies and frameworks...
              </p>
            </Card>

            <Card>
              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">New Opportunity</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Administrative Aide Position</h3>
              <p className="text-sm text-gray-600">
                Join the Municipal Hall team as an Administrative Aide...
              </p>
            </Card>
          </div>
        </div>
    </AdminLayout>
  );
}
