'use client';
import React from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Container, Badge } from '@/components/ui';
import { GraduationCap, Clock, Briefcase, User, TrendingUp } from 'lucide-react';

export default function PESODashboard() {
  const tiles = [
    { title: 'Total Training Applications', value: '45', icon: User, color: 'from-blue-500 to-blue-600' },
    { title: 'Pending Applications', value: '12', icon: Clock, color: 'from-orange-500 to-orange-600' },
    { title: 'Active Training Programs', value: '8', icon: GraduationCap, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <AdminLayout role="PESO" userName="PESO Admin" pageTitle="Dashboard" pageDescription="Overview of training programs and applications">
      <Container size="xl">
        <div className="space-y-8">
          {/* Dashboard Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiles.map((tile, index) => {
              const Icon = tile.icon;
              return (
                <Card key={index} variant="elevated" className="hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{tile.title}</p>
                      <p className="text-4xl font-bold text-gray-900">{tile.value}</p>
                    </div>
                    <div className={`w-16 h-16 bg-gradient-to-br ${tile.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Recent Applications */}
          <Card title="RECENT APPLICATIONS" headerColor="bg-[#D4F4DD]" variant="elevated">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Juan Dela Cruz</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      <span>Web Development Training</span>
                    </div>
                  </div>
                </div>
                <Badge variant="warning" icon={Clock}>Pending</Badge>
              </div>
              <div className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Maria Santos</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      <span>Digital Marketing Training</span>
                    </div>
                  </div>
                </div>
                <Badge variant="warning" icon={Clock}>Pending</Badge>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </AdminLayout>
  );
}
