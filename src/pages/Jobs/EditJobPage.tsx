import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import API_BASE_URL from "../../config/api";

import {
    ArrowLeft,
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    Layers,
    FileText,
    ListChecks,
    BarChart2,
    Clock,
} from "lucide-react";

import { Button, Card } from "../../components/ui/BaseComponents";

// ── Zod Schema ─────────────────────────────────────────────────────────────────
const jobSchema = z.object({
    title: z.string().min(3, "Job title must be at least 3 characters"),
    company: z.string().min(2, "Company name must be at least 2 characters"),
    location: z.string().min(2, "Location is required"),
    salaryMin: z.string().min(1, "Minimum salary is required"),
    salaryMax: z.string().min(1, "Maximum salary is required"),
    level: z.enum(["senior", "junior", "mid", "lead", "intern"], {
        message: "Please select a level",
    }),
    type: z.enum(["full-time", "contract", "part-time", "remote", "internship"], {
        message: "Please select a job type",
    }),
    companyLogo: z.string().optional(),
    skills: z.string().min(1, "At least one skill is required"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    requirements: z.string().min(10, "Requirements must be at least 10 characters"),
    status: z.enum(["open", "closed", "filled"]),
}).refine(
    (data) => parseInt(data.salaryMax) >= parseInt(data.salaryMin),
    { message: "Max salary must be greater than min salary", path: ["salaryMax"] }
);

type JobFormData = z.infer<typeof jobSchema>;

const EditJobPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch,
    } = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
        defaultValues: { status: "open", companyLogo: "" },
    });

    const companyLogo = watch("companyLogo");

    // ── Fetch Existing Job ─────────────────────────────
    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
                    credentials: "include",
                });
                const result = await res.json();

                if (!res.ok || !result.success) throw new Error(result.message || "Failed to fetch");

                const job = result.data;

                // Reset form with fetched data
                reset({
                    ...job,
                    salaryMin: String(job.salaryMin || ""),
                    salaryMax: String(job.salaryMax || ""),
                    skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
                    requirements: Array.isArray(job.requirements) ? job.requirements.join("\n") : "",
                    companyLogo: job.companyLogo || "",
                });

            } catch (err) {
                console.error(err);
                toast.error("Failed to load job");
                navigate("/dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, reset, navigate]);

    // ── Update Job ─────────────────────────────────────
    const onSubmit = async (data: JobFormData) => {
        try {
            const payload = {
                ...data,
                salaryMin: parseInt(data.salaryMin),
                salaryMax: parseInt(data.salaryMax),
                skills: data.skills.split(",").map((s) => s.trim()).filter(Boolean),
                requirements: data.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
            };

            const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (res.ok && result.success) {
                toast.success(result.message || "Job updated successfully!");
                navigate("/dashboard");
            } else {
                toast.error(result.message || "Failed to update job");
            }

        } catch (err) {
            console.error(err);
            toast.error("Server error occurred");
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch(
                `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`,
                { method: "POST", body: formData }
            );

            const data = await res.json();
            if (data.success) {
                setValue("companyLogo", data.data.url);
                toast.success("Logo uploaded!");
            } else {
                toast.error("Upload failed");
            }
        } catch (err) {
            toast.error("Logo upload failed");
        } finally {
            setUploadingLogo(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-secondary/30 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05),transparent)] -z-10" />

            {/* Back */}
            <Link
                to="/dashboard"
                className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl my-16"
            >
                <Card className="p-8 shadow-2xl backdrop-blur-xl bg-background/80">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mx-auto mb-4">
                            <Briefcase size={22} />
                        </div>
                        <h1 className="text-2xl font-bold">Update Job</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Update your existing job listing
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Job Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Job Title</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    {...register("title")}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                        </div>

                        {/* COMPANY LOGO UPLOAD */}
                        <div className="space-y-3 p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-secondary/20 transition-all hover:border-primary/30">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Building2 size={16} className="text-primary" />
                                Company Logo
                            </label>

                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                {/* Preview / Placeholder */}
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary border flex items-center justify-center shrink-0">
                                    {companyLogo ? (
                                        <img src={companyLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={32} className="text-muted-foreground/30" />
                                    )}
                                </div>

                                <div className="flex-1 w-full space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Paste logo URL here..."
                                        {...register("companyLogo")}
                                        className="w-full px-3 py-2 text-sm rounded-lg bg-background border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />

                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                            id="logo-upload"
                                            accept="image/*"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className={`inline-flex items-center justify-center w-full md:w-auto px-4 py-2 text-xs font-medium rounded-lg border cursor-pointer transition-all ${uploadingLogo ? 'bg-secondary text-muted-foreground cursor-wait' : 'bg-background hover:bg-secondary active:scale-95'}`}
                                        >
                                            {uploadingLogo ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                "Upload from Computer"
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    {...register("company")}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            {errors.company && <p className="text-red-500 text-xs">{errors.company.message}</p>}
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    {...register("location")}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
                        </div>

                        {/* Level + Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Job Level</label>
                                <div className="relative">
                                    <BarChart2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <select
                                        {...register("level")}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                                    >
                                        <option value="intern">Intern</option>
                                        <option value="junior">Junior</option>
                                        <option value="mid">Mid</option>
                                        <option value="senior">Senior</option>
                                        <option value="lead">Lead</option>
                                    </select>
                                </div>
                                {errors.level && <p className="text-red-500 text-xs">{errors.level.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Job Type</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <select
                                        {...register("type")}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                                    >
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="remote">Remote</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>
                                {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
                            </div>
                        </div>

                        {/* Salary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Min Salary</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        type="number"
                                        {...register("salaryMin")}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                {errors.salaryMin && <p className="text-red-500 text-xs">{errors.salaryMin.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Max Salary</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        type="number"
                                        {...register("salaryMax")}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                {errors.salaryMax && <p className="text-red-500 text-xs">{errors.salaryMax.message}</p>}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Skills (comma separated)</label>
                            <div className="relative">
                                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    {...register("skills")}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            {errors.skills && <p className="text-red-500 text-xs">{errors.skills.message}</p>}
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <select
                                {...register("status")}
                                className="w-full px-4 py-2 rounded-lg bg-secondary/50 border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                                <option value="filled">Filled</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-muted-foreground" size={18} />
                                <textarea
                                    rows={4}
                                    {...register("description")}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                        </div>

                        {/* Requirements */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Requirements (one per line)</label>
                            <div className="relative">
                                <ListChecks className="absolute left-3 top-3 text-muted-foreground" size={18} />
                                <textarea
                                    rows={4}
                                    {...register("requirements")}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            {errors.requirements && <p className="text-red-500 text-xs">{errors.requirements.message}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                            {isSubmitting ? "Updating Job..." : "Update Job"}
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default EditJobPage;