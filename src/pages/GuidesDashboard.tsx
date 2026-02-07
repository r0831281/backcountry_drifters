import { PageContainer, PageHeader } from '../components/layout';
import { useAuth } from '../contexts/AuthContext';

export function GuidesDashboard() {
  const { userProfile } = useAuth();

  return (
    <PageContainer>
      <PageHeader
        title="Guide Dashboard"
        subtitle={`Welcome back, ${userProfile?.displayName || 'Guide'}!`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Upcoming Trips
          </h3>
          <p className="text-3xl font-bold text-forest-700">0</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            This Month
          </h3>
          <p className="text-3xl font-bold text-forest-700">0</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Trips
          </h3>
          <p className="text-3xl font-bold text-forest-700">0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-semibold text-forest-700 mb-4">
          Scheduled Trips
        </h2>
        <div className="text-center py-12 text-gray-500">
          <p>No trips scheduled yet.</p>
          <p className="text-sm mt-2">
            Your assigned trips will appear here.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
