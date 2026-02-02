import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar, Heart, Settings, Shield, LogOut, Menu, X, Search, ChevronRight, Home, LayoutDashboard, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  enter: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -10
  }
};

export const DashboardLayout = ({
  children,
  title,
  subtitle
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    profile,
    isAdmin,
    signOut
  } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    {
      path: '/discover',
      icon: Compass,
      label: 'Discover'
    },
    {
      path: '/bookings',
      icon: Calendar,
      label: 'My Bookings'
    },
    ...(profile?.is_companion ? [{
      path: '/companion-dashboard',
      icon: LayoutDashboard,
      label: 'Companion Dashboard'
    }] : []),
    {
      path: '/profile',
      icon: User,
      label: 'My Profile'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings'
    },
    ...(isAdmin ? [{
      path: '/admin',
      icon: Shield,
      label: 'Admin Panel'
    }] : [])
  ];

  const handleNavClick = (path: string) => {
    setSidebarOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gradient-primary">Hangoutly</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Main Menu</p>
          </div>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-semibold transition-all group",
                isActive(item.path)
                  ? "bg-primary text-white shadow-deep"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", isActive(item.path) ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
              {item.label}
              {isActive(item.path) && (
                <motion.div layoutId="nav-indicator" className="w-1.5 h-6 bg-white/40 rounded-full ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
            <div className="w-11 h-11 rounded-full bg-white border border-slate-200 p-0.5 overflow-hidden shadow-soft">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {profile?.first_name || 'Member'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                {profile?.is_companion ? 'Verified Companion' : 'Premium Member'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-slate-200/50 h-20 flex items-center px-4 lg:px-10 justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            {title && (
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <div className="flex items-center gap-2 mr-2 border-r border-slate-200 pr-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="rounded-xl font-bold text-muted-foreground">
                  <Home className="w-4 h-4 mr-2" />
                  Website
                </Button>
              </Link>
            </div>

            <NotificationsDropdown />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <motion.main
          key={location.pathname}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1 p-6 lg:p-10"
        >
          {children}
        </motion.main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden bg-white flex flex-col shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-primary" fill="currentColor" />
                  <span className="text-xl font-bold tracking-tight text-gradient-primary">Hangoutly</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {navItems.map(item => (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-semibold transition-all",
                      isActive(item.path)
                        ? "bg-primary text-white shadow-deep"
                        : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="p-6 border-t border-slate-100">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold border-slate-200"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};