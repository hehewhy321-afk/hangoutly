import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import {
  Shield, AlertTriangle, Phone, MapPin, Users, Lock,
  Eye, MessageCircle, Heart, ArrowLeft, CheckCircle2,
  Zap, LifeBuoy, Bell, ShieldCheck, Fingerprint, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

const safetyTips = [
  {
    icon: MapPin,
    title: 'Meet in Public Places',
    description: 'Always meet in busy, well-lit public spaces like cafés or popular landmarks.',
    tag: 'Location'
  },
  {
    icon: Phone,
    title: 'Tell Someone You Trust',
    description: 'Share your meeting location and expected duration with a friend or family member.',
    tag: 'Safety'
  },
  {
    icon: Activity,
    title: 'Trust Your Instincts',
    description: 'Your gut feeling matters. If something feels wrong, leave immediately without hesitation.',
    tag: 'Instinct'
  },
  {
    icon: Lock,
    title: 'Protect Your Privacy',
    description: "Keep your personal information safe. Don't share your home address, financial details, or sensitive personal information.",
    tag: 'Privacy'
  },
  {
    icon: Eye,
    title: 'Stay Alert',
    description: 'Stay fully aware of your surroundings. Avoid alcohol or substances that could impair your judgment.',
    tag: 'Alertness'
  },
  {
    icon: MessageCircle,
    title: 'Set Clear Boundaries',
    description: "Discuss expectations before meeting. Respect each other's boundaries to ensure a positive experience.",
    tag: 'Respect'
  },
];

const SafetyPage = () => {
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
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
            <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </motion.div>

          {/* Hero Section */}
          <div className="text-center mb-24 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 mx-auto mb-10 rounded-[2.5rem] bg-slate-900 flex items-center justify-center shadow-2xl relative z-10"
            >
              <Shield className="w-10 h-10 text-primary" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-[2.5rem] border border-white/10" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-8"
            >
              Trust is our <br />
              <span className="text-gradient-primary">Foundation.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              We've built a comprehensive safety system to protect everyone in our community. Safety isn't just a feature; it's our foundation.
            </motion.p>
          </div>

          {/* Safety Tips Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24"
          >
            {safetyTips.map((tip, i) => (
              <motion.div key={i} variants={itemVariants} className="group">
                <div className="glass-card p-10 h-full border border-slate-200/60 bg-white hover:border-primary/20 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col items-start text-left">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />

                  <div className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest mb-8 border border-slate-100">
                    {tip.tag}
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-white group-hover:border-transparent">
                    <tip.icon className="w-5 h-5 transition-colors" />
                  </div>

                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-4">{tip.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{tip.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Emergency Protocols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-rose-50 border border-rose-100 p-10 md:p-16 rounded-[3rem] mb-24 flex flex-col md:flex-row items-center gap-12"
          >
            <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-rose-900 tracking-tight mb-4 uppercase tracking-widest border-b border-rose-200 pb-2 inline-block">Emergency Contact</h3>
              <p className="text-rose-700/80 text-lg font-medium leading-relaxed mb-6">
                In case of emergency or immediate danger, contact local authorities.
                <span className="block mt-4 text-rose-900 font-black">NEPAL EMERGENCY NUMBER: 100</span>
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                  <Shield className="w-4 h-4" /> 24/7 Monitoring
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                  <Bell className="w-4 h-4" /> Instant Response
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Architecture Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest mb-8">
                <ShieldCheck className="w-4 h-4" /> Layered Defense
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">Verification <br />Process</h2>
              <div className="space-y-8">
                {[
                  { icon: Fingerprint, title: 'ID Verification', desc: 'Every companion is verified with government-issued identification.' },
                  { icon: Eye, title: 'Photo Verification', desc: 'Selfie verification ensures the person matches their profile photo.' },
                  { icon: Users, title: 'Manual Review', desc: 'Each verification is carefully reviewed by our safety team.' },
                  { icon: RefreshCw, title: 'Regular Updates', desc: 'Profiles are regularly re-verified to maintain safety standards.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-5 relative"
            >
              <div className="aspect-[4/5] rounded-[3.5rem] bg-slate-900 overflow-hidden relative group shadow-2xl">
                <img src="https://images.unsplash.com/photo-1541872703-74c5e443d1f0" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 text-center">
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4">Integrity Level</p>
                  <div className="text-6xl font-black text-white tracking-widest mb-4 italic italic">100%</div>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Verified Companions Only</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link to="/discover">
              <MagneticButton className="h-16 px-12 rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow-primary">
                Browse Safely
              </MagneticButton>
            </Link>
            <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stay safe and aware.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const RefreshCw = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default SafetyPage;
