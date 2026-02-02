import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, ChevronDown, Loader2, Sparkles, Filter, X } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProfileCard } from '@/components/ProfileCard';
import { ProfileDetail } from '@/components/ProfileDetail';
import { BookingModal } from '@/components/BookingModal';
import { FilterSheet } from '@/components/FilterSheet';
import { ConsentModal } from '@/components/ConsentModal';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterOptions, Profile } from '@/types';
import { CITIES } from '@/types';
import { CompanionProfile } from '@/hooks/useCompanions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

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
});

const DiscoverPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasAcceptedConsent, setHasAcceptedConsent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cities, setCities] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    city: '',
    gender: '',
    priceRange: [0, 2000],
    activities: [],
    ageRange: [18, 50],
    onlineOnly: false,
  });

  const { user, profile: userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: userActiveBooking } = useQuery({
    queryKey: ['user-active-booking', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', ['accepted', 'active'])
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const hasActiveBooking = !!userActiveBooking;

  useEffect(() => {
    const fetchCities = async () => {
      // @ts-ignore
      const { data } = await supabase.from('cities').select('name').eq('is_active', true).order('name');
      if (data) {
        // @ts-ignore
        setCities(data.map(c => c.name));
      }
    };
    fetchCities();
  }, []);

  const { data: paginatedData, isLoading: isLoadingCompanions } = useQuery({
    queryKey: ['companions-paginated', currentPage, selectedCity, filters],
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
            is_active
          )
        `, { count: 'exact' })
        .eq('availability_status', true);

      const { data, error } = await query;
      if (error) throw error;

      const { data: activeBookings } = await supabase
        .from('bookings')
        .select('user_id, companion_id')
        .in('status', ['accepted', 'active']);

      const busyUserIds = new Set<string>();
      const busyCompanionProfileIds = new Set<string>();

      (activeBookings || []).forEach((booking: any) => {
        busyUserIds.add(booking.user_id);
        busyCompanionProfileIds.add(booking.companion_id);
      });

      let filtered = (data || [])
        .filter((item: any) => {
          const isVerified = item.profile?.is_identity_verified === true;
          const isActive = item.profile?.is_active !== false;
          const isBusy = busyCompanionProfileIds.has(item.profile?.id) ||
            busyUserIds.has(item.profile?.user_id);
          return isVerified && isActive && !isBusy;
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

      if ((selectedCity || filters.city) && (selectedCity !== 'all')) {
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
      if (filters.activities && filters.activities.length > 0) {
        filtered = filtered.filter((c: any) =>
          filters.activities!.some((a) => c.activities?.includes(a))
        );
      }
      if (filters.onlineOnly) {
        filtered = filtered.filter((c: any) => c.profile?.is_online);
      }

      return {
        companions: filtered as CompanionProfile[],
        totalCount: filtered.length,
      };
    },
  });

  const companions = paginatedData?.companions || [];
  const totalCount = paginatedData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, filters, searchQuery]);

  const profiles = useMemo(() => {
    return companions.map(mapCompanionToProfile);
  }, [companions]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      if (searchQuery && !profile.firstName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (profile.age < filters.ageRange[0] || profile.age > filters.ageRange[1]) {
        return false;
      }
      return true;
    });
  }, [searchQuery, filters, profiles]);

  const paginatedProfiles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProfiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProfiles, currentPage]);

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
      navigate('/auth');
      return;
    }

    if (hasActiveBooking) {
      toast({
        title: 'Active booking in progress',
        description: 'Please complete your current booking before making a new one.',
        variant: 'destructive',
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
        toast({
          title: 'Error',
          description: 'Could not find companion profile.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .insert({
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
        message: `You have a new booking request for ${bookingDetails.activity} on ${bookingDetails.date.toLocaleDateString()}`,
        data: { activity: bookingDetails.activity },
      });

      toast({
        title: 'Booking Request Sent!',
        description: 'Your booking request has been sent to the companion.',
      });
      setShowBookingModal(false);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.gender) count++;
    if (filters.activities.length > 0) count++;
    if (filters.onlineOnly) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) count++;
    if (filters.ageRange[0] > 18 || filters.ageRange[1] < 50) count++;
    return count;
  }, [filters]);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer rounded-xl"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={currentPage === 1}
            className="cursor-pointer rounded-xl"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="ellipsis-start" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer rounded-xl"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="ellipsis-end" />);
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer rounded-xl"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <DashboardLayout title="Discover" subtitle="Find your perfect companion">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Modern Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border border-slate-200/50 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />

          <div className="relative flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                placeholder="Search by name, profession..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Select
                  value={selectedCity}
                  onValueChange={setSelectedCity}
                >
                  <SelectTrigger className="px-10 w-full sm:w-48 h-full py-3.5 rounded-2xl bg-slate-50 border-slate-200 font-medium">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 font-medium">
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className={cn(
                  "rounded-2xl h-full py-3.5 px-6 border-slate-200 bg-white hover:bg-slate-50 transition-all font-bold",
                  activeFiltersCount > 0 && "border-primary bg-primary/5 text-primary"
                )}
              >
                <Filter className="w-5 h-5 mr-3" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Active Chips */}
          <AnimatePresence>
            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100"
              >
                {filters.gender && (
                  <span className="filter-chip bg-primary/5 border-primary/10 text-primary">
                    {filters.gender}
                    <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setFilters({ ...filters, gender: '' })} />
                  </span>
                )}
                {filters.activities.map((activity) => (
                  <span key={activity} className="filter-chip bg-accent/5 border-accent/10 text-accent">
                    {activity}
                    <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setFilters({ ...filters, activities: filters.activities.filter(a => a !== activity) })} />
                  </span>
                ))}
                <button
                  onClick={() => setFilters({
                    city: '',
                    gender: '',
                    priceRange: [0, 2000],
                    activities: [],
                    ageRange: [18, 50],
                    onlineOnly: false,
                  })}
                  className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors ml-2"
                >
                  Clear All
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {isLoadingCompanions ? 'Finding companions...' : 'Verified Companions'}
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              {filteredProfiles.length} experts available for you
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <Button variant="ghost" size="sm" className="rounded-lg font-bold text-primary bg-primary/5">All</Button>
            <Button variant="ghost" size="sm" className="rounded-lg font-bold text-muted-foreground">Nearby</Button>
            <Button variant="ghost" size="sm" className="rounded-lg font-bold text-muted-foreground">New</Button>
          </div>
        </div>

        {/* Grid Section */}
        {isLoadingCompanions ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-[420px] w-full rounded-2xl" />
            ))}
          </div>
        ) : paginatedProfiles.length > 0 ? (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12"
            >
              {paginatedProfiles.map((profile, index) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onClick={() => handleProfileClick(profile)}
                  index={index}
                  showSpecialBadge={(profile as any).hasSpecialBadge}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 pb-10">
                <Pagination>
                  <PaginationContent className="gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={cn(
                          "cursor-pointer rounded-xl h-11 border-slate-200 transition-all",
                          currentPage === 1 ? 'pointer-events-none opacity-40' : 'hover:bg-primary/5'
                        )}
                      />
                    </PaginationItem>
                    {renderPaginationItems()}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={cn(
                          "cursor-pointer rounded-xl h-11 border-slate-200 transition-all",
                          currentPage === totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-primary/5'
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="glass-card py-20 text-center border-dashed border-2">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-50 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No results matched your search</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Try adjusting your filters or searching for something else.
            </p>
            <Button
              variant="outline"
              className="rounded-xl font-bold border-slate-200"
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('');
                setFilters({
                  city: '',
                  gender: '',
                  priceRange: [0, 2000],
                  activities: [],
                  ageRange: [18, 50],
                  onlineOnly: false,
                });
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      <FilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={setFilters}
      />

      <ProfileDetail
        isOpen={showProfileDetail}
        onClose={() => setShowProfileDetail(false)}
        profile={selectedProfile as any}
        onBook={handleBookClick}
      />

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onAccept={handleConsentAccept}
      />

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        profile={selectedProfile}
        onBook={handleBookingComplete}
      />
    </DashboardLayout>
  );
};

export default DiscoverPage;
