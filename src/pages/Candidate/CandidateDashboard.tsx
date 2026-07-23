import { useState, useEffect } from 'react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Briefcase, Calendar, FileText } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui/BaseComponents';
import { motion } from 'framer-motion';
import API_BASE_URL from '../../config/api';
import { Link } from 'react-router-dom';

const CandidateDashboard = () => {
  const [stats, setStats] = useState({
    jobsApplied: 0,
    jobsInMarket: 0,
    interviewsScheduled: 0,
  });
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        // 1. Fetch my applications
        const appsRes = await fetch(`${API_BASE_URL}/applications/my`, { credentials: 'include' });
        const appsData = await appsRes.json();

        // 2. Fetch jobs count in market
        const jobsCountRes = await fetch(`${API_BASE_URL}/jobs/count`, { credentials: 'include' });
        const jobsCountData = await jobsCountRes.json();

        // 3. Fetch my interviews
        const interviewsRes = await fetch(`${API_BASE_URL}/interviews`, { credentials: 'include' });
        const interviewsData = await interviewsRes.json();

        let appliedCount = 0;
        let recentApps = [];
        if (appsData.success && Array.isArray(appsData.data)) {
          appliedCount = appsData.data.length;
          recentApps = appsData.data.slice(0, 5); // Take up to 5 recent applications
        }

        let scheduledInterviews = 0;
        if (interviewsData.success && Array.isArray(interviewsData.data)) {
          // Count only active/scheduled or rescheduled interviews
          scheduledInterviews = interviewsData.data.filter(
            (int: any) => int.status === 'Scheduled' || int.status === 'Rescheduled'
          ).length;
        }

        setStats({
          jobsApplied: appliedCount,
          jobsInMarket: jobsCountData.success ? jobsCountData.data : 0,
          interviewsScheduled: scheduledInterviews,
        });
        setMyApplications(recentApps);
      } catch (err) {
        console.error("Error loading candidate dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, []);

  const statsList = [
    { title: 'Jobs Applied', value: stats.jobsApplied.toString(), change: 0, icon: FileText, trend: 'up' as const },
    { title: 'Jobs in Market', value: stats.jobsInMarket.toString(), change: 0, icon: Briefcase, trend: 'up' as const },
    { title: 'Interviews Scheduled', value: stats.interviewsScheduled.toString(), change: 0, icon: Calendar, trend: 'up' as const },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Interview':
        return <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/10">Interview</Badge>;
      case 'Hired':
        return <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10">Hired</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground bg-muted-foreground/5">Applied</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h2>
          <p className="text-muted-foreground">Track your applications status and upcoming interviews.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/jobs">
            <Button>Explore Jobs</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsList.map((stat, i) => (
          <StatCard key={i} {...stat} change={0} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Recent Job Applications</h3>
            <Link to="/my-applications">
              <Button variant="ghost" className="text-xs">View All My Applications</Button>
            </Link>
          </div>

          {myApplications.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              You haven't applied for any jobs yet. Check out the <Link to="/jobs" className="text-primary hover:underline">Jobs Market</Link> to apply!
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map((app, i) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-secondary/30 hover:bg-secondary/50 transition-colors gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {app.job?.company?.charAt(0).toUpperCase() || 'J'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{app.job?.title || 'Unknown Title'}</h4>
                      <p className="text-xs text-muted-foreground">{app.job?.company || 'Unknown Company'} • {app.job?.location}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    {getStatusBadge(app.status)}
                    <Link to={`/job-details/${app.job?._id}`}>
                      <Button variant="outline" className="h-8 px-3 text-xs">View Job Details</Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CandidateDashboard;
