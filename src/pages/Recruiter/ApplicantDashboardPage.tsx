import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, Button } from "../../components/ui/BaseComponents";
import {
  Search, FileText, ExternalLink, Clock, Mail, Briefcase,
  AlertCircle, Loader2, TrendingUp, BarChart3, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, BarChart, Bar, XAxis, Tooltip,
  Cell
} from 'recharts';

interface Application {
  _id: string;
  status: "Applied" | "Interview" | "Rejected" | "Hired";
  createdAt: string;
  resumeUrl: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  job: {
    _id: string;
    title: string;
    company: string;
  };
  score?: number; // AI Score added for Step 9
}

import API_BASE_URL from "../../config/api";

const ApplicantDashboardPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/applications/all`, {
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setApplications(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch applicants");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchApplications();
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(`Application deleted successfully`);
        fetchApplications();
      } else {
        toast.error(result.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setUpdatingId(null);
    }
  }

  const sortedApplicants = [...applications].sort((a, b) => {
    if (sortBy === "score") return (b.score || 0) - (a.score || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredApplicants = sortedApplicants.filter(app => {
    const candidateName = app.candidate?.name?.toLowerCase() || "";
    const candidateEmail = app.candidate?.email?.toLowerCase() || "";
    const jobTitle = app.job?.title?.toLowerCase() || "";
    const s = search.toLowerCase();

    return candidateName.includes(s) || candidateEmail.includes(s) || jobTitle.includes(s);
  });

  // Data for Visualizations (Step 10)
  const radarData = applications.length > 0 ? [
    { subject: 'React', A: 120, fullMark: 150 },
    { subject: 'Node.js', A: 98, fullMark: 150 },
    { subject: 'TypeScript', A: 86, fullMark: 150 },
    { subject: 'AWS', A: 99, fullMark: 150 },
    { subject: 'Docker', A: 85, fullMark: 150 },
    { subject: 'System Design', A: 65, fullMark: 150 },
  ] : [];

  const scoreDistribution = [
    { range: '90-100', count: applications.filter(a => (a.score || 0) >= 90).length },
    { range: '80-89', count: applications.filter(a => (a.score || 0) >= 80 && (a.score || 0) < 90).length },
    { range: '70-79', count: applications.filter(a => (a.score || 0) >= 70 && (a.score || 0) < 80).length },
    { range: '<70', count: applications.filter(a => (a.score || 0) < 70).length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">

        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
              <TrendingUp size={14} />
              Recruiter Intelligence v4.0
            </div>
            <h2 className="text-4xl font-black tracking-tighter">Candidate Ranking</h2>
            <p className="text-muted-foreground text-lg">AI-powered applicant scoring and talent distribution analytics.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setSortBy("score")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sortBy === "score" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Rank by Score
              </button>
              <button
                onClick={() => setSortBy("date")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sortBy === "date" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Most Recent
              </button>
            </div>
          </div>
        </div>

        {/* VISUALIZATION GRID (Step 10) */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 col-span-1 border-primary/10">
              <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target size={14} className="text-primary" />
                Top Skills Match
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid strokeOpacity={0.1} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Radar name="Candidates" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 col-span-1 lg:col-span-2 border-primary/10">
              <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 size={14} className="text-purple-500" />
                Match Score Distribution
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <XAxis dataKey="range" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {scoreDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search candidates, emails or positions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-5 rounded-3xl bg-card border border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-xl shadow-primary/5 text-lg font-medium"
          />
        </div>

        {loading ? (
          <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Syncing recruiting database...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-card rounded-2xl border border-dashed border-border/50">
            <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold">No talent matched</h3>
            <p className="text-muted-foreground max-w-xs mt-1">
              Refine your search parameters or check back later for new applicants.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredApplicants.map((app, i) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card className="group hover:border-primary/40 transition-all shadow-sm hover:shadow-2xl hover:shadow-primary/10 overflow-hidden p-0 border border-border/40 relative">

                    {/* RANKING BADGE (Step 9) */}
                    <div className="absolute top-0 right-0 p-1 px-3 bg-primary text-white text-[10px] font-black rounded-bl-xl shadow-md z-10 transition-transform group-hover:scale-110">
                      TOP MATCH: {app.score}%
                    </div>

                    <div className="flex flex-col xl:flex-row">
                      {/* Section 1: Candidate Profile */}
                      <div className="p-6 flex-1 flex items-start gap-4 border-b xl:border-b-0 xl:border-r border-border/50">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-black text-3xl shrink-0 group-hover:rotate-6 transition-transform duration-500">
                          {app.candidate?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h3 className="text-xl font-black group-hover:text-primary transition-colors truncate">
                            {app.candidate?.name || "Unknown Candidate"}
                          </h3>
                          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground font-semibold">
                            <span className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
                              <Mail size={14} className="text-primary/60" /> {app.candidate?.email}
                            </span>
                            <span className="flex items-center gap-2 truncate">
                              <Briefcase size={14} className="text-primary/60" />
                              Applying for: <span className="text-foreground font-bold">{app.job?.title}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Score Breakdown (Step 9 Preview) */}
                      <div className="px-8 py-6 flex-1 flex flex-col md:flex-row items-center justify-between gap-6 bg-secondary/5 group-hover:bg-primary/[0.02] transition-colors">
                        <div className="flex flex-col items-center md:items-start gap-2.5">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Candidate Quality</p>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${app.score}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="h-full bg-primary"
                              />
                            </div>
                            <span className="text-sm font-black text-primary">{app.score}%</span>
                          </div>
                        </div>

                        <div className="w-full md:w-auto h-px md:h-12 bg-border/50" />

                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                          <Button variant="outline" className="w-full gap-2.5 border-primary/20 hover:bg-primary hover:text-white transition-all font-black h-12 px-6 rounded-xl">
                            <FileText size={18} /> Deep View <ExternalLink size={14} />
                          </Button>
                        </a>
                      </div>

                      {/* Section 3: AI Actions */}
                      <div className="p-6 flex flex-wrap xl:flex-col justify-center items-center gap-3 xl:min-w-[240px] border-t xl:border-t-0 xl:border-l border-border/50 bg-background/50 backdrop-blur-md">
                        {updatingId === app._id ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 size={24} className="animate-spin text-primary" />
                            <span className="text-[10px] font-bold text-primary animate-pulse uppercase tracking-[0.3em]">Processing</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex xl:w-full gap-2">
                              <Button
                                onClick={() => handleUpdateStatus(app._id, "Interview")}
                                className="px-3 h-11 text-xs flex-1 bg-purple-600 hover:bg-purple-700 border-none shadow-xl shadow-purple-500/30 font-black rounded-xl"
                              >
                                Interview
                              </Button>
                              <Button
                                onClick={() => handleUpdateStatus(app._id, "Hired")}
                                className="px-3 h-11 text-xs flex-1 bg-emerald-600 hover:bg-emerald-700 border-none shadow-xl shadow-emerald-500/30 font-black rounded-xl"
                              >
                                Hire
                              </Button>
                            </div>
                            <Button
                              onClick={() => handleReject(app._id)}
                              variant="outline"
                              className="w-full h-11 text-xs border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/40 font-black rounded-xl transition-all"
                            >
                              Reject Profile
                            </Button>
                          </>
                        )}
                        <div className="text-[10px] text-muted-foreground/80 mt-3 flex items-center gap-1.5 font-bold">
                          <Clock size={12} className="text-primary/40" />
                          <span>APPLIED {new Date(app.createdAt).toLocaleDateString().toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicantDashboardPage;
