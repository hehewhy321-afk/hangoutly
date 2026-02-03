import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, Heart, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { MagneticButton } from '@/components/MagneticButton';
import { createMagneticEffect } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin } = useAuth();
  const logoRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Transform header on scroll
  const headerBlur = useTransform(scrollY, [0, 100], [20, 30]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Magnetic effect for logo
  useEffect(() => {
    if (!logoRef.current) return;
    const cleanup = createMagneticEffect(logoRef.current, 0.2);
    return cleanup;
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: user ? '/discover' : '/browse', label: user ? 'Discover' : 'Browse' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/safety', label: 'Safety' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'py-2' : 'py-4'
        )}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className={cn(
              'relative overflow-hidden rounded-2xl',
              'backdrop-blur-xl bg-white/70',
              'border border-white/50',
              'shadow-float',
              'transition-all duration-300',
              isScrolled && 'shadow-float-lg'
            )}
            style={{
              backdropFilter: `blur(${headerBlur}px) saturate(180%)`,
            }}
          >
            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-3 items-center px-8 py-4 gap-8">
              {/* Left - Logo */}
              <Link to="/" className="flex items-center gap-3 group justify-start">
                <motion.div
                  ref={logoRef}
                  className="relative w-12 h-12 rounded-xl overflow-hidden shadow-glow ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src="/logo.png"
                    alt="Hangoutly"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-gradient-primary leading-none tracking-tight">
                    Hangoutly
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground tracking-[0.25em] uppercase">
                    Connect
                  </span>
                </div>
              </Link>

              {/* Center - Navigation */}
              <nav className="flex items-center gap-6 justify-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'text-sm font-semibold transition-all duration-200 relative group',
                      isActive(link.path)
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {link.label}
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <div className="absolute inset-0 -z-10 bg-primary/5 rounded-lg scale-0 group-hover:scale-100 transition-transform" />
                  </Link>
                ))}
              </nav>

              {/* Right - Actions */}
              <div className="flex items-center gap-4 justify-end">
                {user ? (
                  <div className="flex items-center gap-3">
                    <NotificationsDropdown />
                    <Link to={isAdmin ? '/admin' : profile?.is_companion ? '/companion-dashboard' : '/discover'}>
                      <Button variant="ghost" size="sm" className="rounded-xl font-semibold">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link to="/auth">
                    <MagneticButton variant="primary" size="sm" className="rounded-xl font-semibold shadow-glow-primary">
                      <Heart className="w-4 h-4 mr-2" />
                      Get Started
                    </MagneticButton>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden px-6 py-4 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5 group">
                <motion.div
                  className="relative w-10 h-10 rounded-xl overflow-hidden shadow-glow"
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src="/logo.png"
                    alt="Hangoutly"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-gradient-primary leading-none">
                    Hangoutly
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
                    Connect
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                {user && <NotificationsDropdown />}
                <motion.button
                  className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5 text-foreground" />
                  ) : (
                    <Menu className="w-5 h-5 text-foreground" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          y: isMenuOpen ? 0 : -20,
          pointerEvents: isMenuOpen ? 'auto' : 'none',
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-20 left-0 right-0 z-40 md:hidden"
      >
        <div className="container mx-auto px-4">
          <div className="glass-card p-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block py-3 px-4 rounded-xl text-sm font-medium transition-all',
                  isActive(link.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary/50'
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-border space-y-3">
              {user ? (
                <Link
                  to={isAdmin ? '/admin' : profile?.is_companion ? '/companion' : '/dashboard'}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden shadow-glow">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-xl flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Backdrop */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};
