import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Camera, MapPin, Briefcase, Phone,
  Edit2, Save, Loader2, BadgeCheck, Mail, Calendar,
  Shield, Star, Sparkles, Building, Info, Heart, ArrowRight,
  ExternalLink, Facebook, Instagram, Twitter, Check,
  Trash2, Plus, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';
import { ACTIVITIES } from '@/types';

const ProfilePage = () => {
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    area: '',
    profession: '',
    bio: '',
    hourly_rate: 0,
    activities: [] as string[],
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]);
  const avatarRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        area: profile.area || '',
        profession: profile.profession || '',
        bio: profile.bio || '',
        hourly_rate: 0,
        activities: [],
      });

      // Fetch Cities
      const fetchCities = async () => {
        // @ts-ignore
        const { data } = await supabase.from('cities').select('name').eq('is_active', true).order('name');
        if (data) {
          // @ts-ignore
          setCities(data.map(c => c.name));
        }
      };
      fetchCities();

      // Fetch gallery images and hourly rate
      const fetchCompanionData = async () => {
        const { data, error } = await supabase
          .from('companion_profiles')
          .select('gallery_images, hourly_rate, activities')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (data) {
          setGalleryImages(data.gallery_images || []);
          setFormData(prev => ({
            ...prev,
            hourly_rate: data.hourly_rate || 0,
            activities: data.activities || []
          }));
        }
      };

      if (profile.is_companion || profile.id) {
        fetchCompanionData();
      }
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    if (galleryImages.length >= 3) {
      toast({ title: 'Limit Reached', description: 'You can upload up to 3 gallery images.', variant: 'destructive' });
      return;
    }

    setUploadingGallery(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      const newGallery = [...galleryImages, publicUrl];
      setGalleryImages(newGallery);

      // Update in DB immediately
      const { error: updateError } = await supabase
        .from('companion_profiles')
        .upsert({
          profile_id: profile.id,
          gallery_images: newGallery
        }, { onConflict: 'profile_id' });

      if (updateError) throw updateError;

      toast({ title: 'Success', description: 'Image uploaded to gallery.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = async (index: number) => {
    if (!profile) return;
    const newGallery = [...galleryImages];
    newGallery.splice(index, 1);
    setGalleryImages(newGallery);

    // Update in DB immediately
    try {
      await supabase
        .from('companion_profiles')
        .update({ gallery_images: newGallery })
        .eq('profile_id', profile.id);

      toast({ title: 'Removed', description: 'Image removed from gallery.' });
    } catch (error) {
      console.error('Error removing image', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/avatar.${avatarFile.name.split('.').pop()}`, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(`${user.id}/avatar.${avatarFile.name.split('.').pop()}`);
        avatarUrl = urlData.publicUrl;
      }

      const { hourly_rate, activities, ...profileData } = formData;
      const { error } = await supabase
        .from('profiles')
        .update({ ...profileData, avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (error) throw error;

      if (profile?.is_companion) {
        const { error: companionError } = await supabase
          .from('companion_profiles')
          .update({
            hourly_rate: formData.hourly_rate,
            activities: formData.activities
          })
          .eq('profile_id', profile.id);

        if (companionError) throw companionError;
      }

      await refreshProfile();
      setIsEditing(false);
      setAvatarFile(null);
      toast({ title: 'Success', description: 'Profile updated flawlessly.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Update failed', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex items-center justify-center h-80">
          <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        </div>
      </DashboardLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } }
  };

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal information">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-12"
      >
        {/* Banner with Profile Overlap */}
        <motion.div variants={itemVariants} className="relative group">
          <div className="h-48 md:h-64 rounded-[2.5rem] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border border-slate-200/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
            <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-accent/10 blur-3xl rounded-full" />

            {/* Edit Button Overlap */}
            <div className="absolute top-6 right-6 z-20">
              {!isEditing ? (
                <MagneticButton onClick={() => setIsEditing(true)} className="h-12 px-6 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </MagneticButton>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-2xl font-bold uppercase text-[10px] bg-white/20 backdrop-blur-md text-white border-0 hover:bg-rose-500 hover:text-white transition-all">Cancel</Button>
                  <MagneticButton onClick={handleSave} disabled={isSaving} className="h-10 px-6 rounded-2xl bg-emerald-500 text-white shadow-glow-accent flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                  </MagneticButton>
                </div>
              )}
            </div>
          </div>

          {/* Profile Header Block */}
          <div className="px-6 lg:px-12 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="relative group/avatar">
                <div
                  onClick={() => isEditing && avatarRef.current?.click()}
                  className={cn(
                    "w-44 h-44 rounded-[3rem] bg-white p-2 shadow-2xl overflow-hidden transition-all",
                    isEditing ? "cursor-pointer group-hover/avatar:scale-105" : ""
                  )}
                >
                  <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-100 relative">
                    {avatarPreview || profile?.avatar_url ? (
                      <img src={avatarPreview || profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <User className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    {isEditing && (
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-1">
                        <Camera className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase">Change</span>
                      </div>
                    )}
                  </div>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

                {/* Online Status Marker */}
                <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
              </div>

              <div className="flex-1 pb-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-1">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                    {profile?.first_name} {profile?.last_name || 'Expert'}
                  </h2>
                  {profile?.is_verified && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 self-center md:self-auto">
                      <BadgeCheck className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Verified</span>
                    </div>
                  )}
                </div>
                <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.2em] ml-1">
                  {profile?.profession || 'Member'}
                </p>
              </div>

              <div className="hidden lg:flex items-center gap-8 pb-6 px-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-800 tracking-tight">4.9</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-800 tracking-tight">240</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hours</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar: Core Stats */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
            {/* Verification & Trust */}
            <div className="glass-card p-8 border border-slate-200/60 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-emerald-500" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Verification</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Check className={cn("w-4 h-4", profile?.is_identity_verified ? "text-emerald-500" : "text-slate-300")} strokeWidth={4} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Identity</span>
                  </div>
                  <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                    profile?.is_identity_verified ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400")}>
                    {profile?.is_identity_verified ? "Verified" : "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Check className="text-emerald-500 w-4 h-4" strokeWidth={4} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Background</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-emerald-100 text-emerald-600">
                    Cleared
                  </span>
                </div>
              </div>

              {!profile?.is_identity_verified && (
                <Button onClick={() => navigate('/verification')} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-lg group">
                  Complete ID Verification
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>

            {/* Contact Information */}
            <div className="glass-card p-8 border border-slate-200/60 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-primary" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Contact Info</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 group overflow-hidden">
                    <Mail className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-bold text-slate-600 truncate">{user?.email}</span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-14 pl-12 rounded-2xl bg-slate-50 focus:bg-white border-slate-100 font-bold"
                        placeholder="+977 98XXXXXXX"
                      />
                    </div>
                  </div>
                ) : (
                  profile?.phone && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <Phone className="w-5 h-5 text-slate-300" />
                        <span className="text-sm font-bold text-slate-600">{profile.phone}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Stats: Bento Boxes */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
            {/* Professional Persona */}
            <div className="glass-card p-8 lg:p-10 border border-slate-200/60 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">About Me</h3>
                </div>
                {isEditing && (
                  <div className="px-2 py-1 rounded bg-amber-100 text-[9px] font-black text-amber-600 uppercase tracking-widest">
                    Editing
                  </div>
                )}
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Profession</Label>
                    {isEditing ? (
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          value={formData.profession}
                          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                          className="h-14 pl-12 rounded-2xl bg-slate-50 focus:bg-white border-slate-100 font-bold"
                          placeholder="e.g. Creative Lead"
                        />
                      </div>
                    ) : (
                      <div className="h-14 flex items-center px-6 rounded-2xl bg-slate-900 text-white font-bold tracking-tight shadow-lg">
                        {profile?.profession || 'Member'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Location</Label>
                    <div className="flex gap-4">
                      {isEditing ? (
                        <div className="flex-1">
                          <Select
                            value={formData.city}
                            onValueChange={(value) => setFormData({ ...formData, city: value })}
                          >
                            <SelectTrigger className="h-14 w-full rounded-2xl bg-slate-50 border-slate-100 font-bold px-4">
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 font-bold">
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="flex-1 h-14 flex items-center px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700">
                          {profile?.city || 'Undisclosed'}
                        </div>
                      )}
                      {isEditing && (
                        <Input
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          className="h-14 rounded-2xl bg-slate-50 focus:bg-white border-slate-100 font-bold"
                          placeholder="Area"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {(profile?.is_companion || formData.hourly_rate > 0) && (
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Hourly Rate (Rs.)</Label>
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                        <Input
                          type="number"
                          value={formData.hourly_rate}
                          onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                          className="h-14 pl-12 rounded-2xl bg-slate-50 focus:bg-white border-slate-100 font-bold"
                          placeholder="500"
                        />
                      </div>
                    ) : (
                      <div className="h-14 flex items-center px-6 rounded-2xl bg-emerald-50 border border-emerald-100 font-black text-emerald-700 shadow-sm w-fit">
                        Rs. {formData.hourly_rate} / hr
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="min-h-[160px] rounded-3xl bg-slate-50 p-6 focus:bg-white border-slate-100 font-medium leading-relaxed"
                      placeholder="Tell us a bit about yourself..."
                    />
                  ) : (
                    <p className="text-slate-600 font-medium leading-[1.8] text-lg bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100/50">
                      {profile?.bio || 'You haven\'t added a bio yet. Click edit to tell people about yourself.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Activities I'm down for</Label>
                </div>

                {isEditing ? (
                  <div className="flex flex-wrap gap-2 p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                    {ACTIVITIES.map((activity) => {
                      const isSelected = formData.activities.includes(activity);
                      return (
                        <button
                          key={activity}
                          onClick={() => {
                            const newActivities = isSelected
                              ? formData.activities.filter(a => a !== activity)
                              : [...formData.activities, activity];
                            setFormData({ ...formData, activities: newActivities });
                          }}
                          className={cn(
                            "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                            isSelected
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                              : "bg-white text-slate-400 border-slate-100 hover:border-primary/30 hover:text-slate-600"
                          )}
                        >
                          {activity}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.activities.length > 0 ? (
                      formData.activities.map((activity) => (
                        <span key={activity} className="px-5 py-2.5 rounded-xl bg-primary/5 text-primary text-xs font-black uppercase tracking-widest border border-primary/10">
                          {activity}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm font-bold text-slate-400 italic ml-1">No activities selected yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Gallery Section - Only show if editing or has images */}
          {(isEditing || galleryImages.length > 0) && (
            <div className="glass-card p-8 lg:p-10 border border-slate-200/60 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">My Gallery</h3>
                </div>
                {isEditing && (
                  <div className="px-2 py-1 rounded bg-purple-100 text-[9px] font-black text-purple-600 uppercase tracking-widest">
                    {galleryImages.length}/3 Images
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {galleryImages.map((img, index) => (
                  <div key={index} className="relative aspect-[3/4] group rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200/50">
                    <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                    {isEditing && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="rounded-full h-10 w-10 shadow-lg hover:scale-110 transition-transform"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {isEditing && galleryImages.length < 3 && (
                  <div
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-400 bg-slate-50 hover:bg-purple-50/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      {uploadingGallery ? <Loader2 className="w-5 h-5 animate-spin text-purple-500" /> : <Plus className="w-5 h-5 text-purple-500" />}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-purple-500 transition-colors">Add Photo</span>
                  </div>
                )}
                <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
              </div>
            </div>
          )}

          {/* Badges & Influence Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 border border-slate-200/60 shadow-xl flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center shadow-sm">
                <Star className="w-8 h-8 text-indigo-500 fill-indigo-500" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">Elite Tier</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience Tier</p>
              </div>
            </div>

            <div className="glass-card p-8 border border-slate-200/60 shadow-xl flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center shadow-sm">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">High Resonance</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Positive Ratings</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout >
  );
};

export default ProfilePage;
