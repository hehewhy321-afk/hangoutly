import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ACTIVITIES, CITIES, FilterOptions } from '@/types';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
}

export const FilterSheet = ({ isOpen, onClose, filters, onApply }: FilterSheetProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handleReset = () => {
    setLocalFilters({
      city: '',
      gender: '',
      priceRange: [0, 2000],
      activities: [],
      ageRange: [18, 50],
      onlineOnly: false,
    });
  };

  const toggleActivity = (activity: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Fetch Cities
  useState(() => {
    const fetchCities = async () => {
      // @ts-ignore
      const { data } = await import('@/integrations/supabase/client').then(m => m.supabase.from('cities').select('name').eq('is_active', true).order('name'));
      if (data) {
        // @ts-ignore
        setAvailableCities(data.map(c => c.name));
      }
    };
    fetchCities();
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto h-[calc(100vh-140px)]">
              {/* City Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">City</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setLocalFilters((prev) => ({ ...prev, city: '' }))}
                    className={`filter-chip ${!localFilters.city ? 'active' : ''}`}
                  >
                    All Cities
                  </button>
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setLocalFilters((prev) => ({ ...prev, city }))}
                      className={`filter-chip ${localFilters.city === city ? 'active' : ''}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Gender</h3>
                <div className="flex flex-wrap gap-2">
                  {['', 'male', 'female'].map((gender) => (
                    <button
                      key={gender || 'all'}
                      onClick={() => setLocalFilters((prev) => ({ ...prev, gender }))}
                      className={`filter-chip ${localFilters.gender === gender ? 'active' : ''}`}
                    >
                      {gender === '' ? 'All' : gender === 'male' ? 'Male' : 'Female'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Price Range (per hour)</h3>
                  <span className="text-sm text-muted-foreground">
                    Rs. {localFilters.priceRange[0]} - Rs. {localFilters.priceRange[1]}
                  </span>
                </div>
                <Slider
                  value={localFilters.priceRange}
                  min={0}
                  max={2000}
                  step={50}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))
                  }
                  className="py-4"
                />
              </div>

              {/* Age Range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Age Range</h3>
                  <span className="text-sm text-muted-foreground">
                    {localFilters.ageRange[0]} - {localFilters.ageRange[1]} years
                  </span>
                </div>
                <Slider
                  value={localFilters.ageRange}
                  min={18}
                  max={50}
                  step={1}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, ageRange: value as [number, number] }))
                  }
                  className="py-4"
                />
              </div>

              {/* Online Only */}
              <div className="mb-6">
                <button
                  onClick={() =>
                    setLocalFilters((prev) => ({ ...prev, onlineOnly: !prev.onlineOnly }))
                  }
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${localFilters.onlineOnly
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-muted border-2 border-transparent'
                    }`}
                >
                  <span className="font-medium">Online Now Only</span>
                  <div
                    className={`w-12 h-6 rounded-full transition-colors ${localFilters.onlineOnly ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${localFilters.onlineOnly ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5`}
                    />
                  </div>
                </button>
              </div>

              {/* Activities */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Activities</h3>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITIES.map((activity) => (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      className={`filter-chip ${localFilters.activities.includes(activity) ? 'active' : ''
                        }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
              <Button variant="warm" onClick={handleApply} className="w-full" size="lg">
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
