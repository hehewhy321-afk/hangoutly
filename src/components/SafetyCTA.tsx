import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Lock, MapPin, Headset, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MagneticButton } from '@/components/MagneticButton';

const features = [
    { icon: CheckCircle2, label: 'BIO-VERIFICATION' },
    { icon: Lock, label: 'ENCRYPTED LINKS' },
    { icon: MapPin, label: 'PUBLIC MEET POINTS' },
    { icon: Headset, label: 'REAL-TIME SUPPORT' },
];

export const SafetyCTA = () => {
    return (
        <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-[#0A0C14]">
            {/* Background elements to match the "grid/technical" feel */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="bg-[#111420] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">

                        {/* Left Content */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5"
                            >
                                <Shield className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                                    Your Safety First
                                </span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-6xl font-black text-white leading-tight"
                            >
                                Your Integrity is <br />
                                <span className="text-gradient-primary">Our Currency.</span>
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl"
                            >
                                We maintain strict safety standards. Every companion on our platform is
                                thoroughly verified, identity-checked, and monitored by our safety team.
                                You're entering a trusted community.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="grid sm:grid-cols-2 gap-4"
                            >
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <feature.icon className="w-3.5 h-3.5 text-emerald-500" />
                                        </div>
                                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                                            {feature.label}
                                        </span>
                                    </div>
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="pt-4"
                            >
                                <MagneticButton variant="primary" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-sm shadow-glow-primary">
                                    Start Safe Experience
                                    <ArrowRight className="w-5 h-5" />
                                </MagneticButton>
                            </motion.div>
                        </div>

                        {/* Right Graphic */}
                        <div className="relative flex justify-center items-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative w-64 h-64 md:w-96 md:h-96 shrink-0"
                            >
                                {/* Rotating ring */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-white/5"
                                />

                                {/* Outer Glow Ring */}
                                <div className="absolute inset-4 rounded-full border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]" />

                                {/* Central Circle */}
                                <div className="absolute inset-12 rounded-full bg-indigo-600 flex flex-col items-center justify-center text-center p-6 shadow-[0_0_80px_rgba(79,70,229,0.3)]">
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-2 leading-none">
                                        Safety Priority
                                    </span>
                                    <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-tight">
                                        Protocol
                                    </span>

                                    {/* Decorative dot */}
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)]">
                                        <div className="absolute inset-0.5 rounded-full bg-black/40" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};
