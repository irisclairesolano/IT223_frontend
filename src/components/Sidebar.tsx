'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpenIcon, 
  UsersIcon, 
  HomeIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3BottomLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Books', href: '/books', icon: BookOpenIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Transactions', href: '/transactions', icon: ChartBarIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't show sidebar on login page
  if (pathname === '/login') {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const mobileSidebarClass = isMobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {isMobileOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3BottomLeftIcon className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative h-screen flex flex-col bg-gray-800 transition-all duration-300 ease-in-out ${sidebarWidth} ${mobileSidebarClass} md:translate-x-0 z-40`}
        onMouseEnter={() => {
          setIsHovering(true);
          setIsCollapsed(false); // Expand on hover
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          setIsCollapsed(true); // Collapse when mouse leaves
        }}
      >
        {/* Sidebar Header - Simplified since we removed the toggle button */}
        <div className={`flex h-16 items-center justify-center border-b border-gray-700 px-4`}>
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white whitespace-nowrap">
              Library Admin
            </h1>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-2'} py-3 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md hover:translate-x-1'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <div className="relative">
                  <item.icon
                    className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 flex-shrink-0 transition-all duration-300 ${
                      isActive 
                        ? 'text-white scale-110' 
                        : 'text-gray-400 group-hover:text-white group-hover:scale-110'
                    }`}
                    aria-hidden="true"
                  />
                  {isActive && (
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full transition-all duration-300 group-hover:h-8"></span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="transition-all duration-300 group-hover:font-semibold group-hover:tracking-wide">
                    {item.name}
                  </span>
                )}
                {(isCollapsed && isHovering) && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap z-50 transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:ml-3">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-solid border-t-transparent border-b-transparent border-r-gray-900"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={() => {
              logout();
              setIsMobileOpen(false);
            }}
            className={`group flex items-center w-full ${isCollapsed ? 'justify-center px-0' : 'px-2'} py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300 ease-in-out hover:translate-x-1`}
            title={isCollapsed ? "Logout" : ""}
          >
            <ArrowRightOnRectangleIcon
              className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-300`}
              aria-hidden="true"
            />
            {!isCollapsed && (
              <span className="transition-all duration-300 group-hover:font-semibold group-hover:tracking-wide">
                Logout
              </span>
            )}
            {(isCollapsed && isHovering) && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap z-50 transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:ml-3">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-solid border-t-transparent border-b-transparent border-r-gray-900"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}