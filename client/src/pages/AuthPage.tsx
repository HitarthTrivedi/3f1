import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const [_, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <div className="min-h-screen grid items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome to 3F1</CardTitle>
                    <CardDescription>Login or create an account to start debating.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Login
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading}
                                >
                                    <FcGoogle className="mr-2 h-5 w-5" />
                                    Google
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-name">Display Name (Optional)</Label>
                                    <Input
                                        id="reg-name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-email">Email</Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">Password</Label>
                                    <Input
                                        id="reg-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading}
                                >
                                    <FcGoogle className="mr-2 h-5 w-5" />
                                    Google
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
