import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Check, X, Loader2, FileCheck } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Verification } from './types';
import { AdminEmpty } from '@/components/admin/AdminEmpty';

const AdminVerificationsPage = () => {
    const { user, isAdmin, isLoading: authLoading } = useAuth();
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [verificationFilter, setVerificationFilter] = useState<'all' | 'nepal' | 'international'>('all');
    const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
    const [signedUrls, setSignedUrls] = useState<{ front?: string, back?: string, selfie?: string }>({});
    const { toast } = useToast();

    useEffect(() => {
        if (isAdmin) fetchVerifications();
    }, [isAdmin]);

    useEffect(() => {
        if (selectedVerification) generateSignedUrls(selectedVerification);
    }, [selectedVerification]);

    const fetchVerifications = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('verifications')
                .select('*, profile:profile_id(first_name, avatar_url, city)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVerifications((data as any) || []);
        } catch (e: any) {
            toast({ title: 'Error fetching verifications', description: e.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const generateSignedUrls = async (verification: Verification) => {
        try {
            const urls: { front?: string, back?: string, selfie?: string } = {};
            const extractPath = (url: string) => {
                if (!url) return null;
                if (url.includes('verifications/')) {
                    const match = url.match(/verifications\/(.+)/);
                    return match ? match[1] : null;
                }
                return url;
            };

            const frontPath = extractPath(verification.document_front_url);
            const backPath = verification.document_back_url ? extractPath(verification.document_back_url) : null;
            const selfiePath = extractPath(verification.selfie_url);

            if (frontPath) {
                const { data } = await supabase.storage.from('verifications').createSignedUrl(frontPath, 3600);
                if (data) urls.front = data.signedUrl;
            }
            if (backPath) {
                const { data } = await supabase.storage.from('verifications').createSignedUrl(backPath, 3600);
                if (data) urls.back = data.signedUrl;
            }
            if (selfiePath) {
                const { data } = await supabase.storage.from('verifications').createSignedUrl(selfiePath, 3600);
                if (data) urls.selfie = data.signedUrl;
            }
            setSignedUrls(urls);
        } catch (e) {
            setSignedUrls({
                front: verification.document_front_url,
                back: verification.document_back_url || undefined,
                selfie: verification.selfie_url
            });
        }
    };

    const handleVerification = async (verificationId: string, action: 'approve' | 'reject', reason?: string) => {
        try {
            const updateData: any = {
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewer_id: user?.id,
                reviewed_at: new Date().toISOString()
            };
            if (action === 'reject' && reason) updateData.reviewer_notes = reason;

            const { error } = await supabase.from('verifications').update(updateData).eq('id', verificationId);
            if (error) throw error;

            const v = verifications.find(x => x.id === verificationId);
            if (v && action === 'approve') {
                await supabase.from('profiles').update({ is_identity_verified: true }).eq('id', v.profile_id);
            }

            toast({ title: 'Success', description: `Verification ${action}ed successfully.` });
            fetchVerifications();
            setSelectedVerification(null);
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    };

    const filteredVerifications = verifications.filter(v => {
        if (verificationFilter === 'all') return true;
        const country = (v as any).submitter_country?.toLowerCase() || '';
        if (verificationFilter === 'nepal') return country === 'nepal' || country === '';
        if (verificationFilter === 'international') return country !== 'nepal' && country !== '';
        return true;
    });

    const verPag = usePagination({ data: filteredVerifications, itemsPerPage: 10 });

    if (authLoading || isLoading) return (
        <AdminLayout title="Verifications">
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Verifications...</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout title="Verifications" subtitle="Review identity documents and verify members">
            <div className="max-w-[1600px] mx-auto space-y-8">
                <div className="flex gap-2">
                    {(['all', 'nepal', 'international'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setVerificationFilter(filter)}
                            className={cn(
                                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                verificationFilter === filter
                                    ? "bg-slate-900 text-white border-slate-900 shadow-xl"
                                    : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
                            )}
                        >
                            {filter === 'all' ? 'All Requests' : filter === 'nepal' ? 'Nepal Only' : 'International'}
                        </button>
                    ))}
                </div>

                <div className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">User</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Document</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                <th className="px-10 py-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {verPag.paginatedData.map((v) => (
                                <tr key={v.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                <img src={v.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 tracking-tight">{v.full_name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 capitalize">{v.profile?.city}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 font-bold text-xs text-slate-600 capitalize">
                                        {v.document_type.replace('_', ' ')}
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            v.status === 'pending' ? "bg-amber-100 text-amber-600 border-amber-200" :
                                                v.status === 'approved' ? "bg-emerald-100 text-emerald-600 border-emerald-200" :
                                                    "bg-rose-100 text-rose-600 border-rose-200"
                                        )}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-xs font-bold text-slate-600">
                                        {format(new Date(v.created_at), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button onClick={() => setSelectedVerification(v)} variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-white border border-transparent hover:border-slate-200">
                                                <Eye className="w-4 h-4 text-slate-400" />
                                            </Button>
                                            {v.status === 'pending' && (
                                                <>
                                                    <Button onClick={() => handleVerification(v.id, 'approve')} variant="ghost" className="w-10 h-10 p-0 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button onClick={() => handleVerification(v.id, 'reject')} variant="ghost" className="w-10 h-10 p-0 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredVerifications.length === 0 && <AdminEmpty icon={FileCheck} label="No Verification Requests Found" />}
                </div>

                <PaginationControls
                    currentPage={verPag.currentPage}
                    totalPages={verPag.totalPages}
                    startIndex={verPag.startIndex}
                    endIndex={verPag.endIndex}
                    totalItems={verPag.totalItems}
                    onPrevPage={verPag.prevPage}
                    onNextPage={verPag.nextPage}
                    onGoToPage={verPag.goToPage}
                    hasPrevPage={verPag.hasPrevPage}
                    hasNextPage={verPag.hasNextPage}
                />
            </div>

            <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
                <DialogContent className="max-w-4xl p-0 h-[80vh] overflow-hidden rounded-[2.5rem]">
                    <DialogHeader className="p-8 border-b bg-slate-50">
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Document Review: {selectedVerification?.full_name}</DialogTitle>
                    </DialogHeader>
                    <div className="p-8 overflow-y-auto h-full space-y-8 pb-24">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Front Side</p>
                                <div className="aspect-[1.6] rounded-3xl bg-slate-100 overflow-hidden border border-slate-200">
                                    <img src={signedUrls.front} className="w-full h-full object-contain" alt="Front" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Back Side</p>
                                <div className="aspect-[1.6] rounded-3xl bg-slate-100 overflow-hidden border border-slate-200">
                                    {signedUrls.back ? <img src={signedUrls.back} className="w-full h-full object-contain" alt="Back" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">Not Uploaded</div>}
                                </div>
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selfie Confirmation</p>
                                <div className="aspect-[1.6] md:aspect-[2.5] rounded-3xl bg-slate-100 overflow-hidden border border-slate-200">
                                    <img src={signedUrls.selfie} className="w-full h-full object-contain" alt="Selfie" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t flex justify-end gap-4">
                        <Button variant="outline" className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={() => setSelectedVerification(null)}>Close</Button>
                        {selectedVerification?.status === 'pending' && (
                            <>
                                <Button variant="ghost" className="h-14 px-8 rounded-2xl bg-rose-500 text-white hover:bg-rose-600 font-black uppercase text-[10px] tracking-widest" onClick={() => handleVerification(selectedVerification.id, 'reject')}>Reject Request</Button>
                                <Button className="h-14 px-8 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20" onClick={() => handleVerification(selectedVerification.id, 'approve')}>Approve Identity</Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default AdminVerificationsPage;
