'use client';
import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Table, Button, Input, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

export default function JobManagementPage() {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    position: '',
    degree: '',
    eligibilities: '',
    skills: '',
    experience: '',
  });

  const jobs = [
    {
      id: 1,
      position: 'IT Assistant Technician',
      degree: 'Bachelor of Science in Information Technology',
      eligibilities: 'CS Professional',
      skills: 'Programming, Network Administration',
      experience: '2 years',
      status: 'Active'
    },
    {
      id: 2,
      position: 'HR Officer',
      degree: 'Bachelor of Science in Psychology',
      eligibilities: 'CS Professional',
      skills: 'Recruitment, Employee Relations',
      experience: '3 years',
      status: 'Active'
    },
  ];

  const columns = [
    { header: 'Position', accessor: 'position' },
    { header: 'Degree Requirements', accessor: 'degree' },
    { header: 'Eligibilities', accessor: 'eligibilities' },
    { header: 'Skills', accessor: 'skills' },
    { header: 'Experience', accessor: 'experience' },
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
            variant="secondary"
            size="sm"
            onClick={() => showToast('Hide feature coming soon', 'info')}
          >
            👁️ Hide
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
    showToast('Job posting feature coming soon!', 'info');
    setShowAddModal(false);
  };

  return (
    <AdminLayout role="HR" userName="HR Admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <Button variant="success" onClick={() => showToast('Add new job feature coming soon', 'info')}>
            ➕ Add New Job
          </Button>
        </div>

        <Card title="ACTIVE JOB POSTINGS">
          <Table columns={columns} data={jobs} />
        </Card>

        {/* Add Job Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Create Job Post</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Position/Job Title"
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />

                <Textarea
                  label="Degree Requirements/Preferences"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  rows={3}
                  required
                />

                <Textarea
                  label="Eligibilities Requirements/Preferences"
                  value={formData.eligibilities}
                  onChange={(e) => setFormData({ ...formData, eligibilities: e.target.value })}
                  rows={3}
                  required
                />

                <Textarea
                  label="Skills Requirements/Preferences"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  rows={3}
                  required
                />

                <Input
                  label="Total Years of Work Experience"
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g., 2-3 years"
                  required
                />

                <div className="flex gap-4 pt-4">
                  <Button type="submit" variant="success" className="flex-1">
                    Create Job Post
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
