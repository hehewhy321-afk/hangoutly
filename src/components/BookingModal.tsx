import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, BadgeCheck, ChevronRight, CreditCard, Sparkles, Info, Activity as ActivityIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Profile } from '@/types';
import { format, addDays } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onBook: (booking: BookingDetails) => void;
}

interface BookingDetails {
  date: Date;
  time: string;
  duration: number;
  activity: string;
}

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM',
  '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
];

const durations = [1, 2, 3, 4];

export const BookingModal = ({ isOpen, onClose, profile, onBook }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [selectedActivity, setSelectedActivity] = useState<string>('');

  if (!profile) return null;

  const totalCost = profile.hourlyRate * selectedDuration;
  // Only show 3 days: today, tomorrow, day after tomorrow
  const availableDates = Array.from({ length: 3 }, (_, i) => addDays(new Date(), i));

  // Filter time slots for current day
  const getAvailableTimeSlots = (date: Date) => {
    const isToday = date.toDateString() === new Date().toDateString();
    if (!isToday) return timeSlots;

    const currentHour = new Date().getHours();
    return timeSlots.filter(time => {
      // Parse time string to 24h format for comparison
      const [timeStr, modifier] = time.split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      if (hours === 12 && modifier === 'AM') hours = 0;
      if (hours !== 12 && modifier === 'PM') hours += 12;

      // Allow booking at least 1 hour in advance
      return hours > currentHour;
    });
  };

  const currentAvailableSlots = getAvailableTimeSlots(selectedDate);

  const canProceed = () => {
    if (step === 1) return selectedDate && selectedTime;
    if (step === 2) return selectedDuration > 0;
    if (step === 3) return selectedActivity;
    return false;
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleBook = () => {
    onBook({
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
      activity: selectedActivity,
    });
  };

  const resetModal = () => {
    setStep(1);
    setSelectedDate(new Date());
    setSelectedTime('');
    setSelectedDuration(1);
    setSelectedActivity('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full sm:max-w-xl bg-white/95 backdrop-blur-2xl sm:mx-4 rounded-t-[3rem] sm:rounded-[3rem] max-h-[90vh] overflow-hidden shadow-2xl border border-white/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-white/50">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src={profile.images[0]}
                    alt={profile.firstName}
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{profile.firstName}</h3>
                    {profile.isVerified && <BadgeCheck className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Premium Companion</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Rs. {profile.hourlyRate}/hr</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { onClose(); resetModal(); }}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all group"
              >
                <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-8 pt-6">
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-all duration-500",
                      s <= step ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]' : 'bg-slate-100'
                    )}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center mt-3">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Step {step} of 4</p>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">
                  {step === 1 && 'Schedule'}
                  {step === 2 && 'Duration'}
                  {step === 3 && 'Activity'}
                  {step === 4 && 'Summary'}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[65vh] custom-scrollbar">
              <AnimatePresence mode="wait">
                {/* Step 1: Date & Time */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">Select Date & Time</h4>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mt-0.5">When would you like to meet?</p>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Available Dates</Label>
                      <div className="flex gap-4 overflow-x-auto pb-4 px-1 hide-scrollbar">
                        {availableDates.map((date) => {
                          const isSelected = selectedDate.toDateString() === date.toDateString();
                          return (
                            <button
                              key={date.toISOString()}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedTime('');
                              }}
                              className={cn(
                                "flex-shrink-0 flex flex-col items-center justify-center w-24 h-32 rounded-[2rem] transition-all duration-300 border-2",
                                isSelected
                                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1'
                                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                              )}
                            >
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest mb-1",
                                isSelected ? "text-slate-200" : "text-slate-400"
                              )}>
                                {format(date, 'EEE')}
                              </span>
                              <span className="text-3xl font-black tracking-tighter mb-1">{format(date, 'd')}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest">{format(date, 'MMM')}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Available Time Slots</Label>
                          <span className="text-[9px] font-bold text-slate-300 uppercase bg-slate-100 px-2 py-0.5 rounded-full">Local Time</span>
                        </div>
                      </div>

                      {currentAvailableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {currentAvailableSlots.map((time) => {
                            const isSelected = selectedTime === time;
                            return (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                  "h-12 rounded-2xl text-[11px] sm:text-[12px] font-black tracking-tight transition-all duration-200 border-2",
                                  isSelected
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 hover:border-slate-200'
                                )}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                          <p className="text-sm font-bold text-slate-400">No slots available for this date.</p>
                          <p className="text-[10px] font-medium text-slate-300 mt-1 uppercase tracking-wider">Please select another date</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Duration */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">Select Duration</h4>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mt-0.5">How long for the session?</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {durations.map((hours) => {
                        const isSelected = selectedDuration === hours;
                        const price = profile.hourlyRate * hours;
                        return (
                          <button
                            key={hours}
                            onClick={() => setSelectedDuration(hours)}
                            className={cn(
                              "w-full flex items-center justify-between p-6 rounded-[2rem] transition-all duration-300 border-2 group",
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-100 -translate-y-1'
                                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                            )}
                          >
                            <div className="flex items-center gap-5">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black transition-all",
                                isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                              )}>
                                {hours}h
                              </div>
                              <div className="text-left">
                                <span className="block text-sm font-black uppercase tracking-widest">{hours} {hours === 1 ? 'Hour' : 'Hours'}</span>
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-widest",
                                  isSelected ? "text-slate-400" : "text-slate-300"
                                )}>Full Engagement</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={cn(
                                "block text-xl font-black tracking-tight",
                                isSelected ? "text-primary-foreground" : "text-primary"
                              )}>
                                Rs. {price}
                              </span>
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                isSelected ? "text-slate-400" : "text-slate-300"
                              )}>Total Service</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Activity */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <ActivityIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">Select Activity</h4>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mt-0.5">What are we doing today?</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {profile.activities.map((activity) => {
                        const isSelected = selectedActivity === activity;
                        return (
                          <button
                            key={activity}
                            onClick={() => setSelectedActivity(activity)}
                            className={cn(
                              "p-6 rounded-[2rem] text-center transition-all duration-300 border-2",
                              isSelected
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-100 -translate-y-1'
                                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                            )}
                          >
                            <span className="block text-[13px] font-black uppercase tracking-widest mb-1">{activity}</span>
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-widest",
                              isSelected ? "text-slate-400" : "text-slate-300"
                            )}>Preferred Activity</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Summary */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">Booking Summary</h4>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mt-0.5">Please review your request</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Summary Card */}
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 blur-[60px] rounded-full" />

                        <div className="grid grid-cols-2 gap-6 relative z-10">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Meeting Date</span>
                            <span className="text-sm font-black text-white">{format(selectedDate, 'MMM d, yyyy')}</span>
                          </div>
                          <div className="space-y-1.5 text-right">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Start Time</span>
                            <span className="text-sm font-black text-white">{selectedTime}</span>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Duration</span>
                            <span className="text-sm font-black text-white">{selectedDuration} {selectedDuration === 1 ? 'Hour' : 'Hours'}</span>
                          </div>
                          <div className="space-y-1.5 text-right">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Activity</span>
                            <span className="text-sm font-black text-white">{selectedActivity}</span>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Total Investment</span>
                            <span className="text-3xl font-black text-white tracking-tighter">Rs. {totalCost}</span>
                          </div>
                          <div className="h-10 px-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-primary mr-2" />
                            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Secured</span>
                          </div>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="flex items-center gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <Info className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                          Payment will be processed once {profile.firstName} accepts your booking request.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 flex gap-4 bg-white/50">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} className="h-14 flex-1 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border-slate-200 text-slate-500 hover:bg-slate-50">
                  Go Back
                </Button>
              )}
              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="h-14 flex-1 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-200 transition-all hover:bg-slate-800"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleBook}
                  className="h-14 flex-1 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:opacity-90"
                >
                  Send Request
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
