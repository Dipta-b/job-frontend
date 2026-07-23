import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Button, Badge } from '../../components/ui/BaseComponents';
import { Upload, FileText, Cpu, Brain, Sparkles, CheckCircle2, XCircle, Lightbulb, FileSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import API_BASE_URL from '../../config/api';

const ResumeAnalyzerPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<null | any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string>(""); // No longer hardcoded to a bogus ID

  const handleUpload = async () => {
    if (!file) {
      document.getElementById("resumeUpload")?.click();
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jobId) formData.append("jobId", jobId);

      const res = await fetch(`${API_BASE_URL}/resume/analyze`, {
        method: "POST",
        credentials: "include", // ← use cookies
        body: formData,
      });

      const result = await res.json();
      setIsUploading(false);

      if (res.ok && result.success) {
        setAnalysis(result.analysis);
      } else {
        alert(result.message || "Analysis failed");
      }
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      alert("Something went wrong during analysis.");
    }
  };

  const chartData = analysis ? [
    { name: 'Match', value: analysis.score },
    { name: 'Gap', value: 100 - analysis.score }
  ] : [];

  const COLORS = ['#3b82f6', 'rgba(59, 130, 246, 0.1)'];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">

        {/* HIDDEN FILE INPUT */}
        <input
          type="file"
          id="resumeUpload"
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
            }
          }}
        />

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4"
          >
            <Sparkles size={14} />
            ENTERPRISE AI ENGINE
          </motion.div>
          <h2 className="text-4xl font-black tracking-tight mb-3 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            AI Talent Intelligence
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our hybrid matching system combines rule-based precision with deep neural semantic analysis.
          </p>
        </div>

        {/* UPLOAD UI */}
        {!analysis && !isUploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div
              className="border-2 border-dashed border-primary/20 rounded-3xl p-16 bg-primary/[0.02] flex flex-col items-center justify-center transition-all hover:bg-primary/[0.05] hover:border-primary/40 cursor-pointer group"
              onClick={handleUpload}
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Upload size={40} />
              </div>

              <h3 className="text-2xl font-bold mb-3">Upload Candidate Resume</h3>

              <p className="text-muted-foreground mb-10 text-center max-w-md">
                Securely upload PDF or DOCX versions of the candidate's professional profile.
              </p>

              <Button className="px-10 py-3 rounded-xl shadow-lg shadow-primary/20">
                {file ? "Replace File" : "Select Document"}
              </Button>

              {file && (
                <p className="mt-6 text-sm font-medium text-primary flex items-center gap-2">
                  <FileText size={16} />
                  {file.name}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* LOADING STATE */}
        {isUploading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 border-[6px] border-primary/10 border-t-primary rounded-full shadow-[0_0_40px_rgba(59,130,246,0.3)]"
              />
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center text-primary"
              >
                <Cpu size={48} />
              </motion.div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold mb-3">Extracting Intelligence...</h3>
              <div className="flex gap-1 justify-center">
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
              </div>
            </div>
          </div>
        )}

        {/* ANALYSIS RESULT */}
        {analysis && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* LEFT COLUMN: SCORE & SUGGESTIONS */}
              <div className="lg:col-span-4 space-y-8">
                {/* MATCH SCORE CIRCLE */}
                <Card className="flex flex-col items-center justify-center text-center p-10 bg-gradient-to-br from-primary/10 via-background to-transparent border-primary/20">
                  <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6">
                    {jobId ? "Job Match Score" : "Professional Quality Score"}
                  </p>
                  
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={0}
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={80} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-black">{analysis.score}%</span>
                        <span className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">Proprietary Fit</span>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-2">
                    <Badge variant="ai" className="px-4 py-1.5 font-bold shadow-sm">AI VERIFIED</Badge>
                  </div>
                </Card>

                {/* AI SUGGESTIONS */}
                <Card className="p-8 space-y-6">
                  <h4 className="flex items-center gap-3 font-black text-sm uppercase tracking-wider text-purple-500">
                    <Lightbulb size={20} />
                    AI Optimization Cards
                  </h4>
                  
                  <div className="space-y-4">
                    {analysis.suggestions.map((sg: string, i: number) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex gap-3 group hover:bg-purple-500/10 transition-colors"
                      >
                        <Sparkles size={16} className="text-purple-500 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium leading-snug">{sg}</p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* RIGHT COLUMN: BREAKDOWN & SKILLS */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* SKILLS COMPARISON */}
                <Card className="p-8">
                  <h4 className="flex items-center gap-3 font-black text-sm uppercase tracking-wider mb-8">
                    <Brain size={20} className="text-primary" />
                    {jobId ? "Deep Skill Match Architecture" : "Core Skill Inventory"}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* MATCHED */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                           <CheckCircle2 size={18} />
                           <span className="text-sm font-bold uppercase tracking-tighter">Verified Matches</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {analysis.matchedSkills.map((s: string) => (
                                <Badge key={s} variant="success" className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{s}</Badge>
                            ))}
                        </div>
                    </div>

                    {/* MISSING */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-rose-500 mb-2">
                           <XCircle size={18} />
                           <span className="text-sm font-bold uppercase tracking-tighter">Critical Gaps</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missingSkills.map((s: string) => (
                                <Badge key={s} variant="outline" className="px-3 py-1 bg-rose-500/5 text-rose-500 border-rose-500/20 opacity-70 italic">{s}</Badge>
                            ))}
                        </div>
                    </div>
                  </div>
                </Card>

                {/* RESUME BREAKDOWN */}
                <Card className="p-8">
                  <h4 className="flex items-center gap-3 font-black text-sm uppercase tracking-wider mb-8">
                    <FileSearch size={20} className="text-blue-500" />
                    Extraction Intelligence
                  </h4>

                  <div className="space-y-8">
                    {[
                        { title: "Experience Breakdown", icon: Briefcase, content: analysis.breakdown.experience },
                        { title: "Academic Profile", icon: GraduationCap, content: analysis.breakdown.education },
                        { title: "Certifications & Awards", icon: Award, content: analysis.breakdown.certifications }
                    ].map((section, idx) => (
                        <div key={idx} className="relative pl-8 border-l-2 border-primary/10">
                            <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                <section.icon size={10} className="text-primary" />
                            </div>
                            <h5 className="font-bold text-sm mb-2">{section.title}</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {section.content || "No significant data extracted by AI."}
                            </p>
                        </div>
                    ))}
                  </div>
                </Card>

                {/* FOOTER ACTIONS */}
                <div className="flex items-center justify-between p-6 bg-secondary/20 rounded-2xl border border-border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-background border shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                      <FileText className="text-primary" size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold">{file?.name}</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase">Analyzed on {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => { setAnalysis(null); setFile(null); }}>
                        New Analysis
                    </Button>
                    <Button className="shadow-lg shadow-primary/20">
                        Proceed to Shortlist
                    </Button>
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
};

// Dummy icons for the breakdown list
const Briefcase = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const GraduationCap = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const Award = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>;

export default ResumeAnalyzerPage;