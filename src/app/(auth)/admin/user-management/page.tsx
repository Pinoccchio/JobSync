'use client';
import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Container, Badge, Input } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { UserPlus, UserX, Trash2, User, Mail, Shield, Calendar, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UserManagementPage() {
  const { showToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    role: 'HR' as 'HR' | 'PESO',
    fullName: '',
    email: '',
    password: '',
  });

  // Mock user data
  const users = [
    { id: 1, name: 'Micah Echavarre', email: 'micah@jobsync.gov', role: 'HR', status: 'Active', createdDate: '2025-01-01' },
    { id: 2, name: 'PESO Admin', email: 'peso@jobsync.gov', role: 'PESO', status: 'Active', createdDate: '2025-01-01' },
    { id: 3, name: 'Juan Dela Cruz', email: 'juan@email.com', role: 'Applicant', status: 'Active', createdDate: '2025-01-15' },
    { id: 4, name: 'Maria Santos', email: 'maria@email.com', role: 'Applicant', status: 'Active', createdDate: '2025-01-16' },
    { id: 5, name: 'Pedro Gonzales', email: 'pedro@email.com', role: 'Applicant', status: 'Inactive', createdDate: '2025-01-10' },
    { id: 6, name: 'Angelo Belleza', email: 'angelo@email.com', role: 'Applicant', status: 'Active', createdDate: '2025-01-18' },
  ];

  const getRoleBadgeVariant = (role: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (role) {
      case 'HR': return 'success';
      case 'PESO': return 'info';
      case 'Applicant': return 'warning';
      default: return 'default';
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <Badge variant={getRoleBadgeVariant(value)}>{value}</Badge>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => (
        <Badge variant={value === 'Active' ? 'success' : 'default'} icon={value === 'Active' ? CheckCircle2 : AlertCircle}>
          {value}
        </Badge>
      )
    },
    {
      header: 'Created Date',
      accessor: 'createdDate' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions' as const,
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant={row.status === 'Active' ? 'warning' : 'success'}
            size="sm"
            icon={row.status === 'Active' ? UserX : CheckCircle2}
            onClick={() => showToast(`${row.status === 'Active' ? 'Deactivate' : 'Activate'} feature coming soon`, 'info')}
          >
            {row.status === 'Active' ? 'Deactivate' : 'Activate'}
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
    showToast(`${formData.role} account creation feature coming soon!`, 'info');
    setShowCreateModal(false);
    setFormData({ role: 'HR', fullName: '', email: '', password: '' });
  };

  return (
    <AdminLayout role="Admin" userName="System Admin" pageTitle="User Management" pageDescription="Create and manage admin accounts">
      <Container size="xl">
        <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'Active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Admin Accounts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'HR' || u.role === 'PESO').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card variant="flat" className="bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inactive Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'Inactive').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <UserX className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end">
          <Button variant="success" icon={UserPlus} onClick={() => setShowCreateModal(true)}>
            Create Admin Account
          </Button>
        </div>

        {/* Users Table */}
        <Card title="ALL USERS" headerColor="bg-[#D4F4DD]">
          <EnhancedTable
            columns={columns}
            data={users}
            searchable
            paginated
            pageSize={10}
            searchPlaceholder="Search by name, email, or role..."
          />
        </Card>

        {/* Create Account Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#22A555] to-[#1a8045] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Create Admin Account</h2>
                    <p className="text-sm text-green-100">Add a new HR or PESO admin</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'HR' | 'PESO' })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#22A555] transition-colors bg-white"
                        required
                      >
                        <option value="HR">HR Admin</option>
                        <option value="PESO">PESO Admin</option>
                      </select>
                    </div>

                    <Input
                      label="Full Name"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g., Juan Dela Cruz"
                      required
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g., admin@jobsync.gov"
                      required
                    />

                    <Input
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a secure password"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button type="submit" variant="success" icon={UserPlus} className="flex-1">
                      Create Account
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      icon={X}
                      className="flex-1"
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData({ role: 'HR', fullName: '', email: '', password: '' });
                      }}
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
