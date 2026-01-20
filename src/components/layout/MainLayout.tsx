import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-purple-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black transition-colors duration-300">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 w-full md:ml-64 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-64px)] transition-all">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
