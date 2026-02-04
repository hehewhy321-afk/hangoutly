import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, DollarSign, Percent, Shield, Globe } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const AdminSettingsPage = () => {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isAdmin) fetchSettings();
    }, [isAdmin]);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            // @ts-ignore
            const { data, error } = await supabase.from('app_settings').select('*');
            if (error) throw error;

            const settingsMap: any = {};
            (data || []).forEach((item: any) => {
                settingsMap[item.key] = item.value;
            });
            setSettings(settingsMap);
        } catch (e: any) {
            toast({ title: 'Error fetching settings', description: e.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const updates = Object.entries(settings).map(([key, value]) => ({
                key,
                value,
                updated_at: new Date().toISOString()
            }));

            // @ts-ignore
            const { error } = await supabase.from('app_settings').upsert(updates);
            if (error) throw error;

            toast({ title: 'Settings Saved', description: 'Platform configuration has been updated.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isLoading) return (
        <AdminLayout title="Platform Settings">
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Settings...</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout title="Platform Settings" subtitle="Global configuration and economic parameters">
            <div className="max-w-[1000px] mx-auto space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Financial Section */}
                    <section className="glass-card p-10 border border-slate-200/60 shadow-xl bg-white rounded-[2.5rem] space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Financials</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Commission Rate (%)</Label>
                                <div className="relative">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <Input
                                        type="number"
                                        value={(settings.commission_rate || 0.1) * 100}
                                        onChange={(e) => setSettings({ ...settings, commission_rate: parseFloat(e.target.value) / 100 })}
                                        className="h-14 pl-12 rounded-2xl border-slate-200 font-bold text-lg"
                                    />
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium">The percentage Hangoutly takes from each booking.</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minimum Payout (Rs.)</Label>
                                <Input
                                    type="number"
                                    value={settings.min_payout || 500}
                                    onChange={(e) => setSettings({ ...settings, min_payout: parseInt(e.target.value) })}
                                    className="h-14 rounded-2xl border-slate-200 font-bold text-lg"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Security Section */}
                    <section className="glass-card p-10 border border-slate-200/60 shadow-xl bg-white rounded-[2.5rem] space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Trust & Safety</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div>
                                    <p className="text-xs font-black text-slate-800">Strict Verification</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Manual Review Required</p>
                                </div>
                                <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer" onClick={() => setSettings({ ...settings, strict_verification: !settings.strict_verification })}>
                                    <motion.div
                                        animate={{ x: settings.strict_verification ? 24 : 0 }}
                                        className={cn("w-4 h-4 rounded-full shadow-sm", settings.strict_verification ? "bg-primary" : "bg-white")}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div>
                                    <p className="text-xs font-black text-slate-800">Global Signups</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Allow Non-Nepal IPs</p>
                                </div>
                                <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer" onClick={() => setSettings({ ...settings, allow_global_signup: !settings.allow_global_signup })}>
                                    <motion.div
                                        animate={{ x: settings.allow_global_signup ? 24 : 0 }}
                                        className={cn("w-4 h-4 rounded-full shadow-sm", settings.allow_global_signup ? "bg-indigo-500" : "bg-white")}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="h-16 px-12 rounded-[2rem] bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-4"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save All Platform Settings
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettingsPage;
