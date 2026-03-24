import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "wouter";
import { ArrowLeft, Check, Sparkles, CreditCard, Zap, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const packages = [
    {
        amount: 25, credits: 25, popular: false,
        desc: "Standard entry for neural synthesis.",
        tag: "ENTRY UNIT"
    },
    {
        amount: 35, credits: 50, popular: true,
        desc: "Premium processing for extended operations.",
        tag: "OPTIMAL UNIT"
    }
];

const features = [
    `Full Triadic Debate (15 rounds)`,
    `High-Fidelity Audio via Speechify`,
    `Instant Delivery to Wallet`,
    `Global Infrastructure Access`,
    `No Expiration Date`
];

const costs = [
    { icon: Zap, label: "Debate Synthesis", cost: "10 units", note: "Deducted post-debate" },
    { icon: Mic, label: "Audio Generation", cost: "5 units", note: "Instant deduction" },
    { icon: CreditCard, label: "Entry Package", cost: "₹25", note: "25 credits" },
    { icon: Sparkles, label: "Premium Package", cost: "₹35", note: "50 credits" },
];

export default function PricingPage() {
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

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 space-y-16 sm:space-y-24 md:space-y-32">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl space-y-5 sm:space-y-8"
                >
                    <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                        Wallet <span className="italic">Economy</span> <span className="w-8 sm:w-12 h-px bg-primary" />
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                        Credit <br /><span className="text-stroke text-primary">Packages</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                        Secure neural processing units for high-performance agentic reasoning. Deploy your credits to unlock the <Logo className="inline-flex text-base sm:text-lg" dashClassName="w-2 h-[2px] mt-0.5" /> protocol.
                    </p>
                </motion.div>

                {/* Package Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl"
                >
                    {packages.map((pkg, i) => (
                        <div
                            key={i}
                            className={`rounded-none border-2 border-foreground relative transition-all group overflow-hidden ${
                                pkg.popular
                                    ? "shadow-[8px_8px_0px_0px_rgba(255,102,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(255,102,0,1)] -translate-x-0.5 -translate-y-0.5"
                                    : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                            }`}
                        >
                            {pkg.popular && (
                                <div className="bg-primary text-primary-foreground text-[10px] font-black tracking-[0.3em] px-4 py-2 uppercase text-center flex items-center justify-center gap-2 border-b-2 border-foreground">
                                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Most Popular Choice
                                </div>
                            )}

                            <div className="p-6 sm:p-8 md:p-10 border-b border-foreground/10">
                                <div className="text-[9px] uppercase font-black tracking-[0.4em] opacity-30 mb-3">{pkg.tag}</div>
                                <div className="flex items-end justify-between gap-2">
                                    <span className="text-4xl sm:text-5xl font-black tracking-tighter">₹{pkg.amount}</span>
                                    <span className="text-[10px] font-black opacity-30 tracking-widest uppercase mb-1">INR / ONE-TIME</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-black uppercase tracking-tighter mt-2">{pkg.credits} Credits</p>
                                <p className="text-sm text-muted-foreground font-medium mt-3 italic opacity-70">"{pkg.desc}"</p>
                            </div>

                            <div className="p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
                                <ul className="space-y-3 sm:space-y-4">
                                    {[
                                        `~${Math.floor(pkg.credits / 10)} Full Neural Debates`,
                                        `~${Math.floor(pkg.credits / 5)} Audio Generations`,
                                        ...features.slice(2)
                                    ].map((feature, j) => (
                                        <li key={j} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-60">
                                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/debate">
                                    <Button className="w-full h-12 sm:h-14 rounded-none bg-foreground text-background hover:bg-primary transition-all font-black uppercase text-xs tracking-[0.4em] border-2 border-foreground">
                                        Deploy Units —
                                    </Button>
                                </Link>
                                <div className="text-[9px] font-black opacity-20 text-center tracking-[0.5em] uppercase">SECURE // RAZORPAY // 3F1.OS</div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Cost Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="space-y-8 sm:space-y-12"
                >
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic whitespace-nowrap">Operational Costs</h3>
                        <div className="h-px flex-1 bg-foreground/10" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {costs.map((item, i) => (
                            <div key={i} className="p-5 sm:p-6 border border-foreground/10 bg-foreground/[0.02] space-y-3 hover:border-primary/30 transition-colors">
                                <item.icon className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{item.label}</p>
                                    <p className="text-xl sm:text-2xl font-black tracking-tighter">{item.cost}</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1 italic">{item.note}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
