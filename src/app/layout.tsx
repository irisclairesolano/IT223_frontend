// app/layout.tsx
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/AuthContext'
import Sidebar from '@/components/Sidebar'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // better font loading behavior
  variable: '--font-inter', // CSS variable for flexibility
})

export const metadata: Metadata = {
  title: {
    default: 'Library Information System',
    template: '%s | Library Information System' // dynamic title for child pages
  },
  description: 'A modern library management system',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), // for proper canonical URLs
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans h-full antialiased bg-gray-50`}>
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}