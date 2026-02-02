import { motion } from 'framer-motion';
import { FileText, Shield, AlertTriangle, Scale, UserX, CreditCard, Heart, ArrowLeft, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';

const TermsPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: UserX,
      title: 'Eligibility & Registration',
      content: 'You must be at least 18 years old to use our services. By registering, you warrant that you have the right, authority, and capacity to enter into this Agreement and to abide by all of the terms and conditions.'
    },
    {
      icon: Heart,
      title: 'Platonic Service Nature',
      content: 'Hangoutly is strictly a platonic companionship platform. Any form of solicitation, romantic advances, or inappropriate behavior is strictly prohibited and will result in immediate account termination.'
    },
    {
      icon: Shield,
      title: 'User Conduct',
      content: 'Users are expected to behave professionally and respectfully. Harassment, hate speech, violence, and fraudulent activities are not tolerated. We reserve the right to investigate and take appropriate legal action against anyone who violates this provision.'
    },
    {
      icon: CreditCard,
      title: 'Payments & Refunds',
      content: 'All payments are processed securely. Cancellations made within 24 hours of a booking may be eligible for a refund, subject to our cancellation policy. Companions set their own rates, which are clearly displayed on their profiles.'
    },
    {
      icon: AlertTriangle,
      title: 'Liability Disclaimer',
      content: 'While we verify identities, we are not responsible for the conduct of any user on or off the platform. Users interact with each other at their own risk. We recommend meeting in public places and informing a friend or family member of your plans.'
    },
    {
      icon: Scale,
      title: 'Dispute Resolution',
      content: 'Any disputes arising out of or relating to these Terms or the Service will be resolved through binding arbitration in accordance with the rules of the Arbitration Council.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 hover:bg-secondary/50 hover:text-primary transition-all rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass p-8 md:p-16 relative overflow-hidden"
          >
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -ml-32 -mt-32 pointer-events-none" />

            <div className="text-center mb-16 relative z-10 block">
              <div className="w-24 h-24 bg-secondary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-border">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-6">
                Terms of <span className="text-gradient-primary">Service</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                Our commitment to a safe, transparent, and professional environment. Please read these terms carefully before using our platform.
              </p>
            </div>

            {/* Critical Alert */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-8 mb-16 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-600 mb-2">Strictly Platonic Platform</h3>
                  <p className="text-amber-700 leading-relaxed font-medium text-sm">
                    Hangoutly excludes any form of romantic or sexual propositioning. Our community is built on genuine, friendly connections. Violating this core principle results in immediate permanent suspension.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 relative z-10">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/40 p-8 rounded-[2rem] border border-border hover:border-primary/20 transition-all group hover:shadow-lg hover:bg-card/60"
                >
                  <div className="w-14 h-14 bg-secondary rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ease-out border border-border">
                    <section.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">{section.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">Need clarification?</h3>
                  <p className="text-slate-400 font-medium">Our legal team is available to answer your questions.</p>
                </div>
                <Button
                  onClick={() => navigate('/contact')}
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-2xl h-14 px-8 shadow-glow-white hover:scale-105 transition-all w-full md:w-auto"
                >
                  <Mail className="w-4 h-4" />
                  Contact Legal Support
                </Button>
              </div>

              {/* Dark Card Decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
            </div>

            <div className="mt-16 flex items-center justify-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
              <span>Effective Date</span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>January 1, 2024</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
