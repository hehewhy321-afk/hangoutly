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
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

interface DashboardStats {
  totalUsers: number;
  totalCompanions: number;
  pendingVerifications: number;
  openComplaints: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  gender: string;
  city: string;
  phone: string;
  avatar_url: string;
  is_identity_verified: boolean;
  is_verified: boolean;
  is_active: boolean;
  is_companion: boolean;
  is_online: boolean;
  created_at: string;
  bookings_count?: number;
  total_spent?: number;
}

interface Verification {
  id: string;
  full_name: string;
  document_type: string;
  document_front_url: string;
  document_back_url: string;
  selfie_url: string;
  status: string;
  created_at: string;
  profile_id: string;
  reviewer_notes: string | null;
  profile: {
    first_name: string;
    avatar_url: string;
    city: string;
  };
}

interface Complaint {
  id: string;
  complaint_type: string;
  description: string;
  status: string;
  created_at: string;
  reporter_id: string;
  reported_user_id: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCompanions: 0,
    pendingVerifications: 0,
    openComplaints: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [newCity, setNewCity] = useState('');
  const [editingCity, setEditingCity] = useState<any>(null); // For rename modal
  const [deletingCityId, setDeletingCityId] = useState<string | null>(null); // For delete confirmation
  const [settings, setSettings] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    revenue: any[];
    userGrowth: any[];
    activityDistribution: any[];
  }>({ revenue: [], userGrowth: [], activityDistribution: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [complaintFilter, setComplaintFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'nepal' | 'international'>('nepal'); // Default to Nepal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
  const [showManualVerifyModal, setShowManualVerifyModal] = useState(false);
  const [manualVerifyUserId, setManualVerifyUserId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!isAdmin) return;
    const adminChannel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verifications' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchDashboardData())
      .subscribe();
    return () => { supabase.removeChannel(adminChannel); };
  }, [isAdmin]);

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
      const [uRes, compProfRes, vRes, complRes, bRes, citiesRes, settingsRes, recentUsersRes, recentVerificationsRes, recentComplaintsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('is_companion', true),
        supabase.from('verifications').select('*').eq('status', 'pending'),
        supabase.from('complaints').select('*').eq('status', 'open'),
        supabase.from('bookings').select('total_amount, status'),
        // @ts-ignore
        supabase.from('cities').select('*').order('name'),
        // @ts-ignore
        supabase.from('app_settings').select('*'),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('verifications').select('*, profile:profile_id(first_name, avatar_url, city)').order('created_at', { ascending: false }).limit(50),
        supabase.from('complaints').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      const completed = bRes.data?.filter(b => b.status === 'completed') || [];
      const active = bRes.data?.filter(b => ['active', 'pending', 'accepted'].includes(b.status)) || [];

      setStats({
        totalUsers: uRes.count || 0,
        totalCompanions: compProfRes.count || 0,
        pendingVerifications: vRes.data?.length || 0,
        openComplaints: complRes.data?.length || 0,
        activeBookings: active.length,
        completedBookings: completed.length,
        totalRevenue: completed.reduce((sum, b) => sum + (b.total_amount || 0), 0),
      });

      // @ts-ignore
      setCities(citiesRes.data || []);
      setUsers(recentUsersRes.data || []);
      setVerifications((recentVerificationsRes.data as any) || []);
      setComplaints(recentComplaintsRes.data || []);

      const settingsMap: any = {};
      // @ts-ignore
      (settingsRes.data || []).forEach((item: any) => {
        settingsMap[item.key] = item.value;
      });
      setSettings(settingsMap);

      // Process Analytics
      const allBookings = bRes.data || [];
      const revenueByAcc: any = {};
      const activityCount: any = {};

      allBookings.forEach((b: any) => {
        const date = b.created_at.split('T')[0];
        if (b.status === 'completed') {
          revenueByAcc[date] = (revenueByAcc[date] || 0) + (b.total_amount * (settingsMap.commission_rate || 0.1));
        }
        if (b.activity) {
          activityCount[b.activity] = (activityCount[b.activity] || 0) + 1;
        }
      });

      const revenueChartData = Object.entries(revenueByAcc).map(([date, amount]) => ({ date, amount })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const activityChartData = Object.entries(activityCount).map(([name, value]) => ({ name, value }));

      // User Growth
      const userGrowthAcc: any = {};
      // @ts-ignore
      (uRes.data || []).forEach((u: any) => {
        const date = u.created_at.split('T')[0];
        userGrowthAcc[date] = (userGrowthAcc[date] || 0) + 1;
      });
      const userGrowthChartData = Object.entries(userGrowthAcc).map(([date, count]) => ({ date, count })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setAnalyticsData({
        revenue: revenueChartData,
        userGrowth: userGrowthChartData,
        activityDistribution: activityChartData
      });

    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleVerification = async (verificationId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const updateData: any = { status: action === 'approve' ? 'approved' : 'rejected', reviewer_id: user?.id, reviewed_at: new Date().toISOString() };
      if (action === 'reject' && reason) updateData.reviewer_notes = reason;
      const { error } = await supabase.from('verifications').update(updateData).eq('id', verificationId);
      if (error) throw error;
      const v = verifications.find(x => x.id === verificationId);
      if (v) {
        if (action === 'approve') {
          await supabase.from('profiles').update({ is_identity_verified: true }).eq('id', v.profile_id);
          const { data: pData } = await supabase.from('profiles').select('user_id').eq('id', v.profile_id).single();
          if (pData) await supabase.from('notifications').insert({ user_id: pData.user_id, type: 'verification_approved', title: 'Verified!', message: 'Your identity has been verified.' });
        } else {
          const { data: pData } = await supabase.from('profiles').select('user_id').eq('id', v.profile_id).single();
          if (pData) await supabase.from('notifications').insert({ user_id: pData.user_id, type: 'verification_rejected', title: 'Rejected', message: `Reason: ${reason || 'Documents unclear.'}` });
        }
      }
      toast({ title: 'Success' }); fetchDashboardData(); setSelectedVerification(null); setShowRejectModal(false);
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleRejectClick = (verificationId: string) => {
    setPendingRejectId(verificationId);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (pendingRejectId) {
      handleVerification(pendingRejectId, 'reject', rejectionReason);
    }
  };

  const handleUserAction = async (userId: string, action: 'identity_verify' | 'identity_unverify' | 'special_badge' | 'remove_badge' | 'ban' | 'unban') => {
    try {
      let update: any = {};
      if (action === 'identity_verify') update.is_identity_verified = true;
      if (action === 'identity_unverify') update.is_identity_verified = false;
      if (action === 'special_badge') update.is_verified = true;
      if (action === 'remove_badge') update.is_verified = false;
      if (action === 'ban') update.is_active = false;
      if (action === 'unban') update.is_active = true;

      const { error, data } = await supabase.from('profiles').update(update).eq('id', userId).select();
      if (error) throw error;

      if (user) {
        await supabase.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: action,
          target_type: 'profile',
          target_id: userId,
          details: { update }
        });
      }

      const userProfile = users.find(u => u.id === userId);
      if (userProfile) {
        let notificationData: any;
        if (action === 'identity_verify') {
          notificationData = { user_id: userProfile.user_id, type: 'identity_verified', title: 'Identity Verified!', message: 'Your identity has been verified. You can now appear on the discover page.' };
        } else if (action === 'identity_unverify') {
          notificationData = { user_id: userProfile.user_id, type: 'identity_removed', title: 'Identity Verification Removed', message: 'Your identity verification has been removed. You may need to submit new documents.', data: { link: '/verification' } };
        } else if (action === 'special_badge') {
          notificationData = { user_id: userProfile.user_id, type: 'special_badge_granted', title: 'Verified Badge Granted! ✓', message: 'Congratulations! You have been awarded the verified badge.' };
        } else if (action === 'remove_badge') {
          notificationData = { user_id: userProfile.user_id, type: 'badge_removed', title: 'Verified Badge Removed', message: 'Your verified badge has been removed.' };
        } else if (action === 'ban') {
          notificationData = { user_id: userProfile.user_id, type: 'account_banned', title: 'Account Suspended', message: 'Your account has been suspended. Contact support for more information.' };
        } else {
          notificationData = { user_id: userProfile.user_id, type: 'account_unbanned', title: 'Account Restored', message: 'Your account has been restored. You can now use all features.' };
        }
        await supabase.from('notifications').insert(notificationData);
      }

      const messages: Record<string, string> = {
        identity_verify: 'identity verified',
        identity_unverify: 'identity verification removed',
        special_badge: 'verified badge granted',
        remove_badge: 'verified badge removed',
        ban: 'banned',
        unban: 'unbanned',
      };

      toast({ title: 'Success', description: `User has been ${messages[action]}.` });
      await fetchDashboardData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleComplaintAction = async (complaintId: string, action: 'resolved' | 'dismissed') => {
    try {
      const { error } = await supabase.from('complaints').update({ status: action, resolved_at: new Date().toISOString() }).eq('id', complaintId);
      if (error) throw error;
      toast({ title: `Report ${action}`, description: `The report has been marked as ${action}.` });
      fetchDashboardData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddCity = async () => {
    if (!newCity.trim()) return;
    try {
      // @ts-ignore
      const { data, error } = await supabase.from('cities').insert([{ name: newCity, is_active: true }]).select();
      if (error) throw error;
      setCities([...cities, data[0]]);
      setNewCity('');
      toast({ title: 'City Added', description: `${newCity} has been added to the list.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add city.' });
    }
  };

  const toggleCityStatus = async (id: string, currentStatus: boolean) => {
    try {
      // @ts-ignore
      const { error } = await supabase.from('cities').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      setCities(cities.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      toast({ title: 'Status Updated', description: 'City status changed successfully.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const handleDeleteCity = async () => {
    if (!deletingCityId) return;
    try {
      // @ts-ignore
      const { error } = await supabase.from('cities').delete().eq('id', deletingCityId);
      if (error) throw error;
      setCities(cities.filter(c => c.id !== deletingCityId));
      toast({ title: 'City Deleted', description: 'City has been removed permanently.' });
      setDeletingCityId(null);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete city.' });
    }
  };

  const handleUpdateCity = async () => {
    if (!editingCity || !editingCity.name.trim()) return;
    try {
      // @ts-ignore
      const { error } = await supabase.from('cities').update({ name: editingCity.name }).eq('id', editingCity.id);
      if (error) throw error;
      setCities(cities.map(c => c.id === editingCity.id ? { ...c, name: editingCity.name } : c));
      setEditingCity(null);
      toast({ title: 'City Updated', description: 'City name updated successfully.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update city.' });
    }
  };

  const fetchUserDetails = async (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    const { data: bookings } = await supabase.from('bookings').select('*, companion:companion_id(first_name, avatar_url)').or(`user_id.eq.${userProfile.user_id},companion_id.eq.${userProfile.id}`).order('created_at', { ascending: false });
    setUserBookings(bookings || []);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));

      // @ts-ignore
      const { error } = await supabase.from('app_settings').upsert(updates);
      if (error) throw error;
      toast({ title: 'Settings Saved', description: 'Platform settings have been updated.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRequestReverify = async (profileId: string) => {
    try {
      await supabase.from('verifications').delete().eq('profile_id', profileId).eq('status', 'rejected');
      await supabase.from('profiles').update({ is_identity_verified: false }).eq('id', profileId);
      const userProfile = users.find(u => u.id === profileId);
      if (userProfile) {
        await supabase.from('notifications').insert({
          user_id: userProfile.user_id,
          type: 'reverification_requested',
          title: 'Re-verification Available',
          message: 'You can now submit new verification documents. Go to Settings → Verification to complete the process.',
          data: { link: '/verification' }
        });
      }
      if (user) {
        await supabase.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'enable_reverification',
          target_type: 'profile',
          target_id: profileId,
          details: { action: 're-verification enabled' }
        });
      }
      toast({ title: 'Re-verification enabled', description: 'User can now submit new verification documents.' });
      fetchDashboardData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(u => u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.city?.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone?.includes(searchQuery));

  const filteredVerifications = verifications.filter(v => {
    if (verificationFilter === 'all') return true;
    const country = v.submitter_country?.toLowerCase() || '';
    if (verificationFilter === 'nepal') return country === 'nepal' || country === ''; // Default empty to Nepal or make strict? Let's assume empty might be old data, but usually better to show it. Actually logic: IP-based Country.
    if (verificationFilter === 'international') return country !== 'nepal' && country !== '';
    return true;
  });

  const usersPag = usePagination({ data: filteredUsers, itemsPerPage: 10 });
  const verPag = usePagination({ data: filteredVerifications, itemsPerPage: 10 });
  const comPag = usePagination({ data: complaints, itemsPerPage: 10 });

  if (authLoading || !isAdmin) return (
    <DashboardLayout title="Admin Dashboard">
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Dashboard...</p>
      </div>
    </DashboardLayout>
  );

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } } };

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Manage your platform">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10 pb-16">

        {/* Global Operational Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', val: stats.totalUsers, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { label: 'Total Revenue', val: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Active Bookings', val: stats.activeBookings, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Platform Health', val: `${100 - (stats.openComplaints > 0 ? 1 : 0)}%`, icon: Shield, color: 'text-primary', bg: 'bg-primary/5' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-8 border border-slate-200/60 shadow-xl group hover:border-primary/20 transition-all">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{stat.label}</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{stat.val}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Command Interface */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-2 overflow-x-auto">
            <div className="flex gap-10">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'users', label: 'Users', icon: Users, count: stats.totalUsers },
                { id: 'verifications', label: 'Verifications', icon: ShieldCheck, count: stats.pendingVerifications },
                { id: 'cities', label: 'Cities', icon: MapPin },
                { id: 'complaints', label: 'Reports', icon: AlertTriangle, count: stats.openComplaints },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] pb-6 relative transition-colors whitespace-nowrap",
                    activeTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={cn("px-2 py-0.5 rounded-full text-[9px]", activeTab === tab.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>
                        {tab.count}
                      </span>
                    )}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="admin-tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'users' && (
              <div className="relative group min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="h-12 pl-12 pr-6 rounded-2xl bg-white border border-slate-200 text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none w-full"
                />
              </div>
            )}
          </div>

          {/* Content Router */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Real-time Health */}
                  <div className="glass-card p-8 lg:p-10 border border-slate-200/60 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                    <div className="flex items-center gap-3 mb-8">
                      <Zap className="w-6 h-6 text-amber-500" />
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">System Status</h3>
                    </div>
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                          <span>System Load</span>
                          <span className="text-emerald-500">Nominal - 14%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '14%' }} className="h-full bg-emerald-500" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                          <span>Network Latency</span>
                          <span className="text-primary">Fast - 42ms</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '22%' }} className="h-full bg-primary" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Node Activity */}
                  <div className="lg:col-span-2 glass-card p-10 border border-slate-200/60 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        Recent Users
                      </h3>
                      <button onClick={() => setActiveTab('users')} className="text-[10px] font-black uppercase text-primary tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {users.slice(0, 4).map((u, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100/50">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 shadow-sm flex-shrink-0">
                            <img src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-800 tracking-tight truncate">{u.first_name || 'Anonymous'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u.city || 'Nebula'} • {format(new Date(u.created_at), 'MMM d')}</p>
                          </div>
                          <div className={cn("w-2 h-2 rounded-full", u.is_online ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Verification Queue (Critical) */}
                <div className="glass-card p-10 border border-slate-200/60 shadow-xl ring-2 ring-primary/5">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-primary" />
                        Pending Verifications
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review identity verification requests</p>
                    </div>
                    <Button onClick={() => setActiveTab('verifications')} className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                      Process All ({stats.pendingVerifications})
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {verifications.filter(v => v.status === 'pending').slice(0, 3).map((v, i) => (
                      <div key={i} className="p-6 rounded-[2rem] bg-slate-900 text-white relative group overflow-hidden border border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/10 p-0.5">
                              <img src={v.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover rounded-[1rem]" />
                            </div>
                            <div>
                              <p className="text-lg font-black tracking-tight">{v.profile?.first_name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{v.profile?.city}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button onClick={() => setSelectedVerification(v)} variant="ghost" className="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-slate-900 font-black uppercase text-[9px] tracking-widest">
                              Review
                            </Button>
                            <Button onClick={() => handleVerification(v.id, 'approve')} variant="ghost" className="w-10 h-10 p-0 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                              <Check className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {stats.pendingVerifications === 0 && <Empty icon={FileCheck} label="No Pending Verifications" />}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">User</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Role</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Location</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                        <th className="px-10 py-6 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersPag.paginatedData.map((u, i) => (
                        <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                <img src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{u.first_name} {u.last_name}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{u.phone || 'No Digital Line'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", u.is_companion ? "bg-primary/10 text-primary border border-primary/20" : "bg-slate-100 text-slate-500 border border-slate-200")}>
                              {u.is_companion ? 'Companion' : 'Patron'}
                            </span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-xs font-bold text-slate-600">{u.city || 'Remote'}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex gap-2">
                              {u.is_identity_verified && <ShieldCheck className="w-4 h-4 text-emerald-500" strokeWidth={3} />}
                              {u.is_verified && <BadgeCheck className="w-4 h-4 text-primary" strokeWidth={3} />}
                              {!u.is_active && <Ban className="w-4 h-4 text-rose-500" strokeWidth={3} />}
                              {!u.is_identity_verified && !u.is_verified && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 self-center" />}
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="w-10 h-10 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all flex items-center justify-center">
                                  <MoreVertical className="w-5 h-5 text-slate-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100 p-2">
                                <DropdownMenuItem onClick={() => fetchUserDetails(u)} className="p-3 rounded-xl font-bold focus:bg-slate-50 cursor-pointer">
                                  <Eye className="w-4 h-4 mr-3 text-slate-400" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-50" />
                                <DropdownMenuItem onClick={() => handleUserAction(u.id, u.is_identity_verified ? 'identity_unverify' : 'identity_verify')} className="p-3 rounded-xl font-black text-[10px] uppercase tracking-widest focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer">
                                  <Shield className="w-4 h-4 mr-3" /> {u.is_identity_verified ? 'Remove Verification' : 'Verify Identity'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUserAction(u.id, u.is_verified ? 'remove_badge' : 'special_badge')} className="p-3 rounded-xl font-black text-[10px] uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">
                                  <BadgeCheck className="w-4 h-4 mr-3" /> {u.is_verified ? 'Remove Badge' : 'Add Verified Badge'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-50" />
                                <DropdownMenuItem onClick={() => handleUserAction(u.id, u.is_active ? 'ban' : 'unban')} className={cn("p-3 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer", u.is_active ? "text-rose-500 focus:bg-rose-50" : "text-emerald-500 focus:bg-emerald-50")}>
                                  {u.is_active ? <Ban className="w-4 h-4 mr-3" /> : <Check className="w-4 h-4 mr-3" />}
                                  {u.is_active ? 'Ban User' : 'Unban User'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  currentPage={usersPag.currentPage}
                  totalPages={usersPag.totalPages}
                  startIndex={usersPag.startIndex}
                  endIndex={usersPag.endIndex}
                  totalItems={usersPag.totalItems}
                  onPrevPage={usersPag.prevPage}
                  onNextPage={usersPag.nextPage}
                  onGoToPage={usersPag.goToPage}
                  hasPrevPage={usersPag.hasPrevPage}
                  hasNextPage={usersPag.hasNextPage}
                />
              </motion.div>
            )}

            {activeTab === 'verifications' && (
              <motion.div key="verifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Verification Filters */}
                <div className="flex gap-2 mb-4">
                  {(['all', 'nepal', 'international'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setVerificationFilter(filter)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        verificationFilter === filter
                          ? "bg-slate-800 text-white shadow-lg"
                          : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                      )}
                    >
                      {filter === 'all' ? 'All Requests' : filter === 'nepal' ? 'Nepal Only' : 'International'}
                    </button>
                  ))}
                </div>

                <div className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">User</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Document</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                        <th className="px-10 py-6 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {verPag.paginatedData.map((v) => (
                        <tr key={v.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                                <img src={v.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{v.full_name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-[10px] font-bold text-slate-400 capitalize">{v.profile?.city}</p>
                                  {v.submitter_country && (
                                    <span className="text-[9px] font-black uppercase text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {v.submitter_country}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className="text-xs font-bold text-slate-600 capitalize">{v.document_type.replace('_', ' ')}</span>
                          </td>
                          <td className="px-10 py-6">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                              v.status === 'pending' ? "bg-amber-100 text-amber-600 border border-amber-200" :
                                v.status === 'approved' ? "bg-emerald-100 text-emerald-600 border border-emerald-200" :
                                  "bg-rose-100 text-rose-600 border border-rose-200"
                            )}>
                              {v.status}
                            </span>
                          </td>
                          <td className="px-10 py-6">
                            <span className="text-xs font-bold text-slate-600">{format(new Date(v.created_at), 'MMM dd, yyyy')}</span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <Button onClick={() => setSelectedVerification(v)} variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-white border border-transparent hover:border-slate-200">
                                <Eye className="w-4 h-4 text-slate-400" />
                              </Button>
                              {v.status === 'pending' && (
                                <>
                                  <Button onClick={() => handleVerification(v.id, 'approve')} variant="ghost" className="w-10 h-10 p-0 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button onClick={() => handleRejectClick(v.id)} variant="ghost" className="w-10 h-10 p-0 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  currentPage={verPag.currentPage}
                  totalPages={verPag.totalPages}
                  startIndex={verPag.startIndex}
                  endIndex={verPag.endIndex}
                  totalItems={verPag.totalItems}
                  onPrevPage={verPag.prevPage}
                  onNextPage={verPag.nextPage}
                  onGoToPage={verPag.goToPage}
                  hasPrevPage={verPag.hasPrevPage}
                  hasNextPage={verPag.hasNextPage}
                />
              </motion.div>
            )}

            {activeTab === 'complaints' && (
              <motion.div key="complaints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {comPag.paginatedData.map((c) => (
                  <div key={c.id} className="glass-card p-8 border border-slate-200/60 shadow-xl group hover:border-primary/20 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                            c.status === 'open' ? "bg-rose-100 text-rose-600 border border-rose-200" : "bg-emerald-100 text-emerald-600 border border-emerald-200"
                          )}>
                            {c.status}
                          </span>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-l border-slate-200 pl-3">
                            {c.complaint_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed max-w-2xl">{c.description}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Reported on {format(new Date(c.created_at), 'PPPp')}
                        </p>
                      </div>
                      {c.status === 'open' && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleComplaintAction(c.id, 'resolved')}
                            className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-lg"
                          >
                            <Check className="w-4 h-4 mr-2" /> Resolve
                          </Button>
                          <Button
                            onClick={() => handleComplaintAction(c.id, 'dismissed')}
                            variant="outline"
                            className="h-10 px-6 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest"
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {complaints.length === 0 && <Empty icon={AlertTriangle} label="No Open Reports" />}
                <PaginationControls
                  currentPage={comPag.currentPage}
                  totalPages={comPag.totalPages}
                  startIndex={comPag.startIndex}
                  endIndex={comPag.endIndex}
                  totalItems={comPag.totalItems}
                  onPrevPage={comPag.prevPage}
                  onNextPage={comPag.nextPage}
                  onGoToPage={comPag.goToPage}
                  hasPrevPage={comPag.hasPrevPage}
                  hasNextPage={comPag.hasNextPage}
                />
              </motion.div>
            )}

            {activeTab === 'cities' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flax-col md:flex-row gap-4 justify-between items-end md:items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">City Management</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Manage Service Locations</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-2xl shadow-lg border border-indigo-50 w-full md:w-auto">
                    <input
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="New City Name..."
                      className="bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-300 w-full md:w-64"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                    />
                    <MagneticButton
                      onClick={handleAddCity}
                      disabled={!newCity.trim()}
                      className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                    >
                      <Plus className="w-6 h-6" />
                    </MagneticButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {cities.map((city) => (
                    <div key={city.id} className="group p-6 rounded-3xl bg-white border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", city.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                          {editingCity?.id === city.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingCity.name}
                                onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })}
                                className="h-8 font-bold text-lg"
                                autoFocus
                              />
                              <Button size="sm" onClick={handleUpdateCity} className="h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                                <Check className="w-4 h-4 text-white" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingCity(null)} className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                                <X className="w-4 h-4 text-slate-500" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <h3 className={cn("text-lg font-black tracking-tight", city.is_active ? "text-slate-800" : "text-slate-400")}>{city.name}</h3>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                                {city.is_active ? 'Active Location' : 'Inactive Location'}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleCityStatus(city.id, city.is_active)}
                          className={cn(
                            "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            city.is_active
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          )}
                        >
                          {city.is_active ? 'Active' : 'Disabled'}
                        </button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingCity(city)}
                          className="h-10 w-10 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingCityId(city.id)}
                          className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {cities.length === 0 && (
                    <div className="p-12 text-center text-slate-400 font-medium">
                      No cities found. Add one above.
                    </div>
                  )}
                </div>

                {/* Delete Confirmation Modal */}
                <Dialog open={!!deletingCityId} onOpenChange={() => setDeletingCityId(null)}>
                  <DialogContent className="glass-card border-0 rounded-[2rem] p-8 max-w-sm">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800">Delete City?</h3>
                      <p className="text-sm text-slate-500 font-medium">This action cannot be undone. It might affect existing users.</p>
                      <div className="flex gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setDeletingCityId(null)} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
                        <Button onClick={handleDeleteCity} className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-200">Delete</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="glass-card p-12 border border-slate-200/60 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                      <Settings className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Platform Settings</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Configuration</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="uppercase text-xs font-black tracking-widest text-slate-500">Commission Rate (%)</Label>
                      <Input
                        type="number"
                        value={settings.commission_rate || ''}
                        onChange={(e) => setSettings({ ...settings, commission_rate: parseFloat(e.target.value) })}
                        placeholder="10"
                        className="h-14 rounded-2xl bg-slate-50 font-bold"
                      />
                      <p className="text-xs text-slate-400">Percentage taken from every booking.</p>
                    </div>

                    <div className="space-y-4">
                      <Label className="uppercase text-xs font-black tracking-widest text-slate-500">Support Email</Label>
                      <Input
                        value={settings.support_email || ''}
                        onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                        placeholder="support@example.com"
                        className="h-14 rounded-2xl bg-slate-50 font-bold"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="uppercase text-xs font-black tracking-widest text-slate-500">Min. Hourly Rate (Rs.)</Label>
                      <Input
                        type="number"
                        value={settings.min_hourly_rate || ''}
                        onChange={(e) => setSettings({ ...settings, min_hourly_rate: parseInt(e.target.value) })}
                        placeholder="500"
                        className="h-14 rounded-2xl bg-slate-50 font-bold"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="uppercase text-xs font-black tracking-widest text-slate-500">Max Gallery Images</Label>
                      <Input
                        type="number"
                        value={settings.max_gallery_images || ''}
                        onChange={(e) => setSettings({ ...settings, max_gallery_images: parseInt(e.target.value) })}
                        placeholder="3"
                        className="h-14 rounded-2xl bg-slate-50 font-bold"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 md:col-span-2">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", settings.maintenance_mode ? "bg-rose-100 text-rose-500" : "bg-slate-200 text-slate-400")}>
                          <Ban className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">Maintenance Mode</h4>
                          <p className="text-xs text-slate-400 font-medium">Disable platform access for users</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                        className={cn("w-16 h-8 rounded-full relative transition-all", settings.maintenance_mode ? "bg-rose-500" : "bg-slate-300")}
                      >
                        <motion.div
                          animate={{ x: settings.maintenance_mode ? 34 : 4 }}
                          className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <MagneticButton onClick={handleSaveSettings} disabled={savingSettings} className="h-14 px-8 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 flex items-center gap-3 font-black uppercase tracking-widest">
                      {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Changes
                    </MagneticButton>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Revenue Chart */}
                  <div className="glass-card p-8 border border-slate-200/60 shadow-xl col-span-2">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-500" />
                      Revenue Trends
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData.revenue}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs ${value}`} />
                          <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* User Growth */}
                  <div className="glass-card p-8 border border-slate-200/60 shadow-xl">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-500" />
                      User Growth
                    </h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Activity Distribution */}
                  <div className="glass-card p-8 border border-slate-200/60 shadow-xl">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-amber-500" />
                      Top Activities
                    </h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.activityDistribution}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Verification Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-4xl p-0 border-0 rounded-[3rem] overflow-hidden glass-card shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-12 space-y-10 border-r border-slate-100">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                  <img src={selectedVerification?.profile?.avatar_url || ''} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedVerification?.full_name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{selectedVerification?.profile?.city}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Document Details</p>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-sm font-bold text-slate-700">Document Type: <span className="text-primary">{selectedVerification?.document_type.replace('_', ' ')}</span></p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Submitted {selectedVerification && format(new Date(selectedVerification.created_at), 'PPP')}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-10">
                <Button onClick={() => { setPendingRejectId(selectedVerification!.id); setShowRejectModal(true); }} variant="outline" className="flex-1 h-14 rounded-2xl text-rose-500 border-slate-200 font-black uppercase text-xs tracking-widest">
                  Reject
                </Button>
                <MagneticButton onClick={() => handleVerification(selectedVerification!.id, 'approve')} className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow-primary">
                  Approve
                </MagneticButton>
              </div>
            </div>

            <div className="p-12 bg-slate-100 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verification Documents</p>
                <div className="space-y-6">
                  <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                    <img src={signedUrls.front} alt="Front" className="w-full object-contain" />
                  </div>
                  {signedUrls.back && (
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                      <img src={signedUrls.back} alt="Back" className="w-full object-contain" />
                    </div>
                  )}
                  <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                    <img src={signedUrls.selfie} alt="Selfie" className="w-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl p-0 border-0 rounded-[3rem] overflow-hidden glass-card shadow-2xl">
          <div className="p-12 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                  <img src={selectedUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedUser?.first_name} {selectedUser?.last_name}</h3>
                    {selectedUser?.is_verified && <BadgeCheck className="w-6 h-6 text-primary" />}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{selectedUser?.city || 'Remote'}</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{selectedUser?.phone || 'No Phone'}</p>
                  </div>
                </div>
              </div>
              <div className={cn("px-4 py-2 rounded-2xl border font-black uppercase text-[10px] tracking-widest", selectedUser?.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100")}>
                {selectedUser?.is_active ? 'Active Node' : 'Suspended'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Booking History</h4>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
                  {userBookings.map((b) => (
                    <div key={b.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight">{b.activity || 'Hangout'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {format(new Date(b.booking_date), 'PPP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-800">Rs. {b.total_amount}</p>
                        <p className={cn("text-[9px] font-black uppercase tracking-widest mt-1", b.status === 'completed' ? "text-emerald-500" : "text-amber-500")}>
                          {b.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  {userBookings.length === 0 && <p className="text-center py-10 text-[10px] font-black uppercase text-slate-300 tracking-widest">No Interaction Logs</p>}
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Administrative Actions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => handleUserAction(selectedUser!.id, selectedUser!.is_identity_verified ? 'identity_unverify' : 'identity_verify')} variant="outline" className="h-20 rounded-2xl flex flex-col gap-2 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50">
                    <Shield className={cn("w-5 h-5", selectedUser?.is_identity_verified ? "text-emerald-500" : "text-slate-400")} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{selectedUser?.is_identity_verified ? 'Verified' : 'Verify ID'}</span>
                  </Button>
                  <Button onClick={() => handleUserAction(selectedUser!.id, selectedUser!.is_verified ? 'remove_badge' : 'special_badge')} variant="outline" className="h-20 rounded-2xl flex flex-col gap-2 border-slate-200 hover:border-primary/20 hover:bg-primary/5">
                    <BadgeCheck className={cn("w-5 h-5", selectedUser?.is_verified ? "text-primary" : "text-slate-400")} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{selectedUser?.is_verified ? 'Remove Badge' : 'Add Badge'}</span>
                  </Button>
                  <Button onClick={() => handleRequestReverify(selectedUser!.id)} variant="outline" className="h-20 rounded-2xl flex flex-col gap-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50">
                    <RefreshCw className="w-5 h-5 text-indigo-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Re-verify</span>
                  </Button>
                  <Button onClick={() => handleUserAction(selectedUser!.id, selectedUser!.is_active ? 'ban' : 'unban')} variant="outline" className={cn("h-20 rounded-2xl flex flex-col gap-2 border-slate-200", selectedUser?.is_active ? "hover:border-rose-200 hover:bg-rose-50" : "hover:border-emerald-200 hover:bg-emerald-50")}>
                    {selectedUser?.is_active ? <UserX className="w-5 h-5 text-rose-500" /> : <UserCheck className="w-5 h-5 text-emerald-500" />}
                    <span className="text-[9px] font-black uppercase tracking-widest">{selectedUser?.is_active ? 'Ban Node' : 'Unban Node'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md p-10 rounded-[2.5rem] border-0 glass-card">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Reject Verification</h3>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Reason for Rejection</Label>
              <Textarea
                placeholder="Documents are unclear, fake ID, or mismatch..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[120px] rounded-2xl bg-white border-slate-200 focus:ring-rose-500/10 focus:border-rose-500/20 text-sm font-bold resize-none"
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setShowRejectModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">
                Cancel
              </Button>
              <Button onClick={confirmReject} disabled={!rejectionReason.trim()} className="flex-1 h-12 rounded-xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-200">
                Confirm Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const Empty = ({ icon: Icon, label }: any) => (
  <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
    <Icon className="w-12 h-12 text-slate-300 mb-6" />
    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{label}</p>
  </div>
);

export default AdminDashboard;