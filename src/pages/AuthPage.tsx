import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Shield, Loader2, LogIn, UserPlus, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { MagneticButton } from '@/components/MagneticButton';
import { cn } from '@/lib/utils';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.firstName);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: 'Login failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side: Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(250,84,54,0.15),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_rgba(142,76,36,0.15),transparent_50%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[1px] border-white/5 rounded-full scale-150 animate-float" />
        </div>

        <div className="relative z-10 max-w-lg w-full">
          <Link to="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">Hangoutly</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-8">
              Connect with <br />
              <span className="text-gradient-primary">Authenticity.</span>
            </h1>

            <div className="space-y-6">
              {[
                { icon: Shield, title: "Identity Verified", desc: "Every companion undergoes rigorous identity verification." },
                { icon: CheckCircle2, title: "Instant Booking", desc: "Browse, select, and book meaningful experiences in minutes." },
                { icon: Sparkles, title: "Premium Experience", desc: "High-quality companionship for coffee, dinner, or travel." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-bold mb-0.5">{item.title}</p>
                    <p className="text-slate-400 text-sm font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-white/80 font-medium italic mb-4">
              "Hangoutly has completely redefined how I socialize. The companions are professional, interesting, and verified."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700" />
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">James T.</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Premium Member</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-20 relative bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-2xl font-black text-gradient-primary tracking-tighter">Hangoutly</span>
            </Link>
          </div>

          <Link
            to="/"
            className="hidden lg:inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-12 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Website
          </Link>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-3">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              {isSignUp ? 'Start your journey with us today.' : 'Please enter your details to continue.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <Label htmlFor="firstName" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-primary" />
                    <Input
                      id="firstName"
                      placeholder="e.g. John Doe"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                    />
                  </div>
                  {errors.firstName && <p className="text-xs font-bold text-rose-500 ml-1">{errors.firstName}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                />
              </div>
              {errors.email && <p className="text-xs font-bold text-rose-500 ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Password</Label>
                {!isSignUp && (
                  <Link to="/forgot-password" className="text-xs font-black text-primary uppercase tracking-widest hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-14 pl-12 pr-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-bold text-rose-500 ml-1">{errors.password}</p>}
            </div>

            <MagneticButton
              variant="primary"
              type="submit"
              className="w-full h-14 rounded-2xl font-black text-lg shadow-deep"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isSignUp ? (
                "Create Free Account"
              ) : (
                "Sign In Securely"
              )}
            </MagneticButton>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40 bg-white px-4">OR</div>
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-muted-foreground mb-4">
                {isSignUp ? "Already have an account?" : "New to Hangoutly?"}
              </p>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="w-full h-14 rounded-2xl border-slate-200 font-black hover:bg-slate-50 transition-all"
              >
                {isSignUp ? "Sign In Instead" : "Create New Account"}
              </Button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-12 p-5 rounded-[1.5rem] bg-slate-50 flex gap-4">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
              Protected by industry-standard encryption. Your data is never shared with third parties without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
