import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Calendar, MapPin, Briefcase, FileText, Camera,
  Upload, Shield, Check, ChevronRight, ChevronLeft, Loader2,
  Heart, Phone, AlertCircle, Sparkles, Building, Info, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CITIES, ACTIVITIES } from '@/types';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

const STEPS = [
  { id: 1, title: 'Identity', icon: User, desc: 'Personal details' },
  { id: 2, title: 'Location', icon: MapPin, desc: 'Your base city' },
  { id: 3, title: 'Profile', icon: FileText, desc: 'About you' },
  { id: 4, title: 'Security', icon: Shield, desc: 'Verification' },
];

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getMaxBirthDate = (): string => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  return today.toISOString().split('T')[0];
};

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [ageError, setAgeError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    city: '',
    area: '',
    profession: '',
    bio: '',
    isCompanion: false,
    hourlyRate: 500,
    activities: [] as string[],
  });
  const [files, setFiles] = useState({
    avatar: null as File | null,
    documentFront: null as File | null,
    documentBack: null as File | null,
    selfie: null as File | null,
  });
  const [previews, setPreviews] = useState({
    avatar: '',
    documentFront: '',
    documentBack: '',
    selfie: '',
  });

  const avatarRef = useRef<HTMLInputElement>(null);
  const docFrontRef = useRef<HTMLInputElement>(null);
  const docBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.consent_accepted) {
      navigate('/discover');
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        dateOfBirth: profile.date_of_birth || '',
        gender: profile.gender || '',
        phone: profile.phone || '',
        city: profile.city || '',
        area: profile.area || '',
        profession: profile.profession || '',
        bio: profile.bio || '',
      }));
    }
  }, [profile]);

  const handleDateOfBirthChange = (value: string) => {
    setFormData({ ...formData, dateOfBirth: value });
    if (value) {
      const age = calculateAge(value);
      if (age < 18) {
        setAgeError('Must be 18+');
      } else {
        setAgeError('');
      }
    } else {
      setAgeError('');
    }
  };

  const handleFileChange = (key: keyof typeof files, file: File | null) => {
    setFiles({ ...files, [key]: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [key]: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews({ ...previews, [key]: '' });
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleActivity = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18) {
      toast({ title: 'Age Requirement', description: 'Must be 18+.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
      let avatarUrl = '';
      if (files.avatar) {
        avatarUrl = await uploadFile(files.avatar, 'avatars', `${user.id}/avatar.${files.avatar.name.split('.').pop()}`);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          phone: formData.phone || null,
          city: formData.city || null,
          area: formData.area || null,
          profession: formData.profession || null,
          bio: formData.bio || null,
          avatar_url: avatarUrl || null,
          is_companion: formData.isCompanion,
          consent_accepted: true,
          consent_accepted_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      if (formData.isCompanion && profile?.id) {
        await supabase.from('companion_profiles').upsert({
          profile_id: profile.id,
          hourly_rate: formData.hourlyRate,
          activities: formData.activities,
          availability_status: true,
        });
      }

      if (files.documentFront && files.selfie) {
        const docFrontUrl = await uploadFile(files.documentFront, 'verifications', `${user.id}/doc-front.${files.documentFront.name.split('.').pop()}`);
        let docBackUrl = '';
        if (files.documentBack) {
          docBackUrl = await uploadFile(files.documentBack, 'verifications', `${user.id}/doc-back.${files.documentBack.name.split('.').pop()}`);
        }
        const selfieUrl = await uploadFile(files.selfie, 'verifications', `${user.id}/selfie.${files.selfie.name.split('.').pop()}`);
        await refreshProfile();
        const { data: updatedProfile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
        if (updatedProfile) {
          await supabase.from('verifications').insert({
            profile_id: updatedProfile.id,
            full_name: `${formData.firstName} ${formData.lastName}`,
            document_type: 'NID',
            document_front_url: docFrontUrl,
            document_back_url: docBackUrl || null,
            selfie_url: selfieUrl,
            status: 'pending',
          });
        }
      }

      await refreshProfile();
      toast({ title: 'Profile created!', description: 'Redirecting to your dashboard...' });
      navigate('/discover');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save profile', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.firstName && formData.dateOfBirth && formData.gender && !ageError;
      case 2: return formData.city;
      case 3: return true;
      case 4: return files.documentFront && files.selfie;
      default: return false;
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98
    })
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-6 lg:p-8 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tighter">Hangoutly</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Secure Verification</span>
          </div>
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-800 transition-colors">
            <Info className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 lg:p-10 pb-20">
        <div className="w-full max-w-4xl">
          {/* Horizontal Progress */}
          <div className="mb-12 relative flex justify-between">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            <motion.div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
              animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center group">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      backgroundColor: isCompleted || isActive ? '#6366f1' : '#ffffff',
                      borderColor: isCompleted || isActive ? '#6366f1' : '#e2e8f0'
                    }}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-colors",
                      isActive && "shadow-glow-primary"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white" strokeWidth={3} />
                    ) : (
                      <step.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                    )}
                  </motion.div>
                  <div className="absolute -bottom-8 whitespace-nowrap text-center">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest transition-colors",
                      isActive ? "text-primary" : "text-slate-400"
                    )}>
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Content Card */}
          <div className="glass-card border border-slate-200/50 shadow-2xl relative overflow-hidden backdrop-blur-3xl min-h-[500px] flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />

            <div className="flex-1 overflow-hidden relative p-8 lg:p-12">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="h-full"
                >
                  <div className="mb-10 text-center lg:text-left">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                      Part {currentStep} of 4
                    </span>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                      {STEPS[currentStep - 1].title}
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                      {STEPS[currentStep - 1].desc}
                    </p>
                  </div>

                  {/* STEP 1: IDENTITY */}
                  {currentStep === 1 && (
                    <div className="space-y-8">
                      <div className="flex flex-col lg:flex-row gap-10">
                        <div className="flex flex-col items-center">
                          <div
                            onClick={() => avatarRef.current?.click()}
                            className="w-32 h-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center cursor-pointer overflow-hidden border-4 border-white shadow-lg hover:scale-105 transition-all group"
                          >
                            {previews.avatar ? (
                              <img src={previews.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <Camera className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black text-slate-400 uppercase">Upload</span>
                              </div>
                            )}
                          </div>
                          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('avatar', e.target.files?.[0] || null)} />
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">First Name</Label>
                            <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" className="h-14 rounded-2xl bg-slate-50/50 focus:bg-white border-slate-200 font-bold" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Last Name</Label>
                            <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" className="h-14 rounded-2xl bg-slate-50/50 focus:bg-white border-slate-200 font-bold" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Date of Birth</Label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input type="date" value={formData.dateOfBirth} onChange={(e) => handleDateOfBirthChange(e.target.value)} max={getMaxBirthDate()} className={cn("h-14 pl-12 rounded-2xl bg-slate-50/50 focus:bg-white border-slate-200 font-bold", ageError && "border-rose-500")} />
                          </div>
                          {ageError && <p className="text-xs font-bold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Minimum age is 18</p>}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Select Gender</Label>
                          <div className="flex gap-3 h-14">
                            {['male', 'female', 'other'].map((g) => (
                              <button key={g} onClick={() => setFormData({ ...formData, gender: g })} className={cn("flex-1 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all", formData.gender === g ? "bg-primary text-white shadow-glow-primary" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: LOCATION */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Choose your city</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {CITIES.map((city) => (
                            <button
                              key={city}
                              onClick={() => setFormData({ ...formData, city })}
                              className={cn(
                                "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2",
                                formData.city === city ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600"
                              )}
                            >
                              <Building className={cn("w-6 h-6", formData.city === city ? "text-primary" : "text-slate-300")} />
                              <span className="font-bold text-sm tracking-tight">{city}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Specific Area</Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} placeholder="e.g. Thamel, Pokhara Lakeside" className="h-14 pl-12 rounded-2xl bg-slate-50/50 focus:bg-white border-slate-200 font-bold" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PROFILE */}
                  {currentStep === 3 && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Profession</Label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} placeholder="What do you do?" className="h-14 pl-12 rounded-2xl bg-slate-50/50 focus:bg-white border-slate-200 font-bold" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+977 98XXXXXXX" className="h-14 pl-12 rounded-2xl bg-slate-50/50 focus:bg-white border-slate-200 font-bold" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">About You (Bio)</Label>
                        <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Describe yourself, your interests, and what you enjoy..." className="min-h-[140px] rounded-3xl bg-slate-50/50 p-6 focus:bg-white border-slate-200 font-medium leading-relaxed" />
                      </div>

                      {/* Companion Toggle */}
                      <div className={cn("p-6 rounded-[2rem] border transition-all", formData.isCompanion ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-slate-50 border-slate-100")}>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 items-center">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", formData.isCompanion ? "bg-primary text-white" : "bg-slate-200 text-slate-400")}>
                              <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-black text-slate-800 tracking-tight">Become a Companion</h3>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Help others connect</p>
                            </div>
                          </div>
                          <button onClick={() => setFormData({ ...formData, isCompanion: !formData.isCompanion })} className={cn("w-16 h-8 rounded-full transition-all relative", formData.isCompanion ? "bg-primary shadow-glow-primary" : "bg-slate-300")}>
                            <motion.div animate={{ x: formData.isCompanion ? 34 : 4 }} className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md" />
                          </button>
                        </div>

                        <AnimatePresence>
                          {formData.isCompanion && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-6 mt-6 border-t border-primary/10 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Hourly Rate (Rs.)</Label>
                                  <Input type="number" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })} className="h-12 rounded-xl bg-white focus:ring-4 focus:ring-primary/5 border-primary/20 font-black text-primary text-lg" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Proposed Activities</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {ACTIVITIES.map((activity) => (
                                      <button key={activity} onClick={() => toggleActivity(activity)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", formData.activities.includes(activity) ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-400 hover:border-primary/30")}>
                                        {activity}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: VERIFICATION */}
                  {currentStep === 4 && (
                    <div className="space-y-8">
                      <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100">
                          <Shield className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-1">Privacy Protected</p>
                          <p className="text-xs font-bold text-emerald-700/80 leading-relaxed uppercase tracking-widest">
                            We verify identity to build trust. Your documents are processed through secure encryption.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Document Front */}
                        <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">ID Front *</Label>
                          <div onClick={() => docFrontRef.current?.click()} className={cn("aspect-video rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden", previews.documentFront ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-slate-50 hover:border-primary/30")}>
                            {previews.documentFront ? (
                              <img src={previews.documentFront} alt="ID Front" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-slate-300" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload NID/Citizenship</span>
                              </div>
                            )}
                            <input ref={docFrontRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('documentFront', e.target.files?.[0] || null)} />
                          </div>
                        </div>

                        {/* Document Back */}
                        <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">ID Back (Optional)</Label>
                          <div onClick={() => docBackRef.current?.click()} className={cn("aspect-video rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden", previews.documentBack ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-slate-50 hover:border-primary/30")}>
                            {previews.documentBack ? (
                              <img src={previews.documentBack} alt="ID Back" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-slate-300" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Back side if any</span>
                              </div>
                            )}
                            <input ref={docBackRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('documentBack', e.target.files?.[0] || null)} />
                          </div>
                        </div>

                        {/* Selfie */}
                        <div className="space-y-3">
                          <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Clear Selfie *</Label>
                          <div onClick={() => selfieRef.current?.click()} className={cn("aspect-video rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden", previews.selfie ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-slate-50 hover:border-primary/30")}>
                            {previews.selfie ? (
                              <img src={previews.selfie} alt="Selfie" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Camera className="w-8 h-8 text-slate-300" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Live Portrait</span>
                              </div>
                            )}
                            <input ref={selfieRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action Bar */}
            <div className="p-8 lg:p-12 border-t border-slate-100 bg-slate-50/50 backdrop-blur-md flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors uppercase text-xs font-black tracking-widest group">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Go Back
                  </button>
                )}
              </div>

              <div className="flex gap-4 w-full sm:w-auto">
                {currentStep < 4 ? (
                  <MagneticButton onClick={handleNext} disabled={!canProceed()} className="w-full sm:w-48 h-14 rounded-2xl flex items-center justify-center font-black uppercase tracking-widest">
                    Continue
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </MagneticButton>
                ) : (
                  <MagneticButton onClick={handleSubmit} disabled={!canProceed() || isLoading} className="w-full sm:w-64 h-14 rounded-2xl flex items-center justify-center font-black uppercase tracking-widest">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        Finalize Profile
                        <Star className="w-5 h-5 ml-2 fill-white" />
                      </>
                    )}
                  </MagneticButton>
                )}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center flex items-center justify-center gap-4 text-slate-300">
            <span className="h-[1px] flex-1 bg-slate-200"></span>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Trusted by thousands of experts</p>
            <span className="h-[1px] flex-1 bg-slate-200"></span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
