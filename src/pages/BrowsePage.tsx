import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, ChevronDown, Loader2, LogIn, UserPlus, Sparkles, Filter, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { ProfileCard } from '@/components/ProfileCard';
import { ProfileDetail } from '@/components/ProfileDetail';
import { FilterSheet } from '@/components/FilterSheet';
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
import { FilterOptions, Profile } from '@/types';
import { CITIES } from '@/types';
import { CompanionProfile } from '@/hooks/useCompanions';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { MagneticButton } from '@/components/MagneticButton';
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
});

const BrowsePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    city: '',
    gender: '',
    priceRange: [0, 2000],
    activities: [],
    ageRange: [18, 50],
    onlineOnly: false,
  });

  const navigate = useNavigate();

  const { data: paginatedData, isLoading: isLoadingCompanions } = useQuery({
    queryKey: ['companions-public', currentPage, selectedCity, filters],
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
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
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
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
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
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-10 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10 mb-4"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">Premium Companions</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore <span className="text-gradient-primary">Companions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Connect with verified experts and companions for meaningful experiences.
            </p>
          </div>

          {/* Search & Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-10 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -ml-32 -mb-32" />

            <div className="relative flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Search by name, profession or bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/50 shadow-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* City Select */}
                <div className="relative group min-w-[200px]">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="">All Cities</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFilters(true)}
                  className={cn(
                    "rounded-2xl h-full py-4 px-6 border-slate-200 shadow-sm bg-white hover:bg-slate-50 transition-all",
                    activeFiltersCount > 0 && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  <Filter className="w-5 h-5 mr-3" />
                  <span className="font-semibold">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="ml-3 w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Active Filter Chips */}
            <AnimatePresence>
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100"
                >
                  {filters.gender && (
                    <span className="filter-chip">
                      Gender: {filters.gender}
                      <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setFilters({ ...filters, gender: '' })} />
                    </span>
                  )}
                  {filters.onlineOnly && (
                    <span className="filter-chip">
                      Online Only
                      <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setFilters({ ...filters, onlineOnly: false })} />
                    </span>
                  )}
                  {filters.activities.map((activity) => (
                    <span key={activity} className="filter-chip">
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

          {/* Results Summary */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <p className="text-muted-foreground text-sm font-medium">
              {isLoadingCompanions ? (
                <span className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Searching for companions...
                </span>
              ) : (
                <>
                  Found <span className="text-foreground font-bold">{filteredProfiles.length}</span> verified companions
                  {selectedCity && <span> in <span className="text-primary">{selectedCity}</span></span>}
                </>
              )}
            </p>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Sort by:</span>
              <select className="bg-transparent text-sm font-bold text-foreground outline-none cursor-pointer">
                <option>Newest Members</option>
                <option>Hourly Rate: Low to High</option>
                <option>Hourly Rate: High to Low</option>
                <option>Most Popular</option>
              </select>
            </div>
          </div>

          {/* Grid Section */}
          {isLoadingCompanions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-[450px] w-full rounded-3xl" />
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
                <div className="flex justify-center mt-16">
                  <Pagination>
                    <PaginationContent className="gap-2">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={cn(
                            "cursor-pointer rounded-xl h-11 transition-all",
                            currentPage === 1 ? 'pointer-events-none opacity-40' : 'hover:bg-primary/10 hover:text-primary border-slate-200'
                          )}
                        />
                      </PaginationItem>
                      {renderPaginationItems()}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={cn(
                            "cursor-pointer rounded-xl h-11 transition-all",
                            currentPage === totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-primary/10 hover:text-primary border-slate-200'
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card py-24 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">No companions found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We couldn't find any companions matching your current filters. Try broadening your search.
              </p>
              <MagneticButton
                variant="primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('');
                  setCurrentPage(1);
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
                Reset All Filters
              </MagneticButton>
            </motion.div>
          )}

          {/* Join CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 relative rounded-3xl overflow-hidden"
          >
            {/* Background with glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-accent" />
            <div className="absolute inset-0 backdrop-blur-3xl bg-white/5" />

            {/* Animated gradient orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full -mr-48 -mt-48 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 blur-[120px] rounded-full -ml-48 -mb-48 animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Content */}
            <div className="relative px-8 py-16 md:px-16 md:py-20">
              <div className="max-w-3xl mx-auto text-center">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Join Our Community</span>
                </motion.div>

                {/* Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight"
                >
                  Become Part of Our{' '}
                  <span className="relative inline-block">
                    Exclusive Community
                    <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                      <path d="M0 4C50 1 150 1 200 4" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                    </svg>
                  </span>
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto"
                >
                  Join hundreds of members finding meaningful companionship. Secure, verified, and completely private.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <Link to="/auth?mode=signup">
                    <MagneticButton
                      variant="accent"
                      size="lg"
                      className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-2xl shadow-glow-accent bg-white text-primary hover:scale-105 transition-transform"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Free Account
                    </MagneticButton>
                  </Link>
                  <Link to="/how-it-works">
                    <MagneticButton
                      variant="ghost"
                      size="lg"
                      className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-md transition-all"
                    >
                      How it Works
                    </MagneticButton>
                  </Link>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span>100% Verified Profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>24/7 Support</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

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
        onBook={() => navigate('/auth')}
        bookButtonLabel="Sign In to Book"
      />

      {/* Footer (Simplified) */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <p className="text-sm text-muted-foreground">&copy; 2024 Hangoutly. Premium Companionship Platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default BrowsePage;
