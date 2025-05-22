'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/config';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, BookOpenIcon, UserIcon, HashtagIcon, TagIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

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
    console.error('Error details:', error);
    let errorMessage = 'Failed to fetch books';
    if (error.response) {
      switch (error.response.status) {
        case 404: errorMessage = 'API endpoint not found'; break;
        case 401: errorMessage = 'Unauthorized'; break;
        case 403: errorMessage = 'Access forbidden'; break;
        case 422: errorMessage = error.response.data.message || 'Validation error'; break;
        default: errorMessage = `Error: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = 'No response from server';
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Stats Section with Animation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { icon: BookOpenIcon, value: stats.totalBooks, label: 'Total Books', color: 'bg-blue-100 text-blue-800' },
          { icon: BookmarkIcon, value: stats.totalCopies, label: 'Total Copies', color: 'bg-purple-100 text-purple-800' },
          { icon: BookOpenIcon, value: stats.availableCopies, label: 'Available Copies', color: 'bg-green-100 text-green-800' },
          { icon: TagIcon, value: stats.uniqueGenres, label: 'Unique Genres', color: 'bg-amber-100 text-amber-800' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            className={`p-4 rounded-xl shadow-md ${stat.color} transition-all duration-200`}
          >
            <div className="flex items-center">
              <stat.icon className="h-8 w-8 mr-3" />
              <div>
                <p className="text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Header with Add Book Button */}
      <div className="flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-800"
        >
          Books Management
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Book
        </motion.button>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search books by title, author, ISBN, or genre..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </motion.div>

      {/* Error/Empty State */}
      {error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-red-50 rounded-lg"
        >
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-sm text-gray-500 mt-2">API URL: {API_ENDPOINTS.books}</p>
        </motion.div>
      ) : filteredBooks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gray-50 rounded-lg"
        >
          <p className="text-gray-500">
            {searchQuery ? 'No books found matching your search.' : 'No books found in the database.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Author', 'ISBN', 'Genre', 'Copies', 'Actions'].map((header, index) => (
                    <th 
                      key={header}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        index === 0 ? 'rounded-tl-xl' : ''
                      } ${index === 5 ? 'rounded-tr-xl' : ''}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <motion.tr
                    key={book.id}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                    className="transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BookOpenIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-purple-500 mr-2" />
                        <div className="text-sm text-gray-500">{book.author}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <HashtagIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <div className="text-sm text-gray-500 font-mono">{book.isbn}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TagIcon className="h-5 w-5 text-amber-500 mr-2" />
                        <div className="text-sm text-gray-500">{book.genre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          book.available_copies > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {book.available_copies}/{book.total_copies}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(book)}
                          className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(book.id)}
                          className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'Title', name: 'title', icon: BookOpenIcon },
                  { label: 'Author', name: 'author', icon: UserIcon },
                  { label: 'ISBN', name: 'isbn', icon: HashtagIcon },
                  { label: 'Genre', name: 'genre', icon: TagIcon },
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
                        type="text"
                        value={formData[field.name as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
                    <input
                      type="number"
                      value={formData.total_copies}
                      onChange={(e) => {
                        const total = parseInt(e.target.value);
                        setFormData({ 
                          ...formData, 
                          total_copies: total,
                          available_copies: Math.min(formData.available_copies, total)
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Copies</label>
                    <input
                      type="number"
                      value={formData.available_copies}
                      onChange={(e) => {
                        const available = parseInt(e.target.value);
                        setFormData({ 
                          ...formData, 
                          available_copies: Math.min(available, formData.total_copies)
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="0"
                      max={formData.total_copies}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    {editingBook ? 'Update Book' : 'Add Book'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}