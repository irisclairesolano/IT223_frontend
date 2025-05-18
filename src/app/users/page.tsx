import { getUsers } from '@/lib/api';
import { User } from '@/types';

export default async function UsersPage() {
  try {
    const users = await getUsers();

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <ul className="space-y-2">
          {users.map((user: User) => (
            <li key={user.id} className="p-3 bg-white rounded shadow">
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <p className="text-red-500">Failed to load users. Please try again later.</p>
      </div>
    );
  }
}
