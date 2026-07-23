import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, Badge, Button } from "../../components/ui/BaseComponents";
import { 
  FileText, Clock, Building2, MapPin, ExternalLink, 
  Briefcase, Search, AlertCircle, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API_BASE_URL from "../../config/api";

interface Application {
  _id: string;
  status: "Applied" | "Interview" | "Rejected" | "Hired";
  createdAt: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    companyLogo?: string;
  };
  resumeUrl: string;
}

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/applications/my`, {
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setApplications(Array.isArray(result.data) ? result.data : []);
        } else {
          toast.error(result.message || "Failed to fetch applications");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchMyApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Interview": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Hired": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const filteredApps = applications.filter(app => 
    app.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
    app.job?.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">My Applications</h2>
            <p className="text-muted-foreground">Keep track of your active job applications and their current status.</p>
          </div>
          <div className="flex -space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                 {i}
               </div>
             ))}
          </div>
        </div>

        {/* Search/Filter Bar */}
        <div className="relative group max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search my applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/50 focus:border-primary/50 outline-none transition-all"
          />
        </div>

        {loading ? (
          <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center p-12 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/50">
            <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mb-6">
              <Briefcase size={40} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              Start your career journey by browsing thousands of available jobs today.
            </p>
            <Button className="px-8 h-12 text-lg shadow-xl shadow-primary/20" onClick={() => window.location.href = '/jobs'}>
              Explore Jobs
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredApps.map((app, i) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:border-primary/30 transition-all overflow-hidden p-0 border border-border/40 group">
                    <div className="flex flex-col lg:flex-row items-stretch">
                      {/* Left: Job Info */}
                      <div className="p-6 flex-1 flex items-start gap-5 border-b lg:border-b-0 lg:border-r border-border/40 bg-background group-hover:bg-secondary/5 transition-colors">
                        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shrink-0 border border-border/50 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                          {app.job?.companyLogo ? (
                            <img src={app.job.companyLogo} alt={app.job?.company} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 size={28} className="text-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{app.job?.title || "Unknown Position"}</h3>
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5 text-foreground/80">
                              <Building2 size={14} className="text-primary" /> {app.job?.company || "Unknown Company"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} /> {app.job?.location || "Remote"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Status & Time */}
                      <div className="px-8 py-5 lg:py-6 flex flex-row lg:flex-col justify-between lg:justify-center items-center gap-4 bg-secondary/20 lg:min-w-[200px]">
                        <div className="flex flex-col items-center gap-1.5">
                            <Badge className={`px-5 py-1.5 uppercase text-[10px] font-black tracking-widest ${getStatusColor(app.status)} shadow-sm`}>
                            {app.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-bold">
                          <Clock size={12} />
                          {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="p-6 flex items-center justify-center lg:min-w-[180px] bg-background">
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button variant="outline" className="w-full gap-2.5 h-11 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all font-bold">
                            <FileText size={18} /> Resume <ExternalLink size={14} />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {filteredApps.length === 0 && search && (
                 <div className="text-center py-12">
                   <p className="text-muted-foreground">No applications match your search "{search}"</p>
                 </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplicationsPage;
