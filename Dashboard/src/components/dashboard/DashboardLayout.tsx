import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ProtectedRoute } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useIsMobile();

  // Initialize theme: default is light mode (system), only use dark if user chose dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle dark mode toggle
  const handleDarkModeToggle = (isDark: boolean) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          collapsed={collapsed} 
          toggleCollapse={() => setCollapsed(!collapsed)} 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar
            setDarkMode={handleDarkModeToggle} 
            isDarkMode={isDarkMode} 
          />
          <main className="flex-1 overflow-y-auto p-4 bg-muted/20">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;