const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    username: string;
    avatar: string;
  };
  token?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export async function getCsrfToken(): Promise<void> {
  await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  await getCsrfToken();

  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // This sends/receives cookies
    body: JSON.stringify({ username, password } as LoginCredentials),
  });

  if (!res.ok) throw new Error('Login failed');
  return res.json();
}
