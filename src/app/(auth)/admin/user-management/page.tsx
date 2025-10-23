'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Container, Badge, Input, RefreshButton } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { supabase } from '@/lib/supabase/auth';
import { UserPlus, UserX, Trash2, User as UserIcon, User, Mail, Shield, Calendar, X, CheckCircle2, AlertCircle, Eye, Loader2 } from 'lucide-react';
import type { User, CreateUserRequest } from '@/types/users';

export default function UserManagementPage() {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<CreateUserRequest>({
    role: 'ADMIN',
    fullName: '',
    email: '',
    password: '',
  });

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get session from Supabase client
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      setUsers(result.data.users);
      showToast('Users loaded successfully', 'success');
    } catch (error) {
      console.error('Fetch users error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Real-time subscription for user profiles
  useTableRealtime('profiles', ['INSERT', 'UPDATE', 'DELETE'], null, () => {
    showToast('User profile updated', 'info');
    fetchUsers(); // Refresh when changes detected
  });

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.fullName || !formData.email || !formData.password) {
        throw new Error('All fields are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Invalid email format');
      }

      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Get session from Supabase client
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create user');
      }

      showToast(result.message || 'User created successfully', 'success');
      setShowCreateModal(false);
      setFormData({ role: 'ADMIN', fullName: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Create user error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle user status (activate/deactivate)
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      // Get session from Supabase client
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No authentication token');
      }

      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update user');
      }

      showToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchUsers();
    } catch (error) {
      console.error('Toggle status error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to update user', 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsSubmitting(true);
    try {
      // Get session from Supabase client
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user');
      }

      showToast('User deleted successfully', 'success');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to delete user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      accessor: 'full_name' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-gray-400" />
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
        <Badge variant={value === 'active' ? 'success' : 'default'} icon={value === 'active' ? CheckCircle2 : AlertCircle}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      header: 'Created Date',
      accessor: 'created_at' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'id' as const,
      render: (_: any, row: User) => {
        // For applicants: show view only
        if (row.role === 'APPLICANT') {
          return (
            <Button
              variant="secondary"
              size="sm"
              icon={Eye}
              onClick={() => showToast('View applicant profile', 'info')}
            >
              View Profile
            </Button>
          );
        }

        // For admins, HR, PESO: show activate/deactivate and delete
        return (
          <div className="flex gap-2">
            <Button
              variant={row.status === 'active' ? 'warning' : 'success'}
              size="sm"
              icon={row.status === 'active' ? UserX : CheckCircle2}
              onClick={() => handleToggleStatus(row.id, row.status)}
            >
              {row.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => {
                setUserToDelete(row);
                setShowDeleteConfirm(true);
              }}
            >
              Delete
            </Button>
          </div>
        );
      }
    },
  ];


  return (
    <AdminLayout role="Admin" userName={currentUser?.fullName || 'System Admin'} pageTitle="User Management" pageDescription="Create and manage admin accounts">
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
                  {users.filter(u => u.status === 'active').length}
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
                  {users.filter(u => u.status === 'inactive').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <UserX className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <RefreshButton onRefresh={fetchUsers} label="Refresh" showLastRefresh={true} />
          <Button variant="success" icon={UserPlus} onClick={() => setShowCreateModal(true)}>
            Create Admin Account
          </Button>
        </div>

        {/* Users Table */}
        <Card title="ALL USERS" headerColor="bg-[#D4F4DD]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#22A555]" />
                <p className="text-sm text-gray-500">Loading users...</p>
              </div>
            </div>
          ) : (
            <EnhancedTable
              columns={columns}
              data={users}
              searchable
              paginated
              pageSize={10}
              searchPlaceholder="Search by name, email, or role..."
            />
          )}
        </Card>

        {/* Create Account Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
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
                <form onSubmit={handleCreateUser} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'HR' | 'PESO' })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#22A555] transition-colors bg-white"
                        required
                      >
                        <option value="ADMIN">System Admin</option>
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
                    <Button type="submit" variant="success" icon={UserPlus} className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      icon={X}
                      className="flex-1"
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData({ role: 'ADMIN', fullName: '', email: '', password: '' });
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Delete User</h2>
                    <p className="text-sm text-red-100">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Are you sure you want to delete this user? This will permanently remove:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{userToDelete.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{userToDelete.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <Badge variant={getRoleBadgeVariant(userToDelete.role)}>{userToDelete.role}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ This will delete the user account and all associated data. The audit trail will be preserved for historical records.
                  </p>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                  <Button
                    variant="danger"
                    icon={Trash2}
                    className="flex-1"
                    onClick={handleDeleteUser}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete User'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    icon={X}
                    className="flex-1"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setUserToDelete(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
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
