import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, BadgeCheck, Clock, Shield, ChevronLeft, ChevronRight,
  Heart, MessageCircle, Share2, Flag, Ban, Loader2, Check, Sparkles, Star, Calendar, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/types';
import { BlockReportModal } from '@/components/BlockReportModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

interface ProfileDetailProps {
  isOpen: boolean;
  onClose: () => void;
  profile: (Profile & { userId?: string }) | null;
  onBook: () => void;
  bookButtonLabel?: string;
}

export const ProfileDetail = ({ isOpen, onClose, profile, onBook, bookButtonLabel = 'Book This Companion' }: ProfileDetailProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const { user, profile: userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !profile) return;

      const { data: companionProfile } = await supabase
        .from('companion_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!companionProfile) return;

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('companion_profile_id', companionProfile.id)
        .single();

      setIsFavorite(!!data);
    };

    if (isOpen) {
      checkFavorite();
      setCurrentImageIndex(0);
    }
  }, [user, profile, isOpen]);

  if (!profile) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % profile.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + profile.images.length) % profile.images.length);
  };

  const handleReportClick = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to report this profile.',
      });
      return;
    }
    setShowReportModal(true);
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save favorites.',
      });
      return;
    }

    setIsLoadingFavorite(true);
    try {
      const { data: companionProfile } = await supabase
        .from('companion_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!companionProfile) {
        toast({
          title: 'Error',
          description: 'Could not find companion profile.',
          variant: 'destructive',
        });
        return;
      }

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('companion_profile_id', companionProfile.id);

        setIsFavorite(false);
        toast({
          title: 'Removed from favorites',
          description: `${profile.firstName} removed from favorites.`,
        });
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            companion_profile_id: companionProfile.id,
          });

        setIsFavorite(true);
        toast({
          title: 'Added to favorites!',
          description: `${profile.firstName} added to your favorites.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Could not update favorites. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: `${profile.firstName} on Hangoutly`,
      text: `Check out ${profile.firstName}'s profile on Hangoutly!`,
      url: window.location.origin + '/discover',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Link copied!',
          description: 'Profile link copied to clipboard.',
        });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Link copied!',
          description: 'Profile link copied to clipboard.',
        });
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
              onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button (Mobile) */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left: Image Gallery */}
              <div className="w-full lg:w-1/2 relative bg-slate-100 h-[300px] lg:h-auto group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={profile.images[currentImageIndex]}
                    alt={profile.firstName}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {profile.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={prevImage}
                      className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}

                {/* Progress Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 rounded-full bg-black/10 backdrop-blur-md">
                  {profile.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        index === currentImageIndex ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                      )}
                    />
                  ))}
                </div>

                {/* Image Overlay Tokens */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  {profile.isOnline && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Live Now
                    </div>
                  )}
                  {profile.isVerified && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-primary font-bold text-[10px] uppercase tracking-wider shadow-lg">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      ID Verified
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Profile Info */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12 overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-4xl font-bold text-slate-800 tracking-tight mb-2">
                      {profile.firstName}, {profile.age}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        {profile.area}, {profile.city}
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-black text-slate-700">4.9</span>
                        <span className="text-xs font-bold text-muted-foreground">(24 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <button onClick={onClose} className="p-3 rounded-full hover:bg-slate-100 transition-colors">
                      <X className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                  <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Rate</p>
                    <p className="text-xl font-black text-primary">Rs.{profile.hourlyRate}</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Time</p>
                    <p className="text-xl font-black text-slate-800">1h+</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Member</p>
                    <p className="text-xl font-black text-slate-800">6mo</p>
                  </div>
                </div>

                {/* About Section */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">About {profile.firstName}</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {profile.bio || "No bio provided yet."}
                  </p>
                </div>

                {/* Activities Section */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Can Join For</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.activities.map((activity) => (
                      <span key={activity} className="px-4 py-2 rounded-xl bg-primary/5 text-primary text-sm font-bold border border-primary/10">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Safety Banner */}
                <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100 flex gap-4 mb-12">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Shield className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900 mb-0.5">Trust & Safety</p>
                    <p className="text-xs font-bold text-emerald-700/80 leading-relaxed">
                      Secure payments and verified identity. We prioritize your privacy and safety at every step.
                    </p>
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="mt-auto pt-8 flex gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "w-14 h-14 rounded-2xl border-slate-200 transition-all duration-300",
                        isFavorite && "bg-rose-50 border-rose-100 text-rose-500 shadow-sm"
                      )}
                      onClick={handleFavoriteClick}
                      disabled={isLoadingFavorite}
                    >
                      {isLoadingFavorite ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-14 h-14 rounded-2xl border-slate-200"
                      onClick={handleShareClick}
                    >
                      <Share2 className="w-6 h-6 text-slate-400" />
                    </Button>
                  </div>

                  <MagneticButton variant="primary" size="lg" className="flex-1 rounded-2xl h-14" onClick={onBook}>
                    <Calendar className="w-5 h-5 mr-3" />
                    {bookButtonLabel}
                  </MagneticButton>
                </div>

                {/* Report Link */}
                <button
                  onClick={handleReportClick}
                  className="mt-6 text-center text-xs font-bold text-muted-foreground hover:text-rose-500 transition-colors uppercase tracking-widest"
                >
                  Report suspicious activity
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {profile.userId && (
        <BlockReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetUserId={profile.userId}
          targetUserName={profile.firstName}
          mode="report"
        />
      )}
    </>
  );
};
