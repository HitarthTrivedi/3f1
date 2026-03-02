import { Github, Twitter, Linkedin, Mail, ShieldCheck } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-background border-t border-foreground/10 pt-32 pb-16 px-6 overflow-hidden">
            {/* Structural Blueprint Lines */}
            <div className="absolute inset-y-0 left-1/4 w-px bg-foreground/[0.03] pointer-events-none" />
            <div className="absolute inset-y-0 left-2/4 w-px bg-foreground/[0.03] pointer-events-none" />
            <div className="absolute inset-y-0 left-3/4 w-px bg-foreground/[0.03] pointer-events-none" />
            <div className="absolute top-1/2 inset-x-0 h-px bg-foreground/[0.03] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-32">
                    {/* Brand & Mission */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">
                                    3F1 <span className="text-primary italic">—</span>
                                </h3>
                                <div className="px-2 py-0.5 border border-primary/20 text-[8px] uppercase tracking-[0.3em] font-black text-primary">
                                    HQ.LAX
                                </div>
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30 flex items-center gap-2">
                                <span className="w-4 h-px bg-foreground/30" />
                                34.0522° N, 118.2437° W
                            </div>
                        </div>

                        <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-sm">
                            The Dialectic Intelligence Platform. <br />
                            <span className="text-foreground">Orchestrating triadic conflict to distill objective truth.</span>
                        </p>

                        <div className="flex gap-2">
                            {[Github, Twitter, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 flex items-center justify-center border border-foreground/10 hover:border-primary hover:text-primary transition-all rounded-none group">
                                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    {[
                        { title: "Company", links: ["Blogs", "About", "Careers", "Contact us"] },
                        { title: "For Developers", links: ["GitHub", "API Status", "Documentation", "Join community"] },
                        { title: "Product", links: ["Pricing", "Startups", "Enterprise", "Partnership"] }
                    ].map((col) => (
                        <div key={col.title} className="space-y-8">
                            <h4 className="text-[10px] uppercase tracking-[0.5em] font-black text-foreground/40">{col.title}</h4>
                            <ul className="space-y-5 text-xs uppercase tracking-[0.2em] font-bold">
                                {col.links.map(link => (
                                    <li key={link}>
                                        <a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                            <span className="w-0 h-px bg-primary group-hover:w-3 transition-all" />
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-16 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">System Status: Optimal</span>
                        </div>

                        <div className="flex gap-8">
                            {["Terms of use", "Privacy policy"].map(item => (
                                <span key={item} className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30 hover:opacity-100 cursor-pointer transition-opacity border-b border-transparent hover:border-foreground/30">
                                    {item}
                                </span>
                            ))}
                        </div>
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

                <div className="mt-16 text-center">
                    <span className="text-[9px] uppercase tracking-[0.6em] font-black opacity-10">
                        © {currentYear} 3F1 INC — GLOBAL CORE INFRASTRUCTURE
                    </span>
                </div>
            </div>
        </footer>
    );
}

