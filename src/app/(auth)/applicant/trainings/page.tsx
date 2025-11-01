'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, Container, Badge, RefreshButton, Modal, Input, Textarea, EnhancedTable } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
import { useAuth } from '@/contexts/AuthContext';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled
import { AdminLayout } from '@/components/layout';
import { GraduationCap, Clock, Calendar, Users, MapPin, CheckCircle2, Upload, LayoutGrid, List, Filter, Loader2, Award, Star, TrendingUp, User, Laptop, Briefcase, BarChart3, Palette, Wrench, BookOpen, Code, Lightbulb } from 'lucide-react';
import { FileUploadWithProgress } from '@/components/ui';
import { formatShortDate, formatRelativeDate, getCreatorTooltip } from '@/lib/utils/dateFormatters';

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
  created_by: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    role: string;
  } | null;
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
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [filterDuration, setFilterDuration] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

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

  // Helper function to check if program is new (created within last 7 days)
  const isNewProgram = (createdAt: string) => {
    const programDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - programDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Helper function to check if program is starting soon (within 7 days)
  const isStartingSoon = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Filter programs with search and filters
  const filteredPrograms = programs.filter(program => {
    const availableSlots = program.capacity - program.enrolled_count;
    const availabilityPercent = (availableSlots / program.capacity) * 100;

    // Search filter
    const matchesSearch = searchQuery === '' ||
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.skills_covered?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    // Duration filter (parsing duration string)
    const matchesDuration = filterDuration === 'all' || (() => {
      const durationLower = program.duration.toLowerCase();
      if (filterDuration === 'short') {
        return durationLower.includes('week') || durationLower.includes('1 month');
      } else if (filterDuration === 'medium') {
        return durationLower.includes('2 month') || durationLower.includes('3 month');
      } else if (filterDuration === 'long') {
        return durationLower.includes('4 month') || durationLower.includes('5 month') ||
               durationLower.includes('6 month') || durationLower.includes('year');
      }
      return true;
    })();

    // Availability filter
    const matchesAvailability = filterAvailability === 'all' || (() => {
      if (filterAvailability === 'available') return availableSlots > 0;
      if (filterAvailability === 'full') return availableSlots === 0;
      if (filterAvailability === 'almost-full') return availabilityPercent < 20 && availableSlots > 0;
      return true;
    })();

    return matchesSearch && matchesDuration && matchesAvailability;
  });

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

  // Map icon string to lucide-react icon component
  const getIconComponent = (iconString: string | null | undefined) => {
    const iconMap: { [key: string]: any } = {
      'laptop': Laptop,
      'briefcase': Briefcase,
      'chart': BarChart3,
      'palette': Palette,
      'wrench': Wrench,
      'book': BookOpen,
      'code': Code,
      'lightbulb': Lightbulb,
      'graduation': GraduationCap,
      'award': Award,
    };

    if (!iconString) return GraduationCap;

    const key = iconString.toLowerCase().trim();
    return iconMap[key] || GraduationCap;
  };

  // Calculate stats
  const stats = {
    totalPrograms: programs.length,
    availableSlots: programs.reduce((sum, p) => sum + (p.capacity - p.enrolled_count), 0),
    enrolledPrograms: userApplications.filter(app => app.status === 'approved').length,
    pendingApplications: userApplications.filter(app => app.status === 'pending').length,
  };

  return (
    <AdminLayout role="Applicant" userName={user?.fullName || 'Applicant'} pageTitle="PESO Training Programs" pageDescription="Enhance your skills with our free training programs">
      <Container size="xl">
        <div className="space-y-6">
          {/* Refresh Button & View Toggle */}
          <div className="flex items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg border-2 border-gray-200 p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === 'card'
                    ? 'bg-[#22A555] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm font-medium">Card View</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#22A555] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">Table View</span>
              </button>
            </div>

            <RefreshButton onRefresh={fetchTrainings} label="Refresh" showLastRefresh={true} />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Programs</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.totalPrograms}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available Slots</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.availableSlots}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Enrolled</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.enrolledPrograms}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.pendingApplications}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search programs by title, description, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22A555] transition-colors"
              />
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600 hidden md:block" />
              <select
                value={filterDuration}
                onChange={(e) => setFilterDuration(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22A555] bg-white min-w-[150px]"
              >
                <option value="all">All Durations</option>
                <option value="short">Short (&lt; 1 month)</option>
                <option value="medium">Medium (1-3 months)</option>
                <option value="long">Long (3+ months)</option>
              </select>

              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22A555] bg-white min-w-[150px]"
              >
                <option value="all">All Availability</option>
                <option value="available">Available</option>
                <option value="almost-full">Almost Full</option>
                <option value="full">Full</option>
              </select>

              {(filterDuration !== 'all' || filterAvailability !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterDuration('all');
                    setFilterAvailability('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2.5 text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

        {/* Training Content - Card or Table View */}
        {viewMode === 'card' ? (
          /* Card View */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Training Programs ({filteredPrograms.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
                <span className="ml-3 text-gray-600">Loading programs...</span>
              </div>
            ) : filteredPrograms.length === 0 ? (
              <Card className="text-center py-16">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No programs found</h3>
                <p className="text-gray-600 mb-4">
                  {programs.length === 0 ? 'No training programs available at the moment.' : 'Try adjusting your search or filters'}
                </p>
                {(filterDuration !== 'all' || filterAvailability !== 'all' || searchQuery) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterDuration('all');
                      setFilterAvailability('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {filteredPrograms.map((program, index) => {
                  const availableSlots = program.capacity - program.enrolled_count;
                  const availabilityPercent = (availableSlots / program.capacity) * 100;
                  const userApp = getUserApplication(program.id);

                  return (
                    <Card key={program.id} variant="interactive" noPadding className="group hover:shadow-xl transition-all duration-300">
                      <div className={`h-3 bg-gradient-to-r ${getCardColor(index)}`}></div>
                      <div className="p-6 space-y-4">
                        {/* Header with Badges */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-[#22A555]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              {React.createElement(getIconComponent(program.icon), {
                                className: "w-6 h-6 text-[#22A555]"
                              })}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#22A555] transition-colors mb-2 line-clamp-2">
                                {program.title}
                              </h2>
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{program.description}</p>
                              {/* Creator Info */}
                              {program.profiles && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Created by {program.profiles.full_name} • {formatRelativeDate(program.created_at)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status Badges */}
                          <div className="flex flex-col gap-2">
                            {isNewProgram(program.created_at) && (
                              <Badge variant="success" size="sm" className="whitespace-nowrap">
                                🆕 New
                              </Badge>
                            )}
                            {isStartingSoon(program.start_date) && (
                              <Badge variant="warning" size="sm" className="whitespace-nowrap">
                                ⚡ Starting Soon
                              </Badge>
                            )}
                            {availabilityPercent < 20 && availableSlots > 0 && (
                              <Badge variant="danger" size="sm" className="whitespace-nowrap">
                                🔥 Almost Full
                              </Badge>
                            )}
                          </div>
                        </div>

                  {/* Skills Tags */}
                  {program.skills_covered && program.skills_covered.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {program.skills_covered.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} size="sm" variant="default">
                          {skill}
                        </Badge>
                      ))}
                      {program.skills_covered.length > 5 && (
                        <Badge size="sm" variant="default">
                          +{program.skills_covered.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Training Details */}
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#22A555] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{program.duration}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#22A555] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Start Date</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {new Date(program.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {program.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#22A555] mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Location</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{program.location}</p>
                        </div>
                      </div>
                    )}

                    {program.schedule && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-[#22A555] mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Schedule</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{program.schedule}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slots Availability */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${getSlotColor(availableSlots, program.capacity)}`}>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold text-sm">
                        {availableSlots} / {program.capacity} slots
                      </span>
                    </div>
                    <div className="w-24 h-2.5 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-current rounded-full transition-all duration-300"
                        style={{ width: `${(availableSlots / program.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Apply Button */}
                  {userApp ? (
                    <Badge
                      variant={userApp.status === 'approved' ? 'success' : userApp.status === 'denied' ? 'danger' : 'warning'}
                      className="w-full justify-center py-3 text-sm"
                    >
                      Application {userApp.status.charAt(0).toUpperCase() + userApp.status.slice(1)}
                    </Badge>
                  ) : (
                    <Button
                      variant="success"
                      className="w-full shadow-md hover:shadow-lg transition-shadow"
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
              )}
            </div>
          ) : (
            /* Table View */
            <Card title={`TRAINING PROGRAMS (${filteredPrograms.length})`} headerColor="bg-[#D4F4DD]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
                  <span className="ml-3 text-gray-600">Loading programs...</span>
                </div>
              ) : filteredPrograms.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 font-medium">No programs found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {programs.length === 0 ? 'No training programs available' : 'Try adjusting your filters'}
                  </p>
                </div>
              ) : (
                <EnhancedTable
                  columns={[
                    {
                      header: 'Program',
                      accessor: 'title' as const,
                      render: (value: string, row: TrainingProgram) => (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#22A555]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            {React.createElement(getIconComponent(row.icon), {
                              className: "w-5 h-5 text-[#22A555]"
                            })}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{value}</p>
                            <p className="text-xs text-gray-500">{row.description.slice(0, 60)}...</p>
                          </div>
                        </div>
                      )
                    },
                    {
                      header: 'Duration',
                      accessor: 'duration' as const,
                      render: (value: string) => (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{value}</span>
                        </div>
                      )
                    },
                    {
                      header: 'Start Date',
                      accessor: 'start_date' as const,
                      render: (value: string) => (
                        <span className="text-sm text-gray-700">
                          {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )
                    },
                    {
                      header: 'Created By',
                      accessor: 'profiles' as const,
                      render: (_: any, row: TrainingProgram) => (
                        <div
                          className="flex items-start gap-2"
                          title={getCreatorTooltip(row.profiles || null, row.created_at)}
                        >
                          <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {row.profiles?.full_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {row.profiles?.role || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )
                    },
                    {
                      header: 'Location',
                      accessor: 'location' as const,
                      render: (value: string | null) => (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{value || 'TBA'}</span>
                        </div>
                      )
                    },
                    {
                      header: 'Slots',
                      accessor: 'capacity' as const,
                      render: (value: number, row: TrainingProgram) => {
                        const available = value - row.enrolled_count;
                        const percent = (available / value) * 100;
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {available}/{value}
                            </span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  percent > 50 ? 'bg-green-500' : percent > 20 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                    },
                    {
                      header: 'Status',
                      accessor: 'status' as const,
                      render: (value: string, row: TrainingProgram) => {
                        const userApp = getUserApplication(row.id);
                        if (userApp) {
                          return (
                            <Badge variant={userApp.status === 'approved' ? 'success' : userApp.status === 'denied' ? 'danger' : 'warning'}>
                              {userApp.status.charAt(0).toUpperCase() + userApp.status.slice(1)}
                            </Badge>
                          );
                        }
                        return <Badge variant="info">Open</Badge>;
                      }
                    },
                    {
                      header: 'Actions',
                      accessor: 'actions' as const,
                      render: (_: any, row: TrainingProgram) => {
                        const userApp = getUserApplication(row.id);
                        const available = row.capacity - row.enrolled_count;
                        return (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApplyClick(row)}
                            disabled={userApp !== undefined || available === 0}
                          >
                            {userApp ? 'Applied' : available === 0 ? 'Full' : 'Apply'}
                          </Button>
                        );
                      }
                    },
                  ]}
                  data={filteredPrograms}
                  searchable
                  paginated
                  pageSize={10}
                  searchPlaceholder="Search by program name..."
                />
              )}
            </Card>
          )}

          {/* Info Card */}
          <Card variant="flat" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">About PESO Training Programs</p>
                <p className="text-sm text-gray-600">
                  Our training programs are designed to equip job seekers with in-demand skills. All programs
                  are completely free and include certificates upon completion. Limited slots are available,
                  so apply early to secure your spot!
                </p>
              </div>
            </div>
          </Card>
        </div>

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
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedProgram.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedProgram.start_date).toLocaleDateString()}
                  </span>
                  {selectedProgram.profiles && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Created by {selectedProgram.profiles.full_name}
                    </span>
                  )}
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
