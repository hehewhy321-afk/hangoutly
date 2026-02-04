import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Users, Clock, MapPin, ArrowRight, CheckCircle2, Star, Sparkles, TrendingUp, MousePointer2, ChevronDown } from 'lucide-react';
import { Header } from '@/components/Header';
import { Link } from 'react-router-dom';
import { MagneticButton } from '@/components/MagneticButton';
import { BentoGrid, BentoItem } from '@/components/BentoGrid';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { MagneticCursor } from '@/components/MagneticCursor';
import { ParticleBackground } from '@/components/ParticleBackground';
import { FloatingCard } from '@/components/FloatingCard';
import { RippleButton } from '@/components/RippleButton';
import { animations } from '@/lib/animations';
import { SafetyCTA } from '@/components/SafetyCTA';
import { Footer } from '@/components/Footer';

const features = [
  {
    icon: Shield,
    title: 'Verified Profiles',
    description: 'Every companion is ID-verified for your safety and peace of mind.',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: Clock,
    title: 'Time-Based',
    description: 'Book companionship by the hour for predefined activities only.',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    icon: MapPin,
    title: 'Local Connections',
    description: 'Find companions in your city for coffee, hiking, or events.',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    icon: Users,
    title: 'Consent First',
    description: 'Clear boundaries and mutual respect are our core values.',
    gradient: 'from-blue-500 to-cyan-600',
  },
];

const activities = [
  { emoji: '☕', name: 'Coffee', color: 'bg-amber-500/10 border-amber-500/20 text-amber-600' },
  { emoji: '🎬', name: 'Movies', color: 'bg-red-500/10 border-red-500/20 text-red-600' },
  { emoji: '🥾', name: 'Hiking', color: 'bg-green-500/10 border-green-500/20 text-green-600' },
  { emoji: '🎨', name: 'Creative', color: 'bg-purple-500/10 border-purple-500/20 text-purple-600' },
  { emoji: '💬', name: 'Chat', color: 'bg-blue-500/10 border-blue-500/20 text-blue-600' },
  { emoji: '🍽️', name: 'Dining', color: 'bg-orange-500/10 border-orange-500/20 text-orange-600' },
];

const testimonials = [
  {
    name: 'Anita R.',
    text: 'Finally a platform where I feel safe meeting new people. The verification gives me confidence.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    name: 'Raj K.',
    text: 'Great way to explore the city with local companions. Made genuine connections!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    name: 'Priya S.',
    text: 'Love the transparency and safety features. Best platform for meaningful connections.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  },
];

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const isFeaturesInView = useInView(featuresRef, { once: true });

  const [heroProfile, setHeroProfile] = useState<any>(null);
  const [activeUserCount, setActiveUserCount] = useState(500); // Default fallback

  // Fetch active user count
  useEffect(() => {
    const fetchActiveUserCount = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (count !== null && count > 0) {
        setActiveUserCount(count);
      }
    };

    fetchActiveUserCount();
  }, []);

  useEffect(() => {
    const fetchHeroProfile = async () => {
      // Fetch a random verified companion
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          companion_profiles (
            hourly_rate,
            gallery_images
          )
        `)
        .eq('is_companion', true)
        .eq('is_verified', true)
        .limit(10); // Fetch a few to pick random

      if (data && data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)];
        const companionData = random.companion_profiles?.[0] || {};
        const profileWithRate = { ...random, ...companionData };
        setHeroProfile(profileWithRate);
      }
    };

    fetchHeroProfile();

    // Subscribe to periodic updates (every 5 mins change hero maybe?)
    // For now just fetch once on mount
  }, []);

  useEffect(() => {
    if (user && profile && !profile.consent_accepted) {
      navigate('/onboarding');
    }
  }, [user, profile, navigate]);


  useEffect(() => {
    if (heroRef.current) {
      animations.fadeInUp(heroRef.current);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Magnetic Cursor */}
      <MagneticCursor />

      <Header />

      {/* Hero Section - Immersive 2026 */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Particle Background */}
        <ParticleBackground />

        {/* Deep Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/15 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-glow-primary/10 mx-auto"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-bold text-foreground/80 uppercase tracking-[0.2em]">Excellence in Companionship</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-[2.75rem] sm:text-7xl md:text-8xl lg:text-[9rem] font-black leading-[0.95] tracking-tighter mix-blend-lighten">
              <motion.span
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="block text-foreground mb-1 sm:mb-2 sm:whitespace-nowrap"
              >
                Elevate Every
              </motion.span>
              <motion.span
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="block bg-gradient-to-r from-primary via-violet-600 to-accent bg-clip-text text-transparent animate-gradient py-1 md:py-4"
              >
                Connection
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-base md:text-2xl text-muted-foreground leading-relaxed max-w-xl mx-auto font-medium px-4 md:px-0"
            >
              Experience a new era of curated social companionship.
              <span className="text-foreground block mt-2">Secure, verified, and designed for the discerning individual.</span>
            </motion.p>

            {/* CTA Cluster */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-8 md:mb-12 w-full px-6 md:px-0"
            >
              <Link to={user ? '/discover' : '/browse'} className="w-full sm:w-auto">
                <RippleButton variant="primary" size="lg" className="w-full sm:min-w-[200px] md:min-w-[240px] h-14 md:h-16 text-base md:text-lg rounded-2xl md:rounded-[2rem] shadow-2xl font-bold">
                  Explore Community
                </RippleButton>
              </Link>
              {!user && (
                <Link to="/auth" className="w-full sm:w-auto">
                  <RippleButton variant="ghost" size="lg" className="w-full sm:min-w-[200px] md:min-w-[240px] h-14 md:h-16 text-base md:text-lg rounded-2xl md:rounded-[2rem] bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:text-white font-bold transition-all">
                    Join as Member
                  </RippleButton>
                </Link>
              )}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 pt-6 border-t border-white/5 pb-20 md:pb-0"
            >
              <div className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">ID Verified</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ animationDelay: '0.2s' }} />
                <span className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">Safe Meetings</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ animationDelay: '0.4s' }} />
                <span className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">Zero Hidden Fees</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator - Hidden on mobile to prevent overlap/clutter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex-col items-center gap-3 text-muted-foreground/50 hidden md:flex"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 text-primary">Scroll To Discover</span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-primary/50 to-transparent relative overflow-hidden">
            <motion.div
              animate={{ y: [0, 80] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Section - Large Scale Bento */}
      <section className="py-32 px-4 relative bg-background/50 backdrop-blur-3xl border-t border-white/5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-6xl font-black tracking-tight"
              >
                Featured <br />Members
              </motion.h2>
              <p className="text-muted-foreground text-lg max-w-md">Our most active and top-rated companions, hand-picked for quality.</p>
            </div>
            <Link to="/discover">
              <MagneticButton variant="ghost" className="group flex items-center gap-2 font-bold text-primary">
                View All Members <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            </Link>
          </div>

          <BentoGrid columns={4} className="gap-6 md:gap-8">
            {/* Main Featured Card */}
            <BentoItem span={2} rowSpan={2} className="p-0 border-0 bg-transparent rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-2xl relative h-[400px] md:h-auto md:min-h-[600px]">
              <FloatingCard className="w-full h-full" tiltMaxAngle={3}>
                <div className="relative w-full h-full">
                  <img
                    src="https://ik.imagekit.io/otherhope/she-is-not-real-bro.png?updatedAt=1770133374844"
                    alt="Featured Companion"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  {/* Card Content Overlay */}
                  <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">Online Now</span>
                    </div>

                    <h3 className="text-3xl md:text-5xl font-black mb-2 leading-none">Priya, 24</h3>
                    <p className="text-sm md:text-lg text-white/70 mb-6 md:mb-8 max-w-sm leading-relaxed">Graphic designer specializing in creative exploration.</p>

                    <div className="flex flex-wrap gap-2 mb-10">
                      {['Creative', 'Artistic'].map(tag => (
                        <span key={tag} className="px-5 py-2 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-xs font-black tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-8">
                      <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Session Rate</p>
                        <span className="text-3xl font-black">Rs. 500<span className="text-lg opacity-40 font-medium ml-1">/hr</span></span>
                      </div>
                      <Link to={user ? '/discover' : '/browse'}>
                        <RippleButton variant="primary" className="px-10 py-5 h-auto rounded-3xl bg-white text-primary font-black shadow-2xl hover:scale-105 transition-transform text-base">
                          Reserve Now
                        </RippleButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </BentoItem>

            {/* User Stats Card (Accent) */}
            <BentoItem className="bg-gradient-to-br from-primary via-indigo-600 to-violet-600 text-white p-10 flex flex-col justify-between border-0 shadow-2xl rounded-[3rem]">
              <TrendingUp className="w-12 h-12 mb-6 opacity-30" />
              <div>
                <div className="text-5xl md:text-7xl font-black mb-2 leading-none">{activeUserCount}+</div>
                <p className="text-white/70 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">Verified Members</p>
              </div>
            </BentoItem>

            {/* Satisfaction Card */}
            <BentoItem className="bg-white/5 backdrop-blur-md p-8 md:p-10 flex flex-col justify-between border border-white/10 shadow-2xl rounded-[2.5rem] md:rounded-[3rem]">
              <Heart className="w-10 h-10 md:w-12 md:h-12 text-primary mb-6" />
              <div>
                <div className="text-5xl md:text-6xl font-black mb-2 text-foreground">99%</div>
                <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">Satisfaction</p>
              </div>
            </BentoItem>

            {/* Trust/Excellence Card */}
            <BentoItem span={2} className="bg-surface-elevated/50 backdrop-blur-md border border-white/5 p-10 shadow-xl rounded-[3rem] flex flex-col justify-center">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <Star className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h4 className="text-2xl font-black mb-2">Simply Exceptional</h4>
                  <p className="text-muted-foreground">Only the top 1% of applicants make it through our rigorous verification process.</p>
                </div>
              </div>
            </BentoItem>
          </BentoGrid>
        </div>
      </section>

      {/* Standalone Activities Section */}
      <section className="py-24 px-4 bg-background relative overflow-hidden">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">Popular Activities</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Experience curated companionship tailored to your interests.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {activities.map((activity, i) => (
              <motion.div
                key={activity.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className={`p-8 rounded-[2.5rem] border ${activity.color} flex flex-col items-center justify-center gap-4 group cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:bg-white/5`}
              >
                <div className="text-4xl group-hover:scale-125 transition-transform duration-500">{activity.emoji}</div>
                <div className="text-sm font-black uppercase tracking-[0.2em]">{activity.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 bg-gradient-mesh">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient-primary">Hangoutly</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've built the safest and most transparent platform for meaningful connections
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="floating-card p-6 group hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-glow`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Trusted by <span className="text-gradient-primary">Real People</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community has to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">Verified User</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety CTA Section */}
      <SafetyCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
