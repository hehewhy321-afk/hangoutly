import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Filter, MapPin, Calendar, Clock,
    Star, Shield, Zap, TrendingUp, Users,
    Heart, Compass, ArrowRight, CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GreetingBlock } from '@/components/dashboard/GreetingBlock';
import { StatWidget } from '@/components/dashboard/StatWidget';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState({
        activeBookings: 0,
        totalSpent: 0,
        verificationStatus: 'unverified',
        favoriteCompanions: 0
    });
    const [recentCompanions, setRecentCompanions] = useState<any[]>([]);

    useEffect(() => {
        if (profile?.id) {
            fetchUserStats();
        }
    }, [profile?.id]);

    const fetchUserStats = async () => {
        // In a real app, these would be real queries
        setStats({
            activeBookings: 2,
            totalSpent: 12500,
            verificationStatus: profile?.is_verified ? 'verified' : 'pending',
            favoriteCompanions: 5
        });

        // Fetch some companions for the "Featured" section
        const { data } = await supabase
            .from('companion_profiles')
            .select('*, profile:profiles(first_name, avatar_url)')
            .limit(3);
        setRecentCompanions(data || []);
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto space-y-8">
                <GreetingBlock
                    name={profile?.first_name || 'Adventurer'}
                    role="Verified Member"
                    avatarUrl={profile?.avatar_url}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatWidget
                        label="Active Bookings"
                        value={stats.activeBookings}
                        icon={Calendar}
                        color="indigo"
                        subValue="Next: Today 6PM"
                    />
                    <StatWidget
                        label="Total Invested"
                        value={`Rs. ${stats.totalSpent.toLocaleString()}`}
                        icon={Zap}
                        color="orange"
                        trend={[2000, 3000, 2500, 4000, 5000]}
                    />
                    <StatWidget
                        label="Favorites"
                        value={stats.favoriteCompanions}
                        icon={Heart}
                        color="rose"
                    />
                    <motion.div
                        whileHover={{ y: -5 }}
                        className={cn(
                            "glass-card p-6 border shadow-sm relative overflow-hidden flex flex-col justify-between",
                            stats.verificationStatus === 'verified' ? "bg-emerald-500 text-white border-emerald-400" : "bg-amber-500 text-white border-amber-400"
                        )}
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
                                {stats.verificationStatus === 'verified' ? <CheckCircle2 className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-white" />}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Identity Status</p>
                            <h4 className="text-xl font-black tracking-tight uppercase">
                                {stats.verificationStatus === 'verified' ? 'Fully Verified' : 'Action Required'}
                            </h4>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Discovery Feed */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Top Companions Near You</h3>
                            <Link to="/discover" className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                                View All <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recentCompanions.map((comp) => (
                                <motion.div
                                    key={comp.id}
                                    whileHover={{ y: -10 }}
                                    className="glass-card overflow-hidden border border-slate-100 shadow-xl group"
                                >
                                    <div className="aspect-[4/5] relative">
                                        <img
                                            src={comp.profile?.avatar_url || "https://images.unsplash.com/photo-1517841905240-472988babdf9"}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <p className="text-lg font-black tracking-tight">{comp.profile?.first_name}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> Kathmandu
                                            </p>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <div className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-[10px] font-black flex items-center gap-1 border border-white/10">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {comp.average_rating || '5.0'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Starting from</p>
                                            <p className="font-black text-slate-800">Rs. {comp.hourly_rate || '1,500'}/hr</p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="rounded-xl border border-slate-100 hover:bg-slate-50">
                                            <Compass className="w-4 h-4 text-slate-400" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Safety Banner */}
                        <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden group">
                            <div className="relative z-10 space-y-4 max-w-md">
                                <h4 className="text-3xl font-black tracking-tighter leading-none">Your safety is our top priority.</h4>
                                <p className="text-sm font-medium text-indigo-100 leading-relaxed">
                                    All companions are 100% verified with government IDs. Use our secure QR payment for worry-free transactions.
                                </p>
                                <Button className="h-12 px-8 rounded-2xl bg-white text-indigo-600 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-indigo-50 transition-all">
                                    View Safety Protocol
                                </Button>
                            </div>
                            <Shield className="absolute -right-10 -bottom-10 w-64 h-64 text-indigo-500 opacity-20 pointer-events-none group-hover:rotate-12 transition-transform duration-1000" />
                        </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-card p-8 border border-slate-100 shadow-sm space-y-6">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Quick Navigation</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Discover', icon: Compass, color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { label: 'Map View', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { label: 'Bookings', icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                                    { label: 'Support', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
                                ].map((nav, i) => (
                                    <button key={i} className="flex flex-col items-center justify-center p-4 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-all gap-3 group">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", nav.bg)}>
                                            <nav.icon className={cn("w-5 h-5", nav.color)} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{nav.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-8 border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Ongoing Mission</h4>
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shadow-sm">
                                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800">Hangout with Sarah</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active • 2h remaining</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '65%' }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                                <Button className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-xl">
                                    Open Secure Chat
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserDashboard;
