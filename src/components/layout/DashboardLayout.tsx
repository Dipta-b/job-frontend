import React from 'react';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center justify-between px-8 sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-semibold hidden md:block">Welcome back, {user?.name || 'Guest'}!</h1>
          </div>

          <div className="flex items-center gap-3">


            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </button>

            <div className="h-8 w-px bg-border mx-2" />

            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border hover:bg-secondary transition-colors group">
              <span className="text-sm font-medium ml-2">Quick Actions</span>
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                <Search size={14} />
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
