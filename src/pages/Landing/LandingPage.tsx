import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/BaseComponents';
import toast from "react-hot-toast";
import API_BASE_URL from "../../config/api";
import { LogOut } from "lucide-react";
import {
  ArrowRight,
  Search,
  Users,
  Cpu,
  Sparkles,
  Shield,
  Globe
} from 'lucide-react';

import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const { user, setUser } = useContext(AuthContext)

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  const navigate = useNavigate();

  const confirmLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setUser(null);
        navigate("/login");
        toast.success("Logged out successfully");
      } else {
        toast.error(result.message || "Failed to logout");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Server error during logout");
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl gradient-text">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
              A
            </div>
            <Link to="/">ATS Pro</Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#solutions" className="text-sm font-medium hover:text-primary transition-colors">Solutions</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            {
              user ? (
                <button
                  onClick={confirmLogout}
                  className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors text-sm font-medium"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              ) : (<Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>)
            }
            <Link to="/dashboard">
              <Button>Get Started <ArrowRight size={16} className="ml-2" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10 blur-3xl opacity-50" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-500/10 rounded-full -z-10 blur-[100px]" />
        <div className="absolute top-60 left-0 w-96 h-96 bg-blue-500/10 rounded-full -z-10 blur-[100px]" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 border border-primary/20">
            <Sparkles size={14} /> AI-POWERED TALENT ACQUISITION
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            The Future of Hiring <br />
            <span className="gradient-text">Powered by AI Intelligence</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Streamline your recruitment process with ATS Pro. Automated resume screening,
            intelligent candidate matching, and data-driven insights to help you build your dream team.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button className="h-12 px-8 text-base">Start Hiring Now</Button>
            </Link>
            <Button variant="outline" className="h-12 px-8 text-base">Book a Demo</Button>
          </motion.div>

          {/* Hero Dashboard Preview */}
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 relative p-2 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
              alt="Dashboard Preview"
              className="rounded-xl w-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to manage your hiring pipeline at scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: 'AI Resume Scoring', desc: 'Instantly rank hundreds of candidates based on job relevance and skill density.' },
              { icon: Search, title: 'Smart Search', desc: 'Powerful semantic search to find the right talent within your existing candidate pool.' },
              { icon: Users, title: 'Pipeline Management', desc: 'Visual kanban boards to track candidate progress through every stage.' },
              { icon: Globe, title: 'Global Job Board', desc: 'One-click distribution to 50+ major job boards worldwide.' },
              { icon: Shield, title: 'Secure & Compliant', desc: 'Enterprise-level security with GDPR and SOC2 compliance out of the box.' },
              { icon: Sparkles, title: 'Automated Interviews', desc: 'Schedule and conduct interviews with built-in AI assistive notes.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-background border hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60">
          <span className="text-2xl font-black">STRIPE</span>
          <span className="text-2xl font-black">VERCEL</span>
          <span className="text-2xl font-black">LINEAR</span>
          <span className="text-2xl font-black">NOTION</span>
          <span className="text-2xl font-black">META</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto p-12 rounded-[2rem] bg-primary relative overflow-hidden text-center text-primary-foreground">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to transform your hiring?</h2>
          <p className="text-lg opacity-90 mb-10 relative z-10 max-w-2xl mx-auto">Join 2,000+ companies already using ATS Pro to scale their workforce efficiently.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Button variant="secondary" className="h-12 px-8 text-base">Get Started Free</Button>
            <Button variant="outline" className="h-12 px-8 text-base bg-transparent border-white/20 text-white hover:bg-white/10">Talk to Sales</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t mt-12 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl gradient-text mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                A
              </div>
              ATS Pro
            </div>
            <p className="text-sm text-muted-foreground mr-8 leading-relaxed">
              Building the world's most intelligent talent acquisition platform for the future of work.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">AI Insights</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Safety</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; 2026 ATS Pro AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
