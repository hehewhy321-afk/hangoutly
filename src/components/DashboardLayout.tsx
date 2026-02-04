import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar, Heart, Settings, Shield, LogOut, Menu, X, Search, ChevronRight, ChevronLeft, Home, LayoutDashboard, Compass } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
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
    <div className="min-h-screen bg-[#F8FAFC] flex transition-all duration-300 font-sans selection:bg-primary/20">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 shadow-sm",
          isCollapsed ? "w-24" : "w-80"
        )}
      >
        <div className={cn("h-24 flex items-center px-8", isCollapsed ? "justify-center" : "justify-between")}>
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300 shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">Hangoutly</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Connect</span>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="mx-auto mb-6 w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar py-6">
          {!isCollapsed && (
            <div className="px-5 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400/80">Menu</p>
            </div>
          )}
          {navItems.map(item => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.2rem] transition-all group relative overflow-hidden",
                  active
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]"
                    : "text-slate-500 hover:bg-white hover:shadow-md hover:text-slate-900 hover:scale-[1.02]",
                  isCollapsed && "justify-center px-0 w-12 h-12 mx-auto"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20" />
                )}
                <item.icon
                  className={cn(
                    "w-[1.35rem] h-[1.35rem] transition-all duration-300 shrink-0",
                    active ? "text-white" : "text-slate-400 group-hover:text-primary",
                    isCollapsed && "w-6 h-6"
                  )}
                  strokeWidth={2.5}
                />
                {!isCollapsed && <span className="text-[0.95rem] font-bold tracking-tight">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="p-5 border-t border-slate-100/80 space-y-3 bg-white/50 backdrop-blur-sm">
          <div className={cn("flex items-center gap-3 p-3.5 rounded-[1.2rem] bg-white border border-slate-100 shadow-sm transition-all group hover:border-primary/20", isCollapsed && "justify-center p-0 border-0 bg-transparent shadow-none")}>
            <div className="w-11 h-11 rounded-full bg-slate-100 p-0.5 overflow-hidden shadow-sm shrink-0 ring-2 ring-white group-hover:ring-primary/20 transition-all">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[0.9rem] font-black text-slate-800 truncate leading-tight">
                  {profile?.first_name || 'Member'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", profile?.is_companion ? "bg-emerald-500" : "bg-amber-500")} />
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {profile?.is_companion ? 'Companion' : 'Member'}
                  </p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[0.85rem] font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all",
              isCollapsed && "justify-center px-0 w-12 h-12 mx-auto text-rose-500 bg-rose-50"
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-[1.2rem] h-[1.2rem] shrink-0" strokeWidth={2.5} />
            {!isCollapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
          isCollapsed ? "lg:ml-24" : "lg:ml-80"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-20 md:h-24 flex items-center px-5 lg:px-10 justify-between transition-all">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-12 h-12 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center shadow-sm text-slate-500 active:scale-95 transition-all"
            >
              <Menu className="w-6 h-6" strokeWidth={2.5} />
            </button>

            <div className="flex flex-col">
              {/* Mobile Logo Text */}
              <span className="lg:hidden text-lg font-black tracking-tight text-slate-900 leading-none mb-1">Hangoutly</span>
              {title && (
                <h1 className={cn("font-black text-slate-800 tracking-tight transition-all",
                  "text-xl md:text-2xl lg:text-3xl"
                )}>
                  {title}
                </h1>
              )}
              {subtitle && <p className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-2 mr-2 border-r border-slate-200/60 pr-6">
              <Link to="/">
                <Button variant="ghost" size="sm" className="rounded-xl font-bold text-slate-500 hover:text-primary hover:bg-primary/5">
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
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 p-5 md:p-8 lg:p-12 overflow-x-hidden"
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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[4px] z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[85%] sm:w-[22rem] z-50 lg:hidden bg-white shadow-2xl flex flex-col"
            >
              <div className="h-24 flex items-center justify-between px-8 border-b border-slate-100">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/30">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xl font-black tracking-tight text-slate-900">Hangoutly</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-6 space-y-2">
                <div className="px-2 mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Navigation</p>
                </div>
                {navItems.map(item => (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[0.95rem] font-bold transition-all relative overflow-hidden",
                      isActive(item.path)
                        ? "bg-gradient-to-r from-primary to-violet-600 text-white shadow-lg shadow-primary/25"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive(item.path) ? "text-white" : "text-slate-400")} strokeWidth={2.5} />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="mb-4 flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User className="p-2 w-full h-full text-slate-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{profile?.first_name || 'User'}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Logged In</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-wider text-xs border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
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