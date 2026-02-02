import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();

    // Listen for auth state changes (user coming from email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords don\'t match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully reset.',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/auth'), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4 pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-glass p-8 text-center max-w-md w-full"
          >
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid or Expired Link</h2>
            <p className="text-slate-500 font-medium mb-8">
              This password reset link is invalid or has expired. Please request a new one to secure your account.
            </p>
            <Button
              variant="default"
              onClick={() => navigate('/forgot-password')}
              className="w-full h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              Request New Link
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-24">
        <div className="w-full max-w-md relative">

          {/* Ambient Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none opacity-50" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass p-8 md:p-10 relative z-10"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/10">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Reset Password</h1>
              <p className="text-slate-500 font-medium">
                Create a strong new password for your account
              </p>
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-green-50/50 rounded-2xl p-6 border border-green-100"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-in fade-in zoom-in duration-300">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Password Updated!</h2>
                <p className="text-slate-600 font-medium">
                  Your account is secure. Redirecting you to login...
                </p>
                <div className="mt-4 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-slate-700 font-semibold ml-1">New Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className="pl-12 pr-12 h-14 bg-white/60 border-slate-200 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 rounded-xl transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold ml-1">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="pl-12 h-14 bg-white/60 border-slate-200 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/20 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating Security...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
