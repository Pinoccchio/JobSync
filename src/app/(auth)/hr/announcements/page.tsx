'use client';
import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

export default function AnnouncementsPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });

  const [postedContent] = useState([
    {
      id: 1,
      title: 'We are looking for IT Technician!',
      image: '/sample-job.jpg',
      date: '2025-01-15'
    }
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Post announcement feature coming soon', 'info');
  };

  return (
    <AdminLayout role="HR" userName="HR Admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-2">
            Annouments posting for available jobs/ vacant positions
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-block px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Choose File
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    {formData.file ? formData.file.name : 'No file chosen'}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <Input
                  label="*Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                  required
                />

                <Textarea
                  label="*Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter announcement description"
                  rows={6}
                  required
                />

                <Button type="submit" variant="success" size="lg" className="w-full">
                  Post
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Posted Content */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Posted Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postedContent.map((item) => (
              <Card key={item.id}>
                <div className="space-y-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Image Placeholder</span>
                  </div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => showToast('Delete announcement feature coming soon', 'info')}
                  >
                    🗑️ DELETE
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
