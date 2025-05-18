import { LoginResponse, User } from '@/types';

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getCsrfToken() {
  await fetch(`${API}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  await getCsrfToken();
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error('Login failed');
  }

  return res.json();
}

export async function fetchUser(token: string): Promise<User> {
  const res = await fetch(`${API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Unauthorized');
  }

  return res.json();
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API}/users`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }

  return res.json();
}
