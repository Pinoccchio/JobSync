'use client';
import React from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { AdminLayout } from '@/components/layout';

export default function TrainingsPage() {
  const { showToast } = useToast();
  const trainings = [
    {
      title: 'Web Development Training',
      duration: '3 months',
      description: 'Learn HTML, CSS, JavaScript, and modern web frameworks',
      schedule: 'Mon-Fri, 9AM-5PM',
      slots: '25 slots available'
    },
    {
      title: 'Digital Marketing Training',
      duration: '2 months',
      description: 'Master social media marketing, SEO, and content creation',
      schedule: 'Mon-Fri, 1PM-5PM',
      slots: '30 slots available'
    },
    {
      title: 'Data Analytics Training',
      duration: '2 months',
      description: 'Excel, SQL, and data visualization fundamentals',
      schedule: 'Tue-Thu, 2PM-6PM',
      slots: '20 slots available'
    },
    {
      title: 'Graphic Design Training',
      duration: '2 months',
      description: 'Adobe Photoshop, Illustrator, and design principles',
      schedule: 'Mon-Fri, 9AM-12PM',
      slots: '15 slots available'
    },
  ];

  return (
    <AdminLayout role="Applicant" userName="User">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PESO Training Programs</h1>
          <p className="text-gray-600">Enhance your skills with our free training programs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainings.map((training, index) => (
            <Card key={index}>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">{training.title}</h2>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">Duration:</span>
                    <span>{training.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">Schedule:</span>
                    <span>{training.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#22A555] font-medium">
                    <span>{training.slots}</span>
                  </div>
                </div>

                <p className="text-gray-600">{training.description}</p>

                <Button
                  variant="success"
                  className="w-full"
                  size="lg"
                  onClick={() => showToast('Apply for training feature coming soon', 'info')}
                >
                  Apply for Training
                </Button>
              </div>
            </Card>
          ))}
        </div>
    </AdminLayout>
  );
}
