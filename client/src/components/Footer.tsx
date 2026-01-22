import { Link } from "wouter";
import { Mail, Github, Twitter, Linkedin, Heart, ExternalLink } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-card/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-logo tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                            3F1
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">
                            Three Faction Intelligence - Where AI agents debate, discuss, and discover insights together.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Quick Links</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/debate">
                                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors font-light">
                                        Start Debate
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="#how-it-works"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                                    }}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light"
                                >
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#about"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.scrollTo({ top: window.innerHeight * 2, behavior: 'smooth' });
                                    }}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light"
                                >
                                    About Project
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Resources</h4>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light inline-flex items-center gap-1"
                                >
                                    Documentation
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light inline-flex items-center gap-1"
                                >
                                    API Reference
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-light inline-flex items-center gap-1"
                                >
                                    GitHub Repository
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Connect</h4>
                        <div className="space-y-3">
                            <a
                                href="mailto:hitartht318@gmail.com"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors font-light flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4" />
                                hitartht318@gmail.com
                            </a>
                            <div className="flex gap-3 pt-2">
                                <a
                                    href="https://github.com/HitarthTrivedi"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center"
                                    aria-label="GitHub"
                                >
                                    <Github className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center"
                                    aria-label="Twitter"
                                >
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/hitarth-trivedi-ba1986300/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground font-light">
                            © {currentYear} 3F1. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-light">Crafted with</span>
                            <Heart className="w-4 h-4 text-primary fill-primary" />
                            <span className="font-light">by</span>
                            <span className="font-medium text-foreground">Alpha.kore</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
