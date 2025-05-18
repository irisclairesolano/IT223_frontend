'use client';

import { useAuth } from '@/components/AuthProvider';
import { login } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, setToken } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, user } = await login(username, password);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      router.push('/dashboard');
    } catch (err) {
      alert('Login failed!');
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4 p-6">
      <h1 className="text-2xl font-bold">Login</h1>
      <input
        type="text"  
        placeholder="Username"  
        className="w-full border p-2"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2">Login</button>
    </form>
  );
}
