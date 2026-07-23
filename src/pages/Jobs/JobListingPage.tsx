import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Badge, Button } from '../../components/ui/BaseComponents';
import { Search, Filter, MapPin, Briefcase, DollarSign, Clock, Plus, X, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from "react-hot-toast";
import API_BASE_URL from "../../config/api";

// ── Types ──────────────────────────────────────────────────────────────────────
type Job = {
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
};

type Filters = {
  level: string;
  type: string;
  company: string;
  salaryMin: string;
  salaryMax: string;
};

const INITIAL_FILTERS: Filters = {
  level: "",
  type: "",
  company: "",
  salaryMin: "",
  salaryMax: "",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const normalize = (str: string) => str.toLowerCase().trim();



const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  return `${Math.floor(days / 7)} weeks ago`;
};

// ── Component ──────────────────────────────────────────────────────────────────
const JobListingPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  // ── Fetch all jobs ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/jobs`, {
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setJobs(result.data);
        } else {
          toast.error(result.message || "Failed to fetch jobs");
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);
  // ── Filter + Search ──────────────────────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // step 1: search with native JS
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter((job) => {
        const title = job.title?.toLowerCase() ?? "";
        const company = job.company?.toLowerCase() ?? "";
        const location = job.location?.toLowerCase() ?? "";
        const skills = job.skills ?? [];

        return (
          title.includes(searchLower) ||
          company.includes(searchLower) ||
          location.includes(searchLower) ||
          skills.some((skill) => skill.toLowerCase().includes(searchLower))
        );
      });
    }





    // step 2: apply category filters
    return result.filter((job) => {
      // level
      if (filters.level && normalize(job.level ?? "") !== normalize(filters.level))
        return false;

      // type
      if (filters.type && normalize(job.type ?? "") !== normalize(filters.type))
        return false;

      // company
      if (filters.company && !normalize(job.company).includes(normalize(filters.company)))
        return false;

      // salary range
      const min = filters.salaryMin ? parseInt(filters.salaryMin) : 0;
      const max = filters.salaryMax ? parseInt(filters.salaryMax) : Infinity;

      const jobMin = job.salaryMin ?? 0;
      const jobMax = job.salaryMax ?? 0;

      // Check if job range overlaps with filter range or if job salary is within range
      if (jobMax < min || jobMin > max) return false;

      return true;
    });
  }, [search, jobs, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const clearFilters = () => setFilters(INITIAL_FILTERS);

  //delete obs 
  const handleDeleteJob = async (id: string) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) return;

    try {

      const res = await fetch(
        `${API_BASE_URL}/jobs/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {

        toast.success("Job deleted successfully");

        // remove deleted job from UI
        setJobs(
          jobs.filter((job: any) => job._id !== id)
        );

      } else {

        toast.error(
          data.message || "Failed to delete job"
        );
      }

    } catch (err) {

      console.error(err);

      toast.error("Server error");
    }
  };


  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Jobs Management</h2>
            <p className="text-muted-foreground">Create, edit and manage your active job postings.</p>
          </div>
          <Button>
            <Link className="flex" to="/post-jobs">
              <Plus size={16} className="mr-2" /> Post New Job
            </Link>
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search jobs by title, company or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} className="mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Filter Jobs</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <X size={12} /> Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                  {/* Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Level</label>
                    <select
                      value={filters.level}
                      onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/50 border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="">All Levels</option>
                      <option value="senior">Senior</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid</option>
                      <option value="lead">Lead</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/50 border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="">All Types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  {/* Company */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      value={filters.company}
                      onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/50 border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  {/* Salary Min */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Min Salary</label>
                    <input
                      type="number"
                      placeholder="e.g. 3000"
                      value={filters.salaryMin}
                      onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/50 border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  {/* Salary Max */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Max Salary</label>
                    <input
                      type="number"
                      placeholder="e.g. 10000"
                      value={filters.salaryMax}
                      onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/50 border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Briefcase size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No jobs found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Job Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:border-primary/30 transition-all cursor-pointer group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Clickable Area */}
                  <Link to={`/job-details/${job._id}`} className="flex items-start gap-4 flex-1 group/job">
                    {/* Company Logo */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary border flex items-center justify-center shrink-0 mt-1 transition-transform group-hover/job:scale-105">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={24} className="text-muted-foreground/20" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold group-hover/job:text-primary transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <Badge variant={
                          job.status === "open" ? "success" :
                            job.status === "closed" ? "error" : "outline"
                        }>
                          {job.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                          <Briefcase size={14} className="text-primary" /> {job.company}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} /> {job.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={14} /> ${(job.salaryMin ?? 0).toLocaleString()} - ${(job.salaryMax ?? 0).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} /> Posted {timeAgo(job.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-8 border-l pl-8 h-12 hidden md:flex shrink-0">
                    <div className="text-center">
                      <p className="text-xl font-bold">{job.applicationCount || 0}</p>
                      <p className="text-[10px] uppercase text-muted-foreground font-bold">Applications</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/edit-job/${job._id}`}>
                        <Button variant="outline" className="h-9">Edit</Button>
                      </Link>

                      <Button onClick={() => handleDeleteJob(job._id)} variant="outline" className="h-9">Delete</Button>
                    </div>
                  </div>

                </div>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default JobListingPage;