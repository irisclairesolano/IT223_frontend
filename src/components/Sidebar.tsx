'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpenIcon, 
  UsersIcon, 
  HomeIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  XMarkIcon,
  Bars3BottomLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Books', href: '/books', icon: BookOpenIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
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
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Sidebar Header */}
        <div className={`flex h-16 items-center justify-between border-b border-gray-700 px-4 ${isCollapsed ? 'flex-col justify-center space-y-1' : ''}`}>
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white whitespace-nowrap">
              Library Admin
            </h1>
          )}
          <button 
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronDoubleRightIcon className="h-5 w-5" />
            ) : (
              <ChevronDoubleLeftIcon className="h-5 w-5" />
            )}
          </button>
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
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <div className="relative">
                  <item.icon
                    className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 flex-shrink-0 transition-transform duration-200 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-400 group-hover:text-white'
                    }`}
                    aria-hidden="true"
                  />
                  {isActive && (
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full"></span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="transition-all duration-200 group-hover:font-semibold">
                    {item.name}
                  </span>
                )}
                {(isCollapsed && isHovering) && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap z-50">
                    {item.name}
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
            className={`group flex items-center w-full ${isCollapsed ? 'justify-center px-0' : 'px-2'} py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out`}
            title={isCollapsed ? "Logout" : ""}
          >
            <ArrowRightOnRectangleIcon
              className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-white transition-transform duration-200`}
              aria-hidden="true"
            />
            {!isCollapsed && (
              <span className="transition-all duration-200 group-hover:font-semibold">
                Logout
              </span>
            )}
            {(isCollapsed && isHovering) && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}