import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface CreditPackage {
    amount: number; // in rupees
    credits: number;
    popular?: boolean;
}

const creditPackages: CreditPackage[] = [
    { amount: 25, credits: 25 },
    { amount: 35, credits: 50, popular: true },
];

export default function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

    const handlePurchase = async (pkg: CreditPackage) => {
        if (!user) {
            toast({
                title: "Authentication required",
                description: "Please sign in to purchase credits",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        setSelectedPackage(pkg);

        try {
            // Create Razorpay order
            const orderData = await apiClient.post<{
                orderId: string;
                amount: number;
                currency: string;
            }>("/api/payment/create-order", {
                amount: pkg.amount,
                currency: "INR",
            });

            // Load Razorpay script if not already loaded
            if (!(window as any).Razorpay) {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.async = true;
                document.body.appendChild(script);
                await new Promise((resolve) => {
                    script.onload = resolve;
                });
            }

            // Initialize Razorpay checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "3F1 Debate Platform",
                description: `${pkg.credits} debate credits`,
                order_id: orderData.orderId,
                handler: async (response: any) => {
                    try {
                        // Verify payment on backend
                        const result = await apiClient.post("/api/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: orderData.amount,
                        });

                        toast({
                            title: "Payment successful! 🎉",
                            description: `Added ${result.creditsAdded} credits to your account`,
                        });

                        // Refresh page to update credits
                        window.location.reload();
                    } catch (error) {
                        console.error("Payment verification failed:", error);
                        toast({
                            title: "Payment verification failed",
                            description: error instanceof Error ? error.message : "Please contact support",
                            variant: "destructive",
                        });
                    }
                },
                prefill: {
                    email: user.email,
                    name: user.displayName || "",
                },
                theme: {
                    color: "#f97316", // Orange theme to match 3F1
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        setSelectedPackage(null);
                    },
                },
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error("Error creating order:", error);
            toast({
                title: "Payment failed",
                description: error instanceof Error ? error.message : "Failed to create order",
                variant: "destructive",
            });
            setIsProcessing(false);
            setSelectedPackage(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] rounded-none border-2 border-foreground bg-background p-0 overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] dark:sm:shadow-[24px_24px_0px_0px_rgba(255,255,255,1)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary z-50" />

                <div className="p-6 sm:p-10 space-y-8 sm:space-y-10">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 border border-foreground flex items-center justify-center">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary animate-pulse" />
                            </div>
                            <span className="text-[8px] sm:text-[10px] uppercase font-black tracking-[0.3em] sm:tracking-[0.5em] opacity-40">Module: Payment // Gateway</span>
                        </div>
                        <DialogTitle className="text-2xl sm:text-4xl font-black uppercase tracking-tighter">Purchase <span className="text-primary italic">Credits</span></DialogTitle>
                        <DialogDescription className="text-[10px] sm:text-sm uppercase font-bold tracking-widest opacity-60">
                            Select a neural processing package to continue debate operations.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8 sm:space-y-10">
                        {user && (
                            <div className="p-6 sm:p-8 border-2 border-primary/20 bg-primary/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 sm:p-4 text-[6px] sm:text-[8px] font-black opacity-10 tracking-widest">USER_WALLET // SYNCED</div>
                                <div className="flex flex-col sm:flex-row items-center justify-between relative z-10 gap-4">
                                    <div className="space-y-1 text-center sm:text-left">
                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Current Balance</p>
                                        <p className="text-3xl sm:text-4xl font-black tracking-tighter">{user.credits} <span className="text-[10px] uppercase opacity-40 ml-1">Credits</span></p>
                                    </div>
                                    <div className="hidden sm:block h-12 w-px bg-primary/20 mx-8" />
                                    <div className="sm:hidden w-full h-px bg-primary/20" />
                                    <div className="space-y-1 text-center sm:text-right">
                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Free Prompts</p>
                                        <p className="text-2xl sm:text-3xl font-black tracking-tighter text-primary">{user.freePrompts}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pb-4">
                            {creditPackages.map((pkg, i) => (
                                <Card
                                    key={pkg.amount}
                                    className={`rounded-none border-2 border-foreground relative transition-all group cursor-pointer ${pkg.popular
                                        ? "shadow-[8px_8px_0px_0px_rgba(255,102,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(255,102,0,1)] -translate-x-1 -translate-y-1"
                                        : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                                        } ${selectedPackage === pkg && isProcessing ? "opacity-50" : ""}`}
                                    onClick={() => !isProcessing && handlePurchase(pkg)}
                                >
                                    <div className="absolute -top-3 left-4 px-2 bg-background border border-foreground text-[8px] font-black tracking-[0.2em] z-10 uppercase">
                                        PKG_ID: 0{i + 1}
                                    </div>

                                    {pkg.popular && (
                                        <div className="bg-primary text-primary-foreground text-[8px] font-black tracking-[0.3em] px-3 py-1.5 uppercase text-center flex items-center justify-center gap-2 border-b-2 border-foreground">
                                            <Sparkles className="h-3 w-3" />
                                            Most Popular Choice
                                        </div>
                                    )}

                                    <CardHeader className="p-6 sm:p-8 pb-3 sm:pb-4">
                                        <div className="flex justify-between items-end">
                                            <CardTitle className="text-2xl sm:text-3xl font-black tracking-tighter">₹{pkg.amount}</CardTitle>
                                            <div className="text-[10px] font-black opacity-30">INR</div>
                                        </div>
                                        <CardDescription className="text-base sm:text-lg font-black uppercase tracking-tighter text-foreground">{pkg.credits} Credits</CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-6 sm:p-8 pt-0 space-y-4 sm:space-y-6">
                                        <Button
                                            className={`w-full h-12 sm:h-14 rounded-none font-black uppercase tracking-widest text-[10px] sm:text-xs border-2 ${pkg.popular
                                                ? "bg-primary text-primary-foreground border-foreground hover:bg-foreground hover:text-background"
                                                : "bg-background text-foreground border-foreground hover:bg-foreground hover:text-background"
                                                }`}
                                            disabled={isProcessing}
                                        >
                                            {selectedPackage === pkg && isProcessing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Initialize Payment
                                                </>
                                            )}
                                        </Button>
                                        <div className="flex items-center justify-between text-[6px] sm:text-[8px] font-black tracking-widest opacity-30 uppercase border-t border-foreground/5 pt-3 sm:pt-4">
                                            <span>Est. Debates: ~{Math.floor(pkg.credits / 10)}</span>
                                            <span>B0-V2</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-2 pt-6 border-t border-foreground/5 text-center">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-6 sm:w-8 bg-foreground/10" />
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-30">Secure Transaction Flow</span>
                                <div className="h-px w-6 sm:w-8 bg-foreground/10" />
                            </div>
                            <p className="text-[7px] sm:text-[9px] uppercase font-bold tracking-widest opacity-40">Powered by Razorpay Node Interface // ₹25 = 25 Units (Standard)</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
