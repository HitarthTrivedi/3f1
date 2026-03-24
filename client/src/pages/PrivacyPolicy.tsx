import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "wouter";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground relative">
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

            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
                <div className="absolute inset-y-0 left-1/4 w-px bg-foreground hidden sm:block" />
                <div className="absolute inset-y-0 left-2/4 w-px bg-foreground" />
                <div className="absolute inset-y-0 left-3/4 w-px bg-foreground hidden sm:block" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 space-y-12">
                <section className="space-y-6">
                    <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                        Data <span className="italic">Protocol</span> <span className="w-12 h-px bg-primary" />
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.85]">
                        Privacy <br /><span className="text-stroke text-primary">Policy</span>
                    </h2>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-40">Last Updated: March 2024</p>
                </section>

                <div className="prose prose-invert max-w-none space-y-8 font-medium text-muted-foreground leading-relaxed">
                    <section className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">1. Data Collection</h3>
                        <p>We collect minimal data required for authentication and session persistence. This includes your email address, display name, and credit balance. We do not sell or share your personal data with third parties.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">2. Usage Data</h3>
                        <p>We log debate topics and interactions to improve our neural synthesis engine. This data is handled with strict confidentiality and is used primarily for technical refinement.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">3. Security</h3>
                        <p>We employ enterprise-grade security protocols via Firebase and industry-standard encryption to protect your data. However, no transmission over the internet is 100% secure.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">4. Cookies</h3>
                        <p>We use essential cookies for session management and authentication. By using the platform, you consent to the use of these necessary technologies.</p>
                    </section>

                    <section className="space-y-4 pt-8 border-t border-foreground/10">
                        <p className="text-xs italic opacity-60">For data-related inquiries, please reach out via the automated contact channel.</p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
