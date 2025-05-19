'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  BookOpenIcon,
  UserGroupIcon,
  ArrowRightIcon,
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '@/lib/config';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: { total: 0, loading: true, error: null },
    books: { total: 0, loading: true, error: null },
    recentUsers: [],
    recentBooks: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersRes, booksRes] = await Promise.all([
          axios.get(API_ENDPOINTS.users),
          axios.get(API_ENDPOINTS.books),
        ]);

        setStats({
          users: { total: usersRes.data.length, loading: false, error: null },
          books: { total: booksRes.data.length, loading: false, error: null },
          recentUsers: usersRes.data.slice(-5).reverse(),
          recentBooks: booksRes.data.slice(-5).reverse(),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setStats(prev => ({
          ...prev,
          users: { ...prev.users, loading: false, error },
          books: { ...prev.books, loading: false, error },
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your library.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Users Card */}
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={<UserGroupIcon className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          trend="up"
          trendValue="12%"
          loading={stats.users.loading}
          error={stats.users.error}
        />

        {/* Books Card */}
        <StatCard
          title="Total Books"
          value={stats.books.total}
          icon={<BookOpenIcon className="h-6 w-6 text-white" />}
          color="bg-green-500"
          trend="up"
          trendValue="8%"
          loading={stats.books.loading}
          error={stats.books.error}
        />

        {/* Additional Stats Cards (examples) */}
        <StatCard
          title="Active Borrowings"
          value="124"
          icon={<BookOpenIcon className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          trend="down"
          trendValue="3%"
          loading={false}
        />

        <StatCard
          title="Overdue Books"
          value="9"
          icon={<BookOpenIcon className="h-6 w-6 text-white" />}
          color="bg-red-500"
          trend="up"
          trendValue="5%"
          loading={false}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <QuickActionCard
          title="Books Management"
          description="Add, edit, and track all books in your library."
          icon={<BookOpenIcon className="w-8 h-8 text-green-600" />}
          actionText="Go to Books"
          href="/books"
          color="from-green-500 to-green-600"
        />

        <QuickActionCard
          title="User Management"
          description="Register new users, view user details, and manage accounts."
          icon={<UsersIcon className="w-8 h-8 text-blue-600" />}
          actionText="Go to Users"
          href="/users"
          color="from-blue-500 to-blue-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard
          title="Recent Users"
          items={stats.recentUsers}
          icon={<UserGroupIcon className="w-5 h-5 text-blue-500" />}
          emptyMessage="No recent users"
          loading={isLoading}
        />

        <RecentActivityCard
          title="Recent Books"
          items={stats.recentBooks}
          icon={<BookOpenIcon className="w-5 h-5 text-green-500" />}
          emptyMessage="No recent books"
          loading={isLoading}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, trendValue, loading, error }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            {loading ? (
              <div className="h-8 mt-2 w-24 bg-gray-200 rounded animate-pulse"></div>
            ) : error ? (
              <p className="text-red-500 text-sm mt-2">Error loading data</p>
            ) : (
              <h3 className="text-3xl font-semibold text-gray-900 mt-2">{value}</h3>
            )}
          </div>
          <div className={`${color} rounded-lg p-3`}>
            {icon}
          </div>
        </div>
        {!loading && !error && trend && (
          <div className="mt-4 flex items-center">
            {trend === 'up' ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span className={`ml-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue} from last month
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, icon, actionText, href, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-gray-600">{description}</p>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href={href}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r ${color} text-white font-medium hover:opacity-90 transition-opacity group`}
          >
            {actionText}
            <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function RecentActivityCard({ title, items, icon, emptyMessage, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </h3>
          <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <li key={index} className="py-3">
                <div className="flex items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name || item.title || `Item ${index + 1}`}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {item.email || item.author || 'No additional info'}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.status || 'Active'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}