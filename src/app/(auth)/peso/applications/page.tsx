'use client';
import React, { useState, useCallback } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Container, Badge, RefreshButton } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled
import { Eye, CheckCircle, XCircle, User, Mail, Phone, MapPin, GraduationCap, Briefcase, Clock } from 'lucide-react';

export default function PESOApplicationsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [applications, setApplications] = useState([
    {
      id: 1,
      name: 'Juan Dela Cruz',
      email: 'juan@email.com',
      phone: '09123456789',
      address: 'Asuncion, Davao del Norte',
      education: 'Bachelor of Science in Information Technology',
      training: 'Web Development Training',
      status: 'Pending'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '09187654321',
      address: 'Asuncion, Davao del Norte',
      education: 'Bachelor of Science in Business Administration',
      training: 'Digital Marketing Training',
      status: 'Pending'
    },
    {
      id: 3,
      name: 'Pedro Gonzales',
      email: 'pedro@email.com',
      phone: '09111222333',
      address: 'Asuncion, Davao del Norte',
      education: 'Bachelor of Science in Computer Science',
      training: 'Data Analytics Training',
      status: 'Approved'
    },
  ]);

  // Fetch training applications function
  const fetchApplications = useCallback(async () => {
    try {
      // TODO: Real implementation
      // const { data } = await supabase
      //   .from('training_applications')
      //   .select('*')
      //   .order('created_at', { ascending: false });
      showToast('Applications refreshed', 'success');
    } catch (error) {
      showToast('Failed to refresh applications', 'error');
    }
  }, [showToast]);

  // REMOVED: Real-time subscription disabled for performance
  // useTableRealtime('training_applications', ['INSERT', 'UPDATE', 'DELETE'], null, () => {
  //   showToast('Training application updated', 'info');
  //   // fetchApplications(); // Uncomment when real data
  // });

  const columns = [
    {
      header: 'Full Name',
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
      header: 'Phone',
      accessor: 'phone' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Address',
      accessor: 'address' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Education',
      accessor: 'education' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Applied Training',
      accessor: 'training' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => {
        const variant = value === 'Approved' ? 'success' : value === 'Rejected' ? 'danger' : 'warning';
        const icon = value === 'Approved' ? CheckCircle : value === 'Rejected' ? XCircle : Clock;
        return <Badge variant={variant} icon={icon}>{value}</Badge>;
      }
    },
    {
      header: 'Actions',
      accessor: 'actions' as const,
      render: () => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            onClick={() => showToast('View details feature coming soon', 'info')}
          >
            View
          </Button>
          <Button
            variant="success"
            size="sm"
            icon={CheckCircle}
            onClick={() => showToast('Approve feature coming soon', 'info')}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={XCircle}
            onClick={() => showToast('Reject feature coming soon', 'info')}
          >
            Reject
          </Button>
        </div>
      )
    },
  ];

  return (
    <AdminLayout role="PESO" userName={user?.fullName || 'PESO Admin'} pageTitle="Training Applications" pageDescription="Manage and review training program applications">
      <Container size="xl">
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <RefreshButton onRefresh={fetchApplications} label="Refresh" showLastRefresh={true} />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'Pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'Approved').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-red-50 to-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {applications.filter(a => a.status === 'Rejected').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Applications Table */}
          <Card title="TRAINING APPLICATION LIST" headerColor="bg-[#D4F4DD]">
            <EnhancedTable
              columns={columns}
              data={applications}
              searchable
              paginated
              pageSize={10}
              searchPlaceholder="Search by name, email, training, or status..."
            />
          </Card>
        </div>
      </Container>
    </AdminLayout>
  );
}
