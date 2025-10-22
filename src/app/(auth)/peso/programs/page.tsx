'use client';
import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Input, Textarea, Container, Badge } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { Plus, Edit, Trash2, GraduationCap, FileText, Clock, Users, Calendar, X, CheckCircle2 } from 'lucide-react';

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
    {
      header: 'Program Name',
      accessor: 'name' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#22A555]" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Duration',
      accessor: 'duration' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Available Slots',
      accessor: 'slots' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <Badge variant="info">{value} slots</Badge>
        </div>
      )
    },
    {
      header: 'Start Date',
      accessor: 'startDate' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => (
        <Badge variant={value === 'Active' ? 'success' : 'info'} icon={CheckCircle2}>
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
    showToast('Program creation feature coming soon!', 'info');
    setShowAddModal(false);
  };

  const totalSlots = programs.reduce((sum, p) => sum + parseInt(p.slots), 0);

  return (
    <AdminLayout role="PESO" userName="PESO Admin" pageTitle="Training Programs" pageDescription="Manage job training programs and opportunities">
      <Container size="xl">
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Programs</p>
                  <p className="text-3xl font-bold text-gray-900">{programs.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Programs</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {programs.filter(p => p.status === 'Active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {programs.filter(p => p.status === 'Upcoming').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Slots</p>
                  <p className="text-3xl font-bold text-gray-900">{totalSlots}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end">
            <Button variant="success" icon={Plus} onClick={() => setShowAddModal(true)}>
              Add New Program
            </Button>
          </div>

          {/* Programs Table */}
          <Card title="AVAILABLE TRAINING PROGRAMS" headerColor="bg-[#D4F4DD]">
            <EnhancedTable
              columns={columns}
              data={programs}
              searchable
              searchPlaceholder="Search by program name, description, or status..."
            />
          </Card>

          {/* Add Program Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Create Training Program</h2>
                      <p className="text-sm text-purple-100">Add a new training opportunity</p>
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
                        label="Program Name"
                        type="text"
                        value={formData.programName}
                        onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                        placeholder="e.g., Web Development Training"
                        required
                      />

                      <Textarea
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the training program content and objectives"
                        rows={4}
                        required
                      />

                      <div className="grid grid-cols-2 gap-4">
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
                          placeholder="e.g., 25"
                          required
                        />
                      </div>

                      <Input
                        label="Start Date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button type="submit" variant="success" icon={Plus} className="flex-1">
                        Create Program
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
