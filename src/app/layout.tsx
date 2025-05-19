// app/page.tsx
import { redirect } from "next/navigation";
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/AuthContext'
import Sidebar from '@/components/Sidebar'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Library Information System',
  description: 'A modern library management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          <div className="flex h-full bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
