import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export const HeroScene = () => {
    const { user, signOut, isLoading: authLoading } = useAuth();

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-background px-6 pt-20 overflow-hidden">
            {/* Decorative vertical lines for a structured 'Thesys' look */}
            <div className="absolute inset-x-0 top-0 h-px bg-border/50" />
            <div className="absolute inset-y-0 left-1/4 w-px bg-border/20 hidden lg:block" />
            <div className="absolute inset-y-0 right-1/4 w-px bg-border/20 hidden lg:block" />

            <div className="relative z-10 max-w-5xl w-full text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none border border-primary text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                        Introducing <span className="font-logo">3F1</span>.OS debate
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-foreground font-logo">
                        3F1
                    </h1>

                    <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                        <span className="font-logo">3F1</span> leverages a three-agent dialectic protocol to distill complex topics into objective, structured synthesis.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link href="/debate">
                        <Button
                            size="lg"
                            className="h-14 px-6 md:h-16 md:px-10 rounded-none bg-foreground text-background hover:bg-primary transition-colors text-base md:text-lg font-bold group"
                        >
                            Trigger debate
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>

                    {user ? (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => signOut()}
                            className="h-14 px-6 md:h-16 md:px-10 rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors text-base md:text-lg font-bold group"
                        >
                            Logout —
                            <LogOut className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    ) : (
                        <Link href="/auth">
                            <Button
                                variant="outline"
                                size="lg"
                                disabled={authLoading}
                                className="h-14 px-6 md:h-16 md:px-10 rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors text-base md:text-lg font-bold group min-w-[160px]"
                            >
                                {authLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Login —
                                        <UserIcon className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </>
                                )}
                            </Button>
                        </Link>
                    )}
                </motion.div>
            </div>

            {/* Bottom border line */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
        </section>
    );
};

export default HeroScene;
