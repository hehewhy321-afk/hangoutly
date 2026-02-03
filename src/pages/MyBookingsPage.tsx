import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Calendar, Clock, MessageCircle, CreditCard, X,
  ArrowLeft, Loader2, Ban, Flag, MoreHorizontal, Heart, RefreshCw,
  Search, Filter, ChevronRight, Activity, MapPin, Sparkles, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChatWindow } from '@/components/ChatWindow';
import { PaymentModal } from '@/components/PaymentModal';
import { BlockReportModal } from '@/components/BlockReportModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  duration_hours: number;
  activity: string;
  total_amount: number;
  status: string;
  payment_status: string;
  user_id: string;
  companion_id: string;
  companion: {
    id: string;
    first_name: string;
    avatar_url: string;
    city: string;
    user_id: string;
  } | null;
  chat?: {
    id: string;
    starts_at: string;
    ends_at: string;
    grace_period_ends_at: string;
    is_active: boolean;
  } | null;
}

const MyBookingsPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'favorites'>('upcoming');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [blockReportTarget, setBlockReportTarget] = useState<{ id: string; name: string } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('my-bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` }, () => fetchBookings())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `user_id=eq.${user.id}` }, () => fetchBookings())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${user.id}` }, () => fetchFavorites())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`*, companion:companion_id(id, first_name, avatar_url, city, user_id)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const bookingsWithChats = await Promise.all((data || []).map(async (booking) => {
        const { data: chatData } = await supabase.from('chats').select('*').eq('booking_id', booking.id).single();
        return { ...booking, chat: chatData };
      }));
      setBookings(bookingsWithChats);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    setLoadingFavorites(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`id, companion_profile_id, companion_profile:companion_profile_id(id, hourly_rate, activities, profile:profile_id(id, first_name, avatar_url, city, profession, is_online))`)
        .eq('user_id', user.id);
      if (error) throw error;
      setFavorites(data || []);
    } catch (e) { console.error(e); } finally { setLoadingFavorites(false); }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      await supabase.from('favorites').delete().eq('id', favoriteId);
      toast({ title: 'Removed', description: 'Companion removed from favorites.' });
      fetchFavorites();
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !user) return;
    setIsCancelling(true);
    try {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled', cancelled_by: user.id }).eq('id', selectedBooking.id);
      if (error) throw error;
      if (selectedBooking.companion) {
        await supabase.from('notifications').insert({ user_id: selectedBooking.companion.user_id, type: 'booking_cancelled', title: 'Booking Cancelled', message: `Booking for ${selectedBooking.activity} cancelled.`, data: { booking_id: selectedBooking.id } });
      }
      toast({ title: 'Cancelled', description: 'Booking has been cancelled.' });
      fetchBookings();
    } catch (e: any) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); } finally { setIsCancelling(false); setShowCancelDialog(false); }
  };

  const canChat = (booking: Booking) => {
    if (!booking.chat || !['accepted', 'active', 'completed'].includes(booking.status)) return false;
    const now = new Date();
    return now >= new Date(booking.chat.starts_at) && now <= new Date(booking.chat.grace_period_ends_at);
  };

  const upcomingBookings = bookings.filter(b => new Date(b.booking_date) >= new Date() && !['completed', 'cancelled', 'rejected'].includes(b.status));
  const pastBookings = bookings.filter(b => new Date(b.booking_date) < new Date() || ['completed', 'cancelled', 'rejected'].includes(b.status));
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' };
      case 'accepted': return { label: 'Confirmed', icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'active': return { label: 'In Progress', icon: Activity, color: 'text-primary', bg: 'bg-primary/5' };
      case 'completed': return { label: 'Completed', icon: Sparkles, color: 'text-slate-400', bg: 'bg-slate-50' };
      default: return { label: status, icon: X, color: 'text-rose-500', bg: 'bg-rose-50' };
    }
  };

  return (
    <DashboardLayout title="Booking Ledger" subtitle="Your chronicle of connections">
      <div className="flex flex-col gap-8 pb-12">
        {/* Modern Tab System */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm w-fit">
            {[
              { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
              { id: 'past', label: 'History', count: pastBookings.length },
              { id: 'favorites', label: 'Favorites', count: favorites.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                  activeTab === tab.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {tab.label}
                  <span className={cn("px-1.5 py-0.5 rounded-md text-[8px] font-black", activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400")}>
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input placeholder="Search connections..." className="h-12 pl-12 pr-6 rounded-2xl bg-white border border-slate-200 text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none w-full md:w-64" />
            </div>
            <Button variant="outline" className="h-12 w-12 rounded-2xl p-0 border-slate-200 bg-white">
              <Filter className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* List Content */}
        {(authLoading || isLoading) ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-[2rem] bg-primary/5 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading your history...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {activeTab === 'favorites' ? (
                favorites.length > 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav, idx) => {
                      const profile = fav.companion_profile?.profile;
                      return (
                        <motion.div key={fav.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }} className="glass-card group border border-slate-200/50 hover:border-primary/20 transition-all p-6 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4">
                            <button onClick={() => removeFavorite(fav.id)} className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center transition-transform hover:scale-110">
                              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                            </button>
                          </div>

                          <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 overflow-hidden shadow-sm">
                                <img src={profile?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">{profile?.first_name}</h3>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-slate-300" />
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{profile?.city}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                              <div className="flex-1">
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] mb-0.5">Rates</p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">Rs. {fav.companion_profile?.hourly_rate}/hr</p>
                              </div>
                              <div className="w-[1px] h-6 bg-slate-200" />
                              <div className="flex-1 text-right">
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] mb-0.5">Status</p>
                                <p className={cn("text-xs font-black uppercase tracking-widest", profile?.is_online ? "text-emerald-500" : "text-slate-400")}>
                                  {profile?.is_online ? "Active Now" : "Offline"}
                                </p>
                              </div>
                            </div>

                            <MagneticButton onClick={() => navigate(`/discover?profile=${profile?.id}`)} className="h-12 w-full rounded-2xl font-black uppercase text-[10px] tracking-widest">
                              Instant Rebook
                              <RefreshCw className="w-4 h-4 ml-2" />
                            </MagneticButton>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <EmptyState key="no-favs" icon={Heart} title="The Heart is Quiet" desc="Add companions to your inner circle for quick rebooking." actionLabel="Explore Talent" onAction={() => navigate('/discover')} />
                )
              ) : (
                displayedBookings.length > 0 ? (
                  <div className="space-y-6">
                    {displayedBookings.map((booking, idx) => {
                      const status = getStatusConfig(booking.status);
                      return (
                        <motion.div key={booking.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }} className="glass-card group border border-slate-200/50 hover:border-primary/20 transition-all p-6 lg:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center gap-8 relative overflow-hidden">
                          <div className={cn("absolute top-0 left-0 w-1.5 h-full", status.color.replace('text-', 'bg-'))} />

                          {/* Companion Info */}
                          <div className="flex items-center gap-5 w-full lg:w-auto lg:min-w-[280px]">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-[1.8rem] bg-slate-100 overflow-hidden shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                              <img src={booking.companion?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h3 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tighter mb-1.5">{booking.companion?.first_name}</h3>
                              <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.15em]", status.bg, status.color, status.color.replace('text-', 'border-').replace('500', '200'))}>
                                <status.icon className="w-3 h-3" />
                                {status.label}
                              </div>
                            </div>
                          </div>

                          {/* Details Bento */}
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 w-full">
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Date</p>
                              <p className="text-sm font-black text-slate-700 tracking-tight">{format(new Date(booking.booking_date), 'MMM d, yyyy')}</p>
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Duration</p>
                              <p className="text-sm font-black text-slate-700 tracking-tight">{booking.start_time} • {booking.duration_hours}h</p>
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Activity</p>
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="text-sm font-black text-slate-700 tracking-tight truncate">{booking.activity}</span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total</p>
                              <p className="text-lg font-black text-slate-900 tracking-tighter">Rs. {booking.total_amount}</p>
                            </div>
                          </div>

                          {/* Actions Container */}
                          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100 justify-end">
                            {canChat(booking) && (
                              <Button variant="ghost" onClick={() => { setSelectedBooking(booking); setShowChat(true); }} className="h-11 lg:h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest px-6 shadow-glow-primary w-full sm:w-auto">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Chat
                              </Button>
                            )}

                            {booking.payment_status === 'requested' && (
                              <MagneticButton onClick={() => { setSelectedBooking(booking); setShowPayment(true); }} className="h-11 lg:h-12 rounded-xl font-black uppercase text-[10px] tracking-widest px-6 shadow-glow-accent w-full sm:w-auto">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay
                              </MagneticButton>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                                  <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100">
                                {booking.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setShowCancelDialog(true); }} className="p-3 rounded-xl text-rose-500 font-bold focus:bg-rose-50 focus:text-rose-600 cursor-pointer">
                                    <X className="w-4 h-4 mr-3" />
                                    Retract Request
                                  </DropdownMenuItem>
                                )}
                                {booking.companion && (
                                  <>
                                    <DropdownMenuItem onClick={() => { setBlockReportTarget({ id: booking.companion!.user_id, name: booking.companion!.first_name }); setShowBlockModal(true); }} className="p-3 rounded-xl font-bold focus:bg-slate-50 cursor-pointer">
                                      <Ban className="w-4 h-4 mr-3 text-slate-400" />
                                      Blacklist User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setBlockReportTarget({ id: booking.companion!.user_id, name: booking.companion!.first_name }); setShowReportModal(true); }} className="p-3 rounded-xl font-bold focus:bg-slate-50 cursor-pointer">
                                      <Flag className="w-4 h-4 mr-3 text-slate-400" />
                                      Incident Report
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState key="no-bookings" icon={Calendar} title="Ledger is Waiting" desc={`You have no ${activeTab} records. Let's start building your network.`} actionLabel="Connect Now" onAction={() => navigate('/discover')} />
                )
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <AnimatePresence>
        {showChat && selectedBooking?.chat && (
          <ChatWindow chatId={selectedBooking.chat.id} otherUserName={selectedBooking.companion?.first_name || 'Companion'} otherUserAvatar={selectedBooking.companion?.avatar_url} onClose={() => { setShowChat(false); setSelectedBooking(null); }} />
        )}
      </AnimatePresence>
      <PaymentModal isOpen={showPayment} onClose={() => { setShowPayment(false); setSelectedBooking(null); }} bookingId={selectedBooking?.id || ''} onPaymentComplete={fetchBookings} />
      <BlockReportModal isOpen={showBlockModal} onClose={() => { setShowBlockModal(false); setBlockReportTarget(null); }} targetUserId={blockReportTarget?.id || ''} targetUserName={blockReportTarget?.name || ''} mode="block" />
      <BlockReportModal isOpen={showReportModal} onClose={() => { setShowReportModal(false); setBlockReportTarget(null); setSelectedBooking(null); }} targetUserId={blockReportTarget?.id || ''} targetUserName={blockReportTarget?.name || ''} mode="report" bookingId={selectedBooking?.id} />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="rounded-[2.5rem] p-10 border-0 shadow-2xl overflow-hidden glass-card">
          <div className="absolute top-0 right-0 p-8 opacity-10"><X className="w-32 h-32" /></div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black text-slate-800 tracking-tight">Retract Booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium py-4">
              This action terminates the connection sequence for this specific occurrence. The companion will be notified of your decision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4">
            <AlertDialogCancel className="h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest border-slate-200">Maintain Request</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelBooking} disabled={isCancelling} className="h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest">
              {isCancelling && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Retract Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

const EmptyState = ({ icon: Icon, title, desc, actionLabel, onAction }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 shadow-sm">
      <Icon className="w-10 h-10 text-slate-200" />
    </div>
    <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{title}</h3>
    <p className="text-slate-500 font-medium mb-10 leading-relaxed uppercase text-[10px] tracking-[0.2em]">{desc}</p>
    <MagneticButton onClick={onAction} className="h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow-primary">
      {actionLabel}
      <ChevronRight className="w-5 h-5 ml-2" />
    </MagneticButton>
  </motion.div>
);

export default MyBookingsPage;
