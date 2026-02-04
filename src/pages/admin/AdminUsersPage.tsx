import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Search, MoreVertical, Eye, Shield, BadgeCheck, Ban, Check, MapPin, Loader2
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { UserProfile } from './types';

const AdminUsersPage = () => {
    const { user, isAdmin, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (isAdmin) fetchUsers();
    }, [isAdmin]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers((data as UserProfile[]) || []);
        } catch (e: any) {
            toast({ title: 'Error fetching users', description: e.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserAction = async (userId: string, action: string) => {
        try {
            let update: any = {};
            if (action === 'identity_verify') update.is_identity_verified = true;
            if (action === 'identity_unverify') update.is_identity_verified = false;
            if (action === 'special_badge') update.is_verified = true;
            if (action === 'remove_badge') update.is_verified = false;
            if (action === 'ban') update.is_active = false;
            if (action === 'unban') update.is_active = true;

            const { error } = await supabase.from('profiles').update(update).eq('id', userId);
            if (error) throw error;

            toast({ title: 'Success', description: `User status updated: ${action.replace('_', ' ')}` });
            fetchUsers();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const filteredUsers = users.filter(u =>
        u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery)
    );

    const usersPag = usePagination({ data: filteredUsers, itemsPerPage: 10 });

    if (authLoading || isLoading) return (
        <AdminLayout title="User Management">
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Users...</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout
            title="User Management"
            subtitle={`${filteredUsers.length} total members in the ecosystem`}
        >
            <div className="max-w-[1600px] mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, city or phone..."
                            className="h-12 pl-12 pr-6 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 text-xs font-bold transition-all outline-none w-full"
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">User</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Role</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Location</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                <th className="px-10 py-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {usersPag.paginatedData.map((u) => (
                                <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                                <img src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 tracking-tight">{u.first_name} {u.last_name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{u.phone || 'No Digital Line'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            u.is_companion ? "bg-primary/10 text-primary border border-primary/20" : "bg-slate-100 text-slate-500 border border-slate-200"
                                        )}>
                                            {u.is_companion ? 'Companion' : 'Patron'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-xs font-bold text-slate-600">{u.city || 'Remote'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex gap-2">
                                            {u.is_identity_verified && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />}
                                            {u.is_verified && <BadgeCheck className="w-4 h-4 text-primary" strokeWidth={3} />}
                                            {!u.is_active && <Ban className="w-4 h-4 text-rose-500" strokeWidth={3} />}
                                            {!u.is_identity_verified && !u.is_verified && u.is_active && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 self-center" />}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-10 h-10 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center justify-center">
                                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100 p-2">
                                                <DropdownMenuItem className="p-3 rounded-xl font-bold focus:bg-slate-50 cursor-pointer">
                                                    <Eye className="w-4 h-4 mr-3 text-slate-400" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                <DropdownMenuItem onClick={() => handleUserAction(u.id, u.is_identity_verified ? 'identity_unverify' : 'identity_verify')} className="p-3 rounded-xl font-black text-[10px] uppercase tracking-widest focus:bg-emerald-50 focus:text-emerald-600 cursor-pointer">
                                                    <Shield className="w-4 h-4 mr-3" /> {u.is_identity_verified ? 'Remove Verification' : 'Verify Identity'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUserAction(u.id, u.is_verified ? 'remove_badge' : 'special_badge')} className="p-3 rounded-xl font-black text-[10px] uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer">
                                                    <BadgeCheck className="w-4 h-4 mr-3" /> {u.is_verified ? 'Remove Badge' : 'Add Verified Badge'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                <DropdownMenuItem onClick={() => handleUserAction(u.id, u.is_active ? 'ban' : 'unban')} className={cn("p-3 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer", u.is_active ? "text-rose-500 focus:bg-rose-50" : "text-emerald-500 focus:bg-emerald-50")}>
                                                    {u.is_active ? <Ban className="w-4 h-4 mr-3" /> : <Check className="w-4 h-4 mr-3" />}
                                                    {u.is_active ? 'Ban User' : 'Unban User'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <PaginationControls
                    currentPage={usersPag.currentPage}
                    totalPages={usersPag.totalPages}
                    startIndex={usersPag.startIndex}
                    endIndex={usersPag.endIndex}
                    totalItems={usersPag.totalItems}
                    onPrevPage={usersPag.prevPage}
                    onNextPage={usersPag.nextPage}
                    onGoToPage={usersPag.goToPage}
                    hasPrevPage={usersPag.hasPrevPage}
                    hasNextPage={usersPag.hasNextPage}
                />
            </div>
        </AdminLayout>
    );
};

export default AdminUsersPage;
