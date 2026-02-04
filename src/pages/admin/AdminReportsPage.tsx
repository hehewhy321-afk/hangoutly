import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Complaint } from './types';
import { AdminEmpty } from '@/components/admin/AdminEmpty';

const AdminReportsPage = () => {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (isAdmin) fetchComplaints();
    }, [isAdmin]);

    const fetchComplaints = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComplaints((data as Complaint[]) || []);
        } catch (e: any) {
            toast({ title: 'Error fetching reports', description: e.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplaintAction = async (complaintId: string, action: 'resolved' | 'dismissed') => {
        try {
            const { error } = await supabase
                .from('complaints')
                .update({ status: action, resolved_at: new Date().toISOString() })
                .eq('id', complaintId);

            if (error) throw error;
            toast({ title: `Report ${action}`, description: `The report has been marked as ${action}.` });
            fetchComplaints();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const comPag = usePagination({ data: complaints, itemsPerPage: 10 });

    if (authLoading || isLoading) return (
        <AdminLayout title="Reports & Complaints">
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Reports...</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout title="Reports & Complaints" subtitle="Manage user reported issues and trust & safety">
            <div className="max-w-[1200px] mx-auto space-y-8">
                <div className="space-y-6">
                    {comPag.paginatedData.map((c) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8 border border-slate-200/60 shadow-xl group hover:border-primary/20 transition-all bg-white rounded-[2rem]"
                        >
                            <div className="flex items-start justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            c.status === 'open' ? "bg-rose-100 text-rose-600 border-rose-200" : "bg-emerald-100 text-emerald-600 border-emerald-200"
                                        )}>
                                            {c.status}
                                        </span>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-l border-slate-200 pl-3">
                                            {c.complaint_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{c.description}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Reported on {format(new Date(c.created_at), 'PPPp')}
                                    </p>
                                </div>
                                {c.status === 'open' && (
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <Button
                                            onClick={() => handleComplaintAction(c.id, 'resolved')}
                                            className="h-12 px-8 rounded-xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-lg"
                                        >
                                            <Check className="w-4 h-4 mr-2" /> Resolve
                                        </Button>
                                        <Button
                                            onClick={() => handleComplaintAction(c.id, 'dismissed')}
                                            variant="outline"
                                            className="h-12 px-8 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all"
                                        >
                                            Dismiss
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {complaints.length === 0 && <AdminEmpty icon={AlertTriangle} label="No Open Reports" />}
                </div>

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
            </div>
        </AdminLayout>
    );
};

export default AdminReportsPage;
