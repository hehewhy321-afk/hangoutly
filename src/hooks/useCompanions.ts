import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CompanionProfile {
  id: string;
  profile_id: string;
  hourly_rate: number;
  activities: string[];
  gallery_images: string[];
  availability_status: boolean;
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    age?: number;
    gender: string;
    city: string;
    area: string;
    profession: string;
    bio: string;
    avatar_url: string;
    is_identity_verified: boolean; // Real ID verification
    is_verified: boolean; // Special badge (X/Instagram style)
    is_online: boolean;
    created_at?: string;
  };
}

export const useCompanions = (filters?: {
  city?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  activities?: string[];
  onlineOnly?: boolean;
}) => {
  return useQuery({
    queryKey: ['companions', filters],
    queryFn: async () => {
      // First get companion profiles with availability
      let query = supabase
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
        `)
        .eq('availability_status', true);

      const { data, error } = await query;

      if (error) throw error;

      // Get all active bookings (accepted or active status) to hide busy users
      const { data: activeBookings } = await supabase
        .from('bookings')
        .select('user_id, companion_id')
        .in('status', ['accepted', 'active']);

      // Create sets of busy user_ids and companion profile_ids
      const busyUserIds = new Set<string>();
      const busyCompanionProfileIds = new Set<string>();

      (activeBookings || []).forEach((booking: any) => {
        busyUserIds.add(booking.user_id);
        busyCompanionProfileIds.add(booking.companion_id); // companion_id is profile.id
      });

      console.log('Busy users:', busyUserIds.size, 'Busy companions:', busyCompanionProfileIds.size);

      // Filter on client side for complex filters
      // IMPORTANT: Only show identity-verified and active users on discover page
      // Also filter out companions who have active bookings
      let filtered = (data || [])
        .filter((item: any) => {
          const isVerified = item.profile?.is_identity_verified === true;
          const isActive = item.profile?.is_active !== false;
          // Check if this companion has an active booking (by their profile.id)
          const hasActiveBookingAsCompanion = busyCompanionProfileIds.has(item.profile?.id);
          // Check if this companion (as a user) has an active booking they made
          const hasActiveBookingAsUser = busyUserIds.has(item.profile?.user_id);
          const isBusy = hasActiveBookingAsCompanion || hasActiveBookingAsUser;

          console.log('Filtering:', item.profile?.first_name, 'verified:', isVerified, 'active:', isActive, 'busy:', isBusy);
          return isVerified && isActive && !isBusy;
        })
        .map((item: any) => {
          // Calculate age from date_of_birth
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
          return {
            ...item,
            profile: {
              ...item.profile,
              age,
            },
          };
        });

      if (filters?.city) {
        filtered = filtered.filter((c: any) => c.profile?.city === filters.city);
      }
      if (filters?.gender) {
        filtered = filtered.filter((c: any) => c.profile?.gender === filters.gender);
      }
      if (filters?.minPrice !== undefined) {
        filtered = filtered.filter((c: any) => c.hourly_rate >= filters.minPrice!);
      }
      if (filters?.maxPrice !== undefined) {
        filtered = filtered.filter((c: any) => c.hourly_rate <= filters.maxPrice!);
      }
      if (filters?.activities && filters.activities.length > 0) {
        filtered = filtered.filter((c: any) =>
          filters.activities!.some((a) => c.activities?.includes(a))
        );
      }
      if (filters?.onlineOnly) {
        filtered = filtered.filter((c: any) => c.profile?.is_online);
      }

      return filtered as CompanionProfile[];
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (booking: {
      companionId: string; // This is the profile ID
      bookingDate: string;
      startTime: string;
      durationHours: number;
      activity: string;
      hourlyRate: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          companion_id: booking.companionId,
          booking_date: booking.bookingDate,
          start_time: booking.startTime,
          duration_hours: booking.durationHours,
          activity: booking.activity,
          hourly_rate: booking.hourlyRate,
          total_amount: booking.hourlyRate * booking.durationHours,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Get companion's user_id from their profile (companionId is profile.id)
      const { data: companionProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', booking.companionId)
        .single();

      if (companionProfile?.user_id) {
        // Create notification for companion using their auth user_id
        await supabase.from('notifications').insert({
          user_id: companionProfile.user_id,
          type: 'booking_request',
          title: 'New Booking Request',
          message: `You have a new booking request for ${booking.activity}`,
          data: { booking_id: data.id },
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useMyBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookings', 'my', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          companion:companion_id(
            first_name,
            avatar_url,
            city
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select('companion_profile_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((f) => f.companion_profile_id);
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (companionProfileId: string) => {
      if (!user) throw new Error('Not authenticated');

      const isFavorite = favoritesQuery.data?.includes(companionProfileId);

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('companion_profile_id', companionProfileId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            companion_profile_id: companionProfileId,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return {
    favorites: favoritesQuery.data || [],
    isLoading: favoritesQuery.isLoading,
    toggleFavorite: toggleFavorite.mutate,
  };
};
