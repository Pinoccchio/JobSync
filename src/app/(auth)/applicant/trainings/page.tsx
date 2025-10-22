'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Container, Badge } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { AdminLayout } from '@/components/layout';
import { GraduationCap, Clock, Calendar, Users, MapPin, CheckCircle2 } from 'lucide-react';

export default function TrainingsPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const trainings = [
    {
      title: 'Web Development Training',
      duration: '3 months',
      description: 'Learn HTML, CSS, JavaScript, and modern web frameworks like React and Next.js',
      schedule: 'Mon-Fri, 9AM-5PM',
      totalSlots: 25,
      availableSlots: 25,
      location: 'PESO Office - Computer Lab',
      startDate: 'Feb 15, 2025',
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      icon: '💻',
      color: 'blue'
    },
    {
      title: 'Digital Marketing Training',
      duration: '2 months',
      description: 'Master social media marketing, SEO, and content creation strategies',
      schedule: 'Mon-Fri, 1PM-5PM',
      totalSlots: 30,
      availableSlots: 12,
      location: 'PESO Office - Training Room',
      startDate: 'Feb 20, 2025',
      skills: ['Social Media', 'SEO', 'Content Marketing'],
      icon: '📱',
      color: 'purple'
    },
    {
      title: 'Data Analytics Training',
      duration: '2 months',
      description: 'Excel, SQL, and data visualization fundamentals for business analytics',
      schedule: 'Tue-Thu, 2PM-6PM',
      totalSlots: 20,
      availableSlots: 8,
      location: 'PESO Office - Computer Lab',
      startDate: 'Feb 18, 2025',
      skills: ['Excel', 'SQL', 'Data Viz'],
      icon: '📊',
      color: 'teal'
    },
    {
      title: 'Graphic Design Training',
      duration: '2 months',
      description: 'Adobe Photoshop, Illustrator, and fundamental design principles',
      schedule: 'Mon-Fri, 9AM-12PM',
      totalSlots: 15,
      availableSlots: 3,
      location: 'PESO Office - Design Lab',
      startDate: 'Feb 22, 2025',
      skills: ['Photoshop', 'Illustrator', 'Design'],
      icon: '🎨',
      color: 'orange'
    },
  ];

  const filteredTrainings = trainings.filter(training =>
    training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    training.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSlotColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-600 bg-green-100';
    if (percentage > 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getCardColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500/10 to-blue-600/5',
      purple: 'from-purple-500/10 to-purple-600/5',
      teal: 'from-teal-500/10 to-teal-600/5',
      orange: 'from-orange-500/10 to-orange-600/5',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <AdminLayout role="Applicant" userName="User" pageTitle="PESO Training Programs" pageDescription="Enhance your skills with our free training programs">
      <Container size="xl">

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="Search training programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22A555] focus:border-transparent"
            />
            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Training Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTrainings.map((training, index) => (
            <Card key={index} variant="interactive" noPadding className="group">
              <div className={`h-2 bg-gradient-to-r ${getCardColor(training.color)}`}></div>
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{training.icon}</div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#22A555] transition-colors mb-2">
                        {training.title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed">{training.description}</p>
                    </div>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2">
                  {training.skills.map((skill, idx) => (
                    <Badge key={idx} size="sm" variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Training Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium text-gray-900">{training.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm font-medium text-gray-900">{training.startDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">{training.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Schedule</p>
                      <p className="text-sm font-medium text-gray-900">{training.schedule}</p>
                    </div>
                  </div>
                </div>

                {/* Slots Availability */}
                <div className={`flex items-center justify-between p-3 rounded-lg ${getSlotColor(training.availableSlots, training.totalSlots)}`}>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">
                      {training.availableSlots} / {training.totalSlots} slots available
                    </span>
                  </div>
                  <div className="w-20 h-2 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-current rounded-full transition-all"
                      style={{ width: `${(training.availableSlots / training.totalSlots) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Apply Button */}
                <Button
                  variant="success"
                  className="w-full"
                  size="lg"
                  icon={CheckCircle2}
                  onClick={() => showToast('Apply for training feature coming soon', 'info')}
                  disabled={training.availableSlots === 0}
                >
                  {training.availableSlots === 0 ? 'Training Full' : 'Apply for Training'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTrainings.length === 0 && (
          <Card className="text-center py-16">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No training programs found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search to find what you're looking for.</p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </Card>
        )}

        {/* Info Card */}
        <Card variant="flat" className="mt-8 bg-gradient-to-br from-[#22A555]/5 to-[#20C997]/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">About PESO Training Programs</h3>
              <p className="text-gray-700 leading-relaxed">
                Our training programs are designed to equip job seekers with in-demand skills. All programs
                are completely free and include certificates upon completion. Limited slots are available,
                so apply early to secure your spot!
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </AdminLayout>
  );
}
