import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "wouter";
import { ArrowLeft, Mail, MessageSquare, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";

const contactInfo = [
    { icon: Mail, label: "Email", value: "alpha.kore25@gmail.com", href: "mailto:alpha.kore25@gmail.com" },
    { icon: MessageSquare, label: "Community", value: "Discord / Alpha-kore", href: "https://discord.gg/alpha-kore" },
    { icon: Globe, label: "Location", value: "Vadodara", href: "#" }
];

export default function Contact() {
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

            <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 space-y-12 sm:space-y-20">
                {/* Hero */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-5 sm:space-y-8"
                >
                    <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                        Transmission <span className="italic">Channel</span> <span className="w-8 sm:w-12 h-px bg-primary" />
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                        Contact <br /><span className="text-stroke text-primary">Mission Control</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                        Have questions about the <Logo className="inline-flex text-base sm:text-lg" dashClassName="w-2 h-[2px] mt-0.5" /> protocol or custom enterprise integrations? Deploy a message to our automated intelligence unit.
                    </p>
                </motion.section>

                {/* Contact Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16"
                >
                    {/* Contact Info */}
                    <div className="space-y-8 sm:space-y-10">
                        <div className="space-y-2">
                            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Direct Lines</h3>
                            <div className="w-12 h-0.5 bg-primary" />
                        </div>
                        {contactInfo.map((item, i) => (
                            <a key={i} href={item.href} className="flex items-center gap-4 sm:gap-6 group">
                                <div className="w-11 h-11 sm:w-12 sm:h-12 border border-foreground/10 flex items-center justify-center group-hover:border-primary transition-colors shrink-0">
                                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-40 mb-0.5">{item.label}</p>
                                    <p className="text-base sm:text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">{item.value}</p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <motion.form
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="p-6 sm:p-8 md:p-10 border-2 border-foreground bg-background space-y-5 sm:space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,102,0,0.2)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:dark:shadow-[12px_12px_0px_0px_rgba(255,102,0,0.2)]"
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest opacity-60">Identity // Name</label>
                            <Input className="rounded-none border-foreground/20 focus-visible:ring-primary focus-visible:border-primary h-11 sm:h-12" placeholder="Commander" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest opacity-60">Frequency // Email</label>
                            <Input type="email" className="rounded-none border-foreground/20 focus-visible:ring-primary focus-visible:border-primary h-11 sm:h-12" placeholder="ops@recon.io" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest opacity-60">Transmission // Message</label>
                            <Textarea className="rounded-none border-foreground/20 focus-visible:ring-primary focus-visible:border-primary min-h-[120px] sm:min-h-[150px]" placeholder="Brief mission details..." />
                        </div>
                        <Button type="submit" className="w-full h-12 sm:h-14 rounded-none bg-foreground text-background hover:bg-primary font-black uppercase text-xs tracking-[0.3em] transition-all shadow-[4px_4px_0px_0px_rgba(255,102,0,0.4)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5">
                            Initialize Upload —
                        </Button>
                    </motion.form>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
