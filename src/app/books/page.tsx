'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/config';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  total_copies: number;
  available_copies: number;
  created_at: string;
  updated_at: string;
}

export default function BooksPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    total_copies: 1,
    available_copies: 1,
  });

  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, authLoading });
    if (!authLoading) {
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login...');
        router.replace('/login');
        return;
      }
      console.log('Authenticated, fetching books...');
      fetchBooks();
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Filter books based on search query
    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  const fetchBooks = async () => {
    try {
      console.log('Fetching books...');
      setLoading(true);
      setError(null);
      const response = await axios.get(API_ENDPOINTS.books);
      console.log('Books response:', response.data);
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error: any) {
      console.error('Error fetching books:', error);
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
    
    let errorMessage = 'Failed to fetch books';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await axios.put(`${API_ENDPOINTS.books}/${editingBook.id}`, formData);
        toast.success('Book updated successfully');
      } else {
        await axios.post(API_ENDPOINTS.books, formData);
        toast.success('Book added successfully');
      }
      setIsModalOpen(false);
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        total_copies: 1,
        available_copies: 1,
      });
      fetchBooks();
    } catch (error: any) {
      handleError(error);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      total_copies: book.total_copies,
      available_copies: book.available_copies,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`${API_ENDPOINTS.books}/${id}`);
        toast.success('Book deleted successfully');
        fetchBooks();
      } catch (error: any) {
        handleError(error);
      }
    }
  };

  if (authLoading) {
    console.log('Auth loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, returning null...');
    return null;
  }

  if (loading) {
    console.log('Loading books...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log('Rendering books page with', books.length, 'books');
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Books Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your library's book collection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Books</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{books.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Copies</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {books.reduce((sum, book) => sum + book.total_copies, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Available Copies</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {books.reduce((sum, book) => sum + book.available_copies, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Unique Genres</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {new Set(books.map(book => book.genre)).size}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button
          onClick={() => {
            setEditingBook(null);
            setFormData({
              title: '',
              author: '',
              isbn: '',
              genre: '',
              total_copies: 1,
              available_copies: 1,
            });
            setIsModalOpen(true);
          }}
          className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Book
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredBooks.map((book) => (
              <li key={book.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                    <p className="text-sm text-gray-500">by {book.author}</p>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="mr-4">ISBN: {book.isbn}</span>
                      <span className="mr-4">Genre: {book.genre}</span>
                      <span>Available: {book.available_copies}/{book.total_copies}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    // Allow letters, numbers, spaces, and common punctuation
                    const value = e.target.value;
                    if (/^[A-Za-z0-9\s\-.,!?'&quot;()]*$/.test(value)) {
                      setFormData({ ...formData, title: value });
                    }
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  pattern="[A-Za-z0-9\s\-.,!?'&quot;()]*"
                  title="Please enter a valid book title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => {
                    // Allow letters, spaces, hyphens, and apostrophes for author names
                    const value = e.target.value;
                    if (/^[A-Za-z\s\-']*$/.test(value)) {
                      setFormData({ ...formData, author: value });
                    }
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  pattern="[A-Za-z\s\-']*"
                  title="Please enter a valid author name (letters, spaces, hyphens, and apostrophes only)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => {
                    // Allow only numbers and hyphens for ISBN
                    const value = e.target.value;
                    if (/^[0-9\-]*$/.test(value)) {
                      setFormData({ ...formData, isbn: value });
                    }
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  pattern="[0-9\-]*"
                  title="Please enter a valid ISBN (numbers and hyphens only)"
                  maxLength={13}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Genre</label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => {
                    // Allow letters, spaces, and hyphens for genre
                    const value = e.target.value;
                    if (/^[A-Za-z\s\-]*$/.test(value)) {
                      setFormData({ ...formData, genre: value });
                    }
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  pattern="[A-Za-z\s\-]*"
                  title="Please enter a valid genre (letters, spaces, and hyphens only)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Copies</label>
                  <input
                    type="number"
                    value={formData.total_copies}
                    onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Available Copies</label>
                  <input
                    type="number"
                    value={formData.available_copies}
                    onChange={(e) => setFormData({ ...formData, available_copies: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                    max={formData.total_copies}
                    required
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                >
                  {editingBook ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
