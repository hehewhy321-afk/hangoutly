import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Check, X, Edit2, Trash2, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

const AdminCitiesPage = () => {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [cities, setCities] = useState<any[]>([]);
    const [newCity, setNewCity] = useState('');
    const [editingCity, setEditingCity] = useState<any>(null);
    const [deletingCityId, setDeletingCityId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (isAdmin) fetchCities();
    }, [isAdmin]);

    const fetchCities = async () => {
        setIsLoading(true);
        try {
            // @ts-ignore
            const { data, error } = await supabase.from('cities').select('*').order('name');
            if (error) throw error;
            setCities(data || []);
        } catch (e: any) {
            toast({ title: 'Error fetching cities', description: e.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCity = async () => {
        if (!newCity.trim()) return;
        try {
            // @ts-ignore
            const { data, error } = await supabase.from('cities').insert([{ name: newCity, is_active: true }]).select();
            if (error) throw error;
            setCities([...cities, data[0]]);
            setNewCity('');
            toast({ title: 'City Added', description: `${newCity} has been added.` });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };

    const toggleCityStatus = async (id: string, currentStatus: boolean) => {
        try {
            // @ts-ignore
            const { error } = await supabase.from('cities').update({ is_active: !currentStatus }).eq('id', id);
            if (error) throw error;
            setCities(cities.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
            toast({ title: 'Status Updated' });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };

    const handleDeleteCity = async (id: string) => {
        try {
            // @ts-ignore
            const { error } = await supabase.from('cities').delete().eq('id', id);
            if (error) throw error;
            setCities(cities.filter(c => c.id !== id));
            toast({ title: 'City Deleted' });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete city.' });
        }
    };

    const handleUpdateCity = async () => {
        if (!editingCity || !editingCity.name.trim()) return;
        try {
            // @ts-ignore
            const { error } = await supabase.from('cities').update({ name: editingCity.name }).eq('id', editingCity.id);
            if (error) throw error;
            setCities(cities.map(c => c.id === editingCity.id ? { ...c, name: editingCity.name } : c));
            setEditingCity(null);
            toast({ title: 'City Updated' });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        }
    };

    if (authLoading || isLoading) return (
        <AdminLayout title="City Management">
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Cities...</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout title="City Management" subtitle="Define and manage available service locations">
            <div className="max-w-[1200px] mx-auto space-y-10">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-end md:items-center bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-4 bg-slate-50 p-2 pl-6 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-slate-200 transition-all w-full md:w-auto">
                        <input
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            placeholder="Enter new city name..."
                            className="bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-300 w-full md:w-80 h-12"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                        />
                        <MagneticButton
                            onClick={handleAddCity}
                            disabled={!newCity.trim()}
                            className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xl disabled:opacity-50 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                        </MagneticButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {cities.map((city) => (
                        <motion.div
                            key={city.id}
                            layout
                            className="group p-6 rounded-3xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                    city.is_active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                                )}>
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div>
                                    {editingCity?.id === city.id ? (
                                        <div className="flex items-center gap-3">
                                            <Input
                                                value={editingCity.name}
                                                onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })}
                                                className="h-10 font-bold text-lg rounded-xl border-slate-200 w-56"
                                                autoFocus
                                            />
                                            <Button size="icon" onClick={handleUpdateCity} className="h-10 w-10 bg-slate-900 rounded-xl">
                                                <Check className="w-5 h-5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => setEditingCity(null)} className="h-10 w-10 hover:bg-slate-100 rounded-xl">
                                                <X className="w-5 h-5 text-slate-500" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className={cn("text-xl font-black tracking-tight", city.is_active ? "text-slate-800" : "text-slate-400")}>{city.name}</h3>
                                            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-1">
                                                Service is {city.is_active ? 'Online' : 'Disabled'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => toggleCityStatus(city.id, city.is_active)}
                                    className={cn(
                                        "h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                                        city.is_active
                                            ? "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                                            : "bg-slate-100 text-slate-400 border-transparent"
                                    )}
                                >
                                    {city.is_active ? 'Disable' : 'Enable'}
                                </button>
                                <Button size="icon" variant="ghost" onClick={() => setEditingCity(city)} className="h-11 w-11 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteCity(city.id)} className="h-11 w-11 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCitiesPage;
