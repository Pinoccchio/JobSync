'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, Container, Badge, RefreshButton, Modal, Input, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
import { useAuth } from '@/contexts/AuthContext';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled
import { AdminLayout } from '@/components/layout';
import { GraduationCap, Clock, Calendar, Users, MapPin, CheckCircle2, Upload } from 'lucide-react';
import { FileUploadWithProgress } from '@/components/ui';

interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  duration: string;
  schedule: string | null;
  capacity: number;
  enrolled_count: number;
  location: string | null;
  start_date: string;
  end_date: string | null;
  skills_covered: string[];
  icon: string;
  status: string;
}

interface UserApplication {
  id: string;
  program_id: string;
  status: 'pending' | 'approved' | 'denied';
}

export default function TrainingsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [userApplications, setUserApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    highest_education: '',
    id_image_url: '',
    id_image_name: '',
  });

  // Fetch training programs function
  const fetchTrainings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/training/programs?status=active');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch training programs');
      }

      setPrograms(result.data || []);
      showToast('Training programs refreshed', 'success');
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch user's applications
  const fetchUserApplications = useCallback(async () => {
    try {
      const response = await fetch('/api/training/applications');
      const result = await response.json();

      if (response.ok) {
        setUserApplications(result.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching user applications:', error);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchTrainings();
    fetchUserApplications();
  }, [fetchTrainings, fetchUserApplications]);

  // REMOVED: Real-time subscription disabled for performance
  // useTableRealtime('training_programs', ['INSERT', 'UPDATE', 'DELETE'], null, () => {
  //   showToast('Training programs updated', 'info');
  //   // fetchTrainings(); // Uncomment when real data
  // });

  // Handle apply button click
  const handleApplyClick = (program: TrainingProgram) => {
    setSelectedProgram(program);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      address: '',
      highest_education: '',
      id_image_url: '',
      id_image_name: '',
    });
    setApplyModalOpen(true);
  };

  // Handle image upload
  const handleImageUpload = (data: {
    fileName: string;
    filePath: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }) => {
    setFormData({
      ...formData,
      id_image_url: data.fileUrl,
      id_image_name: data.fileName,
    });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProgram) return;

    // Validate all fields
    if (!formData.full_name || !formData.email || !formData.phone || !formData.address || !formData.highest_education || !formData.id_image_url) {
      showToast('Please fill in all required fields and upload your ID', 'error');
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await fetch('/api/training/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id: selectedProgram.id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      showToast(result.message || 'Application submitted successfully', 'success');
      setApplyModalOpen(false);
      setSelectedProgram(null);
      fetchUserApplications(); // Refresh applications list
    } catch (error: any) {
      console.error('Error submitting application:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Check if user has applied to a program
  const getUserApplication = (programId: string) => {
    return userApplications.find(app => app.program_id === programId);
  };

  const filteredPrograms = programs.filter(program =>
    program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSlotColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-600 bg-green-100';
    if (percentage > 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getCardColor = (index: number) => {
    const colors = [
      'from-blue-500/10 to-blue-600/5',
      'from-purple-500/10 to-purple-600/5',
      'from-teal-500/10 to-teal-600/5',
      'from-orange-500/10 to-orange-600/5',
    ];
    return colors[index % colors.length];
  };

  const getIcon = (index: number) => {
    const icons = ['💻', '📱', '📊', '🎨', '🔧', '📚', '🎯', '💡'];
    return icons[index % icons.length];
  };

  return (
    <AdminLayout role="Applicant" userName={user?.fullName || 'Applicant'} pageTitle="PESO Training Programs" pageDescription="Enhance your skills with our free training programs">
      <Container size="xl">
        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <RefreshButton onRefresh={fetchTrainings} label="Refresh" showLastRefresh={true} />
        </div>

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
          {filteredPrograms.map((program, index) => {
            const availableSlots = program.capacity - program.enrolled_count;
            const userApp = getUserApplication(program.id);

            return (
              <Card key={program.id} variant="interactive" noPadding className="group">
                <div className={`h-2 bg-gradient-to-r ${getCardColor(index)}`}></div>
                <div className="p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{program.icon || getIcon(index)}</div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#22A555] transition-colors mb-2">
                          {program.title}
                        </h2>
                        <p className="text-gray-600 leading-relaxed">{program.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  {program.skills_covered && program.skills_covered.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {program.skills_covered.map((skill, idx) => (
                        <Badge key={idx} size="sm" variant="default">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Training Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{program.duration}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(program.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {program.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-900">{program.location}</p>
                        </div>
                      </div>
                    )}

                    {program.schedule && (
                      <div className="flex items-start gap-2">
                        <Users className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Schedule</p>
                          <p className="text-sm font-medium text-gray-900">{program.schedule}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slots Availability */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${getSlotColor(availableSlots, program.capacity)}`}>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">
                        {availableSlots} / {program.capacity} slots available
                      </span>
                    </div>
                    <div className="w-20 h-2 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-current rounded-full transition-all"
                        style={{ width: `${(availableSlots / program.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Apply Button */}
                  {userApp ? (
                    <div className="space-y-2">
                      <Badge
                        variant={userApp.status === 'approved' ? 'success' : userApp.status === 'denied' ? 'danger' : 'warning'}
                        className="w-full justify-center py-3"
                      >
                        Application {userApp.status.charAt(0).toUpperCase() + userApp.status.slice(1)}
                      </Badge>
                    </div>
                  ) : (
                    <Button
                      variant="success"
                      className="w-full"
                      size="lg"
                      icon={CheckCircle2}
                      onClick={() => handleApplyClick(program)}
                      disabled={availableSlots === 0}
                    >
                      {availableSlots === 0 ? 'Training Full' : 'Apply for Training'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPrograms.length === 0 && !loading && (
          <Card className="text-center py-16">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No training programs found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search to find what you're looking for.</p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="text-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-[#22A555] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading training programs...</p>
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

        {/* Application Modal */}
        <Modal
          isOpen={applyModalOpen}
          onClose={() => {
            setApplyModalOpen(false);
            setSelectedProgram(null);
          }}
          title={`Apply for ${selectedProgram?.title || 'Training'}`}
          size="lg"
        >
          {selectedProgram && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Program Info */}
              <div className="bg-[#22A555]/5 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedProgram.title}</h3>
                <p className="text-sm text-gray-600">{selectedProgram.description}</p>
                <div className="mt-3 flex gap-4 text-sm text-gray-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedProgram.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedProgram.start_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Juan Dela Cruz"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="juan@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="09123456789"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complete Address <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Barangay, Municipality, Province"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Highest Educational Attainment <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.highest_education}
                      onChange={(e) => setFormData({ ...formData, highest_education: e.target.value })}
                      placeholder="e.g., Bachelor of Science in Information Technology"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ID Upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Valid ID Upload</h3>
                <FileUploadWithProgress
                  bucket="id-images"
                  accept="image/*"
                  maxSizeMB={5}
                  onUploadComplete={handleImageUpload}
                  label="Upload a clear photo of your valid ID (Driver's License, Passport, etc.)"
                />
                {formData.id_image_url && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">✓ ID uploaded successfully</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setApplyModalOpen(false);
                    setSelectedProgram(null);
                  }}
                  disabled={submitLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  icon={CheckCircle2}
                  loading={submitLoading}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </Container>
    </AdminLayout>
  );
}
