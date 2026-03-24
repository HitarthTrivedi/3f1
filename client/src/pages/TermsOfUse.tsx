import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export default function TermsOfUse() {
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
                        Legal <span className="italic">Framework</span> <span className="w-12 h-px bg-primary" />
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.85]">
                        Terms <br /><span className="text-stroke text-primary">of Use</span>
                    </h2>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-40">Last Updated: March 2024</p>
                </section>

                <div className="prose prose-invert max-w-none space-y-8 font-medium text-muted-foreground leading-relaxed">
                    <section className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">1. Acceptance of Terms</h3>
                        <p>By accessing or using the 3F1 platform, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">2. Use License</h3>
                        <p>Permission is granted to temporarily use the 3F1 platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose, or for any public display;</li>
                            <li>Attempt to decompile or reverse engineer any software contained on the platform;</li>
                            <li>Remove any copyright or other proprietary notations from the materials.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">3. Disclaimer</h3>
                        <p>The materials on the 3F1 platform are provided on an 'as is' basis. 3F1 makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">4. Credit System</h3>
                        <p>The 3F1 platform operates on a credit-based system. Credits are non-refundable and have no cash value. We reserve the right to modify credit costs and package pricing at any time without prior notice.</p>
                    </section>

                    <section className="space-y-4 pt-8 border-t border-foreground/10">
                        <p className="text-xs italic opacity-60">Should you have any questions regarding these terms, please contact Mission Control via the contact channel.</p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
