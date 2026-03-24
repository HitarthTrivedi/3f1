import { useState } from "react";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "wouter";
import { ArrowLeft, Zap, Info, CreditCard, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

// ── Data ────────────────────────────────────────────────────────────────────

const factions = [
    {
        unit: "UNIT_01", name: "ANALYST", sub: "DATA EXTRACTION & LOGICAL STRUCTURING",
        desc: "The first agent to engage. Breaks down the input topic into structured data points, logical components, and factual chains. Establishes the informational foundation for the debate cycle.",
    },
    {
        unit: "UNIT_02", name: "CRITIC", sub: "ANOMALY DETECTION & CROSS-VERIFICATION",
        desc: "Challenges the Analyst's output. Identifies logical gaps, contradictions, unsupported claims, and cognitive biases. Forces the system to confront weaknesses before synthesis proceeds.",
    },
    {
        unit: "UNIT_03", name: "SYNTHESIZER", sub: "UI STATE GENERATION & OPTIMIZATION",
        desc: "Resolves the dialectic tension between Analyst and Critic. Integrates validated data and confirmed facts into a single, optimised output state presented to the user.",
    },
];

const features = [
    { num: "F_01", title: "Three-Agent Dialectic Protocol", desc: "Three specialised AI agents engage in a structured debate cycle — extract, challenge, synthesise — ensuring multi-perspective coverage of every topic without human bias." },
    { num: "F_02", title: "Trigger Debate Interface", desc: "Users submit any topic to instantly trigger a live debate cycle. The UI shows real-time faction activity via an interactive orbital 3D visualisation." },
    { num: "F_03", title: "Structured Synthesis Output", desc: "The Synthesizer produces a clean, objective, structured summary — eliminating noise, contradiction, and bias from the debate exchange." },
    { num: "F_04", title: "Faction Orbital Visualisation", desc: "An interactive 3D orbital scene displays the three faction agents (A, S, C) in motion around a central table — making the dialectic process visually tangible in real time." },
    { num: "F_05", title: "Light / Dark Mode", desc: "Full theme toggle support between a pure black dark mode and a high-contrast white light mode — matching the site's stark typographic aesthetic." },
    { num: "F_06", title: "Authentication & Session Management", desc: "Login system for authenticated access. Users can save debate histories and revisit past synthesis outputs from their session dashboard." },
];

const techStack = [
    { layer: "FRONTEND", tech: "React / Vite", note: "SPA with client-side routing via Wouter" },
    { layer: "STYLING", tech: "Tailwind CSS", note: "Monospaced, high-contrast design system" },
    { layer: "3D SCENE", tech: "Three.js / WebGL", note: "Faction orbital interactive visualisation" },
    { layer: "AI AGENTS", tech: "OpenAI / Gemini / Grok", note: "Three-faction agent pipeline orchestration" },
    { layer: "BACKEND", tech: "Node.js / Express", note: "API layer for debate orchestration" },
    { layer: "AUTH", tech: "Firebase Auth", note: "Session and login management" },
    { layer: "DATABASE", tech: "Firestore / Postgres", note: "Debate history and user data storage" },
    { layer: "PAYMENTS", tech: "Razorpay", note: "Credit purchase and webhook sync" },
    { layer: "HOSTING", tech: "Vercel", note: "Deployed at 3f1.in (.in TLD, India)" },
];



const faqs = [
    { q: "What is the three-agent dialectic protocol?", a: "A structured three-step AI reasoning cycle: the Analyst extracts and structures data, the Critic challenges for flaws and bias, and the Synthesizer produces an integrated objective output. Designed to eliminate single-perspective bias." },
    { q: "What topics can I debate?", a: "Any topic — political, scientific, philosophical, technical, or factual. The three agents are domain-agnostic and adapt their analysis to the subject matter provided." },
    { q: "Do I need an account to use 3F1?", a: "Anonymous users get 1 free debate. A full account is required to save debate history, access past syntheses, and purchase credits for continued use." },
    { q: "How long does a debate cycle take?", a: "Typically 30–90 seconds depending on topic complexity, agent model settings, and server load. The orbital visualisation shows live faction activity during the cycle." },
    { q: "What is BYOK?", a: "Bring Your Own Key — you can supply your own API keys for OpenAI, Anthropic, or other providers. Your key is used directly and never stored server-side." },
    { q: "Is 3F1 open source?", a: "The codebase is proprietary. Check the official GitHub or contact the team at 3f1.in for licensing and open-source availability." },
];

const fees = [
    { icon: Zap, op: "Debate Synthesis", cost: "10 units", timing: "Finality Post-Debate" },
    { icon: Mic, op: "Audio Generation", cost: "5 units", timing: "Instant Deduction" },
    { icon: Info, op: "Session Restore", cost: "0 units", timing: "State Reloaded" },
    { icon: CreditCard, op: "Entry Level PKG", cost: "₹25.00", timing: "Razorpay Sync" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ label, title, outline }: { label: string; title: string; outline?: string }) {
    return (
        <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                {label} <span className="w-12 h-px bg-primary" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-[0.9]">
                {title}{outline && <> <span className="text-stroke text-primary">{outline}</span></>}
            </h3>
        </div>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`border border-foreground/10 p-5 sm:p-6 space-y-3 transition-colors ${open ? "bg-foreground/[0.02]" : ""}`}>
            <button
                className="w-full flex justify-between items-start gap-4 text-left"
                onClick={() => setOpen(o => !o)}
            >
                <span className="text-sm font-black uppercase tracking-tight text-foreground">{q}</span>
                <span
                    className="text-primary font-black text-lg shrink-0 mt-0.5 transition-transform duration-200"
                    style={{ transform: open ? "rotate(90deg)" : "none" }}
                >
                    →
                </span>
            </button>
            {open && (
                <p className="text-sm text-muted-foreground leading-relaxed border-t border-foreground/10 pt-3">
                    {a}
                </p>
            )}
        </div>
    );
}



// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentationPage() {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground relative">

            {/* Header — identical to other footer pages */}
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

            {/* Background grid lines — identical to other footer pages */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
                <div className="absolute inset-y-0 left-1/4 w-px bg-foreground hidden sm:block" />
                <div className="absolute inset-y-0 left-2/4 w-px bg-foreground" />
                <div className="absolute inset-y-0 left-3/4 w-px bg-foreground hidden sm:block" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 space-y-16 sm:space-y-24">

                {/* ── Hero ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                        Technical <span className="italic">Manual</span> <span className="w-12 h-px bg-primary" />
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.85]">
                        3F1 <br /><span className="text-stroke text-primary">Protocol</span>
                    </h2>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-40">
                        v1.0 — Three Faction Intelligence
                    </p>
                    <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-2xl">
                        A comprehensive guide to the 3F1 platform's architecture, three-agent dialectic orchestration, and real-time synthesis engine.
                    </p>
                </motion.section>

                {/* ── How it Works ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    className="space-y-8"
                >
                    <SectionHeading label="Section 01" title="How It Works" />
                    <div className="prose prose-invert max-w-none space-y-4 font-medium text-muted-foreground leading-relaxed">
                        <p>
                            3F1 orchestrates <strong className="text-foreground">structured tension between three distinct intelligence factions</strong> to distill objective truth from any topic.
                            A user submits a topic — triggering a debate — and the three agents engage in a dialectic exchange.
                        </p>
                        <p>
                            The <strong className="text-foreground">Analyst</strong> ingests the topic and structures raw data logically.
                            The <strong className="text-foreground">Critic</strong> cross-examines for anomalies and logical weaknesses.
                            The <strong className="text-foreground">Synthesizer</strong> integrates both and generates a final, objective output state.
                        </p>
                        <p>
                            This three-step protocol prevents single-perspective bias — all outputs are stress-tested before synthesis.
                        </p>
                    </div>
                </motion.section>

                {/* ── The Three Factions ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="space-y-8"
                >
                    <SectionHeading label="Section 02" title="The Three Agents" />
                    <div className="space-y-6">
                        {factions.map((f, i) => (
                            <div key={i} className="flex flex-row gap-5 sm:gap-8 items-start">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 border-2 border-primary flex items-center justify-center font-logo font-black text-xl sm:text-2xl">
                                    {i + 1}
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{f.unit}</p>
                                    <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground">{f.name}</h4>
                                    <p className="text-[9.5px] font-black uppercase tracking-[0.15em] opacity-30">{f.sub}</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── Features ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="space-y-8"
                >
                    <SectionHeading label="Section 03" title="Platform Features" />
                    <div className="space-y-4">
                        {features.map((f, i) => (
                            <div key={i} className="flex gap-5 border border-foreground/10 p-5 sm:p-6 hover:bg-foreground/[0.02] transition-colors">
                                <span className="font-black text-[9px] uppercase tracking-widest text-primary shrink-0 mt-0.5 w-10">{f.num}</span>
                                <div className="space-y-1">
                                    <p className="text-sm font-black uppercase tracking-tight text-foreground">{f.title}</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* ── Tech Stack ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-8"
                >
                    <SectionHeading label="Section 04" title="Tech Stack" />
                    <div className="border-2 border-foreground bg-background overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-foreground bg-foreground/5">
                                    <th className="p-4 sm:p-5 text-[10px] uppercase font-black tracking-widest opacity-40">Layer</th>
                                    <th className="p-4 sm:p-5 text-[10px] uppercase font-black tracking-widest opacity-40">Technology</th>
                                    <th className="p-4 sm:p-5 text-[10px] uppercase font-black tracking-widest opacity-40 hidden sm:table-cell">Purpose</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/10">
                                {techStack.map((row, i) => (
                                    <tr key={i} className="hover:bg-foreground/[0.02] transition-colors">
                                        <td className="p-4 sm:p-5">
                                            <span className="font-black text-[9px] uppercase tracking-widest text-primary">{row.layer}</span>
                                        </td>
                                        <td className="p-4 sm:p-5 font-bold text-sm text-foreground">{row.tech}</td>
                                        <td className="p-4 sm:p-5 text-sm text-muted-foreground italic hidden sm:table-cell">{row.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>



                {/* ── Fees & Economy ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="space-y-8"
                >
                    <SectionHeading label="Section 05" title="Fees & Economy" />
                    <div className="border-2 border-foreground bg-background overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-foreground bg-foreground/5">
                                    <th className="p-4 sm:p-5 text-[10px] uppercase font-black tracking-widest opacity-40">Operation</th>
                                    <th className="p-4 sm:p-5 text-[10px] uppercase font-black tracking-widest opacity-40">Cost</th>
                                    <th className="p-4 sm:p-5 text-[10px] uppercase font-black tracking-widest opacity-40 hidden sm:table-cell">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/10 text-sm font-bold uppercase tracking-widest">
                                {fees.map((row, i) => (
                                    <tr key={i} className="hover:bg-foreground/[0.02] transition-colors">
                                        <td className="p-4 sm:p-5 flex items-center gap-3">
                                            <row.icon size={14} className="text-primary shrink-0" />
                                            {row.op}
                                        </td>
                                        <td className="p-4 sm:p-5">{row.cost}</td>
                                        <td className="p-4 sm:p-5 opacity-40 italic hidden sm:table-cell">{row.timing}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>

                {/* ── FAQ ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                    className="space-y-8"
                >
                    <SectionHeading label="Section 06" title="Frequently Asked" />
                    <div className="space-y-3">
                        {faqs.map((f) => (
                            <FaqItem key={f.q} q={f.q} a={f.a} />
                        ))}
                    </div>
                </motion.section>

                {/* ── License ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="space-y-8"
                >
                    <SectionHeading label="Section 07" title="License & Credits" />
                    <div className="border border-foreground/10 p-6 sm:p-8 space-y-4">
                        <p className="text-xl font-black uppercase tracking-tight text-foreground">3F1 .OS DEBATE</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            3F1 and the Three Faction Intelligence protocol are products of their respective creators.
                            All rights reserved. Refer to the official repository for licensing terms and contributor guidelines.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-foreground/10">
                            <span className="font-black text-[9px] uppercase tracking-widest text-primary border border-primary/30 px-2.5 py-1">ALL RIGHTS RESERVED</span>
                            <span className="font-black text-[10px] uppercase tracking-widest opacity-30">© 2026 — 3F1</span>
                            <a href="https://www.3f1.in" target="_blank" rel="noreferrer" className="font-black text-[10px] text-primary uppercase tracking-widest hover:underline">
                                3f1.in ↗
                            </a>
                        </div>
                    </div>
                </motion.section>

                {/* Footer note */}
                <section className="space-y-4 pt-8 border-t border-foreground/10">
                    <p className="text-xs italic opacity-60">
                        The protocol is continuously evolving. For questions, contact the team at{" "}
                        <a href="https://www.3f1.in" target="_blank" rel="noreferrer" className="text-primary hover:underline">3f1.in</a>.
                    </p>
                </section>

            </main>

            <Footer />
        </div>
    );
}
