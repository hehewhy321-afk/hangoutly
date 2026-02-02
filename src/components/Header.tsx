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
        <div className="container mx-auto px-4">
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
            <div className="px-6 py-4 flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                  ref={logoRef}
                  className="relative w-11 h-11 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-5 h-5 text-white" fill="white" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-hero opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                </motion.div>
                <span className="text-xl font-bold text-gradient-primary">
                  Hangoutly
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'text-sm font-medium transition-all duration-200 relative',
                      'hover:-translate-y-0.5',
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
                  </Link>
                ))}
              </nav>

              {user ? (
                <>
                  <Link to={isAdmin ? '/admin' : profile?.is_companion ? '/companion' : '/dashboard'}>
                    <Button variant="ghost" className="rounded-xl flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <NotificationsDropdown />
                </>
              ) : (
                <Link to="/auth">
                  <MagneticButton variant="primary" size="sm" className="flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4" />
                    Sign In
                  </MagneticButton>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <div className="flex md:hidden items-center">
                <motion.button
                  className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
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
