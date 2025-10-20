import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface AdminLayoutProps {
  children: React.ReactNode;
  role: 'HR' | 'PESO' | 'Applicant';
  userName?: string;
}

const HR_MENU_ITEMS = [
  { label: 'Dashboard', href: '/hr/dashboard', icon: '🏠' },
  { label: 'Extracted and Ranked PDS Record', href: '/hr/ranked-records', icon: '⚙️' },
  { label: 'Scanned PDS Records Management', href: '/hr/scanned-records', icon: '📄' },
  { label: 'Job Management', href: '/hr/job-management', icon: '💼' },
  { label: 'Announcements', href: '/hr/announcements', icon: '📢' },
];

const PESO_MENU_ITEMS = [
  { label: 'Dashboard', href: '/peso/dashboard', icon: '🏠' },
  { label: 'Training Applications', href: '/peso/applications', icon: '📋' },
  { label: 'Training Programs', href: '/peso/programs', icon: '🎓' },
];

const APPLICANT_MENU_ITEMS = [
  { label: 'Dashboard', href: '/applicant/dashboard', icon: '🏠' },
  { label: 'Jobs', href: '/applicant/jobs', icon: '💼' },
  { label: 'Trainings', href: '/applicant/trainings', icon: '🎓' },
  { label: 'My Applications', href: '/applicant/applications', icon: '📋' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  role,
  userName = 'Admin'
}) => {
  const menuItems =
    role === 'HR' ? HR_MENU_ITEMS :
    role === 'PESO' ? PESO_MENU_ITEMS :
    APPLICANT_MENU_ITEMS;

  const userRole =
    role === 'HR' ? 'HR Admin' :
    role === 'PESO' ? 'PESO Admin' :
    'Applicant';

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      <Sidebar menuItems={menuItems} role={role} />

      <div className="flex-1 ml-64 flex flex-col">
        <TopNav userRole={userRole} userName={userName} showSearch={true} />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
