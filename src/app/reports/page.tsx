'use client';

import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

const dailyUsageData = [
  { day: 'Mon', usage: 120 },
  { day: 'Tue', usage: 200 },
  { day: 'Wed', usage: 150 },
  { day: 'Thu', usage: 170 },
  { day: 'Fri', usage: 250 },
  { day: 'Sat', usage: 300 },
  { day: 'Sun', usage: 180 },
];

const monthlyUserData = [
  { month: 'Jan', users: 30 },
  { month: 'Feb', users: 45 },
  { month: 'Mar', users: 60 },
  { month: 'Apr', users: 80 },
  { month: 'May', users: 100 },
];

export default function ReportsPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Reports Center</h1>
        <p className="text-gray-600 text-md">
          Access detailed usage, performance, and activity logs.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="System Usage"
          description="Daily usage patterns by users across the system."
          icon={<ChartBarIcon className="h-6 w-6 text-indigo-600" />}
        />
        <ReportCard
          title="User Growth"
          description="Track how user registrations evolve monthly."
          icon={<UserGroupIcon className="h-6 w-6 text-blue-600" />}
        />
        <ReportCard
          title="Book Catalog Activity"
          description="Monitor additions and edits to the book database."
          icon={<BookOpenIcon className="h-6 w-6 text-green-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Usage</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyUsageData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="usage" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly User Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyUserData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-4">
          <ClockIcon className="h-6 w-6 text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Recent System Activity</h2>
        </div>
        <ul className="divide-y divide-gray-200 text-sm text-gray-600">
          <li className="py-3">📈 Daily usage report generated at 10:00 AM.</li>
          <li className="py-3">👤 User <strong>alex.smith@example.com</strong> updated profile.</li>
          <li className="py-3">📚 3 new books added to the system.</li>
          <li className="py-3">🔒 Admin reviewed security permissions.</li>
        </ul>
      </div>
    </div>
  );
}

type ReportCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

function ReportCard({ title, description, icon }: ReportCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow p-5 hover:shadow-md transition">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-gray-100 rounded-lg mr-3">{icon}</div>
        <h3 className="text-md font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
