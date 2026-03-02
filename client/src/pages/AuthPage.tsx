import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthPage() {
    const { user, isLoading: authLoading, signIn, signUp, signInWithGoogle } = useAuth();
    const [_, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            setLocation("/debate");
        }
    }, [user, authLoading, setLocation]);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signIn(email, password);
            setLocation("/debate");
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signUp(email, password, displayName || undefined);
            setLocation("/debate");
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            setLocation("/debate");
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-[10px] uppercase font-black tracking-[0.5em] opacity-40">Verifying Authority...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-background">
            {/* Structural technical background grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
                <div className="absolute top-10 left-10 text-[10px] font-black tracking-widest">[00:00] -- ORIGIN</div>
                <div className="absolute top-10 right-10 text-[10px] font-black tracking-widest">AUTH // S-01</div>
                <div className="absolute bottom-10 left-10 text-[10px] font-black tracking-widest">3F1.OS_SECURE</div>

                <div className="absolute inset-y-0 left-[10%] w-px bg-foreground" />
                <div className="absolute inset-y-0 left-[90%] w-px bg-foreground" />
            </div>

            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="relative z-10 w-full max-w-lg space-y-12">
                <div className="flex flex-col items-center space-y-4">
                    <Link href="/">
                        <Button variant="ghost" className="rounded-none uppercase text-[10px] font-black tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to Hub
                        </Button>
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                        Identity <span className="text-stroke">Portal</span>
                    </h1>
                </div>

                <Card className="w-full rounded-none border-2 border-foreground bg-background shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,102,0,0.2)] md:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] md:dark:shadow-[24px_24px_0px_0px_rgba(255,102,0,0.2)] relative overflow-hidden transition-all group">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05] bg-[linear-gradient(rgba(255,102,0,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary opacity-30 dark:opacity-40" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary opacity-30 dark:opacity-40" />
                    <div className="absolute top-0 right-0 p-4 text-[8px] font-black opacity-10 tracking-[0.2em] select-none uppercase">3F1.SECURE_ACCESS</div>

                    <CardHeader className="p-10 pb-6 border-b border-foreground/5">
                        <CardTitle className="text-2xl font-black uppercase tracking-tighter">Initialize Session</CardTitle>
                        <CardDescription className="uppercase text-[10px] font-bold tracking-widest opacity-60">Authorize your neural credentials to begin operations.</CardDescription>
                    </CardHeader>

                    <CardContent className="p-10">
                        <Tabs defaultValue="login" className="space-y-10">
                            <TabsList className="grid w-full grid-cols-2 rounded-none p-1 bg-foreground/5 h-14 border border-foreground/10">
                                <TabsTrigger value="login" className="rounded-none font-black text-xs uppercase tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background">Login</TabsTrigger>
                                <TabsTrigger value="register" className="rounded-none font-black text-xs uppercase tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background">Register</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="space-y-8">
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Credential: Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="USER@DOMAIN.COM"
                                            required
                                            className="rounded-none border-2 border-foreground/10 focus:border-primary h-12 font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Credential: Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="rounded-none border-2 border-foreground/10 focus:border-primary h-12 font-bold transition-all"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-14 rounded-none bg-foreground text-background hover:bg-primary transition-all font-black uppercase tracking-widest text-xs border-2 border-foreground" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Authenticate Session
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-foreground/10" />
                                        </div>
                                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest opacity-30">
                                            <span className="bg-background px-4">Federated OAuth</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-14 rounded-none border-2 border-foreground hover:bg-foreground hover:text-background transition-all font-black uppercase tracking-widest text-xs"
                                        onClick={handleGoogleSignIn}
                                        disabled={isLoading}
                                    >
                                        <FcGoogle className="mr-3 h-5 w-5" />
                                        Authorize via Google
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="register" className="space-y-8">
                                <form onSubmit={handleRegister} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-name" className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Profile: Ident Name</Label>
                                        <Input
                                            id="reg-name"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="OPERATOR_X"
                                            className="rounded-none border-2 border-foreground/10 focus:border-primary h-12 font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email" className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Credential: Email</Label>
                                        <Input
                                            id="reg-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="USER@DOMAIN.COM"
                                            required
                                            className="rounded-none border-2 border-foreground/10 focus:border-primary h-12 font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-password" className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Credential: New Password</Label>
                                        <Input
                                            id="reg-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="rounded-none border-2 border-foreground/10 focus:border-primary h-12 font-bold transition-all"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-14 rounded-none bg-foreground text-background hover:bg-primary transition-all font-black uppercase tracking-widest text-xs border-2 border-foreground" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Initialize Account
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-foreground/10" />
                                        </div>
                                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest opacity-30">
                                            <span className="bg-background px-4">Alternative</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-14 rounded-none border-2 border-foreground hover:bg-foreground hover:text-background transition-all font-black uppercase tracking-widest text-xs"
                                        onClick={handleGoogleSignIn}
                                        disabled={isLoading}
                                    >
                                        <FcGoogle className="mr-3 h-5 w-5" />
                                        Google OAuth
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
