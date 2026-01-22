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
    { amount: 10, credits: 50 },
    { amount: 50, credits: 300, popular: true },
    { amount: 100, credits: 650 },
    { amount: 500, credits: 3500 },
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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Purchase Debate Credits</DialogTitle>
                    <DialogDescription>
                        Choose a credit package to continue debating. Each debate costs 10 credits.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {user && (
                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div>
                                <p className="text-sm font-medium text-orange-900">Current Balance</p>
                                <p className="text-2xl font-bold text-orange-600">{user.credits} credits</p>
                            </div>
                            {user.freePrompts > 0 && (
                                <div className="text-right">
                                    <p className="text-sm font-medium text-orange-900">Free Prompts</p>
                                    <p className="text-xl font-bold text-orange-600">{user.freePrompts}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {creditPackages.map((pkg) => (
                            <Card
                                key={pkg.amount}
                                className={`cursor-pointer transition-all hover:shadow-md ${pkg.popular ? "border-orange-500 border-2" : ""
                                    } ${selectedPackage === pkg && isProcessing ? "opacity-50" : ""}`}
                                onClick={() => !isProcessing && handlePurchase(pkg)}
                            >
                                {pkg.popular && (
                                    <div className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-t-lg text-center flex items-center justify-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        Most Popular
                                    </div>
                                )}
                                <CardHeader className={pkg.popular ? "pt-3" : ""}>
                                    <CardTitle className="text-xl">₹{pkg.amount}</CardTitle>
                                    <CardDescription>{pkg.credits} credits</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        className="w-full"
                                        disabled={isProcessing}
                                        variant={pkg.popular ? "default" : "outline"}
                                    >
                                        {selectedPackage === pkg && isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Purchase
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground mt-2">
                                        ~{Math.floor(pkg.credits / 10)} debates
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        <p>Secure payment powered by Razorpay</p>
                        <p className="mt-1">₹10 = 50 credits (5 debates)</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
