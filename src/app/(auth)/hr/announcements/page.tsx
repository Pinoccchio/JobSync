'use client';
import React, { useState, useCallback } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Button, Input, Textarea, FileUpload, Container, Badge, RefreshButton } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { Trash2, Calendar, Image as ImageIcon, Send, Megaphone } from 'lucide-react';

export default function AnnouncementsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });

  const [postedContent, setPostedContent] = useState([
    {
      id: 1,
      title: 'We are looking for IT Technician!',
      description: 'Join our team as an IT Technician. Great opportunity for skilled professionals.',
      image: '/sample-job.jpg',
      date: '2025-01-15',
      category: 'Job Opening'
    },
    {
      id: 2,
      title: 'Training Program Registration Open',
      description: 'New web development training program starting next month.',
      image: '/sample-training.jpg',
      date: '2025-01-12',
      category: 'Training'
    },
    {
      id: 3,
      title: 'HR Office Relocation Notice',
      description: 'The HR office will be temporarily relocated during renovations.',
      image: '/sample-notice.jpg',
      date: '2025-01-10',
      category: 'Notice'
    }
  ]);

  const handleFileSelect = (file: File) => {
    setFormData({ ...formData, file });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Post announcement feature coming soon', 'info');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Job Opening': return 'bg-blue-100 text-blue-800';
      case 'Training': return 'bg-purple-100 text-purple-800';
      case 'Notice': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch announcements function
  const fetchAnnouncements = useCallback(async () => {
    try {
      // TODO: Real implementation
      // const { data } = await supabase
      //   .from('announcements')
      //   .select('*')
      //   .order('created_at', { ascending: false });
      showToast('Announcements refreshed', 'success');
    } catch (error) {
      showToast('Failed to refresh announcements', 'error');
    }
  }, [showToast]);

  // Real-time subscription for announcements
  useTableRealtime('announcements', ['INSERT', 'UPDATE', 'DELETE'], null, () => {
    showToast('Announcement updated', 'info');
    // fetchAnnouncements(); // Uncomment when real data
  });

  return (
    <AdminLayout role="HR" userName={user?.fullName || "HR Admin"} pageTitle="Announcements" pageDescription="Post job announcements and notices">
      <Container size="xl">
        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <RefreshButton onRefresh={fetchAnnouncements} label="Refresh" showLastRefresh={true} />
        </div>

        {/* Create Announcement Card */}
        <Card variant="elevated" className="mb-8">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Announcement</h2>
                <p className="text-sm text-gray-600">Share important updates and job openings</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Upload Image
                  </label>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    accept="image/*"
                  />
                  {formData.file && (
                    <p className="text-sm text-[#22A555] mt-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      {formData.file.name}
                    </p>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <Input
                    label="Title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter announcement title"
                    required
                  />

                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter announcement description"
                    rows={5}
                    required
                  />

                  <Button type="submit" variant="success" size="lg" icon={Send} className="w-full">
                    Post Announcement
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Card>

        {/* Posted Content */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Posted Announcements</h2>
            <Badge variant="info">{postedContent.length} active</Badge>
          </div>

          {postedContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postedContent.map((item) => (
                <Card key={item.id} variant="interactive" noPadding className="group">
                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-400" />
                    </div>
                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#22A555] transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>

                    {/* Actions */}
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      className="w-full mt-3"
                      onClick={() => showToast('Delete announcement feature coming soon', 'info')}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-16">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No announcements yet</h3>
              <p className="text-gray-600 mb-4">Create your first announcement to get started</p>
            </Card>
          )}
        </div>
      </Container>
    </AdminLayout>
  );
}
