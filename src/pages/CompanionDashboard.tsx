import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, DollarSign, Clock, Users, Check, X, MessageSquare,
  QrCode, Upload, Loader2, TrendingUp, Eye, ArrowRight,
  Shield, Wallet, Zap, Star, Activity, ChevronRight, MapPin,
  LockKeyhole, Award, BarChart3, Filter, MoreVertical, Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChatWindow } from '@/components/ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';
import { GreetingBlock } from '@/components/dashboard/GreetingBlock';
import { StatWidget } from '@/components/dashboard/StatWidget';

interface BookingRequest {
  id: string;
  booking_date: string;
  start_time: string;
  duration_hours: number;
  activity: string;
  total_amount: number;
  status: string;
  payment_status: string;
  user_notes: string | null;
  created_at: string;
  user_id: string;
  user: {
    first_name: string;
    avatar_url: string;
  };
  chat?: {
    id: string;
    starts_at: string;
    ends_at: string;
    grace_period_ends_at: string;
    is_active: boolean;
  } | null;
}

const CompanionDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('bookings');
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [companionProfile, setCompanionProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    averageRating: 0,
    earningsTrend: 0,
    bookingsTrend: 0,
  });
  const [paymentQR, setPaymentQR] = useState<File | null>(null);
  const [paymentQRPreview, setPaymentQRPreview] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => { if (profile?.id) fetchCompanionData(); }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase.channel('companion-bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `companion_id=eq.${profile.id}` }, () => fetchCompanionData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `companion_id=eq.${profile.id}` }, () => fetchCompanionData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const fetchCompanionData = async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    try {
      const { data: comp } = await supabase.from('companion_profiles').select('*').eq('profile_id', profile.id).single();
      setCompanionProfile(comp);
      if (comp?.payment_qr_url) setPaymentQRPreview(comp.payment_qr_url);

      const { data: bList } = await supabase.from('bookings').select('*').eq('companion_id', profile.id).order('created_at', { ascending: false });
      const bWithUsers = await Promise.all((bList || []).map(async (b: any) => {
        const { data: u } = await supabase.from('profiles').select('first_name, avatar_url').eq('user_id', b.user_id).maybeSingle();
        const { data: c } = await supabase.from('chats').select('*').eq('booking_id', b.id).single();
        return { ...b, user: u || { first_name: 'User', avatar_url: null }, chat: c };
      }));
      setBookings(bWithUsers);

      const completed = bWithUsers.filter((b: any) => b.status === 'completed');
      const pending = bWithUsers.filter((b: any) => b.status === 'pending');
      setStats({
        totalEarnings: completed.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        totalBookings: completed.length,
        pendingBookings: pending.length,
        averageRating: comp?.average_rating || 0,
        earningsTrend: 0, // Calculated below
        bookingsTrend: 0, // Calculated below
      });

      // Calculate Activity Trends
      const now = new Date();
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const currentEarnings = completed
        .filter(b => b.created_at >= firstDayCurrentMonth)
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      const lastMonthEarnings = completed
        .filter(b => b.created_at >= firstDayLastMonth && b.created_at < firstDayCurrentMonth)
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      const currentBookings = completed.filter(b => b.created_at >= firstDayCurrentMonth).length;
      const lastMonthBookings = completed.filter(b => b.created_at >= firstDayLastMonth && b.created_at < firstDayCurrentMonth).length;

      const earningsTrendVal = lastMonthEarnings === 0
        ? (currentEarnings > 0 ? 100 : 0)
        : Math.round(((currentEarnings - lastMonthEarnings) / lastMonthEarnings) * 100);

      const bookingsTrendVal = lastMonthBookings === 0
        ? (currentBookings > 0 ? 100 : 0)
        : Math.round(((currentBookings - lastMonthBookings) / lastMonthBookings) * 100);

      setStats(prev => ({
        ...prev,
        earningsTrend: earningsTrendVal,
        bookingsTrend: bookingsTrendVal
      }));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase.from('bookings').update({ status: action === 'accept' ? 'accepted' : 'rejected' }).eq('id', bookingId);
      if (error) throw error;
      const b = bookings.find(x => x.id === bookingId);
      if (b && action === 'accept' && profile?.id) {
        const now = new Date();
        const bDate = new Date(`${b.booking_date}T${b.start_time}`);
        const endsAt = new Date(bDate.getTime() + b.duration_hours * 60 * 60 * 1000);
        const gracePeriodEnds = new Date(endsAt.getTime() + 30 * 60 * 1000); // 30 minutes grace period as per PRD
        await supabase.from('chats').insert({ booking_id: bookingId, user_id: b.user_id, companion_id: profile.id, starts_at: now.toISOString(), ends_at: endsAt.toISOString(), grace_period_ends_at: gracePeriodEnds.toISOString(), is_active: true });
        await supabase.from('notifications').insert({ user_id: b.user_id, type: 'booking_accepted', title: 'Confirmed!', message: `Booking for ${b.activity} accepted.` });
      }
      toast({ title: 'Success', description: `Booking ${action}ed successfully.` });
      fetchCompanionData();
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleRequestPayment = async (bookingId: string) => {
    try {
      const b = bookings.find(x => x.id === bookingId);
      if (!b || !profile?.id) return;
      await supabase.from('payment_requests').insert({ booking_id: bookingId, companion_id: profile.id, user_id: b.user_id, amount: b.total_amount, payment_qr_url: companionProfile?.payment_qr_url, status: 'requested' });
      await supabase.from('bookings').update({ payment_status: 'requested' }).eq('id', bookingId);
      toast({ title: 'Request Sent', description: 'User has been notified.' });
      fetchCompanionData();
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleConfirmPayment = async (bookingId: string) => {
    try {
      const b = bookings.find(x => x.id === bookingId);
      if (!b || !profile?.id) return;
      await supabase.from('payment_requests').update({ status: 'confirmed' }).eq('booking_id', bookingId);
      await supabase.from('bookings').update({ payment_status: 'confirmed', status: 'completed' }).eq('id', bookingId);
      toast({ title: 'Settled', description: 'Payment confirmed & booking completed.' });
      fetchCompanionData();
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleToggleAvailability = async () => {
    if (!profile?.id || !companionProfile) return;
    try {
      const nextStat = !companionProfile.availability_status;
      await supabase.from('companion_profiles').update({ availability_status: nextStat }).eq('profile_id', profile.id);
      setCompanionProfile({ ...companionProfile, availability_status: nextStat });
      toast({ title: nextStat ? 'Live Now' : 'Stealth Now', description: 'Availability updated.' });
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleUploadPaymentQR = async () => {
    if (!paymentQR || !user || !profile?.id) return;
    try {
      const { error: upErr } = await supabase.storage.from('payment-qr').upload(`${user.id}/qr.${paymentQR.name.split('.').pop()}`, paymentQR, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('payment-qr').getPublicUrl(`${user.id}/qr.${paymentQR.name.split('.').pop()}`);
      await supabase.from('companion_profiles').update({ payment_qr_url: data.publicUrl }).eq('profile_id', profile.id);
      setPaymentQRPreview(data.publicUrl);
      toast({ title: 'Success', description: 'Payment QR synchronized.' });
      setActiveTab('bookings');
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => ['accepted', 'active', 'requested', 'paid'].includes(b.status));
  const historyBookings = bookings.filter(b => b.status === 'completed');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Intelligence...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Greeting */}
        <GreetingBlock
          name={profile?.first_name || 'Partner'}
          role="Companion Specialist"
          avatarUrl={profile?.avatar_url}
        />

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10 pb-16">

          {/* Top Row: Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatWidget
              label="Total Earnings"
              value={`Rs. ${stats.totalEarnings.toLocaleString()}`}
              icon={Wallet}
              color="orange"
              trendDirection={stats.earningsTrend >= 0 ? 'up' : 'down'}
              trendLabel={`${Math.abs(stats.earningsTrend)}% trend`}
              trend={[1200, 1500, 1400, 1800, 2200, 1900, 2500]}
            />
            <StatWidget
              label="Completed Meetups"
              value={stats.totalBookings}
              icon={Award}
              color="blue"
              trendDirection={stats.bookingsTrend >= 0 ? 'up' : 'down'}
              trendLabel={`${Math.abs(stats.bookingsTrend)}% monthly`}
              trend={[2, 4, 3, 5, 6, 4, 8]}
            />
            <StatWidget
              label="Active Requests"
              value={stats.pendingBookings}
              icon={Clock}
              color="indigo"
              subValue="Respond within 2h"
            />
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card p-6 border border-slate-100 shadow-sm relative overflow-hidden bg-slate-900 text-white flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
                  <LockKeyhole className="w-5 h-5 text-orange-400" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-end">
                  <div className="w-12 h-12 rounded-full border-4 border-orange-500/20 border-t-orange-500 flex items-center justify-center relative">
                    <span className="text-[10px] font-black">{companionProfile?.availability_status ? '100%' : '0%'}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Active Status</p>
                <div className="flex items-center justify-between">
                  <h4 className={cn("text-xl font-black tracking-tight", companionProfile?.availability_status ? "text-emerald-400" : "text-rose-400")}>
                    {companionProfile?.availability_status ? 'Live Now' : 'Stealth Mode'}
                  </h4>
                  <Switch
                    checked={companionProfile?.availability_status || false}
                    onCheckedChange={handleToggleAvailability}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Middle Row: Main Work Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Col: Activity Manager */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  Manage Activities
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold">{bookings.length}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:shadow-sm">
                    <Filter className="w-3.5 h-3.5 mr-2" /> Filters
                  </Button>
                  <div className="flex gap-1">
                    {[
                      { id: 'bookings', label: 'Requests' },
                      { id: 'active', label: 'Active' },
                      { id: 'history', label: 'History' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                          activeTab === t.id ? "bg-white shadow-sm text-slate-900 border border-slate-100" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {activeTab === 'bookings' && (
                    <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      {pendingBookings.length > 0 ? (
                        pendingBookings.map((b) => (
                          <div key={b.id} className="glass-card p-5 border border-slate-100 flex items-center justify-between group hover:border-orange-200 transition-all bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                                <img src={b.user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h5 className="font-black text-slate-800 text-sm">{b.user?.first_name}</h5>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-orange-400" /> {format(new Date(b.booking_date), 'MMM d')}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-blue-400" /> Kathmandu
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right hidden sm:block px-6 border-x border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rate</p>
                                <p className="font-black text-slate-800">Rs. {b.total_amount}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => handleBookingAction(b.id, 'reject')} variant="ghost" size="sm" className="w-9 h-9 rounded-xl p-0 text-slate-300 hover:bg-rose-50 hover:text-rose-500">
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button onClick={() => handleBookingAction(b.id, 'accept')} size="sm" className="h-9 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
                                  Accept
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : <Empty icon={Calendar} label="No Pending Requests" />}
                    </motion.div>
                  )}

                  {activeTab === 'active' && (
                    <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      {activeBookings.length > 0 ? (
                        activeBookings.map((b) => (
                          <div key={b.id} className="glass-card p-5 border border-slate-100 flex items-center justify-between group hover:border-primary/20 transition-all bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm">
                                <img src={b.user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h5 className="font-black text-slate-800 text-sm">{b.user?.first_name}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                    b.status === 'accepted' ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500")}>
                                    {b.status}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Activity: {b.activity}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {b.chat && (
                                <Button onClick={() => { setSelectedBooking(b); setShowChat(true); }} variant="outline" size="sm" className="h-9 rounded-xl border-slate-100 flex items-center gap-2 px-4 text-[9px] font-black uppercase tracking-widest">
                                  <MessageSquare className="w-3.5 h-3.5" /> Chat
                                </Button>
                              )}

                              {b.payment_status === 'pending' && (
                                <Button onClick={() => handleRequestPayment(b.id)} size="sm" className="h-9 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[9px] font-black uppercase tracking-widest shadow-lg">
                                  Request Payment
                                </Button>
                              )}

                              {b.payment_status === 'paid' && (
                                <Button onClick={() => handleConfirmPayment(b.id)} size="sm" className="h-9 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                  Confirm Payment
                                </Button>
                              )}

                              {['requested', 'confirmed'].includes(b.payment_status) && (
                                <div className={cn("px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest",
                                  b.payment_status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                  {b.payment_status}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : <Empty icon={Activity} label="No Active Sessions" />}
                    </motion.div>
                  )}

                  {activeTab === 'history' && (
                    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      {historyBookings.length > 0 ? (
                        historyBookings.map((b) => (
                          <div key={b.id} className="glass-card p-4 border border-slate-100 flex items-center justify-between opacity-80 hover:opacity-100 bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden grayscale">
                                <img src={b.user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-black text-slate-800 text-xs">{b.user?.first_name}</p>
                                <p className="text-[9px] font-bold text-slate-400">{format(new Date(b.booking_date), 'PPP')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-black text-slate-900 text-xs">Rs. {b.total_amount}</p>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                          </div>
                        ))
                      ) : <Empty icon={Shield} label="Clean Registry" />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Col: Widgets Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">

              {/* Analytics Widget */}
              <div className="glass-card p-6 border border-slate-100 shadow-sm space-y-6 bg-white/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Progress</h4>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                      <motion.circle
                        cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray={352}
                        initial={{ strokeDashoffset: 352 }}
                        animate={{ strokeDashoffset: 352 - (352 * (Math.abs(stats.bookingsTrend) / 100)) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-slate-900"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-800">{Math.abs(stats.bookingsTrend)}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Total Earnings</span>
                  <span className="text-slate-900 font-black">Rs. {stats.totalEarnings.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick Setting: Payment */}
              <button
                onClick={() => setActiveTab('settings')}
                className="glass-card p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:bg-white hover:border-indigo-200 transition-all bg-white/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Configure</p>
                    <h4 className="text-sm font-black text-slate-800 tracking-tight transition-colors group-hover:text-indigo-600">Payment Settings</h4>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 transition-transform group-hover:translate-x-1" />
              </button>

            </div>
          </div>

          {/* Payment Settings Tab Content Overlay */}
          <AnimatePresence>
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setActiveTab('bookings')} />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-lg glass-card p-10 bg-white shadow-3xl border-0 overflow-hidden"
                >
                  <div className="absolute top-6 right-6">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('bookings')} className="w-10 h-10 p-0 rounded-full hover:bg-slate-100 text-slate-400">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <QrCode className="w-7 h-7 text-indigo-500" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Payment Gateway</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronize your regional QR details</p>
                      </div>
                    </div>

                    {paymentQRPreview ? (
                      <div className="relative group p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center min-h-[300px]">
                        <img src={paymentQRPreview} alt="QR" className="w-64 h-64 object-contain mix-blend-multiply transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] flex items-center justify-center">
                          <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Drop to Update
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 bg-slate-50">
                        <QrCode className="w-12 h-12 text-slate-200" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No QR Synchronized</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) { setPaymentQR(f); setPaymentQRPreview(URL.createObjectURL(f)); }
                          }}
                          className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-bold p-4 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:font-black file:text-[10px] file:uppercase opacity-0 absolute inset-0 cursor-pointer z-10"
                        />
                        <div className="h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center px-6 gap-4">
                          <Users className="w-5 h-5 text-indigo-500" />
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Choose new QR image</span>
                        </div>
                      </div>
                      <Button
                        onClick={handleUploadPaymentQR}
                        disabled={!paymentQR}
                        className="h-16 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-widest shadow-2xl transition-all"
                      >
                        Save QR Code
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {showChat && selectedBooking?.chat && (
          <ChatWindow
            chatId={selectedBooking.chat.id}
            otherUserName={selectedBooking.user?.first_name || 'User'}
            otherUserAvatar={selectedBooking.user?.avatar_url}
            onClose={() => { setShowChat(false); setSelectedBooking(null); }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

const Empty = ({ icon: Icon, label }: any) => (
  <div className="flex flex-col items-center justify-center py-20 opacity-20 group">
    <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-8 h-8 text-slate-300" strokeWidth={2.5} />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{label}</p>
  </div>
);

export default CompanionDashboard;
