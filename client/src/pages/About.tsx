import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "wouter";
import { ArrowLeft, Brain, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const features = [
    { icon: Brain, title: "Triadic Logic", desc: "Three distinct agentic units — Analyst, Critic, and Synthesizer — working in concert to extract objective insight." },
    { icon: Shield, title: "Objective Truth", desc: "Filtering noise and bias through rigorous internal cross-examination across 15 structured debate rounds." },
    { icon: Zap, title: "Neural Speed", desc: "High-performance synthesis powered by Alpha-kore's automated unit, running on bleeding-edge AI providers." }
];

export default function About() {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground relative">
            {/* Sticky Header */}
            <header className="border-b border-foreground/10 bg-background sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/">
                            <Button variant="outline" size="icon" className="w-9 h-9 sm:w-10 sm:h-10 rounded-none border-foreground/20 hover:border-foreground transition-all group">
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Logo className="text-xl sm:text-2xl" />
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Background grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
                <div className="absolute inset-y-0 left-1/4 w-px bg-foreground hidden sm:block" />
                <div className="absolute inset-y-0 left-2/4 w-px bg-foreground" />
                <div className="absolute inset-y-0 left-3/4 w-px bg-foreground hidden sm:block" />
            </div>

            <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 space-y-16 sm:space-y-24">
                {/* Hero */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6 sm:space-y-8"
                >
                    <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                        Origin <span className="italic">Story</span> <span className="w-8 sm:w-12 h-px bg-primary" />
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                        The Debating <br /><span className="text-stroke text-primary">Platform</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                        <Logo className="inline-flex text-base sm:text-lg md:text-xl" dashClassName="w-2 h-[2px] mt-0.5" /> is a next-generation intelligence synthesis engine built on the principles of triadic conflict. We believe objective truth isn't found in a single model, but in the tension between competing perspectives.
                    </p>
                </motion.section>

                {/* Feature Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
                >
                    {features.map((feature, i) => (
                        <div key={i} className="p-6 sm:p-8 border-2 border-foreground/10 hover:border-primary/50 transition-all duration-300 group">
                            <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary mb-5 sm:mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-3 sm:mb-4">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Alpha-kore CTA */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="p-8 sm:p-12 border-2 border-foreground bg-foreground text-background relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 pointer-events-none">
                        <Logo className="text-7xl sm:text-9xl" dashClassName="w-8 sm:w-12 h-2 sm:h-3 mt-4 sm:mt-6" />
                    </div>
                    <div className="relative z-10 space-y-4 sm:space-y-6">
                        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic text-primary">Built by Alpha-kore</h3>
                        <p className="text-base sm:text-lg font-medium opacity-80 max-w-xl leading-relaxed">
                            Alpha-kore is an Automated Intelligence Unit dedicated to pushing the boundaries of generative UI and agentic workflows. <Logo className="text-base inline-flex" dashClassName="w-2 h-[2px] mt-0.5" /> is our core infrastructure for truth distillation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                            <Link href="/documentation">
                                <Button className="w-full sm:w-auto rounded-none h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/80 font-black uppercase text-xs tracking-widest transition-all">
                                    Read the Docs —
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" className="w-full sm:w-auto rounded-none h-12 px-8 border-background text-background hover:bg-background hover:text-foreground font-black uppercase text-xs tracking-widest transition-all">
                                    Get in Touch
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.section>
            </main>

            <Footer />
        </div>
    );
}
