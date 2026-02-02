import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Loader2, Check, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: 'Reset link sent',
        description: 'Check your email for a password reset link.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send reset link',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-semibold">Back to login</span>
            </Link>

            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/10">
                <KeyRound className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Forgot Password?</h1>
              <p className="text-slate-500 font-medium">
                Don't worry, it happens. Enter your email linked to your account.
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
                <h2 className="text-xl font-bold text-slate-800 mb-2">Check your email</h2>
                <p className="text-slate-600 mb-6 text-sm">
                  We've sent a secure password reset link to<br />
                  <strong className="text-slate-800">{email}</strong>
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSuccess(false)}
                  className="rounded-xl hover:bg-white hover:border-primary/30"
                >
                  Try another email
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold ml-1">Email address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
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
                      Sending Link...
                    </>
                  ) : (
                    'Send Reset Link'
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

export default ForgotPasswordPage;
