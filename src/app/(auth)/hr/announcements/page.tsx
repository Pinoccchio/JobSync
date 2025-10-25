'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Button, Input, Textarea, FileUploadWithProgress, Container, Badge, RefreshButton } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Calendar, Image as ImageIcon, Send, Megaphone, Loader2 } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  status: string;
  created_by: string;
  published_at: string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    imageUrl: '',
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements');
      const result = await response.json();

      if (result.success) {
        setAnnouncements(result.data);
      } else {
        showToast(result.error || 'Failed to fetch announcements', 'error');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showToast('Failed to fetch announcements', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Handle image upload
  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          image_url: formData.imageUrl || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('Announcement posted successfully!', 'success');
        setFormData({ title: '', description: '', category: 'general', imageUrl: '' });
        fetchAnnouncements();
      } else {
        showToast(result.error || 'Failed to post announcement', 'error');
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      showToast('Failed to post announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete announcement: "${title}"?`)) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        showToast('Announcement deleted successfully', 'success');
        fetchAnnouncements();
      } else {
        showToast(result.error || 'Failed to delete announcement', 'error');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showToast('Failed to delete announcement', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'job_opening': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-purple-100 text-purple-800';
      case 'notice': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'job_opening': return 'Job Opening';
      case 'training': return 'Training';
      case 'notice': return 'Notice';
      default: return 'General';
    }
  };

  return (
    <AdminLayout role="HR" userName={user?.fullName || "HR Admin"} pageTitle="Announcements" pageDescription="Post job announcements and notices">
      <Container size="xl">
        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <RefreshButton onRefresh={fetchAnnouncements} label="Refresh Announcements" showLastRefresh={true} />
        </div>

        {/* Create Announcement Card */}
        <Card variant="elevated" className="mb-8 hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#22A555] to-[#1a8045] rounded-xl flex items-center justify-center shadow-lg">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Announcement</h2>
                <p className="text-sm text-gray-600 mt-0.5">Share important updates and job openings</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Upload Image (Optional)
                  </label>
                  <FileUploadWithProgress
                    bucket="announcements"
                    onUploadComplete={handleImageUpload}
                    accept="image/jpeg,image/jpg,image/png"
                    maxSizeMB={5}
                  />
                  {formData.imageUrl && (
                    <p className="text-sm text-[#22A555] mt-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Image uploaded successfully
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
                    disabled={submitting}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22A555]"
                      disabled={submitting}
                    >
                      <option value="general">General</option>
                      <option value="job_opening">Job Opening</option>
                      <option value="training">Training</option>
                      <option value="notice">Notice</option>
                    </select>
                  </div>

                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter announcement description"
                    rows={4}
                    required
                    disabled={submitting}
                  />

                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    icon={submitting ? Loader2 : Send}
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'Posting...' : 'Post Announcement'}
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
            <Badge variant="info">{announcements.length} active</Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
              <span className="ml-3 text-gray-600">Loading announcements...</span>
            </div>
          ) : announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((item) => (
                <Card key={item.id} variant="interactive" noPadding className="group hover:shadow-2xl transition-all duration-300">
                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden group-hover:from-gray-300 group-hover:to-gray-400 transition-all">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400 group-hover:text-gray-500 transition-colors" />
                      </div>
                    )}
                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${getCategoryColor(item.category)}`}>
                        {getCategoryLabel(item.category)}
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
                      <span>{new Date(item.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>

                    {/* Actions */}
                    <Button
                      variant="danger"
                      size="sm"
                      icon={deletingId === item.id ? Loader2 : Trash2}
                      className="w-full mt-3"
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={deletingId !== null}
                    >
                      {deletingId === item.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-200">
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
