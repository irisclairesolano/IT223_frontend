'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/config';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: number;
  user_id: number;
  book_id: number;
  borrowed_at: string;
  due_at: string;
  returned_at: string | null;
  late_fee: number;
  user?: {
    name: string;
    email: string;
  };
  book?: {
    title: string;
    author: string;
    isbn: string;
  };
}

interface Book {
  id: number;
  title: string;
  author: string;
  available_copies: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    user_id: '',
    book_id: '',
    due_at: '',
  });
  const [editData, setEditData] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }
      fetchTransactions();
      fetchBooks();
      fetchUsers();
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const filtered = transactions.filter(transaction => 
      transaction.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.book?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.book?.isbn.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [searchQuery, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      // Log the full request details
      console.log('Fetching transactions with config:', {
        url: API_ENDPOINTS.transactions,
        headers: config.headers
      });

      const response = await axios.get(API_ENDPOINTS.transactions, config);
      
      // Log successful response
      console.log('Transactions response:', {
        status: response.status,
        data: response.data
      });

      setTransactions(response.data);
      setFilteredTransactions(response.data);
    } catch (error: any) {
      // Enhanced error logging
      console.error('Transaction fetch error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      };
      const response = await axios.get(API_ENDPOINTS.books, config);
      setBooks(response.data);
    } catch (error: any) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      };
      const response = await axios.get(API_ENDPOINTS.users, config);
      setUsers(response.data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
    }
  };

  const handleError = (error: any) => {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    let errorMessage = 'An error occurred';
    if (error.response) {
      switch (error.response.status) {
        case 404:
          errorMessage = 'API endpoint not found. Please check the API URL.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          router.replace('/login');
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

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      };

      await axios.post(API_ENDPOINTS.borrow, formData, config);
      toast.success('Book borrowed successfully');
      setIsModalOpen(false);
      setFormData({
        user_id: '',
        book_id: '',
        due_at: '',
      });
      fetchTransactions();
      fetchBooks();
    } catch (error: any) {
      handleError(error);
    }
  };

  const handleReturn = async (id: number) => {
    if (window.confirm('Are you sure you want to return this book?')) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        };

        await axios.post(`${API_ENDPOINTS.return}/${id}`, {}, config);
        toast.success('Book returned successfully');
        fetchTransactions();
        fetchBooks();
      } catch (error: any) {
        handleError(error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        };

        await axios.delete(`${API_ENDPOINTS.transactions}/${id}`, config);
        toast.success('Transaction deleted successfully');
        fetchTransactions();
      } catch (error: any) {
        handleError(error);
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      };

      await axios.put(`${API_ENDPOINTS.transactions}/${editData.id}`, editData, config);
      toast.success('Transaction updated successfully');
      setIsEditModalOpen(false);
      setEditData(null);
      fetchTransactions();
    } catch (error: any) {
      handleError(error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Book Transactions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage book borrowing and returns
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Borrow Book
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrowed At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.user?.name}</div>
                    <div className="text-sm text-gray-500">{transaction.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.book?.title}</div>
                    <div className="text-sm text-gray-500">{transaction.book?.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.borrowed_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.due_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.returned_at
                        ? 'bg-green-100 text-green-800'
                        : new Date(transaction.due_at) < new Date()
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.returned_at
                        ? 'Returned'
                        : new Date(transaction.due_at) < new Date()
                        ? 'Overdue'
                        : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {!transaction.returned_at && (
                      <button
                        onClick={() => handleReturn(transaction.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Return
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditData(transaction);
                        setIsEditModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Borrow Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">Borrow a Book</h2>
            <form onSubmit={handleBorrow}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Book</label>
                  <select
                    value={formData.book_id}
                    onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a book</option>
                    {books
                      .filter((book) => book.available_copies > 0)
                      .map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title} by {book.author}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_at}
                    onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Borrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {isEditModalOpen && editData && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">Edit Transaction</h2>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={editData.due_at.split('T')[0]}
                    onChange={(e) => setEditData({ ...editData, due_at: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditData(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 