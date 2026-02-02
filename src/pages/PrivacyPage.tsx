import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Database, Server, UserCheck, ArrowLeft, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';

const PrivacyPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: 'Information Collection',
      content: 'We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, phone number, and verification documents.'
    },
    {
      icon: Eye,
      title: 'How We Use Data',
      content: 'We use the information we collect to provide, maintain, and improve our services, including to process transactions, verify identities to ensure safety, and communicate with you about updates and security alerts.'
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your personal information. Your data is encrypted in transit and at rest using advanced cryptographic protocols.'
    },
    {
      icon: UserCheck,
      title: 'User Rights',
      content: 'You have the right to access, correct, or delete your personal information. You can manage your privacy settings directly from your account dashboard or contact our support team for assistance.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
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
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />

            <div className="text-center mb-16 relative z-10 block">
              <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-primary/10">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-6">
                Privacy <span className="text-gradient-primary">Protocol</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                Your privacy isn't just a policy—it's the core architecture of our platform. We are committed to transparency and advanced data protection.
              </p>
            </div>

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
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">Have questions about privacy?</h3>
                  <p className="text-slate-400 font-medium">Our Data Protection Officer is ready to assist you.</p>
                </div>
                <Button
                  onClick={() => navigate('/contact')}
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-2xl h-14 px-8 shadow-glow-white hover:scale-105 transition-all w-full md:w-auto"
                >
                  <Mail className="w-4 h-4" />
                  Contact Privacy Team
                </Button>
              </div>

              {/* Dark Card Decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
            </div>

            <div className="mt-16 flex items-center justify-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
              <span>Last Protocol Update</span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>March 15, 2024</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
