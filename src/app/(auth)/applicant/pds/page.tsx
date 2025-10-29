'use client';
import { PDSWizard } from '@/components/PDS/PDSWizard';
import { AdminLayout } from '@/components/layout';

export default function PDSPage() {
  return (
    <AdminLayout
      role="Applicant"
      userName="Applicant"
      pageTitle="Personal Data Sheet"
      pageDescription="CS Form No. 212, Revised 2025"
    >
      <PDSWizard />
    </AdminLayout>
  );
}
