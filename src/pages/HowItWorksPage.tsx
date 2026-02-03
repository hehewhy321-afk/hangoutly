import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import {
  ArrowLeft, UserPlus, Search, Calendar, MessageSquare,
  CreditCard, Star, Shield, ArrowRight, Heart,
  Zap, Globe, Sparkles, ChevronRight, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up and verify your identity. All companions undergo thorough verification.',
    color: 'bg-indigo-500',
    tag: 'Authentication'
  },
  {
    number: 2,
    icon: Search,
    title: 'Browse Companions',
    description: 'Explore our verified community. Filter by city, interests, and activities.',
    color: 'bg-purple-500',
    tag: 'Exploration'
  },
  {
    number: 3,
    icon: Calendar,
    title: 'Book a Meeting',
    description: 'Choose your time and location. Set clear expectations for your experience.',
    color: 'bg-primary',
    tag: 'Coordination'
  },
  {
    number: 4,
    icon: MessageSquare,
    title: 'Connect Securely',
    description: 'Message through our secure platform. Finalize the details of your meeting.',
    color: 'bg-emerald-500',
    tag: 'Chat'
  },
  {
    number: 5,
    icon: CreditCard,
    title: 'Meet & Pay',
    description: 'Meet at your chosen venue. Pay directly through our secure platform.',
    color: 'bg-amber-500',
    tag: 'Transaction'
  },
  {
    number: 6,
    icon: Star,
    title: 'Network Feedback',
    description: 'Contribute to the collective intelligence. Your feedback maintains our high standards.',
    color: 'bg-rose-500',
    tag: 'Evolution'
  },
];

const faqs = [
  {
    question: 'Is the platform identity-secure?',
    answer: 'Absolutely. Every companion profile requires government-issued authentication and biometric verification before network activation.',
  },
  {
    question: 'How are asset exchanges managed?',
    answer: 'Exchanges are direct between nodes. Our system provides the framework; you choose the method (QR, digital transfer, or traditional).',
  },
  {
    question: 'What constitutes an allow-list activity?',
    answer: 'We facilitate sophisticated, platonic social experiences: dining, arts, intellectual discourse, and professional attendance. Sexual services are strictly forbidden.',
  },
  {
    question: 'Can I elevate to Companion status?',
    answer: 'Yes. Any registered node can apply for elevations and activate companion protocols after thorough identity vetting.',
  },
];

const HowItWorksPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
  } as const;

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary/20">
      <Header />

      <main className="pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Return to Origin
              </Link>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-8">
                Refined <br />
                <span className="text-gradient-primary">Connection</span> <br />
                Dynamics.
              </h1>
              <p className="text-lg text-slate-500 max-w-lg font-medium leading-relaxed">
                A sophisticated framework designed for premium social experiences. We've optimized the companionship protocol for safety, elegance, and authenticity.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl">
              <img
                src="https://www.asiapacific.ca/sites/default/files/styles/apf_700/public/Keystone_280.png.jpeg"
                className="w-full h-full object-cover"
                alt="Sophisticated Connection"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 flex gap-4">
                <div className="flex-1 glass-card bg-white/10 border-white/20 p-6 backdrop-blur-xl">
                  <p className="text-white text-3xl font-black tracking-tighter">99.9%</p>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Verification Integrity</p>
                </div>
                <div className="flex-1 glass-card bg-white/10 border-white/20 p-6 backdrop-blur-xl">
                  <p className="text-white text-3xl font-black tracking-tighter">24/7</p>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">System Vigilance</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Operational Steps */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-40">
            <div className="text-center mb-20">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">How It Works</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Simple Steps to Connect</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <motion.div key={i} variants={itemVariants} className="group cursor-default">
                  <div className="glass-card p-10 h-full border border-slate-200/60 bg-white shadow-xl hover:border-primary/20 hover:shadow-2xl transition-all relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />

                    <div className={cn("inline-flex items-center gap-3 px-4 py-1.5 rounded-full mb-8", "bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors")}>
                      <span className="text-[10px] font-black tracking-widest">{step.tag}</span>
                    </div>

                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform", step.color)}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4">{step.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">{step.description}</p>

                    <div className="text-4xl font-black text-slate-100 group-hover:text-primary/5 transition-colors select-none absolute bottom-8 right-10">
                      0{step.number}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Safety & Trust Banner */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative rounded-[3rem] bg-slate-900 p-12 md:p-20 overflow-hidden mb-40">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-2">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-8 ring-1 ring-emerald-500/20">
                  <Shield className="w-4 h-4" /> Your Safety First
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">Your Integrity is <br />Our Currency.</h2>
                <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                  We maintain strict safety standards. Every companion is thoroughly verified, identity-checked, and monitored by our safety team. You're entering a trusted community.
                </p>
                <div className="grid grid-cols-2 gap-8 mt-12">
                  <div className="flex items-center gap-4 text-white font-black text-xs uppercase tracking-widest">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Bio-Verification
                  </div>
                  <div className="flex items-center gap-4 text-white font-black text-xs uppercase tracking-widest">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Encrypted Links
                  </div>
                  <div className="flex items-center gap-4 text-white font-black text-xs uppercase tracking-widest">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Public Meet Points
                  </div>
                  <div className="flex items-center gap-4 text-white font-black text-xs uppercase tracking-widest">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Real-time Support
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-64 rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 border border-white/5 rounded-full animate-ping opacity-20" />
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center p-8 text-center shadow-glow-primary">
                    <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Safety First</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQs */}
          <div className="mb-40">
            <div className="text-center mb-20">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Questions</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Frequently Asked</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {faqs.map((faq, i) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="glass-card p-10 border border-slate-200/60 bg-white">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-4 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-card p-12 md:p-24 bg-white border border-slate-200/60 text-center shadow-2xl rounded-[3.5rem] relative overflow-hidden">
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />

            <Sparkles className="w-12 h-12 text-primary mx-auto mb-10" />
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-8 leading-[1.1]">Ready to make <br />meaningful connections?</h2>
            <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto mb-12">
              Join the thousands who have prioritized meaningful, verified companionship.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/discover">
                <MagneticButton className="h-16 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-glow-primary">
                  Browse Companions
                </MagneticButton>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="h-16 px-10 rounded-2xl font-black uppercase text-xs tracking-widest border-slate-200 group">
                  Sign Up <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default HowItWorksPage;
