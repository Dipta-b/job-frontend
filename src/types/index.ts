export interface Interview {
  _id: string;
  applicationId: string;
  jobId: string;
  recruiterId: string;
  candidateId: string;
  round: number;
  interviewType: "HR" | "Technical" | "Manager" | "Final";
  mode: "Online" | "Offline";
  meetingLink?: string;
  location?: string;
  interviewDate: Date | string;
  duration: number;
  interviewer: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";
  notes?: string;
  feedback?: string;
  rating?: number;
  createdAt: Date | string;
}
