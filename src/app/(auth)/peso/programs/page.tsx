'use client';
import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Table, Button, Input, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

export default function PESOProgramsPage() {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    programName: '',
    description: '',
    duration: '',
    slots: '',
    startDate: '',
  });

  const programs = [
    {
      id: 1,
      name: 'Web Development Training',
      description: 'Learn HTML, CSS, JavaScript, and modern frameworks',
      duration: '3 months',
      slots: '25',
      startDate: '2025-02-01',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Digital Marketing Training',
      description: 'Social media marketing, SEO, and content creation',
      duration: '2 months',
      slots: '30',
      startDate: '2025-02-15',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Data Analytics Training',
      description: 'Excel, SQL, and data visualization basics',
      duration: '2 months',
      slots: '20',
      startDate: '2025-03-01',
      status: 'Upcoming'
    },
  ];

  const columns = [
    { header: 'Program Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Duration', accessor: 'duration' },
    { header: 'Available Slots', accessor: 'slots' },
    { header: 'Start Date', accessor: 'startDate' },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: () => (
        <div className="flex gap-2">
          <Button
            variant="warning"
            size="sm"
            onClick={() => showToast('Edit feature coming soon', 'info')}
          >
            ✏️ Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => showToast('Delete feature coming soon', 'info')}
          >
            🗑️ Delete
          </Button>
        </div>
      )
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Program creation feature coming soon!', 'info');
    setShowAddModal(false);
  };

  return (
    <AdminLayout role="PESO" userName="PESO Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Training Programs Management</h1>
          <Button variant="success" onClick={() => showToast('Add new program feature coming soon', 'info')}>
            ➕ Add New Program
          </Button>
        </div>

        <Card title="AVAILABLE TRAINING PROGRAMS">
          <Table columns={columns} data={programs} />
        </Card>

        {/* Add Program Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Create Training Program</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Program Name"
                  type="text"
                  value={formData.programName}
                  onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                  required
                />

                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />

                <Input
                  label="Duration"
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 3 months"
                  required
                />

                <Input
                  label="Available Slots"
                  type="number"
                  value={formData.slots}
                  onChange={(e) => setFormData({ ...formData, slots: e.target.value })}
                  required
                />

                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />

                <div className="flex gap-4 pt-4">
                  <Button type="submit" variant="success" className="flex-1">
                    Create Program
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
