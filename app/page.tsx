import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Books Management</h2>
              <p className="text-gray-600 mb-4">Manage your library's book collection, add new books, and track their availability.</p>
              <Link href="/books" className="btn-primary inline-block">
                View Books
              </Link>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">User Management</h2>
              <p className="text-gray-600 mb-4">Register new users, view user details, and manage user accounts.</p>
              <Link href="/users" className="btn-primary inline-block">
                View Users
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 