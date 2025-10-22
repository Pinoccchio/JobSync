'use client';
import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Input, Textarea, Container, Badge } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { Plus, Edit, EyeOff, Trash2, Briefcase, GraduationCap, CheckCircle2, X } from 'lucide-react';

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
    {
      header: 'Position',
      accessor: 'position' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#22A555]" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      header: 'Degree Requirements',
      accessor: 'degree' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Eligibilities',
      accessor: 'eligibilities' as const,
      render: (value: string) => (
        <Badge variant="info">{value}</Badge>
      )
    },
    {
      header: 'Skills',
      accessor: 'skills' as const,
      render: (value: string) => (
        <div className="flex flex-wrap gap-1">
          {value.split(',').map((skill, idx) => (
            <Badge key={idx} variant="default" className="text-xs">
              {skill.trim()}
            </Badge>
          ))}
        </div>
      )
    },
    { header: 'Experience', accessor: 'experience' as const },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => (
        <Badge variant={value === 'Active' ? 'success' : 'default'} icon={CheckCircle2}>
          {value}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions' as const,
      render: () => (
        <div className="flex gap-2">
          <Button
            variant="warning"
            size="sm"
            icon={Edit}
            onClick={() => showToast('Edit feature coming soon', 'info')}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={EyeOff}
            onClick={() => showToast('Hide feature coming soon', 'info')}
          >
            Hide
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => showToast('Delete feature coming soon', 'info')}
          >
            Delete
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
    <AdminLayout role="HR" userName="HR Admin" pageTitle="Job Management" pageDescription="Create and manage job postings">
      <Container size="xl">
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Job Postings</p>
                  <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applicants</p>
                  <p className="text-3xl font-bold text-gray-900">47</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Positions Filled</p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end">
            <Button variant="success" icon={Plus} onClick={() => setShowAddModal(true)}>
              Add New Job
            </Button>
          </div>

          {/* Job Postings Table */}
          <Card title="ACTIVE JOB POSTINGS" headerColor="bg-[#D4F4DD]">
            <EnhancedTable
              columns={columns}
              data={jobs}
              searchable
              searchPlaceholder="Search by position, skills, or requirements..."
            />
          </Card>

          {/* Add Job Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#22A555] to-[#1a8045] px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Create Job Post</h2>
                      <p className="text-sm text-green-100">Add a new job opportunity</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5">
                      <Input
                        label="Position/Job Title"
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        placeholder="e.g., IT Assistant Technician"
                        required
                      />

                      <Textarea
                        label="Degree Requirements/Preferences"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="e.g., Bachelor of Science in Information Technology"
                        rows={3}
                        required
                      />

                      <Textarea
                        label="Eligibilities Requirements/Preferences"
                        value={formData.eligibilities}
                        onChange={(e) => setFormData({ ...formData, eligibilities: e.target.value })}
                        placeholder="e.g., CS Professional, Certified IT Professional"
                        rows={3}
                        required
                      />

                      <Textarea
                        label="Skills Requirements/Preferences"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="e.g., Programming, Network Administration, Database Management"
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
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button type="submit" variant="success" icon={Plus} className="flex-1">
                        Create Job Post
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        icon={X}
                        className="flex-1"
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </AdminLayout>
  );
}
