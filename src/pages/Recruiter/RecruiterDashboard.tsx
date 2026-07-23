import { useState, useEffect } from 'react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Users, Briefcase, Calendar, Star, Search, Filter } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui/BaseComponents';
import { motion } from 'framer-motion';
import { cn } from '../../utils/utils';
import API_BASE_URL from '../../config/api';

const RecruiterDashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeJobs: 0,
    scheduledInterviews: 0,
    avgAiScore: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch jobs count
        const jobsCountRes = await fetch(`${API_BASE_URL}/jobs/count`, { credentials: 'include' });
        const jobsCountData = await jobsCountRes.json();
        
        // Fetch applications count
        const appsCountRes = await fetch(`${API_BASE_URL}/applications/count`, { credentials: 'include' });
        const appsCountData = await appsCountRes.json();

        // Fetch interviews count
        const interviewsCountRes = await fetch(`${API_BASE_URL}/interviews/count`, { credentials: 'include' });
        const interviewsCountData = await interviewsCountRes.json();

        // Fetch all applications for recent list and average score
        const allAppsRes = await fetch(`${API_BASE_URL}/applications/all`, { credentials: 'include' });
        const allAppsData = await allAppsRes.json();

        let avg = 0;
        let recent = [];
        if (allAppsData.success && Array.isArray(allAppsData.data)) {
          const apps = allAppsData.data;
          // Calculate average AI score
          const totalScore = apps.reduce((sum: number, app: any) => sum + (app.score || 0), 0);
          avg = apps.length > 0 ? Math.round(totalScore / apps.length) : 0;
          
          // Map and sort for recent applications (first 4 items)
          recent = apps.slice(0, 4).map((app: any) => ({
            name: app.candidate?.name || 'Unknown',
            job: app.job?.title || 'Unknown Position',
            date: new Date(app.createdAt).toLocaleDateString(),
            score: app.score || 0,
            status: app.status || 'Applied',
          }));
        }

        setStats({
          totalApplications: appsCountData.success ? appsCountData.data : 0,
          activeJobs: jobsCountData.success ? jobsCountData.data : 0,
          scheduledInterviews: interviewsCountData.success ? interviewsCountData.data : 0,
          avgAiScore: avg,
        });

        setRecentApplications(recent);
      } catch (err) {
        console.error("Error fetching recruiter dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsList = [
    { title: 'Total Applications', value: stats.totalApplications.toString(), change: 12, icon: Users, trend: 'up' as const },
    { title: 'Active Jobs', value: stats.activeJobs.toString(), change: 8, icon: Briefcase, trend: 'up' as const },
    { title: 'Interviews Scheduled', value: stats.scheduledInterviews.toString(), change: 2, icon: Calendar, trend: 'up' as const },
    { title: 'Avg. AI Score', value: `${stats.avgAiScore}/100`, change: 5, icon: Star, trend: 'up' as const },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hiring Overview</h2>
          <p className="text-muted-foreground">Monitor your pipeline and candidate performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Filter size={16} className="mr-2" /> Filter</Button>
          <Button><Search size={16} className="mr-2" /> New Job Posting</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Recent Applications</h3>
            <Button variant="ghost" className="text-xs">View All</Button>
          </div>
          <div className="space-y-4">
            {recentApplications.map((app, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl border bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {app.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{app.name}</h4>
                    <p className="text-xs text-muted-foreground">{app.job}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">AI Score</p>
                    <Badge variant="ai">{app.score}</Badge>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium">{app.status}</p>
                    <p className="text-[10px] text-muted-foreground">{app.date}</p>
                  </div>
                  <Button variant="outline" className="h-8 px-3 text-xs">Details</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* <Card>
          <h3 className="text-lg font-bold mb-6">Candidate Pipeline</h3>
          <div className="space-y-6">
            {[
              { label: 'Sourcing', count: 124, color: 'bg-blue-500' },
              { label: 'Screening', count: 45, color: 'bg-purple-500' },
              { label: 'Interview', count: 18, color: 'bg-amber-500' },
              { label: 'Offer', count: 4, color: 'bg-emerald-500' },
            ].map((stage, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>{stage.label}</span>
                  <span className="text-muted-foreground">{stage.count} candidates</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(stage.count / 150) * 100}%` }}
                    className={cn("h-full", stage.color)}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4">Upcoming Interviews</h4>
            <div className="space-y-3">
              {[
                { name: 'Sarah Wilson', time: '10:00 AM', type: 'Technical' },
                { name: 'Michael Chen', time: '02:30 PM', type: 'Design' },
              ].map((interview, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{interview.name}</p>
                    <p className="text-[10px] text-muted-foreground">{interview.type} Interview</p>
                  </div>
                  <span className="text-[10px] font-bold">{interview.time}</span>
                </div>
              ))}
            </div>
          </div>
        </Card> */}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
