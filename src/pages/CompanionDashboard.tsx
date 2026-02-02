import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, DollarSign, Clock, Users, Check, X, MessageSquare,
  QrCode, Upload, Loader2, TrendingUp, Eye, ArrowRight,
  Shield, Wallet, Zap, Star, Activity, ChevronRight, MapPin
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
      });
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
        const gracePeriodEnds = new Date(endsAt.getTime() + 15 * 60 * 1000); // 15 minutes grace period
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
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => ['accepted', 'active'].includes(b.status));
  const historyBookings = bookings.filter(b => b.status === 'completed');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } }
  };

  if (isLoading) return (
    <DashboardLayout title="Companion Dashboard">
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Dashboard...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Companion Dashboard" subtitle="Manage your bookings and earnings">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10 pb-16">

        {/* Header Stats Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Earnings', val: `Rs. ${stats.totalEarnings}`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Completed Bookings', val: stats.totalBookings, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { label: 'Pending Requests', val: stats.pendingBookings, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Rating', val: stats.averageRating.toFixed(1), icon: Star, color: 'text-primary', bg: 'bg-primary/5' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 border border-slate-200/60 shadow-xl group hover:border-primary/20 transition-all">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black text-slate-800 tracking-tight">{stat.val}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-4 glass-card p-6 lg:p-8 bg-slate-900 border-0 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20">
              <Zap className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Availability</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Set whether you're available for bookings</p>
              </div>
              <div className="flex items-center justify-between pt-6">
                <span className={cn("text-xs font-black uppercase tracking-widest", companionProfile?.availability_status ? "text-emerald-400" : "text-rose-400")}>
                  {companionProfile?.availability_status ? 'Available' : 'Unavailable'}
                </span>
                <Switch
                  checked={companionProfile?.availability_status || false}
                  onCheckedChange={handleToggleAvailability}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tactical View Tabs */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex gap-8">
              {[
                { id: 'bookings', label: 'Pending Bookings', count: pendingBookings.length },
                { id: 'active', label: 'Active Bookings', count: activeBookings.length },
                { id: 'history', label: 'Completed', count: historyBookings.length },
                { id: 'settings', label: 'Payment Settings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] pb-4 relative transition-colors",
                    activeTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && <span className="ml-2 text-[9px] text-primary">{tab.count}</span>}
                  {activeTab === tab.id && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {activeTab === 'bookings' && (
              <motion.div key="pending" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                {pendingBookings.length > 0 ? (
                  pendingBookings.map((b, i) => (
                    <div key={b.id} className="glass-card p-8 border border-slate-200/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-amber-200 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[1.8rem] bg-slate-100 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                          <img src={b.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-1">{b.user?.first_name}</h4>
                          <div className="flex items-center gap-3 text-slate-400">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                              <Calendar className="w-3.5 h-3.5" /> {format(new Date(b.booking_date), 'MMM d')}
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                              <Clock className="w-3.5 h-3.5" /> {b.start_time}
                            </div>
                          </div>
                          <p className="mt-2 text-[10px] font-bold text-primary uppercase tracking-widest">Activity: {b.activity}</p>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-6">
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {b.total_amount}</p>
                        <div className="flex gap-3">
                          <Button onClick={() => handleBookingAction(b.id, 'reject')} variant="ghost" className="h-12 w-12 rounded-2xl p-0 hover:bg-rose-50 text-rose-500">
                            <X className="w-5 h-5" />
                          </Button>
                          <MagneticButton onClick={() => handleBookingAction(b.id, 'accept')} className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-glow-primary">
                            Accept
                          </MagneticButton>
                        </div>
                      </div>
                    </div>
                  ))
                ) : <Empty icon={Calendar} label="No Pending Bookings" />}
              </motion.div>
            )}

            {activeTab === 'active' && (
              <motion.div key="active" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                {activeBookings.length > 0 ? (
                  activeBookings.map((b) => (
                    <div key={b.id} className="glass-card p-8 border border-slate-200/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 overflow-hidden shadow-sm">
                          <img src={b.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-slate-800 tracking-tight mb-1">{b.user?.first_name}</h4>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[9px] font-black uppercase tracking-[0.15em]">
                            <Activity className="w-3 h-3" /> Active Booking
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {b.chat && (
                          <Button onClick={() => { setSelectedBooking(b); setShowChat(true); }} variant="outline" className="h-12 rounded-2xl border-slate-200 flex items-center gap-3 px-6 font-black uppercase text-[10px] tracking-widest">
                            <MessageSquare className="w-4 h-4" /> Chat
                          </Button>
                        )}

                        {b.payment_status === 'pending' && (
                          <MagneticButton onClick={() => handleRequestPayment(b.id)} className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-glow-accent">
                            Request Payment
                          </MagneticButton>
                        )}

                        {b.payment_status === 'paid' && (
                          <MagneticButton onClick={() => handleConfirmPayment(b.id)} className="h-12 px-8 rounded-2xl bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest">
                            Confirm Payment
                          </MagneticButton>
                        )}

                        <div className={cn("px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                          b.payment_status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            b.payment_status === 'requested' ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {b.payment_status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : <Empty icon={Activity} label="No Missions in Progress" />}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                {historyBookings.length > 0 ? (
                  historyBookings.map((b) => (
                    <div key={b.id} className="glass-card p-6 border border-slate-200/50 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden grayscale">
                          <img src={b.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 tracking-tight">{b.user?.first_name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(b.booking_date), 'PPP')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 tracking-tight">Rs. {b.total_amount}</p>
                        <div className="text-[8px] font-black uppercase text-emerald-500 tracking-widest mt-1 italic">Completed</div>
                      </div>
                    </div>
                  ))
                ) : <Empty icon={Shield} label="No Completed Bookings" />}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto w-full">
                <div className="glass-card p-10 border border-slate-200/60 shadow-2xl space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">Payment QR Code</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload your payment QR for users to pay you</p>
                    </div>
                  </div>

                  {paymentQRPreview && (
                    <div className="relative group">
                      <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <img src={paymentQRPreview} alt="QR" className="w-64 h-64 object-contain mix-blend-multiply" />
                      </div>
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] flex items-center justify-center">
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Update QR Code</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Upload QR Code</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) { setPaymentQR(f); setPaymentQRPreview(URL.createObjectURL(f)); }
                        }}
                        className="h-16 rounded-2xl bg-white border-slate-200 font-bold p-4 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:font-black file:text-[10px] file:uppercase"
                      />
                    </div>
                    <MagneticButton onClick={handleUploadPaymentQR} disabled={!paymentQR} className="h-14 w-full rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow-primary">
                      Save QR Code
                    </MagneticButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>

      {/* Embedded Chat Modal */}
      <AnimatePresence>
        {showChat && selectedBooking?.chat && (
          <ChatWindow chatId={selectedBooking.chat.id} otherUserName={selectedBooking.user?.first_name || 'User'} otherUserAvatar={selectedBooking.user?.avatar_url} onClose={() => { setShowChat(false); setSelectedBooking(null); }} />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

const Empty = ({ icon: Icon, label }: any) => (
  <div className="flex flex-col items-center justify-center py-32 opacity-20 group">
    <Icon className="w-16 h-16 text-slate-300 mb-6 group-hover:scale-110 transition-transform" />
    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{label}</p>
  </div>
);

export default CompanionDashboard;
