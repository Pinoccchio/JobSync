'use client';
import React from 'react';
import { AdminLayout } from '@/components/layout';
import { DashboardTile, Card } from '@/components/ui';

export default function PESODashboard() {
  const tiles = [
    { title: 'Total Training Applications', value: '45' },
    { title: 'Pending Applications', value: '12' },
    { title: 'Active Training Programs', value: '8' },
  ];

  return (
    <AdminLayout role="PESO" userName="PESO Admin">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">PESO Dashboard</h1>

        {/* Dashboard Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiles.map((tile, index) => (
            <DashboardTile
              key={index}
              title={tile.title}
              value={tile.value}
            />
          ))}
        </div>

        {/* Recent Applications */}
        <Card title="RECENT APPLICATIONS">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">Juan Dela Cruz</p>
                <p className="text-sm text-gray-600">Applied for: Web Development Training</p>
              </div>
              <span className="text-sm text-yellow-600 font-medium">Pending</span>
            </div>
            <div className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">Maria Santos</p>
                <p className="text-sm text-gray-600">Applied for: Digital Marketing Training</p>
              </div>
              <span className="text-sm text-yellow-600 font-medium">Pending</span>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
