import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, BriefcaseIcon, CalendarCheck, Loader2, CheckCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Button, Badge } from '../../components/ui/BaseComponents';
import API_BASE_URL from '../../config/api';
import toast from 'react-hot-toast';
import { cn } from '../../utils/utils';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'APPLICATION' | 'INTERVIEW' | 'SYSTEM';
    link: string;
    isRead: boolean;
    createdAt: string;
    sender?: { name: string };
}

const typeIcon = (type: Notification['type']) => {
    switch (type) {
        case 'INTERVIEW': return <CalendarCheck size={18} className="text-blue-500" />;
        case 'APPLICATION': return <BriefcaseIcon size={18} className="text-primary" />;
        default: return <Bell size={18} className="text-muted-foreground" />;
    }
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setNotifications(data.data);
        } catch (err) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const markRead = async (id: string) => {
        try {
            await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                credentials: 'include'
            });
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch { toast.error('Failed to mark as read'); }
    };

    const markAllRead = async () => {
        try {
            await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'POST',
                credentials: 'include'
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch { toast.error('Failed to mark all as read'); }
    };

    const deleteOne = async (id: string) => {
        try {
            await fetch(`${API_BASE_URL}/notifications/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch { toast.error('Failed to delete notification'); }
    };

    const clearAll = async () => {
        if (!confirm('Clear all notifications?')) return;
        try {
            await fetch(`${API_BASE_URL}/notifications`, {
                method: 'DELETE',
                credentials: 'include'
            });
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch { toast.error('Failed to clear notifications'); }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <DashboardLayout>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-sm font-semibold bg-primary text-primary-foreground rounded-full px-2.5 py-0.5">
                                    {unreadCount} new
                                </span>
                            )}
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Stay updated on your applications, interviews, and system alerts.
                        </p>
                    </div>
                    {notifications.length > 0 && (
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <Button variant="outline" onClick={markAllRead} className="gap-2">
                                    <CheckCheck size={16} /> Mark all read
                                </Button>
                            )}
                            <Button variant="ghost" onClick={clearAll} className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 size={16} /> Clear all
                            </Button>
                        </div>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : notifications.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-20 border-dashed">
                        <Bell className="w-12 h-12 text-muted-foreground/40 mb-4" />
                        <h3 className="font-semibold text-muted-foreground">You're all caught up!</h3>
                        <p className="text-sm text-muted-foreground/60 mt-1">No notifications yet. Check back later.</p>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence>
                            {notifications.map((n, i) => (
                                <motion.div
                                    key={n._id}
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 40 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    <div className={cn(
                                        "group flex items-start gap-4 p-4 rounded-xl border transition-all",
                                        n.isRead
                                            ? "bg-card border-border/50 opacity-70"
                                            : "bg-primary/5 border-primary/20 shadow-sm"
                                    )}>
                                        {/* Icon */}
                                        <div className={cn(
                                            "mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                            n.isRead ? "bg-secondary" : "bg-primary/10"
                                        )}>
                                            {typeIcon(n.type)}
                                        </div>

                                        {/* Text */}
                                        <Link
                                            to={n.link || '/dashboard'}
                                            onClick={() => !n.isRead && markRead(n._id)}
                                            className="flex-1 min-w-0"
                                        >
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className={cn("text-sm font-semibold", !n.isRead && "text-foreground")}>
                                                    {n.title}
                                                </p>
                                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize">
                                                    {n.type.toLowerCase()}
                                                </Badge>
                                                {!n.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                                                {n.message}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground/60 mt-1">
                                                {new Date(n.createdAt).toLocaleString(undefined, {
                                                    dateStyle: 'medium', timeStyle: 'short'
                                                })}
                                                {n.sender?.name && ` · from ${n.sender.name}`}
                                            </p>
                                        </Link>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!n.isRead && (
                                                <button
                                                    title="Mark as read"
                                                    onClick={() => markRead(n._id)}
                                                    className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                                >
                                                    <Check size={15} />
                                                </button>
                                            )}
                                            <button
                                                title="Delete"
                                                onClick={() => deleteOne(n._id)}
                                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
