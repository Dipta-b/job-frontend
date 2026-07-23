import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AnimatePresence } from 'framer-motion';
import RegisterPage from './pages/Auth/RegisterPage';
import PostJobPage from './pages/Jobs/PostJobPage';
import EditJobPage from './pages/Jobs/EditJobPage';
import JobDetailsPage from './pages/Jobs/JobDetailsPage';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';

// Lazy load pages
const RecruiterDashboard = lazy(() => import('./pages/Recruiter/RecruiterDashboard'));
const CandidateDashboard = lazy(() => import('./pages/Candidate/CandidateDashboard'));
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));
const JobListingPage = lazy(() => import('./pages/Jobs/JobListingPage'));
const ResumeAnalyzerPage = lazy(() => import('./pages/AI/ResumeAnalyzerPage'));
const UserManagementPage = lazy(() => import('./pages/Recruiter/UserManagementPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const MyApplicationsPage = lazy(() => import('./pages/Candidate/MyApplicationsPage'));
const ApplicantDashboardPage = lazy(() => import('./pages/Recruiter/ApplicantDashboardPage'));
const InterviewsPage = lazy(() => import('./pages/Interviews/InterviewsPage'));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage'));

// Placeholder components
const Placeholder = ({ name }: { name: string }) => (
  <DashboardLayout>
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <h2 className="text-2xl font-bold text-muted-foreground">{name} Page</h2>
      <p className="text-muted-foreground mt-2">This module is under construction.</p>
    </div>
  </DashboardLayout>
);

const DashboardContainer = () => {
  const { user } = useAuth();
  if (user?.role === 'recruiter' || user?.role === 'admin') {
    return <RecruiterDashboard />;
  }
  return <CandidateDashboard />;
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ats-theme">
      <AnimatePresence mode="wait">
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            {/* Main Marketing Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardLayout>
                  <DashboardContainer />
                </DashboardLayout>
              </PrivateRoute>
            } />
            <Route path="/post-jobs" element={
              <PrivateRoute allowedRoles={['recruiter', 'admin']}>
                <PostJobPage />
              </PrivateRoute>
            } />
            <Route path="/jobs" element={<JobListingPage />} />
            <Route path="/resume-analyzer" element={
              <PrivateRoute>
                <ResumeAnalyzerPage />
              </PrivateRoute>
            } />
            <Route path="/candidates" element={
              <PrivateRoute allowedRoles={['recruiter', 'admin']}>
                <DashboardLayout>
                  <UserManagementPage />
                </DashboardLayout>
              </PrivateRoute>
            } />
            <Route path="/applicants" element={
              <PrivateRoute allowedRoles={['recruiter', 'admin']}>
                <ApplicantDashboardPage />
              </PrivateRoute>
            } />
            <Route path="/my-applications" element={
              <PrivateRoute>
                <MyApplicationsPage />
              </PrivateRoute>
            } />
            <Route path="/interviews" element={
              <PrivateRoute>
                <InterviewsPage />
              </PrivateRoute>
            } />
            {/* <Route path="/analytics" element={<Placeholder name="Analytics" />} /> */}
            <Route path="/notifications" element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            } />
            <Route path="/settings" element={<Placeholder name="Settings" />} />
            <Route path="/edit-job/:id" element={
              <PrivateRoute allowedRoles={['recruiter', 'admin']}>
                <EditJobPage />
              </PrivateRoute>
            } />
            <Route path="/job-details/:id" element={<JobDetailsPage />} />

            {/* Default redirection */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
