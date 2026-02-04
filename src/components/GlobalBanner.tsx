import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Monitor, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const GlobalBanner = () => {
    const [bannerData, setBannerData] = useState<{ enabled: boolean; text: string } | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchBannerSettings = async () => {
            try {
                // @ts-ignore
                const { data, error } = await supabase.from('app_settings').select('key, value');
                if (error) return;

                const settings = data as any[];
                const enabled = settings.find(i => i.key === 'banner_enabled')?.value;
                const text = settings.find(i => i.key === 'banner_text')?.value;

                if (enabled === true || enabled === 'true') {
                    setBannerData({ enabled: true, text: text || '' });
                } else {
                    setBannerData({ enabled: false, text: '' });
                }
            } catch (e) {
                console.error('Error fetching banner settings:', e);
            }
        };

        fetchBannerSettings();

        // Optional: Real-time updates
        const channel = supabase.channel('banner-settings-sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings' }, () => fetchBannerSettings())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (!bannerData?.enabled || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-4 left-4 right-4 z-[100] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-lg lg:hidden"
            >
                <div className="relative glass-card p-4 bg-slate-900/95 backdrop-blur-3xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-[1.5rem] overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute -right-10 -top-10 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full" />
                    <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                            <Info className="w-5 h-5 text-blue-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/20 text-[8px] font-black uppercase tracking-wider text-blue-300">
                                    <Monitor className="w-2.5 h-2.5" /> Desktop
                                </span>
                            </div>
                            <p className="text-xs font-bold text-slate-100 leading-tight truncate">
                                {bannerData.text}
                            </p>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Progress Indicator Line */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 opacity-50" />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
