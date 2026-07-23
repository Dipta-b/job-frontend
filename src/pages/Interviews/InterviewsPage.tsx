import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Video, 
  Clock, 
  User, 
  Plus, 
  Star,
  Loader2
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui/BaseComponents';
import { useAuth } from '../../context/AuthContext';
import type { Interview } from '../../types';
import API_BASE_URL from '../../config/api';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

interface Application {
  _id: string;
  candidateName?: string;
  candidateEmail?: string;
  candidate?: {
    _id: string;
    name: string;
    email: string;
  };
  job?: {
    _id: string;
    title: string;
    company: string;
  };
  status: string;
}

const InterviewsPage = () => {
  const { user } = useAuth();
  const isRecruiterOrAdmin = user?.role === 'recruiter' || user?.role === 'admin';

  const [interviews, setInterviews] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Schedule Form State
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [round, setRound] = useState(1);
  const [interviewType, setInterviewType] = useState<Interview['interviewType']>('Technical');
  const [mode, setMode] = useState<Interview['mode']>('Online');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [interviewer, setInterviewer] = useState('');
  const [notes, setNotes] = useState('');

  // Feedback Form State
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [isGivingFeedback, setIsGivingFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<Interview['status']>('Completed');

  const fetchInterviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/interviews`, { credentials: 'include' });
      const result = await res.json();
      if (res.ok && result.success) {
        setInterviews(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch interviews');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    }
  };

  const fetchApplications = async () => {
    if (!isRecruiterOrAdmin) return;
    try {
      const res = await fetch(`${API_BASE_URL}/applications/all`, { credentials: 'include' });
      const result = await res.json();
      if (res.ok && result.success) {
        setApplications(result.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchInterviews(), fetchApplications()]);
      setLoading(false);
    };
    init();
  }, [user]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !interviewDate || !interviewer) {
      toast.error('Please fill in all required fields');
      return;
    }

    const app = applications.find(a => a._id === selectedAppId);
    if (!app) {
      toast.error('Selected application not found');
      return;
    }

    const body = {
      applicationId: app._id,
      jobId: app.job?._id,
      candidateId: app.candidate?._id,
      round,
      interviewType,
      mode,
      meetingLink,
      location,
      interviewDate,
      duration,
      interviewer,
      notes
    };

    try {
      const res = await fetch(`${API_BASE_URL}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(result.message || 'Interview scheduled successfully');
        setIsScheduling(false);
        // Reset form
        setSelectedAppId('');
        setRound(1);
        setMeetingLink('');
        setLocation('');
        setInterviewDate('');
        setInterviewer('');
        setNotes('');
        fetchInterviews();
      } else {
        toast.error(result.message || 'Scheduling failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Scheduling failed');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;

    try {
      const res = await fetch(`${API_BASE_URL}/interviews/${selectedInterview._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          feedback: feedbackText,
          rating
        }),
        credentials: 'include'
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Interview updated successfully');
        setIsGivingFeedback(false);
        setSelectedInterview(null);
        setFeedbackText('');
        fetchInterviews();
      } else {
        toast.error(result.message || 'Failed to update interview');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update');
    }
  };

  const handleCancelInterview = async (interviewId: string) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' }),
        credentials: 'include'
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Interview cancelled');
        fetchInterviews();
      } else {
        toast.error('Failed to cancel interview');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: Interview['status']) => {
    switch (status) {
      case 'Scheduled':
        return <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/10">Scheduled</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10">Cancelled</Badge>;
      case 'Rescheduled':
        return <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10">Rescheduled</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Interviews Scheduler</h2>
            <p className="text-muted-foreground">Manage and track your schedule and panel interviews.</p>
          </div>
          {isRecruiterOrAdmin && (
            <Button onClick={() => setIsScheduling(!isScheduling)} className="gap-2">
              <Plus size={16} /> {isScheduling ? 'Cancel' : 'Schedule Interview'}
            </Button>
          )}
        </div>

        {/* Schedule Interview Form */}
        <AnimatePresence>
          {isScheduling && isRecruiterOrAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border border-border bg-card">
                <h3 className="text-lg font-bold mb-4">New Invitation Details</h3>
                <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground mr-1">Select Candidate Job Application *</label>
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    >
                      <option value="">-- Choose Candidate --</option>
                      {applications.map(app => (
                        <option key={app._id} value={app._id}>
                          {app.candidate?.name || 'Unknown'} - {app.job?.title || 'Unknown'} ({app.job?.company})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Interviewer Name(s) *</label>
                    <input
                      type="text"
                      value={interviewer}
                      onChange={(e) => setInterviewer(e.target.value)}
                      placeholder="e.g. Sarah Jenkins (Lead Dev)"
                      className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Interview Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                      className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Interview Type</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value as any)}
                      className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                    >
                      <option value="HR">HR Screen</option>
                      <option value="Technical">Technical</option>
                      <option value="Manager">Managerial</option>
                      <option value="Final">Final Round</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Round Number</label>
                    <input
                      type="number"
                      value={round}
                      onChange={(e) => setRound(parseInt(e.target.value) || 1)}
                      className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Interview Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                    >
                      <option value="Online">Online Video Meeting</option>
                      <option value="Offline">In-Person (Offline)</option>
                    </select>
                  </div>

                  {mode === 'Online' ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Meeting Link (Zoom/Meet)</label>
                      <input
                        type="url"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Office Location / Address</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Conference Room B, 4th Floor"
                        className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Additional Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify pre-requisites or topics to review..."
                      className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm min-h-[80px]"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <Button type="button" variant="outline" onClick={() => setIsScheduling(false)}>Cancel</Button>
                    <Button type="submit">Send Invitation</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback / Evaluation Modal Form */}
        <AnimatePresence>
          {isGivingFeedback && selectedInterview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-card w-full max-w-lg p-6 rounded-2xl border shadow-2xl relative"
              >
                <h3 className="text-xl font-bold mb-1">Evaluate Interview</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Assessment for {selectedInterview.candidate?.name} • Round {selectedInterview.round} ({selectedInterview.interviewType})
                </p>

                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Interview Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                    >
                      <option value="Completed">Completed - Pass / Ready</option>
                      <option value="Cancelled">Cancelled - Void Session</option>
                      <option value="Rescheduled">Reschedule Requested</option>
                    </select>
                  </div>

                  {status === 'Completed' && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-2">Technical Rating (1 - 5 Stars)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              rating >= star 
                                ? 'bg-primary/10 border-primary text-primary' 
                                : 'bg-secondary border-border text-muted-foreground'
                            }`}
                          >
                            <Star size={20} fill={rating >= star ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Interviewer Feedback & Notes</label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Comment on coding skills, communication, problem solving..."
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsGivingFeedback(false);
                        setSelectedInterview(null);
                      }}
                    >
                      Close
                    </Button>
                    <Button type="submit">Submit Assessment</Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interviews Listing Container */}
        {interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border bg-secondary/10">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg text-foreground">No Interviews Scheduled</h3>
            <p className="text-sm text-muted-foreground mt-1">There are no matching interview dates registered in your profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {interviews.map((interview) => (
              <Card key={interview._id} className="border bg-card hover:border-primary/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-bold text-lg text-foreground">{interview.job?.title || 'Unknown Position'}</h4>
                      <Badge variant="outline">{interview.job?.company || 'Unknown Company'}</Badge>
                      <Badge variant="outline">{interview.interviewType} (Round {interview.round})</Badge>
                      {getStatusBadge(interview.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User size={15} className="text-primary" />
                        <span>
                          {isRecruiterOrAdmin 
                            ? `Candidate: ${interview.candidate?.name || 'Unknown'}` 
                            : `Interviewer: ${interview.interviewer}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-primary" />
                        <span>
                          {new Date(interview.interviewDate).toLocaleString(undefined, { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })} ({interview.duration} mins)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {interview.mode === 'Online' ? (
                          <>
                            <Video size={15} className="text-blue-500" />
                            {interview.meetingLink ? (
                              <a 
                                href={interview.meetingLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-primary hover:underline font-medium"
                              >
                                Join Video Call
                              </a>
                            ) : (
                              <span>Online (Link Pending)</span>
                            )}
                          </>
                        ) : (
                          <>
                            <MapPin size={15} className="text-amber-500" />
                            <span>Location: {interview.location || 'Office HQ'}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isRecruiterOrAdmin && (
                      <div className="text-xs text-muted-foreground/80 bg-secondary/40 p-2.5 rounded-lg border border-border/50">
                        <strong>Recruiter Details:</strong> Candidate Email: {interview.candidate?.email || 'N/A'} • Assigned Interviewer: {interview.interviewer}
                      </div>
                    )}

                    {interview.notes && (
                      <div className="p-3 bg-secondary/50 rounded-lg text-sm border-l-2 border-primary">
                        <span className="font-bold text-xs text-muted-foreground block mb-0.5">Notes:</span>
                        <p className="text-foreground">{interview.notes}</p>
                      </div>
                    )}

                    {/* Feedback Display */}
                    {interview.feedback && (
                      <div className="p-3 bg-emerald-500/5 rounded-lg text-sm border-l-2 border-emerald-500 mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-emerald-600 uppercase">Evaluation Report</span>
                          {interview.rating > 0 && (
                            <div className="flex gap-0.5 text-amber-500">
                              {Array.from({ length: interview.rating }).map((_, idx) => (
                                <Star key={idx} size={11} fill="currentColor" />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-muted-foreground italic font-medium">"{interview.feedback}"</p>
                      </div>
                    )}
                  </div>

                  {isRecruiterOrAdmin && (
                    <div className="flex flex-wrap lg:flex-col gap-2 justify-end items-end shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                      {interview.status !== 'Completed' && interview.status !== 'Cancelled' && (
                        <>
                          <Button 
                            className="w-full sm:w-auto"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setFeedbackText(interview.feedback || '');
                              setRating(interview.rating || 5);
                              setStatus('Completed');
                              setIsGivingFeedback(true);
                            }}
                          >
                            Add Assessment
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full sm:w-auto text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setFeedbackText(interview.feedback || '');
                              setRating(interview.rating || 5);
                              setStatus('Rescheduled');
                              setIsGivingFeedback(true);
                            }}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full sm:w-auto text-destructive hover:bg-destructive/10"
                            onClick={() => handleCancelInterview(interview._id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InterviewsPage;
