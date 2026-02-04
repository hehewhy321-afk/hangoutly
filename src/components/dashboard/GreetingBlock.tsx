import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Mic, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GreetingBlockProps {
    name: string;
    role?: string;
    avatarUrl?: string;
    className?: string;
}

export const GreetingBlock = ({ name, role, avatarUrl, className }: GreetingBlockProps) => {
    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6", className)}>
            <div className="lg:col-span-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-3">
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            Hey, {name}!
                            <span className="text-3xl animate-bounce-subtle inline-block">👋</span>
                        </h2>
                    </div>
                    <p className="text-2xl font-medium text-slate-400 tracking-tight">
                        Just ask me anything!
                    </p>
                </motion.div>
            </div>

            <div className="lg:col-span-6 flex items-center justify-end gap-4">
                <div className="relative w-full max-w-sm hidden md:block">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <Input
                        placeholder="Search activities, companions..."
                        className="h-14 pl-12 pr-12 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary/20 transition-all font-bold"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center">
                        <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-white border border-slate-100 shadow-sm shrink-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                        <img src={avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"} className="w-full h-full object-cover" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-black text-slate-800 leading-none">{name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role || 'Member'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
