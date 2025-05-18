'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/config';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface User {
  id: number;
  name: string;
  email: string;
  password: string; // hashed password
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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Users Management</h1>
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
          className="btn-primary flex items-center"
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
          className="input-field pl-10 w-full"
        />
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-gray-500 mt-2">API URL: {API_ENDPOINTS.users}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery ? 'No users found matching your search.' : 'No users found in the database.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password Hash</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{user.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">
                      {user.password.substring(0, 20)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.updated_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field mt-1"
                  required={!editingUser}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingUser ? 'Update' : 'Add'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 