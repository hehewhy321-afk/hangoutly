import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import {
  ArrowLeft, Mail, Phone, MapPin, Send, MessageSquare,
  Loader2, Globe, Heart, LifeBuoy, Zap, ChevronRight,
  Shield, Headset, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'support@hangoutly.com',
    description: 'Average response: 4 hours',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50'
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+977-1-4XXXXXX',
    description: 'Mon-Fri, 9am-6pm NPT',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50'
  },
  {
    icon: MapPin,
    title: 'Location',
    value: 'Kathmandu, Nepal',
    description: 'Central Office',
    color: 'text-amber-500',
    bg: 'bg-amber-50'
  },
];

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({ title: 'Message Sent', description: 'Your message has been successfully sent to our support team.' });
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
  } as const;

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary/20 overflow-x-hidden">
      <Header />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Back Path */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-16">
            <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-16 items-start">

            {/* Left Column: Context & Metadata */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="lg:col-span-5 space-y-12">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-8 shadow-2xl relative">
                  <Headset className="w-8 h-8 text-primary" strokeWidth={2.5} />
                  <div className="absolute inset-0 rounded-2xl border border-white/10" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-8">
                  Get in <br />
                  <span className="text-gradient-primary">Touch.</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                  Our support team is here and ready to help. We're here to assist you with any questions or concerns.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info, i) => (
                  <motion.div key={i} variants={itemVariants} className="group cursor-default">
                    <div className="p-6 rounded-[2rem] bg-white border border-slate-200/60 shadow-xl hover:border-primary/20 hover:shadow-2xl transition-all flex items-center gap-6">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform", info.bg)}>
                        <info.icon className={cn("w-5 h-5", info.color)} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{info.title}</p>
                        <p className="text-base font-black text-slate-800 tracking-tight">{info.value}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{info.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={itemVariants} className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-xl font-black tracking-tight mb-4 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  Priority Support
                </h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                  For immediate safety concerns or urgent issues, please visit our safety page.
                </p>
                <Link to="/safety">
                  <Button variant="ghost" className="h-10 px-6 rounded-xl bg-white/10 hover:bg-white text-white hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all">
                    Visit Safety Page <ChevronRight className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Column: Interaction Field */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-7"
            >
              <div className="glass-card p-10 md:p-14 bg-white border border-slate-200/60 shadow-2xl rounded-[3.5rem] relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

                <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Your Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Wick"
                        className="h-16 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 font-bold transition-all p-6"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@nexus.com"
                        className="h-16 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 font-bold transition-all p-6"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Subject</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Optimization Request"
                      className="h-16 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 font-bold transition-all p-6"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Message</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your question or concern..."
                      className="min-h-[200px] rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 font-bold transition-all p-6 resize-none"
                      required
                    />
                  </div>

                  <div className="pt-6">
                    <MagneticButton
                      type="submit"
                      disabled={isSubmitting}
                      className="h-16 w-full md:w-auto px-12 rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow-primary overflow-hidden relative"
                    >
                      <AnimatePresence mode="wait">
                        {isSubmitting ? (
                          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" /> Transmitting...
                          </motion.div>
                        ) : (
                          <motion.div key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                            <Send className="w-5 h-5" /> Send Message
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </MagneticButton>
                  </div>
                </form>
              </div>

              <div className="mt-12 flex items-center justify-between px-10 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                <div className="flex items-center gap-3 underline decoration-primary/30 underline-offset-4">
                  <Globe className="w-3.5 h-3.5" /> 256-bit Encrypted
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Premium Support
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
