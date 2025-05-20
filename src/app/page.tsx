'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  BookOpenIcon,
  UserGroupIcon,
  ArrowRightIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '@/lib/config';

export default function DashboardPage() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalBooks, setTotalBooks] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, booksRes] = await Promise.all([
          axios.get(API_ENDPOINTS.users),
          axios.get(API_ENDPOINTS.books),
        ]);

        setTotalUsers(usersRes.data.length);
        setTotalBooks(booksRes.data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 text-lg">
          Overview and quick access to system insights and tools.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          loading={loading}
          icon={<UserGroupIcon className="h-7 w-7 text-blue-600" title="Total registered users" />}
          color="blue"
        />
        <StatCard
          title="Total Books"
          value={totalBooks}
          loading={loading}
          icon={<BookOpenIcon className="h-7 w-7 text-green-600" title="Total books in catalog" />}
          color="green"
        />
        <StatCard
          title="System Status"
          value="Operational"
          loading={false}
          icon={<ChartBarIcon className="h-7 w-7 text-indigo-600" title="System performance status" />}
          color="indigo"
        />
      </div>

      {/* Actionable Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ActionCard
          title="Books Management"
          description="Add, edit, and monitor all books in the system. Keep the catalog organized."
          link="/books"
          icon={<BookOpenIcon className="w-6 h-6 text-green-600" />}
          bgColor="from-green-500 to-green-600"
        />
        <ActionCard
          title="User Management"
          description="View and manage registered users, permissions, and roles."
          link="/users"
          icon={<UsersIcon className="w-6 h-6 text-blue-600" />}
          bgColor="from-blue-500 to-blue-600"
        />
        {/* Added a new navigation tile for Reports */}
        <ActionCard
          title="Reports Center"
          description="Access detailed usage, performance, and activity logs."
          link="/reports"
          icon={<ChartBarIcon className="w-6 h-6 text-purple-600" />}
          bgColor="from-purple-500 to-purple-600"
        />
      </div>

      {/* Spotlight Widget */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Spotlight</h2>
        <p className="text-sm">
          📢 <strong>Reminder:</strong> Update admin credentials regularly and perform security audits
          every quarter.
        </p>
      </div>

      {/* Upcoming Tasks Calendar Overview */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Tasks</h2>
        <ul className="text-sm text-gray-600 space-y-3">
          <li>
            🗓️ <strong>May 23:</strong> Approve new book submissions
          </li>
          <li>
            🗓️ <strong>May 25:</strong> Review monthly user activity report
          </li>
          <li>
            🗓️ <strong>May 30:</strong> System backup and maintenance
          </li>
        </ul>
      </div>

      {/* Monthly Goals with Progress Bars */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Goals</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-700 mb-1">Reach 100 registered users</p>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-blue-500 h-2 rounded-full w-[75%]"></div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-700 mb-1">Add 50 new books</p>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-green-500 h-2 rounded-full w-[60%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Books Preview with Images */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Popular Books</h2>
        <ul className="text-sm text-gray-600 space-y-3">
          <li className="flex items-center gap-3">
            <img
              src="/book1.jpg"
              alt="Clean Code"
              className="w-10 h-10 rounded object-cover"
              loading="lazy"
            />
            <span>
              <strong>Clean Code</strong> by Robert C. Martin
            </span>
          </li>
          <li className="flex items-center gap-3">
            <img
              src="/book2.jpg"
              alt="JavaScript: The Good Parts"
              className="w-10 h-10 rounded object-cover"
              loading="lazy"
            />
            <span>
              <strong>JavaScript: The Good Parts</strong>
            </span>
          </li>
        </ul>
      </div>

      {/* Recent Activity Feed with Role Badge */}
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex items-center mb-4">
          <ClockIcon className="h-6 w-6 text-gray-500 mr-2" title="Recent user and system activity" />
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <ul className="divide-y divide-gray-200 text-sm text-gray-600">
          <li className="py-3">
            📚 New book <strong>"React for Beginners"</strong> was added.
          </li>
          <li className="py-3 flex items-center justify-between">
            <span>👤 User <strong>jane.doe@example.com</strong> registered.</span>
            {/* Example badge */}
            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
              Admin
            </span>
          </li>
          <li className="py-3">
            ✏️ Admin updated permissions for <strong>john.doe@example.com</strong>.
          </li>
        </ul>
      </div>
    </div>
  );
}

// StatCard component with type safety
type StatCardProps = {
  title: string;
  value: string | number | null;
  loading: boolean;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'indigo';
};

function StatCard({ title, value, loading, icon, color }: StatCardProps) {
  const colorMap: Record<StatCardProps['color'], string> = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    indigo: 'bg-indigo-50',
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 flex items-center gap-5 hover:shadow-md transition">
      <div className={`p-3 rounded-lg ${colorMap[color]}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {loading ? (
          <div className="h-6 w-16 mt-1 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <h2 className="text-2xl font-semibold text-gray-800">{value}</h2>
        )}
      </div>
    </div>
  );
}

// ActionCard component with type safety
type ActionCardProps = {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  bgColor: string;
};

function ActionCard({ title, description, link, icon, bgColor }: ActionCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow p-6 flex flex-col justify-between hover:shadow-lg transition">
      <div>
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-gray-100 mr-3">{icon}</div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-6">{description}</p>
      </div>
      <Link
        href={link}
        className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r ${bgColor} text-white font-medium hover:opacity-90 transition-all group w-full sm:w-auto`}
      >
        Manage {title.split(' ')[0]}
        <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
