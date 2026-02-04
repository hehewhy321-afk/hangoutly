import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileCheck, AlertTriangle, Calendar, TrendingUp,
  Shield, Settings, ChevronRight, Search, Check, X, Eye,
  Ban, Clock, DollarSign, Activity, MoreVertical, Mail,
  Phone, MapPin, BadgeCheck, UserX, Edit, Download, Upload,
  RefreshCw, AlertCircle, ShieldCheck, Zap, Globe, Heart,
  BarChart3, LifeBuoy, Info, Loader2, UserCheck, Save, Trash2, Edit2, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { GreetingBlock } from '@/components/dashboard/GreetingBlock';
import { StatWidget } from '@/components/dashboard/StatWidget';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminEmpty } from '@/components/admin/AdminEmpty';
import { DashboardStats, UserProfile, Verification, Complaint } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCompanions: 0,
    pendingVerifications: 0,
    openComplaints: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    userActivityTrend: 0,
  });
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [recentVerifications, setRecentVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [signedUrls, setSignedUrls] = useState<{ front?: string, back?: string, selfie?: string }>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      toast({ title: 'Access denied', variant: 'destructive' });
    }
  }, [authLoading, isAdmin]);

  useEffect(() => { if (isAdmin) fetchDashboardData(); }, [isAdmin]);

  useEffect(() => { if (selectedVerification) generateSignedUrls(selectedVerification); }, [selectedVerification]);

  const generateSignedUrls = async (verification: Verification) => {
    try {
      const urls: { front?: string, back?: string, selfie?: string } = {};
      const extractPath = (url: string) => {
        if (!url) return null;
        if (url.includes('verifications/')) {
          const match = url.match(/verifications\/(.+)/);
          return match ? match[1] : null;
        }
        return url;
      };
      const frontPath = extractPath(verification.document_front_url);
      const backPath = verification.document_back_url ? extractPath(verification.document_back_url) : null;
      const selfiePath = extractPath(verification.selfie_url);

      if (frontPath) {
        const { data } = await supabase.storage.from('verifications').createSignedUrl(frontPath, 3600);
        if (data) urls.front = data.signedUrl;
      }
      if (backPath) {
        const { data } = await supabase.storage.from('verifications').createSignedUrl(backPath, 3600);
        if (data) urls.back = data.signedUrl;
      }
      if (selfiePath) {
        const { data } = await supabase.storage.from('verifications').createSignedUrl(selfiePath, 3600);
        if (data) urls.selfie = data.signedUrl;
      }
      setSignedUrls(urls);
    } catch (e) {
      setSignedUrls({ front: verification.document_front_url, back: verification.document_back_url || undefined, selfie: verification.selfie_url });
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [uRes, compProfRes, vRes, complRes, bRes, recentUsersRes, recentVerificationsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('is_companion', true),
        supabase.from('verifications').select('*').eq('status', 'pending'),
        supabase.from('complaints').select('*').eq('status', 'open'),
        supabase.from('bookings').select('total_amount, status'),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('verifications').select('*, profile:profile_id(first_name, avatar_url, city)').order('created_at', { ascending: false }).limit(3),
      ]);

      const completed = bRes.data?.filter(b => b.status === 'completed') || [];
      const active = bRes.data?.filter(b => ['active', 'pending', 'accepted'].includes(b.status)) || [];

      setStats(prev => ({
        ...prev,
        totalUsers: uRes.count || 0,
        totalCompanions: compProfRes.count || 0,
        pendingVerifications: vRes.data?.length || 0,
        openComplaints: complRes.data?.length || 0,
        activeBookings: active.length,
        completedBookings: completed.length,
        totalRevenue: completed.reduce((sum, b) => sum + (b.total_amount || 0), 0),
      }));

      setRecentUsers((recentUsersRes.data as UserProfile[]) || []);
      setRecentVerifications((recentVerificationsRes.data as any) || []);

      // Calculate Trend
      const now = new Date();
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [uCurrentMonth, uLastMonth] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', firstDayCurrentMonth),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', firstDayLastMonth).lt('created_at', firstDayCurrentMonth)
      ]);

      const lastMonthCount = uLastMonth.count || 0;
      const currentMonthCount = uCurrentMonth.count || 0;
      const activityTrendVal = lastMonthCount === 0
        ? (currentMonthCount > 0 ? 100 : 0)
        : Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100);

      setStats(prev => ({ ...prev, userActivityTrend: activityTrendVal }));

    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleVerification = async (verificationId: string, action: 'approve' | 'reject') => {
    try {
      const updateData: any = { status: action === 'approve' ? 'approved' : 'rejected', reviewer_id: user?.id, reviewed_at: new Date().toISOString() };
      const { error } = await supabase.from('verifications').update(updateData).eq('id', verificationId);
      if (error) throw error;

      if (action === 'approve') {
        const v = recentVerifications.find(x => x.id === verificationId);
        if (v) await supabase.from('profiles').update({ is_identity_verified: true }).eq('id', v.profile_id);
      }

      toast({ title: 'Success' }); fetchDashboardData(); setSelectedVerification(null);
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  if (authLoading || isLoading) return (
    <AdminLayout title="System Overview">
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Ecosystem State...</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="System Overview" subtitle="Real-time pulse of the Hangoutly ecosystem">
      <div className="max-w-[1600px] mx-auto space-y-12">
        <GreetingBlock
          name={profile?.first_name || 'Admin'}
          role="Master Admin"
          avatarUrl={profile?.avatar_url}
        />

        {/* Global Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatWidget
            label="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            color="indigo"
            trendDirection={stats.userActivityTrend >= 0 ? 'up' : 'down'}
            trendLabel={`${Math.abs(stats.userActivityTrend)}% activity`}
          />
          <StatWidget
            label="Total Revenue"
            value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            subValue="Eco-commission total"
          />
          <StatWidget
            label="Active Bookings"
            value={stats.activeBookings}
            icon={Clock}
            color="orange"
          />
          <StatWidget
            label="Reports Open"
            value={stats.openComplaints}
            icon={AlertTriangle}
            color="rose"
            subValue="Action required"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Status Card */}
          <div className="glass-card p-10 border border-slate-200/60 shadow-xl overflow-hidden relative bg-white rounded-[2.5rem]">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
            <div className="flex items-center gap-3 mb-8">
              <Zap className="w-6 h-6 text-amber-500" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">System Health</h3>
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                  <span>Server Load</span>
                  <span className="text-emerald-500">Nominal - 14%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '14%' }} className="h-full bg-emerald-500" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                  <span>API Response</span>
                  <span className="text-primary">Fast - 42ms</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '22%' }} className="h-full bg-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Users List */}
          <div className="lg:col-span-2 glass-card p-10 border border-slate-200/60 shadow-xl bg-white rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <Globe className="w-5 h-5 text-indigo-500" />
                New Arrivals
              </h3>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-[10px] font-black uppercase text-primary tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2"
              >
                Manage All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-lg transition-all">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0 border border-slate-100">
                    <img src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 tracking-tight truncate">{u.first_name || 'Anonymous'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u.city || 'Remote'} • {format(new Date(u.created_at), 'MMM d')}</p>
                  </div>
                  <div className={cn("w-2 h-2 rounded-full", u.is_online ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Verification Queue */}
        <div className="glass-card p-12 border border-slate-200/60 shadow-xl ring-2 ring-primary/5 bg-white rounded-[3rem] text-slate-900 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 blur-3xl rounded-full" />
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 text-center md:text-left relative z-10">
            <div>
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-4 justify-center md:justify-start text-slate-800">
                <ShieldCheck className="w-8 h-8 text-primary" />
                Priority Verification
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Document review required to enable member profiles</p>
            </div>
            <Button
              onClick={() => navigate('/admin/verifications')}
              className="h-16 px-10 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-black uppercase text-xs tracking-widest shadow-2xl transition-all"
            >
              Process All Requests ({stats.pendingVerifications})
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {recentVerifications.filter(v => v.status === 'pending').map((v, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white p-0.5 border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                      <img src={v.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover rounded-[1rem]" />
                    </div>
                    <div>
                      <p className="text-xl font-black tracking-tight text-slate-800">{v.profile?.first_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.profile?.city}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => setSelectedVerification(v)} variant="ghost" className="flex-1 h-12 rounded-xl bg-white border border-slate-200 hover:bg-slate-900 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all">
                      Review
                    </Button>
                    <Button onClick={() => handleVerification(v.id, 'approve')} variant="ghost" className="w-12 h-12 p-0 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">
                      <Check className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {stats.pendingVerifications === 0 && <AdminEmpty icon={FileCheck} label="Queue Empty" />}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-4xl p-0 h-[80vh] overflow-hidden rounded-[2.5rem]">
          <DialogHeader className="p-8 border-b bg-slate-50">
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Document Review: {selectedVerification?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="p-8 overflow-y-auto h-full space-y-8 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Front Side</p>
                <div className="aspect-[1.6] rounded-3xl bg-slate-100 overflow-hidden border border-slate-200">
                  <img src={signedUrls.front} className="w-full h-full object-contain" alt="Front" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Back Side</p>
                <div className="aspect-[1.6] rounded-3xl bg-slate-100 overflow-hidden border border-slate-200">
                  {signedUrls.back ? <img src={signedUrls.back} className="w-full h-full object-contain" alt="Back" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">Not Uploaded</div>}
                </div>
              </div>
              <div className="space-y-3 md:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selfie Confirmation</p>
                <div className="aspect-[1.6] md:aspect-[2.5] rounded-3xl bg-slate-100 overflow-hidden border border-slate-200">
                  <img src={signedUrls.selfie} className="w-full h-full object-contain" alt="Selfie" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t flex justify-end gap-4">
            <Button variant="outline" className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={() => setSelectedVerification(null)}>Close</Button>
            {selectedVerification?.status === 'pending' && (
              <>
                <Button variant="ghost" className="h-14 px-8 rounded-2xl bg-rose-500 text-white hover:bg-rose-600 font-black uppercase text-[10px] tracking-widest" onClick={() => handleVerification(selectedVerification.id, 'reject')}>Reject</Button>
                <Button className="h-14 px-8 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20" onClick={() => handleVerification(selectedVerification.id, 'approve')}>Approve</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDashboard;