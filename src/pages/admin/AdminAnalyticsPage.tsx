import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Loader2, Calendar } from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const AdminAnalyticsPage = () => {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [analyticsData, setAnalyticsData] = useState<any>({ revenue: [], userTrend: [], activityDistribution: [] });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (isAdmin) fetchAnalytics();
    }, [isAdmin]);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            // @ts-ignore
            const { data: appSettings } = await supabase.from('app_settings').select('*');
            const settingsMap: any = {};
            (appSettings || []).forEach((item: any) => { settingsMap[item.key] = item.value; });

            const [profilesRes, bookingsRes] = await Promise.all([
                supabase.from('profiles').select('created_at'),
                supabase.from('bookings').select('total_amount, status, created_at, activity')
            ]);

            // Process Revenue & Activities
            const allBookings = bookingsRes.data || [];
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

            const revenueChartData = Object.entries(revenueByAcc)
                .map(([date, amount]) => ({ date, amount }))
                .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(-30);

            const activityChartData = Object.entries(activityCount)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => (b.value as number) - (a.value as number))
                .slice(0, 5);

            // User Trend
            const userTrendAcc: any = {};
            (profilesRes.data || []).forEach((u: any) => {
                const date = u.created_at.split('T')[0];
                userTrendAcc[date] = (userTrendAcc[date] || 0) + 1;
            });
            const userTrendChartData = Object.entries(userTrendAcc)
                .map(([date, count]) => ({ date, count }))
                .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(-30);

            setAnalyticsData({
                revenue: revenueChartData,
                userTrend: userTrendChartData,
                activityDistribution: activityChartData
            });
        } catch (e: any) {
            toast({ title: 'Error processing analytics', description: e.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) return (
        <AdminLayout title="Analytics & Insights">
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Processing Big Data...</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout title="Analytics & Insights" subtitle="Real-time performance metrics and user growth trends">
            <div className="max-w-[1600px] mx-auto space-y-10">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Chart */}
                    <section className="glass-card p-10 border border-slate-200/60 shadow-xl bg-white rounded-[2.5rem] space-y-8 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Revenue Growth</h3>
                            </div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Last 30 Days</p>
                        </div>

                        <div className="h-[350px] w-full relative">
                            {analyticsData.revenue.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analyticsData.revenue}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#revenueGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Revenue Data Yet</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* User Growth Chart */}
                    <section className="glass-card p-10 border border-slate-200/60 shadow-xl bg-white rounded-[2.5rem] space-y-8 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">User Signups</h3>
                            </div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Registration Trend</p>
                        </div>

                        <div className="h-[350px] w-full relative">
                            {analyticsData.userTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analyticsData.userTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                        />
                                        <Line type="stepAfter" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting for first signups</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Activity Distribution */}
                    <section className="glass-card p-10 border border-slate-200/60 shadow-xl bg-white rounded-[2.5rem] space-y-8 lg:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Popular Activities</h3>
                        </div>

                        {analyticsData.activityDistribution.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analyticsData.activityDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {analyticsData.activityDistribution.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][index % 5]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-4">
                                    {analyticsData.activityDistribution.map((entry: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][index % 5] }} />
                                                <span className="text-sm font-bold text-slate-700 capitalize">{entry.name}</span>
                                            </div>
                                            <span className="font-black text-slate-900">{entry.value} bookings</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[200px] w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No bookings recorded yet</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalyticsPage;
