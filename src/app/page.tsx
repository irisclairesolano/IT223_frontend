'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  BookOpenIcon,
  UserGroupIcon,
  ArrowRightIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '@/lib/config';

export default function DashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, booksRes] = await Promise.all([
          axios.get(API_ENDPOINTS.users),
          axios.get(API_ENDPOINTS.books),
        ]);

        setTotalUsers(usersRes.data.length);
        setTotalBooks(booksRes.data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded-lg p-6 flex items-center gap-4">
          <UserGroupIcon className="h-10 w-10 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <h2 className="text-2xl font-semibold text-gray-800">{totalUsers}</h2>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 flex items-center gap-4">
          <BookOpenIcon className="h-10 w-10 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Total Books</p>
            <h2 className="text-2xl font-semibold text-gray-800">{totalBooks}</h2>
          </div>
        </div>
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Books Management */}
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-4">
              <BookOpenIcon className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Books Management</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Add, edit, and track all books in your library.
            </p>
          </div>
          <Link
            href="/books"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 transition-all group"
          >
            Go to Books
            <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-4">
              <UsersIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Register new users, view user details, and manage accounts.
            </p>
          </div>
          <Link
            href="/users"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all group"
          >
            Go to Users
            <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
