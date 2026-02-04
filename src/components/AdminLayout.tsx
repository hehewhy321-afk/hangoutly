import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Users, Shield, LogOut, Menu, X, ChevronRight, ChevronLeft,
    Home, LayoutDashboard, ShieldCheck, MapPin, AlertTriangle,
    Settings, BarChart3, Activity, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
};

export const AdminLayout = ({
    children,
    title,
    subtitle
}: AdminLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { profile, signOut } = useAuth();

    const isActive = (path: string) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const adminNavItems = [
        {
            path: '/admin',
            icon: Activity,
            label: 'Overview'
        },
        {
            path: '/admin/analytics',
            icon: BarChart3,
            label: 'Analytics'
        },
        {
            path: '/admin/users',
            icon: Users,
            label: 'User Management'
        },
        {
            path: '/admin/verifications',
            icon: ShieldCheck,
            label: 'Verifications'
        },
        {
            path: '/admin/cities',
            icon: MapPin,
            label: 'City Management'
        },
        {
            path: '/admin/reports',
            icon: AlertTriangle,
            label: 'Reports & Complaints'
        },
        {
            path: '/admin/settings',
            icon: Settings,
            label: 'Platform Settings'
        }
    ];

    const handleNavClick = (path: string) => {
        setSidebarOpen(false);
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex transition-all duration-300 font-sans selection:bg-slate-900/10">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 shadow-sm",
                    isCollapsed ? "w-24" : "w-80"
                )}
            >
                <div className={cn("h-24 flex items-center px-8", isCollapsed ? "justify-center" : "justify-between")}>
                    <Link to="/admin" className="flex items-center gap-3.5 group">
                        <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300 shrink-0">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">Hangoutly</span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Admin Portal</span>
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
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400/80">Management</p>
                        </div>
                    )}
                    {adminNavItems.map(item => {
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavClick(item.path)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.2rem] transition-all group relative overflow-hidden",
                                    active
                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02]",
                                    isCollapsed && "justify-center px-0 w-12 h-12 mx-auto"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon
                                    className={cn(
                                        "w-[1.2rem] h-[1.2rem] transition-all duration-300 shrink-0",
                                        active ? "text-white" : "text-slate-400 group-hover:text-slate-900",
                                        isCollapsed && "w-6 h-6"
                                    )}
                                    strokeWidth={2.5}
                                />
                                {!isCollapsed && <span className="text-[0.95rem] font-bold tracking-tight">{item.label}</span>}
                            </button>
                        )
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-100 space-y-3">
                    <Link to="/" className={cn("flex items-center gap-3 p-3.5 rounded-[1.2rem] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all group", isCollapsed && "justify-center")}>
                        <Home className="w-[1.2rem] h-[1.2rem] shrink-0" strokeWidth={2.5} />
                        {!isCollapsed && <span className="text-sm font-bold">Back to Site</span>}
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[0.85rem] font-bold text-rose-500 hover:bg-rose-50 transition-all",
                            isCollapsed && "justify-center bg-rose-50"
                        )}
                    >
                        <LogOut className="w-[1.2rem] h-[1.2rem] shrink-0" strokeWidth={2.5} />
                        {!isCollapsed && "Sign Out"}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-300",
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
                            <span className="lg:hidden text-lg font-black tracking-tight text-slate-900 leading-none mb-1">Hangoutly Admin</span>
                            {title && (
                                <h1 className="font-black text-slate-800 tracking-tight text-xl md:text-2xl lg:text-3xl">
                                    {title}
                                </h1>
                            )}
                            {subtitle && <p className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <p className="text-sm font-black text-slate-800 leading-tight">{profile?.first_name || 'Admin User'}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Master Admin</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-md ring-1 ring-slate-100">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                    <Shield className="w-6 h-6" />
                                </div>
                            )}
                        </div>
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
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl shadow-lg shadow-primary/25">
                                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                    </div>
                                    <span className="text-xl font-black tracking-tight text-slate-900">Admin Portal</span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-2">
                                {adminNavItems.map(item => (
                                    <button
                                        key={item.path}
                                        onClick={() => handleNavClick(item.path)}
                                        className={cn(
                                            "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[0.95rem] font-bold transition-all relative overflow-hidden",
                                            isActive(item.path)
                                                ? "bg-slate-900 text-white shadow-lg"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <item.icon className={cn("w-5 h-5", isActive(item.path) ? "text-white" : "text-slate-400")} strokeWidth={2.5} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-wider text-xs border-slate-200 bg-white text-slate-900 hover:bg-slate-50 shadow-sm"
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
