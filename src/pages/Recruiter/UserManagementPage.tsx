import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, Mail, Loader2, ArrowDownCircle } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui/BaseComponents';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

import API_BASE_URL from '../../config/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'recruiter' | 'admin' | 'candidate';
  status: string;
  image?: string;
}

const UserManagementPage = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        credentials: 'include',
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setUsers(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
    setUpdatingId(targetUserId);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/${targetUserId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include',
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(result.message || `User updated to ${newRole}`);
        
        // If updating self, refresh the auth context to update UI immediately
        if (targetUserId === currentUser?._id) {
          await refreshUser();
        }
        
        fetchUsers();
      } else {
        toast.error(result.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge variant="ai" className="bg-red-500/10 text-red-500 border-red-500/20">Admin</Badge>;
      case 'recruiter': return <Badge variant="ai" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Recruiter</Badge>;
      default: return <Badge variant="outline">User</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage user roles and system permissions.</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 flex items-center gap-2">
          <Shield className="text-primary" size={18} />
          <span className="text-sm font-medium">Logged in as: <span className="font-bold uppercase">{currentUser?.role}</span></span>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence>
                {users.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{u.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail size={12} />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {updatingId === u._id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                          <>
                            {/* DEMOTE TO USER - Available to Admin (for anyone) and Recruiter (for other recruiters) */}
                            {u.role !== 'user' && u.role !== 'candidate' && (
                              <Button
                                variant="outline"
                                className="h-8 px-3 text-xs gap-1.5 border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                                onClick={() => handleUpdateRole(u._id, 'user')}
                                disabled={
                                  (currentUser?.role === 'recruiter' && u.role === 'admin') ||
                                  (currentUser?._id === u._id && u.role === 'admin')
                                }
                              >
                                <ArrowDownCircle size={14} /> Demote
                              </Button>
                            )}

                            {/* MAKE RECRUITER - Available to Admin (for anyone not recruiter) and Recruiter (for users) */}
                            {u.role !== 'recruiter' && (
                              <Button
                                variant="outline"
                                className="h-8 px-3 text-xs gap-1.5 border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-500"
                                onClick={() => handleUpdateRole(u._id, 'recruiter')}
                                disabled={
                                  (currentUser?.role === 'recruiter' && u.role === 'admin')
                                }
                              >
                                <ShieldCheck size={14} /> Make Recruiter
                              </Button>
                            )}

                            {/* MAKE ADMIN - Available to Admin only */}
                            {currentUser?.role === 'admin' && u.role !== 'admin' && (
                              <Button
                                variant="outline"
                                className="h-8 px-3 text-xs gap-1.5 border-primary/20 hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleUpdateRole(u._id, 'admin')}
                              >
                                <Shield size={14} /> Make Admin
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UserManagementPage;
