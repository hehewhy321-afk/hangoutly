import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="liquid-glass text-center p-12 max-w-lg w-full relative z-10"
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-6 shadow-inner">
          <Ghost className="w-12 h-12 text-slate-400" />
        </div>

        <h1 className="text-6xl font-black text-slate-800 mb-2 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Page not found</h2>

        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          Oops! It seems you've ventured into the unknown. The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto h-12 px-6 bg-gradient-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform rounded-xl font-bold">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto h-12 px-6 rounded-xl font-semibold border-slate-200 hover:bg-white hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
