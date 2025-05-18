'use client';

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login"); // Redirect if not logged in
    }
  }, [user]);

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard, {user.name}!</h1>
      <p className="text-lg mb-6">Here’s what we got for you today:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold">📧 Email</h2>
          <p>{user.email}</p>
        </div>

        <div className="bg-green-100 p-4 rounded-xl shadow">
          <h2 className="text-xl font-semibold">🧠 Mood of the Day</h2>
          <p>✨ Slaying bugs, drinking coffee. ✨</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded-xl shadow col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold">📊 Coming Soon</h2>
          <p>You’ll see post analytics, user data, and more here!</p>
        </div>
      </div>
    </div>
  );
}
