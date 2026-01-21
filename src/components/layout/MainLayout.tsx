import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSidebar } from '../../contexts/SidebarContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black transition-colors duration-300">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main 
          className={`
            flex-1 w-full p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-64px)] 
            transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            will-change-[margin-left]
            ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
