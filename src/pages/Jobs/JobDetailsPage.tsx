import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Building2, MapPin, DollarSign, Clock,
  ArrowLeft, Share2, Bookmark, CheckCircle2,
  Users, Calendar, FileText, BarChart2
} from "lucide-react";
import { Button, Card, Badge } from "../../components/ui/BaseComponents";
import toast from "react-hot-toast";

interface Job {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  level: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
  description: string;
  requirements: string[];
  status: string;
  applicationCount: number;
  createdAt: string;
}

import API_BASE_URL from "../../config/api";

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
          credentials: "include"
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setJob(result.data);
        } else {
          toast.error(result.message || "Failed to fetch job details");
          return;
        }

        // Check if user has already applied
        const myAppsRes = await fetch(`${API_BASE_URL}/applications/my`, {
          credentials: "include",
        });
        const myAppsResult = await myAppsRes.json();
        if (myAppsRes.ok && myAppsResult.success) {
          const alreadyApplied = myAppsResult.data.some((app: any) => app.jobId === id);
          setHasApplied(alreadyApplied);
        }
      } catch (err) {
        toast.error("Server error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please login to apply");
      navigate("/login");
      return;
    }

    const resumeUrl = window.prompt("Enter your Resume URL (PDF/Link):", "https://example.com/resume.pdf");

    if (!resumeUrl) return;

    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jobId: id, resumeUrl }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("Application submitted successfully!");
        setHasApplied(true);

        // Refresh job details to show new application count
        const refreshRes = await fetch(`${API_BASE_URL}/jobs/${id}`, { credentials: "include" });
        const refreshResult = await refreshRes.json();
        if (refreshRes.ok && refreshResult.success) {
          setJob(refreshResult.data);
        }
      } else {
        toast.error(result.message || "Failed to apply");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold text-muted-foreground">Job not found</p>
        <Link to="/jobs">
          <Button variant="outline">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/10 pb-20">
      {/* Header / Banner */}
      <div className="bg-background border-b pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-6">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group font-medium">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Job Board
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-secondary border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={32} className="text-muted-foreground/30" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Building2 size={18} className="text-primary" /> {job.company}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={18} /> {job.location}
                  </div>
                  <div className="flex items-center gap-1.5 capitalize">
                    <Clock size={18} /> {job.type}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-12 w-12 p-0">
                <Bookmark size={20} />
              </Button>
              <Button variant="outline" className="h-12 w-12 p-0">
                <Share2 size={20} />
              </Button>
              <Button
                onClick={handleApply}
                disabled={hasApplied}
                className={`h-12 px-8 font-bold shadow-lg transition-all ${hasApplied
                  ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20 shadow-none cursor-not-allowed hover:bg-emerald-500/20"
                  : "shadow-primary/20"
                  }`}
              >
                {hasApplied ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={18} /> Applied
                  </span>
                ) : (
                  "Apply Now"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Job Description
              </h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-primary" />
                Requirements
              </h2>
              <ul className="space-y-4">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Job Overview</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Salary Range</p>
                    <p className="font-bold">${(job.salaryMin ?? 0).toLocaleString()} - ${(job.salaryMax ?? 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BarChart2 size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Job Level</p>
                    <p className="font-bold capitalize">{job.level}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Date Posted</p>
                    <p className="font-bold">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Applications</p>
                    <p className="font-bold">{job.applicationCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t">
                <h4 className="text-sm font-bold mb-4">Skills Required</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <Badge key={i} variant="default" className="px-3 py-1 lowercase">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary text-white border-none shadow-xl shadow-primary/30 text-center">
              <h3 className="text-lg font-bold mb-2">Interested in this role?</h3>
              <p className="text-primary-foreground/80 text-sm mb-6 leading-relaxed">
                Join our team and help us build the future of our company.
              </p>
              <Button
                onClick={handleApply}
                disabled={hasApplied}
                className={`w-full transition-all ${hasApplied
                  ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20 shadow-none cursor-not-allowed"
                  : "bg-white text-primary hover:bg-white/95 border-none shadow-lg"
                  }`}
              >
                {hasApplied ? "Already Applied" : "Apply Now"}
              </Button>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
