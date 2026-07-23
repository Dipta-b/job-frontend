import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui/BaseComponents';
import { Mail, Lock, ArrowLeft, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    role: string;
    image?: string;
}
import API_BASE_URL from '../../config/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [registeredUser, setRegisteredUser] = useState<any>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<RegisterFormData>();

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                toast.error(result.message || 'Registration failed');
                return;
            }

            setRegisteredUser(result.data);
            setUser(result.data); // Update context state immediately
            setIsOpen(true);
            reset();

        } catch (err) {
            console.error(err);
            toast.error('Server error occurred');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-secondary/30 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05),transparent)] -z-10" />

            {/* Back Link */}
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft size={16} /> Back to Home
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 shadow-2xl backdrop-blur-xl bg-background/80">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mx-auto mb-4 text-2xl font-bold">
                            A
                        </div>
                        <h1 className="text-2xl font-bold">Create an account</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Sign up to get started with ATS Pro
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    {...register('name', { required: 'Full name is required' })}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-500 text-xs">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Enter a valid email address',
                                        },
                                    })}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters',
                                        },
                                    })}
                                    className="w-full pl-10 pr-10 py-2 rounded-lg bg-secondary/50 border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
                                >
                                    {showPassword ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
                                </span>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Role is automatically set to "user" on backend */}

                        {/* Image URL
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Profile Image URL</label>
                            <div className="relative">
                                <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    placeholder="https://example.com/photo.jpg"
                                    {...register('image')}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary/50 border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div> */}

                        {/* Submit */}
                        <Button type="submit" className="w-full h-11 mt-2">
                            Create Account
                        </Button>

                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>

                </Card>
            </motion.div>

            {/* Success Modal */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog onClose={() => setIsOpen(false)} className="relative z-50">

                    {/* Backdrop */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>

                    {/* Modal Panel */}
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-background border shadow-2xl p-8 text-center">

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🎉</span>
                                </div>

                                <Dialog.Title className="text-xl font-bold mb-2">
                                    Registration Successful!
                                </Dialog.Title>

                                <p className="text-sm text-muted-foreground mb-6">
                                    Welcome aboard,{' '}
                                    <span className="text-foreground font-semibold">
                                        {registeredUser?.name}
                                    </span>
                                    ! Your account has been created successfully.
                                </p>

                                <Button
                                    className="w-full h-11"
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/login');
                                    }}
                                >
                                    Go to Login
                                </Button>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>

                </Dialog>
            </Transition>

        </div>
    );
};

export default RegisterPage;