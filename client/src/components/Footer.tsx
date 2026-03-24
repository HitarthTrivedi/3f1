import { Github, Twitter, Linkedin, ShieldCheck, Instagram } from "lucide-react";
import { Link } from "wouter";
import { Logo } from "./Logo";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-background border-t border-foreground/10 pt-16 pb-8 px-6 overflow-hidden">
            {/* Structural Blueprint Lines */}
            <div className="absolute inset-y-0 left-1/4 w-px bg-foreground/[0.03] pointer-events-none" />
            <div className="absolute inset-y-0 left-2/4 w-px bg-foreground/[0.03] pointer-events-none" />
            <div className="absolute inset-y-0 left-3/4 w-px bg-foreground/[0.03] pointer-events-none" />
            <div className="absolute top-1/2 inset-x-0 h-px bg-foreground/[0.03] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand & Mission */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <h3 className="text-4xl font-black tracking-tighter">
                                    <Logo className="text-4xl" />
                                </h3>
                                <div className="px-2 py-0.5 border border-primary/20 text-[8px] uppercase tracking-[0.3em] font-black text-primary">
                                    HQ.LAX
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
                            The Debating Platform. <br />
                            <span className="text-foreground">Orchestrating triadic conflict to distill objective truth.</span>
                        </p>

                        <div className="flex gap-2">
                            {[
                                { Icon: Github, href: "https://github.com/alpha-kore" },
                                { Icon: Twitter, href: "https://twitter.com/alpha-kore" },
                                { Icon: Linkedin, href: "https://linkedin.com/company/alpha-kore" },
                                { Icon: Instagram, href: "https://instagram.com/alpha-kore" }
                            ].map(({ Icon, href }, i) => (
                                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center border border-foreground/10 hover:border-primary hover:text-primary transition-all rounded-none group">
                                    <Icon size={16} className="group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    {[
                        { title: "Company", links: [{ name: "About", href: "/about" }, { name: "Contact us", href: "/contact" }] },
                        { title: "For Developers", links: [{ name: "GitHub", href: "https://github.com/alpha-kore" }, { name: "Documentation", href: "/documentation" }, { name: "Join community", href: "https://discord.gg/alpha-kore" }] },
                        { title: "Product", links: [{ name: "Pricing", href: "/pricing" }] }
                    ].map((col) => (
                        <div key={col.title} className="space-y-5">
                            <h4 className="text-[10px] uppercase tracking-[0.5em] font-black text-foreground/40">{col.title}</h4>
                            <ul className="space-y-4 text-xs uppercase tracking-[0.2em] font-bold">
                                {col.links.map(link => (
                                    <li key={typeof link === "string" ? link : link.name}>
                                        <a href={typeof link === "string" ? "#" : link.href} className="hover:text-primary transition-colors flex items-center gap-2 group">
                                            <span className="w-0 h-px bg-primary group-hover:w-3 transition-all" />
                                            {typeof link === "string" ? link : link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-wrap items-center gap-8">
                        <Link href="/terms">
                            <span className="text-xs uppercase tracking-[0.2em] font-black opacity-60 hover:opacity-100 cursor-pointer transition-opacity border-b-2 border-transparent hover:border-primary/30">
                                Terms of use
                            </span>
                        </Link>
                        <Link href="/privacy">
                            <span className="text-xs uppercase tracking-[0.2em] font-black opacity-60 hover:opacity-100 cursor-pointer transition-opacity border-b-2 border-transparent hover:border-primary/30">
                                Privacy policy
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6 group cursor-pointer">
                        <div className="text-right">
                            <div className="text-[10px] uppercase tracking-[0.4em] font-black group-hover:text-primary transition-colors">Built by Alpha.kore</div>
                            <div className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-30 mt-0.5">Automated Intelligence Unit</div>
                        </div>
                        <div className="w-12 h-px bg-foreground/20 group-hover:bg-primary transition-all group-hover:w-16" />
                        <div className="w-10 h-10 border border-foreground/10 flex items-center justify-center group-hover:border-primary transition-colors">
                            <ShieldCheck size={18} className="group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <span className="text-[9px] uppercase tracking-[0.6em] font-black opacity-10 flex items-center justify-center gap-2">
                        © {currentYear} <Logo className="text-[9px]" dashClassName="w-2 h-[1px] mt-0.5 border-none opacity-20" /> INC — GLOBAL CORE INFRASTRUCTURE
                    </span>
                </div>
            </div>
        </footer>
    );
}
