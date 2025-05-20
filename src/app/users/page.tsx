"use client";

import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/config';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, UserIcon, IdentificationIcon, EnvelopeIcon, LockClosedIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'ascending' | 'descending';
  } | null>(null);
  // Pagination logic
  const usersPerPage = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  // Define fetchUsers first
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.users);
      setUsers(response.data);
      setFilteredUsers(response.data);
      setError(null);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: any) => {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    let errorMessage = 'Failed to fetch users';
    if (error.response) {
      switch (error.response.status) {
        case 404:
          errorMessage = 'API endpoint not found. Please check the API URL.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please check if authentication is required.';
          break;
        case 403:
          errorMessage = 'Access forbidden. Please check your permissions.';
          break;
        case 422:
          errorMessage = error.response.data.message || 'Validation error. Please check your input.';
          break;
        default:
          errorMessage = `Error: ${error.response.status} - ${error.response.data?.message || error.message}`;
      }
    } else if (error.request) {
      errorMessage = 'No response received from server. Please check your connection.';
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const requestSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedUsers = () => {
    if (!sortConfig) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      if (sortConfig.key === 'created_at' || sortConfig.key === 'updated_at') {
        const dateA = new Date(a[sortConfig.key]).getTime();
        const dateB = new Date(b[sortConfig.key]).getTime();
        return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
      } else if (sortConfig.key === 'id') {
        return sortConfig.direction === 'ascending' ? a.id - b.id : b.id - a.id;
      } else {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      }
    });
  };

  const SortableHeader = ({ columnKey, label, icon: Icon }: { 
    columnKey: keyof User; 
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    return (
      <th 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => requestSort(columnKey)}
      >
        <div className="flex items-center">
          <Icon className="h-4 w-4 mr-2" />
          {label}
          {sortConfig?.key === columnKey && (
            <span className="ml-1">
              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`${API_ENDPOINTS.users}/${editingUser.id}`, formData);
        toast.success('User updated successfully');
      } else {
        await axios.post(API_ENDPOINTS.users, formData);
        toast.success('User added successfully');
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
      });
      fetchUsers();
    } catch (error: any) {
      handleError(error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show password when editing
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_ENDPOINTS.users}/${id}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error: any) {
        handleError(error);
      }
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.length,
    recentlyAdded: users.filter(user => 
      new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig, users]);

  // Get sorted and filtered users for current page
  const sortedUsers = getSortedUsers();
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Enhanced Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center">
            <IdentificationIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Recently Added</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.recentlyAdded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Add User Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              name: '',
              email: '',
              password: '',
            });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New User
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      {/* Error/Empty State */}
      {error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-sm text-gray-500 mt-2">API URL: {API_ENDPOINTS.users}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {searchQuery ? 'No users found matching your search.' : 'No users found in the database.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader columnKey="id" label="ID" icon={IdentificationIcon} />
                  <SortableHeader columnKey="name" label="Name" icon={UserIcon} />
                  <SortableHeader columnKey="email" label="Email" icon={EnvelopeIcon} />
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <LockClosedIcon className="h-4 w-4 mr-2" />
                      Password Hash
                    </div>
                  </th>
                  <SortableHeader columnKey="created_at" label="Created At" icon={CalendarIcon} />
                  <SortableHeader columnKey="updated_at" label="Updated At" icon={ClockIcon} />
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr 
                    key={user.id}
                    className="transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <IdentificationIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <div className="text-sm font-medium text-gray-900">#{user.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-purple-500 mr-2" />
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-500 font-mono">
                          {user.password ? `${user.password.substring(0, 8)}...` : <span className="italic text-gray-400">N/A</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-amber-500 mr-2" />
                        <div className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-green-500 mr-2" />
                        <div className="text-sm text-gray-500">
                          {new Date(user.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:scale-110 active:scale-95 transition-all"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:scale-110 active:scale-95 transition-all"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredUsers.length > 0 && (
        <div className="flex justify-between items-center py-4">
          <div className="text-sm text-gray-500">
            Showing {sortedUsers.length === 0 ? 0 : indexOfFirstUser + 1} to {Math.min(indexOfLastUser, sortedUsers.length)} of {sortedUsers.length} users
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 py-2 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scaleIn">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'Name', name: 'name', icon: UserIcon },
                  { label: 'Email', name: 'email', icon: EnvelopeIcon },
                  { 
                    label: editingUser ? 'New Password (leave blank to keep current)' : 'Password',
                    name: 'password', 
                    icon: LockClosedIcon,
                    type: 'password'
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <field.icon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={field.type || 'text'}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          [field.name]: e.target.value 
                        })}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required={field.name === 'password' ? !editingUser : true}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                  >
                    {editingUser ? 'Update User' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}