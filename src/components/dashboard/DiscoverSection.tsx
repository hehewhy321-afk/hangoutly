import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { ProfileCard } from '@/components/ProfileCard';
import { ProfileDetail } from '@/components/ProfileDetail';
import { BookingModal } from '@/components/BookingModal';
import { FilterSheet } from '@/components/FilterSheet';
import { ConsentModal } from '@/components/ConsentModal';
import { Button } from '@/components/ui/button';
import { PaginationControls } from '@/components/PaginationControls';
import { usePagination } from '@/hooks/usePagination';
import { FilterOptions, Profile } from '@/types';
import { CITIES } from '@/types';
import { CompanionProfile } from '@/hooks/useCompanions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 12;

const mapCompanionToProfile = (companion: CompanionProfile): Profile & { hasSpecialBadge: boolean; userId: string } => ({
  id: companion.profile.id,
  firstName: companion.profile.first_name,
  age: companion.profile.age || 25,
  gender: (companion.profile.gender as 'male' | 'female' | 'other') || 'other',
  city: companion.profile.city || '',
  area: companion.profile.area || '',
  profession: companion.profile.profession || '',
  bio: companion.profile.bio || '',
  hourlyRate: companion.hourly_rate,
  activities: companion.activities || [],
  images: companion.gallery_images?.length ? companion.gallery_images : [companion.profile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop'],
  isOnline: companion.profile.is_online,
  isVerified: companion.profile.is_identity_verified,
  hasSpecialBadge: companion.profile.is_verified,
  userId: companion.profile.user_id,
  createdAt: companion.profile.created_at, // Map created_at
});

export const DiscoverSection = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'nearby' | 'new'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasAcceptedConsent, setHasAcceptedConsent] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    city: '',
    gender: '',
    priceRange: [0, 2000],
    activities: [],
    ageRange: [18, 50],
    onlineOnly: false,
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const { data: companionsData, isLoading } = useQuery({
    queryKey: ['companions-dashboard', selectedCity, filters],
    queryFn: async () => {
      const query = supabase
        .from('companion_profiles')
        .select(`
          *,
          profile:profile_id(
            id,
            user_id,
            first_name,
            date_of_birth,
            gender,
            city,
            area,
            profession,
            bio,
            avatar_url,
            is_identity_verified,
            is_verified,
            is_online,
            is_active,
            created_at
          )
        `, { count: 'exact' })
        .eq('availability_status', true);

      const { data, error } = await query;
      if (error) throw error;

      let filtered = (data || [])
        .filter((item: any) => {
          const isVerified = item.profile?.is_identity_verified === true;
          const isActive = item.profile?.is_active !== false;
          return isVerified && isActive;
        })
        .map((item: any) => {
          let age: number | undefined;
          if (item.profile?.date_of_birth) {
            const birthDate = new Date(item.profile.date_of_birth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
          return { ...item, profile: { ...item.profile, age } };
        });

      if (selectedCity || filters.city) {
        const city = selectedCity || filters.city;
        filtered = filtered.filter((c: any) => c.profile?.city === city);
      }
      if (filters.gender) {
        filtered = filtered.filter((c: any) => c.profile?.gender === filters.gender);
      }
      if (filters.priceRange[0] > 0) {
        filtered = filtered.filter((c: any) => c.hourly_rate >= filters.priceRange[0]);
      }
      if (filters.priceRange[1] < 2000) {
        filtered = filtered.filter((c: any) => c.hourly_rate <= filters.priceRange[1]);
      }
      if (filters.activities?.length > 0) {
        filtered = filtered.filter((c: any) =>
          filters.activities!.some((a) => c.activities?.includes(a))
        );
      }
      if (filters.onlineOnly) {
        filtered = filtered.filter((c: any) => c.profile?.is_online);
      }

      return filtered as CompanionProfile[];
    },
  });

  const companions = companionsData || [];

  const profiles = useMemo(() => companions.map(mapCompanionToProfile), [companions]);

  const filteredProfiles = useMemo(() => {
    let result = profiles.filter((profile) => {
      if (searchQuery && !profile.firstName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (profile.age < filters.ageRange[0] || profile.age > filters.ageRange[1]) {
        return false;
      }
      return true;
    });

    // Apply Tab Sorting/Filtering
    if (activeTab === 'nearby') {
      // For now, "Nearby" defaults to Kathmandu if no location is detected, or compares with selectedCity
      const userCity = selectedCity || 'Kathmandu';
      result = result.filter(p => p.city === userCity);
    } else if (activeTab === 'new') {
      // Sort by createdAt descending
      result = [...result].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }

    return result;
  }, [searchQuery, filters, profiles, activeTab, selectedCity]);

  // Use the pagination hook with the filtered profiles
  const pagination = usePagination({ data: filteredProfiles, itemsPerPage: ITEMS_PER_PAGE });

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowProfileDetail(true);
  };

  const handleBookClick = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book a companion.',
      });
      return;
    }

    if (!hasAcceptedConsent) {
      setShowConsentModal(true);
    } else {
      setShowProfileDetail(false);
      setShowBookingModal(true);
    }
  };

  const handleConsentAccept = () => {
    setHasAcceptedConsent(true);
    setShowConsentModal(false);
    setShowProfileDetail(false);
    setShowBookingModal(true);
  };

  const handleBookingComplete = async (bookingDetails: any) => {
    if (!user || !selectedProfile) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('id', selectedProfile.id)
        .single();

      if (!profileData) {
        toast({ title: 'Error', description: 'Could not find companion profile.', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        companion_id: profileData.id,
        booking_date: bookingDetails.date.toISOString().split('T')[0],
        start_time: bookingDetails.time,
        duration_hours: bookingDetails.duration,
        activity: bookingDetails.activity,
        hourly_rate: selectedProfile.hourlyRate,
        total_amount: selectedProfile.hourlyRate * bookingDetails.duration,
        status: 'pending',
        payment_status: 'pending',
      });

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: profileData.user_id,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `You have a new booking request for ${bookingDetails.activity}`,
        data: { activity: bookingDetails.activity },
      });

      toast({ title: 'Booking Request Sent!', description: 'Your booking request has been sent.' });
      setShowBookingModal(false);
    } catch (error: any) {
      toast({ title: 'Booking Failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    pagination.goToPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {['all', 'nearby', 'new'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                activeTab === tab
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105"
                  : "bg-white text-slate-400 hover:bg-slate-50 border border-transparent hover:border-slate-100"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-4 shadow-lg"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full md:w-48 pl-12 pr-10 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">All Cities</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>

            <Button variant="outline" onClick={() => setShowFilters(true)}>
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
              {(filters.gender || filters.activities.length > 0 || filters.onlineOnly) && (
                <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {[filters.gender, ...filters.activities, filters.onlineOnly].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </span>
          ) : (
            <>
              <span className="font-semibold text-foreground">{filteredProfiles.length}</span> companions found
            </>
          )}
        </p>
      </div>

      {/* Profiles Grid */}
      {pagination.paginatedData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagination.paginatedData.map((profile, index) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onClick={() => handleProfileClick(profile)}
                index={index}
                showSpecialBadge={(profile as any).hasSpecialBadge}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              totalItems={pagination.totalItems}
              onPrevPage={pagination.prevPage}
              onNextPage={pagination.nextPage}
              onGoToPage={pagination.goToPage}
              hasPrevPage={pagination.hasPrevPage}
              hasNextPage={pagination.hasNextPage}
            />
          )}
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No companions found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </motion.div>
      )}

      {/* Modals */}
      <FilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />

      {selectedProfile && (
        <>
          <ProfileDetail
            profile={selectedProfile}
            isOpen={showProfileDetail}
            onClose={() => setShowProfileDetail(false)}
            onBook={handleBookClick}
          />
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            profile={selectedProfile}
            onBook={handleBookingComplete}
          />
          <ConsentModal
            isOpen={showConsentModal}
            onClose={() => setShowConsentModal(false)}
            onAccept={handleConsentAccept}
          />
        </>
      )}
    </div>
  );
};
