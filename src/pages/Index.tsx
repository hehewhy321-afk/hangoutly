import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, useInView } from 'framer-motion';
import { Heart, Shield, Users, Clock, MapPin, ArrowRight, CheckCircle2, Star, Sparkles, TrendingUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { Link } from 'react-router-dom';
import { MagneticButton } from '@/components/MagneticButton';
import { BentoGrid, BentoItem } from '@/components/BentoGrid';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { animations } from '@/lib/animations';
import { SafetyCTA } from '@/components/SafetyCTA';

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
  { emoji: '☕', name: 'Coffee Dates', color: 'bg-amber-500/10 border-amber-500/20 text-amber-600' },
  { emoji: '🎬', name: 'Movies', color: 'bg-red-500/10 border-red-500/20 text-red-600' },
  { emoji: '🥾', name: 'Hiking', color: 'bg-green-500/10 border-green-500/20 text-green-600' },
  { emoji: '🎭', name: 'Events', color: 'bg-purple-500/10 border-purple-500/20 text-purple-600' },
  { emoji: '💬', name: 'Conversations', color: 'bg-blue-500/10 border-blue-500/20 text-blue-600' },
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
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section with Bento Grid */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 40 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="text-center mb-16"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">100% Verified Companions</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              Find Your Perfect{' '}
              <span className="text-gradient-primary">Companion</span>
              <br />
              for Any Occasion
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Book verified companions for movies, coffee, hiking, or meaningful conversations.
              Safe, consent-driven, and completely transparent.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to={user ? '/discover' : '/browse'}>
                <MagneticButton variant="primary" size="lg">
                  Find Companions
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
              {!user && (
                <Link to="/auth">
                  <MagneticButton variant="secondary" size="lg">
                    Become a Companion
                  </MagneticButton>
                </Link>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium text-muted-foreground">ID Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium text-muted-foreground">Safe Meetings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium text-muted-foreground">No Hidden Fees</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Grid */}
          <BentoGrid columns={4} className="gap-4">
            {/* Large Featured Card */}
            <BentoItem span={2} rowSpan={2} className="relative overflow-hidden group">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop"
                  alt="Featured Companion"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="relative h-full flex flex-col justify-end p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-md w-fit mb-4">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-white">Online Now</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Priya, 24</h3>
                <p className="text-white/90 mb-4">Graphic Designer • Kathmandu</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-sm">☕ Coffee</span>
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-sm">🎨 Art</span>
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-sm">🚶 Walking</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">Rs. 500/hr</span>
                  <Link to={user ? '/discover' : '/browse'}>
                    <button className="px-6 py-3 rounded-xl bg-white text-primary font-semibold hover:bg-white/90 transition-all">
                      Book Now
                    </button>
                  </Link>
                </div>
              </div>
            </BentoItem>

            {/* Stats Card */}
            <BentoItem className="bg-gradient-primary text-white">
              <div className="flex flex-col h-full justify-between">
                <TrendingUp className="w-8 h-8 mb-4" />
                <div>
                  <div className="text-4xl font-bold mb-2">
                    <AnimatedCounter end={500} suffix="+" />
                  </div>
                  <p className="text-white/90">Happy Users</p>
                </div>
              </div>
            </BentoItem>

            {/* Verified Badge */}
            <BentoItem className="bg-green-500/10">
              <div className="flex flex-col h-full justify-between">
                <Shield className="w-8 h-8 text-green-500 mb-4" />
                <div>
                  <div className="text-4xl font-bold text-green-500 mb-2">100%</div>
                  <p className="text-green-600 font-medium">ID Verified</p>
                </div>
              </div>
            </BentoItem>

            {/* Activities */}
            <BentoItem span={2}>
              <h4 className="text-lg font-bold mb-4">Popular Activities</h4>
              <div className="grid grid-cols-3 gap-2">
                {activities.map((activity, i) => (
                  <motion.div
                    key={activity.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-xl border ${activity.color} text-center`}
                  >
                    <div className="text-2xl mb-1">{activity.emoji}</div>
                    <div className="text-xs font-medium">{activity.name}</div>
                  </motion.div>
                ))}
              </div>
            </BentoItem>
          </BentoGrid>
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
      <footer className="py-12 px-4 bg-surface border-t border-border">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="text-xl font-bold text-gradient-primary">Hangoutly</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Safe, verified companionship for meaningful connections.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/browse" className="hover:text-primary transition-colors">Browse</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link to="/safety" className="hover:text-primary transition-colors">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><a href="mailto:support@hangoutly.com" className="hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy;{new Date().getFullYear()}  Hangoutly. All rights reserved.</p>
            <p>Made with ❤️ by <a href="https://github.com/hehewhy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Groot</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
