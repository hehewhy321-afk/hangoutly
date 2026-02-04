import { LucideIcon } from 'lucide-react';

interface AdminEmptyProps {
    icon: LucideIcon;
    label: string;
}

export const AdminEmpty = ({ icon: Icon, label }: AdminEmptyProps) => (
    <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
        <Icon className="w-12 h-12 text-slate-300 mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{label}</p>
    </div>
);
