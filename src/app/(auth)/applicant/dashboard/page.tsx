'use client';
import React from 'react';
import Link from 'next/link';
import { Button, Card, Container } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { Briefcase, Download, Calendar, Users, GraduationCap, Megaphone } from 'lucide-react';

export default function ApplicantDashboard() {
  const announcements = [
    {
      icon: Briefcase,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      title: 'Hiring! Hiring! Hiring!',
      description: 'We are seeking a skilled and reliable IT Technician to join our team at the Municipal Hall.',
      date: 'Posted 2 days ago',
      category: 'Job Opening'
    },
    {
      icon: GraduationCap,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      title: 'Web Development Training',
      description: 'Learn modern web development technologies and frameworks in our comprehensive 3-month program.',
      date: 'Posted 5 days ago',
      category: 'Training Program'
    },
    {
      icon: Users,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-100',
      title: 'Administrative Aide Position',
      description: 'Join the Municipal Hall team as an Administrative Aide. Multiple positions available.',
      date: 'Posted 1 week ago',
      category: 'Job Opening'
    },
  ];

  return (
    <AdminLayout role="Applicant" userName="User" pageTitle="Dashboard" pageDescription="Welcome back! Here's your overview">
      <Container size="xl">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Section - Modern Illustration */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#22A555]/20 to-[#20C997]/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-[#22A555] to-[#20C997] rounded-2xl p-12 shadow-2xl">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Briefcase className="w-24 h-24 mb-6 opacity-90" />
                <h3 className="text-3xl font-bold mb-2">Your Career</h3>
                <p className="text-lg opacity-90">Starts Here</p>
              </div>
            </div>
          </div>

          {/* Right Section - Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Welcome to <span className="text-[#22A555]">JOBSYNC</span>
              </h1>
              <p className="text-gray-700 text-xl mb-2">
                Your smarter way to streamline hiring.
              </p>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed">
              At JobSync, we simplify and accelerate the hiring process for both employers and job
              seekers. Our intelligent screening platform quickly analyzes resumes, highlights top
              candidates, and matches qualifications with job requirements.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/applicant/jobs">
                <Button size="lg" icon={Briefcase} className="w-full sm:w-auto">
                  Browse Jobs
                </Button>
              </Link>
              <Button size="lg" variant="outline" icon={Download} className="w-full sm:w-auto">
                Download PDS Form
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card variant="flat" className="text-center">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 bg-[#22A555]/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[#22A555]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Active Job Postings</p>
              </div>
            </div>
          </Card>

          <Card variant="flat" className="text-center">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">4</p>
                <p className="text-sm text-gray-600">Training Programs</p>
              </div>
            </div>
          </Card>

          <Card variant="flat" className="text-center">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">150+</p>
                <p className="text-sm text-gray-600">Applications Processed</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Announcements Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-[#22A555]" />
              <h2 className="text-3xl font-bold text-gray-900">Latest Announcements</h2>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement, index) => {
              const Icon = announcement.icon;
              return (
                <Card key={index} variant="interactive" noPadding className="group">
                  <div className="p-6 space-y-4">
                    {/* Icon and Category */}
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 ${announcement.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-7 h-7 ${announcement.iconColor}`} />
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {announcement.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-[#22A555] transition-colors">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {announcement.description}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{announcement.date}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
}
