import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileSearch,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { cn } from '../../utils/utils';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  collapsed: boolean;
  active: boolean;
  badge?: number;
}

const SidebarItem = ({ icon: Icon, label, href, collapsed, active, badge }: SidebarItemProps) => {
  return (
    <Link to={href}>
      <motion.div
        whileHover={{ x: 4 }}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative mb-1",
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        {active && (
          <motion.div
            layoutId="active-nav"
            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
          />
        )}
        <div className="relative">
          <Icon size={20} className={cn(active ? "text-primary" : "")} />
          {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="whitespace-nowrap flex-1"
          >
            {label}
          </motion.span>
        )}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span className="ml-auto text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const isRecruiterOrAdmin = user?.role === 'recruiter' || user?.role === 'admin';

  // Poll unread notification count every 30 seconds
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          const count = data.data.filter((n: any) => !n.isRead).length;
          setUnreadCount(count);
        }
      } catch {
        // silently fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Reset badge when visiting notifications page
  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Briefcase, label: 'Jobs', href: '/jobs' },
    ...(isRecruiterOrAdmin ? [
      { icon: ClipboardList, label: 'Applicants', href: '/applicants' },
      { icon: Users, label: 'Candidates', href: '/candidates' }
    ] : []),
    ...(!isRecruiterOrAdmin ? [
      { icon: UserCheck, label: 'My Applications', href: '/my-applications' }
    ] : []),
    { icon: FileSearch, label: 'Resume Analyzer', href: '/resume-analyzer' },
    { icon: Calendar, label: 'Interviews', href: '/interviews' },
  ];

  const bottomItems = [
    { icon: Bell, label: 'Notifications', href: '/notifications', badge: unreadCount },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      className={cn(
        "h-screen sticky top-0 bg-background border-r flex flex-col z-50",
        collapsed ? "items-center" : "px-4"
      )}
    >
      <div className="flex items-center justify-between h-16 mb-4">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 font-bold text-xl gradient-text"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              A
            </div>
            ATS Pro
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg border bg-card hover:bg-secondary text-muted-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border-none focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              collapsed={collapsed}
              active={location.pathname === item.href}
            />
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className={cn("text-xs font-semibold text-muted-foreground mb-4 px-3", collapsed && "text-center")}>
            {collapsed ? "•••" : "SYSTEM"}
          </p>
          <div className="space-y-1">
            {bottomItems.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
                collapsed={collapsed}
                active={location.pathname === item.href}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-3")}>
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Guest"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || "Guest Email"}</p>
            </div>
          )}
          {!collapsed && <LogOut onClick={logout} className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors" size={18} />}
        </div>
      </div>
    </motion.aside>
  );
};
