import { PDSWizard } from '@/components/PDS/PDSWizard';

export const metadata = {
  title: 'Fill PDS - JobSync',
  description: 'Complete your Personal Data Sheet online',
};

export default function PDSPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-6 mb-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900">Personal Data Sheet</h1>
          <p className="text-gray-600 mt-2">CS Form No. 212, Revised 2025</p>
        </div>
      </div>

      <PDSWizard />
    </div>
  );
}
