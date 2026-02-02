import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

const rules = [
  {
    id: 'no-intimacy',
    text: 'I understand this platform is for time-based companionship only. No physical intimacy is expected or offered.',
  },
  {
    id: 'respect',
    text: 'I will respect boundaries and consent at all times. Consent can be revoked anytime.',
  },
  {
    id: 'public',
    text: 'I prefer meeting in public places and will prioritize safety.',
  },
  {
    id: 'activities',
    text: 'I understand activities must be predefined and agreed upon before meeting.',
  },
  {
    id: 'zero-tolerance',
    text: 'I acknowledge that violations result in permanent ban from the platform.',
  },
];

export const ConsentModal = ({ isOpen, onAccept, onClose }: ConsentModalProps) => {
  const [acceptedRules, setAcceptedRules] = useState<string[]>([]);

  const toggleRule = (ruleId: string) => {
    setAcceptedRules((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  const allAccepted = acceptedRules.length === rules.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl relative border border-white/20"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>

            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-emerald-50 flex items-center justify-center shadow-inner">
                <Shield className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Safety & Consent</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
                Our Community Guidelines
              </p>
            </div>

            {/* Legal Statement */}
            <div className="rounded-[2rem] p-6 mb-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <AlertTriangle className="w-24 h-24" />
              </div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-[13px] font-bold leading-relaxed text-slate-300">
                  This platform facilitates <span className="text-white font-black underline decoration-primary underline-offset-4">time-based companionship only</span>.
                  Any form of physical intimacy or coercion is strictly prohibited.
                </p>
              </div>
            </div>

            {/* Rules Checklist */}
            <div className="space-y-3 mb-10 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
              {rules.map((rule) => (
                <motion.label
                  key={rule.id}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all border",
                    acceptedRules.includes(rule.id)
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-slate-50 border-transparent hover:bg-slate-100'
                  )}
                >
                  <Checkbox
                    checked={acceptedRules.includes(rule.id)}
                    onCheckedChange={() => toggleRule(rule.id)}
                    className="mt-1 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <span className={cn(
                    "text-xs font-bold leading-relaxed transition-colors",
                    acceptedRules.includes(rule.id) ? "text-emerald-900" : "text-slate-600"
                  )}>
                    {rule.text}
                  </span>
                </motion.label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={onClose} className="flex-1 h-14 rounded-2xl border-slate-200 font-extrabold uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                Cancel
              </Button>
              <Button
                onClick={onAccept}
                disabled={!allAccepted}
                className={cn(
                  "flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
                  allAccepted
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.02]"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                <Check className="w-4 h-4 mr-2" />
                I Consent
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
