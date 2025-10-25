'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Input, Textarea, Container, Badge, RefreshButton } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, EyeOff, Trash2, Briefcase, GraduationCap, CheckCircle2, X, Loader2, AlertCircle } from 'lucide-react';

interface Job {
  id: string;
  position: string;
  degree: string;
  eligibilities: string;
  skills: string;
  experience: string;
  status: string;
  _raw: any;
}

export default function JobManagementPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHideConfirm, setShowHideConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [jobToHide, setJobToHide] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const [formData, setFormData] = useState({
    position: '',
    degree: '',
    eligibilities: '',
    skills: '',
    experience: '',
    location: 'Asuncion Municipal Hall',
    employment_type: 'Full-time',
    description: '',
  });

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      const result = await response.json();

      if (result.success) {
        setJobs(result.data.map((job: any) => ({
          id: job.id,
          position: job.title,
          degree: job.degree_requirement,
          eligibilities: job.eligibilities.join(', '),
          skills: job.skills.join(', '),
          experience: `${job.years_of_experience} years`,
          status: job.status === 'active' ? 'Active' : job.status === 'hidden' ? 'Hidden' : 'Archived',
          _raw: job
        })));
      } else {
        showToast(result.error || 'Failed to fetch jobs', 'error');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showToast('Failed to fetch jobs', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Create job
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Build description from form data
      const description = `
Position: ${formData.position}

Degree Requirements:
${formData.degree}

Required Eligibilities:
${formData.eligibilities}

Required Skills:
${formData.skills}

Years of Experience Required: ${formData.experience}

Location: ${formData.location}
Employment Type: ${formData.employment_type}
      `.trim();

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.position,
          description: description,
          degree_requirement: formData.degree,
          eligibilities: formData.eligibilities.split(',').map(e => e.trim()).filter(Boolean),
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          years_of_experience: parseInt(formData.experience.replace(/\D/g, '')) || 0,
          location: formData.location,
          employment_type: formData.employment_type,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('Job created successfully!', 'success');
        setShowAddModal(false);
        setFormData({
          position: '',
          degree: '',
          eligibilities: '',
          skills: '',
          experience: '',
          location: 'Asuncion Municipal Hall',
          employment_type: 'Full-time',
          description: '',
        });
        fetchJobs();
      } else {
        showToast(result.error || 'Failed to create job', 'error');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      showToast('Failed to create job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit job
  const handleEdit = (job: Job) => {
    setEditingJob(job._raw);
    setFormData({
      position: job._raw.title,
      degree: job._raw.degree_requirement,
      eligibilities: job._raw.eligibilities.join(', '),
      skills: job._raw.skills.join(', '),
      experience: `${job._raw.years_of_experience}`,
      location: job._raw.location || 'Asuncion Municipal Hall',
      employment_type: job._raw.employment_type || 'Full-time',
      description: job._raw.description || '',
    });
    setShowEditModal(true);
  };

  // Update job
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingJob) return;

    try {
      setSubmitting(true);

      const description = `
Position: ${formData.position}

Degree Requirements:
${formData.degree}

Required Eligibilities:
${formData.eligibilities}

Required Skills:
${formData.skills}

Years of Experience Required: ${formData.experience}

Location: ${formData.location}
Employment Type: ${formData.employment_type}
      `.trim();

      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.position,
          description: description,
          degree_requirement: formData.degree,
          eligibilities: formData.eligibilities.split(',').map(e => e.trim()).filter(Boolean),
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          years_of_experience: parseInt(formData.experience.replace(/\D/g, '')) || 0,
          location: formData.location,
          employment_type: formData.employment_type,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('Job updated successfully!', 'success');
        setShowEditModal(false);
        setEditingJob(null);
        setFormData({
          position: '',
          degree: '',
          eligibilities: '',
          skills: '',
          experience: '',
          location: 'Asuncion Municipal Hall',
          employment_type: 'Full-time',
          description: '',
        });
        fetchJobs();
      } else {
        showToast(result.error || 'Failed to update job', 'error');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      showToast('Failed to update job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Hide job
  const handleHide = async () => {
    if (!jobToHide) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/jobs/${jobToHide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'hidden' }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('Job hidden successfully', 'success');
        setShowHideConfirm(false);
        setJobToHide(null);
        fetchJobs();
      } else {
        showToast(result.error || 'Failed to hide job', 'error');
      }
    } catch (error) {
      showToast('Failed to hide job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete job
  const handleDelete = async () => {
    if (!jobToDelete) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/jobs/${jobToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message || 'Job archived successfully', 'success');
        setShowDeleteConfirm(false);
        setJobToDelete(null);
        fetchJobs();
      } else {
        showToast(result.error || 'Failed to delete job', 'error');
      }
    } catch (error) {
      showToast('Failed to delete job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="flex flex-wrap gap-1">
          {value.split(',').slice(0, 2).map((elig, idx) => (
            <Badge key={idx} variant="info" className="text-xs">
              {elig.trim()}
            </Badge>
          ))}
          {value.split(',').length > 2 && (
            <Badge variant="default" className="text-xs">
              +{value.split(',').length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      header: 'Skills',
      accessor: 'skills' as const,
      render: (value: string) => (
        <div className="flex flex-wrap gap-1">
          {value.split(',').slice(0, 2).map((skill, idx) => (
            <Badge key={idx} variant="default" className="text-xs">
              {skill.trim()}
            </Badge>
          ))}
          {value.split(',').length > 2 && (
            <Badge variant="default" className="text-xs">
              +{value.split(',').length - 2}
            </Badge>
          )}
        </div>
      )
    },
    { header: 'Experience', accessor: 'experience' as const },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => (
        <Badge variant={value === 'Active' ? 'success' : value === 'Hidden' ? 'warning' : 'default'} icon={CheckCircle2}>
          {value}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions' as const,
      render: (_: any, row: Job) => (
        <div className="flex gap-2">
          <Button
            variant="warning"
            size="sm"
            icon={Edit}
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={EyeOff}
            onClick={() => {
              setJobToHide(row);
              setShowHideConfirm(true);
            }}
          >
            Hide
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => {
              setJobToDelete(row);
              setShowDeleteConfirm(true);
            }}
          >
            Delete
          </Button>
        </div>
      )
    },
  ];

  return (
    <AdminLayout role="HR" userName={user?.fullName || "HR Admin"} pageTitle="Job Management" pageDescription="Create and manage job postings">
      <Container size="xl">
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="primary" size="md" icon={Plus} onClick={() => setShowAddModal(true)}>
              Add New Job
            </Button>
            <RefreshButton onRefresh={fetchJobs} label="Refresh" showLastRefresh={true} />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Job Postings</p>
                  <p className="text-3xl font-bold text-gray-900">{jobs.filter(j => j.status === 'Active').length}</p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hidden/Archived</p>
                  <p className="text-3xl font-bold text-gray-900">{jobs.filter(j => j.status !== 'Active').length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Job Postings Table */}
          <Card title="JOB POSTINGS" headerColor="bg-[#D4F4DD]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
                <span className="ml-3 text-gray-600">Loading jobs...</span>
              </div>
            ) : (
              <EnhancedTable
                columns={columns}
                data={jobs}
                searchable
                searchPlaceholder="Search by position, skills, or requirements..."
              />
            )}
          </Card>

          {/* Add Job Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-[#22A555] to-[#1a8045] px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Create Job Post</h2>
                      <p className="text-sm text-green-100 mt-0.5">Add a new job opportunity</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all duration-200"
                    disabled={submitting}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                      label="Position/Job Title"
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., IT Assistant Technician"
                      required
                      disabled={submitting}
                    />

                    <Textarea
                      label="Degree Requirements"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="e.g., Bachelor of Science in Information Technology"
                      rows={2}
                      required
                      disabled={submitting}
                    />

                    <Textarea
                      label="Eligibilities (comma-separated)"
                      value={formData.eligibilities}
                      onChange={(e) => setFormData({ ...formData, eligibilities: e.target.value })}
                      placeholder="e.g., CS Professional, Certified IT Professional"
                      rows={2}
                      required
                      disabled={submitting}
                    />

                    <Textarea
                      label="Skills (comma-separated)"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="e.g., Programming, Network Administration, Database Management"
                      rows={2}
                      required
                      disabled={submitting}
                    />

                    <Input
                      label="Years of Experience Required"
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="e.g., 2"
                      required
                      disabled={submitting}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={submitting}
                      />

                      <Input
                        label="Employment Type"
                        type="text"
                        value={formData.employment_type}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                        disabled={submitting}
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        type="submit"
                        variant="success"
                        icon={submitting ? Loader2 : Plus}
                        className="flex-1"
                        disabled={submitting}
                      >
                        {submitting ? 'Creating...' : 'Create Job Post'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        icon={X}
                        className="flex-1"
                        onClick={() => setShowAddModal(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Edit Job Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Edit Job Post</h2>
                      <p className="text-sm text-yellow-100 mt-0.5">Update job details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingJob(null);
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all duration-200"
                    disabled={submitting}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <form onSubmit={handleUpdate} className="space-y-5">
                    <Input
                      label="Position/Job Title"
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., IT Assistant Technician"
                      required
                      disabled={submitting}
                    />

                    <Textarea
                      label="Degree Requirements"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="e.g., Bachelor of Science in Information Technology"
                      rows={2}
                      required
                      disabled={submitting}
                    />

                    <Textarea
                      label="Eligibilities (comma-separated)"
                      value={formData.eligibilities}
                      onChange={(e) => setFormData({ ...formData, eligibilities: e.target.value })}
                      placeholder="e.g., CS Professional, Certified IT Professional"
                      rows={2}
                      required
                      disabled={submitting}
                    />

                    <Textarea
                      label="Skills (comma-separated)"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="e.g., Programming, Network Administration, Database Management"
                      rows={2}
                      required
                      disabled={submitting}
                    />

                    <Input
                      label="Years of Experience Required"
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="e.g., 2"
                      required
                      disabled={submitting}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={submitting}
                      />

                      <Input
                        label="Employment Type"
                        type="text"
                        value={formData.employment_type}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                        disabled={submitting}
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        type="submit"
                        variant="warning"
                        icon={submitting ? Loader2 : Edit}
                        className="flex-1"
                        disabled={submitting}
                      >
                        {submitting ? 'Updating...' : 'Update Job'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        icon={X}
                        className="flex-1"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingJob(null);
                        }}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Hide Confirmation Modal */}
          {showHideConfirm && jobToHide && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <EyeOff className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Hide Job Posting</h3>
                        <p className="text-sm text-white/90">Confirm hiding this job</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowHideConfirm(false);
                        setJobToHide(null);
                      }}
                      className="text-white/90 hover:text-white transition-colors"
                      disabled={submitting}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  {/* Warning Message */}
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800 mb-1">Warning: Hide Job Posting</p>
                        <p className="text-sm text-amber-700">
                          This will hide the job from applicants. They will no longer be able to view or apply to this position.
                        </p>
                        <ul className="text-sm text-amber-700 list-disc list-inside mt-2 space-y-1">
                          <li>Job will be removed from public view</li>
                          <li>Existing applications will be preserved</li>
                          <li>You can restore this job later</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Job to be hidden:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{jobToHide.position}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{jobToHide.degree}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                        <Badge variant={jobToHide.status === 'Active' ? 'success' : 'warning'} className="text-xs">
                          {jobToHide.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowHideConfirm(false);
                        setJobToHide(null);
                      }}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="warning"
                      icon={submitting ? Loader2 : EyeOff}
                      onClick={handleHide}
                      className="flex-1"
                      disabled={submitting}
                    >
                      {submitting ? 'Hiding...' : 'Hide Job'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && jobToDelete && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Delete Job Posting</h3>
                        <p className="text-sm text-white/90">This action cannot be undone</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setJobToDelete(null);
                      }}
                      className="text-white/90 hover:text-white transition-colors"
                      disabled={submitting}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  {/* Warning Message */}
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800 mb-1">Warning: Permanent Archiving</p>
                        <p className="text-sm text-red-700">
                          You are about to permanently archive this job posting. This will:
                        </p>
                        <ul className="text-sm text-red-700 list-disc list-inside mt-2 space-y-1">
                          <li>Remove the job from all active listings</li>
                          <li>Prevent new applications</li>
                          <li>Archive all related data</li>
                          <li>This cannot be undone</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Job to be deleted:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{jobToDelete.position}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{jobToDelete.degree}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                        <Badge variant={jobToDelete.status === 'Active' ? 'success' : 'warning'} className="text-xs">
                          {jobToDelete.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setJobToDelete(null);
                      }}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      icon={submitting ? Loader2 : Trash2}
                      onClick={handleDelete}
                      className="flex-1"
                      disabled={submitting}
                    >
                      {submitting ? 'Deleting...' : 'Delete Job'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </AdminLayout>
  );
}
