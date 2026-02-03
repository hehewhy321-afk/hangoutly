import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Lock, Eye, Shield,
  Trash2, LogOut, Loader2, Check, ShieldCheck, AlertCircle,
  Clock, ChevronRight, BadgeCheck, Zap, Globe, Smartphone,
  UserX, Key, Mail, Fingerprint, Sparkles, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
const SettingsPage = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    bookingAlerts: true,
    messageAlerts: true,
    marketingEmails: false,
    profileVisible: true,
    showOnlineStatus: true,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!profile?.id) return;
      const { data } = await supabase.from('verifications').select('status').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (data) setVerificationStatus(data.status as any);
    };
    fetchVerificationStatus();
  }, [profile]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Mismatch', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      toast({ title: 'Success', description: 'Password updated successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const handleToggleOnlineStatus = async () => {
    if (!user) return;
    try {
      await updateProfile({ is_online: !profile?.is_online });
      toast({ title: profile?.is_online ? 'Now Offline' : 'Now Online', description: 'Status updated.' });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleLogoutOthers = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      toast({ title: 'Secured', description: 'Logged out of all other devices successfully.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email || !deletePassword) return;
    setIsDeleting(true);
    try {
      // Step 1: Verify Password by attempting to re-sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: deletePassword,
      });

      if (signInError) throw new Error('Incorrect password. Authentication failed.');

      // Step 2: Delete user profile (this triggers cleanup or marks as deleted)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Step 3: Sign out and redirect
      await signOut();
      navigate('/');
      toast({ title: 'Account Deleted', description: 'Your account and data have been removed.' });
    } catch (e: any) {
      toast({ title: 'Deletion Failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account and preferences">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-12"
      >
        {/* Verification Status Banner Overlay */}
        <motion.div variants={itemVariants} className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl p-8 lg:p-12 text-white">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none text-white focus-within:opacity-20 transition-opacity">
            <Fingerprint className="w-64 h-64" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center relative",
                profile?.is_identity_verified ? "bg-emerald-500/20" : "bg-primary/20"
              )}>
                {profile?.is_identity_verified ? (
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                ) : (
                  <Shield className="w-10 h-10 text-primary" />
                )}
                {!profile?.is_identity_verified && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">
                  {profile?.is_identity_verified ? 'Identity Verified' : 'Verification Required'}
                </h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] max-w-md">
                  {profile?.is_identity_verified
                    ? 'Your identity has been verified. You have full access to all features.'
                    : 'Verify your identity to unlock more features and build trust.'}
                </p>
              </div>
            </div>

            {!profile?.is_identity_verified && (
              <MagneticButton
                onClick={() => navigate('/verification')}
                className="h-14 px-10 rounded-2xl bg-white text-slate-900 font-black uppercase text-xs tracking-widest shadow-glow-primary hover:bg-slate-50 transition-all group"
              >
                Verify Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            )}
          </div>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Section: Communications */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
            <div className="glass-card p-8 lg:p-10 border border-slate-200/60 shadow-xl space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Notifications</h3>
              </div>

              <div className="space-y-6">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Get updates via email' },
                  { key: 'bookingAlerts', label: 'Booking Alerts', desc: 'Alerts for new bookings' },
                  { key: 'messageAlerts', label: 'Message Alerts', desc: 'Alerts for new messages' },
                  { key: 'marketingEmails', label: 'Marketing', desc: 'Promotional news and updates' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between group">
                    <div className="pr-4">
                      <p className="text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-normal mt-1 tracking-tighter max-w-[150px]">{item.desc}</p>
                    </div>
                    <Switch
                      checked={settings[item.key as keyof typeof settings]}
                      onCheckedChange={() => handleToggle(item.key as keyof typeof settings)}
                      className="data-[state=checked]:bg-primary shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 lg:p-10 border border-slate-200/60 shadow-xl space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Privacy</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <div className="pr-4">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Profile Visibility</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-normal mt-1 max-w-[150px]">Allow others to see your profile</p>
                  </div>
                  <Switch checked={settings.profileVisible} onCheckedChange={() => handleToggle('profileVisible')} className="shrink-0" />
                </div>
                <div className="flex items-center justify-between group">
                  <div className="pr-4">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Online Status</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-normal mt-1 max-w-[150px]">Show when you are online</p>
                  </div>
                  <Switch checked={profile?.is_online || false} onCheckedChange={handleToggleOnlineStatus} className="data-[state=checked]:bg-emerald-500 shrink-0" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section: Security & Account */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
            {/* Security Console */}
            <div className="glass-card p-8 lg:p-12 border border-slate-200/60 shadow-xl">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Security</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage your security settings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">New Password</Label>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="h-16 pl-14 rounded-2xl bg-slate-50 focus:bg-white border-slate-100 font-bold"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm Password</Label>
                  <div className="relative">
                    <Check className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="h-16 pl-14 rounded-2xl bg-slate-50 focus:bg-white border-slate-100 font-bold"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <MagneticButton
                  onClick={handlePasswordChange}
                  disabled={isLoading || !passwordData.newPassword}
                  className="h-12 px-8 rounded-xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-xl"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                </MagneticButton>
              </div>
            </div>

            {/* Active Logins */}
            <div className="glass-card p-8 border border-slate-200/60 shadow-xl group hover:border-primary/20 transition-all">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    <Zap className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-md font-black text-slate-800 tracking-tight">Active Logins</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest mt-1">
                      Logout of all other devices except this one.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleLogoutOthers}
                  disabled={isLoading}
                  variant="outline"
                  className="h-12 px-6 rounded-xl border-slate-200 font-extrabold uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Logout Others'}
                </Button>
              </div>
            </div>

            {/* Account Termination */}
            <div className="glass-card p-8 lg:p-10 border border-slate-200/60 shadow-xl bg-gradient-to-br from-white to-rose-50/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-1">Danger Zone</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Permanently delete your account and all associated data.</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  className="h-12 rounded-xl px-8 bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md p-10 rounded-[2.5rem] border-0 glass-card">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Are you sure?</h3>
                <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest mt-1">This action is irreversible</p>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              We are sorry to see you go. To confirm deletion, please enter your current password below.
            </p>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Current Password</Label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button onClick={() => setShowDeleteModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={!deletePassword || isDeleting}
                className="flex-1 h-12 rounded-xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-200 transition-all"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Forever'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SettingsPage;
