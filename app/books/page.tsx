'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/config';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
    fetchBooks();
  }, []);

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
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.books);
      setBooks(response.data);
      setFilteredBooks(response.data);
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
    
    let errorMessage = 'Failed to fetch books';
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

  const stats = {
    totalBooks: books.length,
    totalCopies: books.reduce((sum, book) => sum + book.total_copies, 0),
    availableCopies: books.reduce((sum, book) => sum + book.available_copies, 0),
    uniqueGenres: new Set(books.map(book => book.genre)).size,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Books</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalBooks}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Copies</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalCopies}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Available Copies</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.availableCopies}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Unique Genres</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.uniqueGenres}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Books Management</h1>
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
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Book
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
          placeholder="Search books by title, author, ISBN, or genre..."
          className="input-field pl-10 w-full"
        />
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-gray-500 mt-2">API URL: {API_ENDPOINTS.books}</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery ? 'No books found matching your search.' : 'No books found in the database.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Copies</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{book.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{book.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{book.isbn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{book.genre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      book.available_copies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {book.available_copies} of {book.total_copies}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(book)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
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
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Genre</label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Copies</label>
                <input
                  type="number"
                  value={formData.total_copies}
                  onChange={(e) => {
                    const total = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      total_copies: total,
                      available_copies: Math.min(formData.available_copies, total) // Ensure available doesn't exceed total
                    });
                  }}
                  className="input-field mt-1"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available Copies</label>
                <input
                  type="number"
                  value={formData.available_copies}
                  onChange={(e) => {
                    const available = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      available_copies: Math.min(available, formData.total_copies) // Ensure available doesn't exceed total
                    });
                  }}
                  className="input-field mt-1"
                  min="0"
                  max={formData.total_copies}
                  required
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
                  {editingBook ? 'Update' : 'Add'} Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 