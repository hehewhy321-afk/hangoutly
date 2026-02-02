import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, BadgeCheck, Clock, Sparkles, Heart } from 'lucide-react';
import { Profile } from '@/types';
import { create3DTilt } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
  index: number;
  showSpecialBadge?: boolean;
}

export const ProfileCard = ({ profile, onClick, index, showSpecialBadge = false }: ProfileCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const cleanup = create3DTilt(cardRef.current, 5);
    return cleanup;
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{
        y: -12,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      onClick={onClick}
      className="group relative w-full cursor-pointer h-[420px] rounded-[2.5rem] p-3 transition-all duration-500 hover:shadow-2xl"
    >
      {/* Glass Background Layer */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/60 transition-all duration-500 group-hover:bg-white/60 group-hover:border-white/80 shadow-sm" />

      {/* Main Card Content */}
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white shadow-inner">

        {/* Image Container */}
        <div className="relative h-3/4 w-full overflow-hidden">
          <motion.img
            src={profile.images[0]}
            alt={profile.firstName}
            className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
          />

          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

          {/* Top Interactions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            {profile.isOnline && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase text-white tracking-widest text-shadow-sm">Online</span>
              </div>
            )}

            <button className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:bg-white/20 hover:scale-110 active:scale-95">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-black text-white tracking-tight">{profile.firstName}, {profile.age}</h3>
                {profile.isVerified && (
                  <TooltipBadge label="Identity Verified">
                    <BadgeCheck className="w-5 h-5 text-blue-400" />
                  </TooltipBadge>
                )}
                {showSpecialBadge && (
                  <TooltipBadge label="Premium">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </TooltipBadge>
                )}
              </div>

              <div className="flex items-center gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{profile.area}, {profile.city}</span>
              </div>

              {/* Activities Tags */}
              <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-auto overflow-hidden">
                {profile.activities.slice(0, 3).map((activity) => (
                  <span key={activity} className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Details Section */}
        <div className="relative h-1/4 bg-white p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profession</p>
              <p className="text-sm font-bold text-slate-700 truncate max-w-[140px]">{profile.profession}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Per Hour</p>
              <p className="text-lg font-black text-primary">Rs. {profile.hourlyRate.toLocaleString()}</p>
            </div>
          </div>

          <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full w-0 bg-primary/50 group-hover:w-full transition-all duration-700 ease-in-out" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper component for tooltips
const TooltipBadge = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className="group/tooltip relative">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900/90 backdrop-blur-sm rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
      <span className="text-[10px] font-bold text-white">{label}</span>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/90" />
    </div>
  </div>
);
