import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export function initializeRazorpay(): Razorpay {
    if (razorpayInstance) {
        return razorpayInstance;
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
    }

    razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });

    console.log("Razorpay initialized");
    return razorpayInstance;
}

export function getRazorpay(): Razorpay {
    if (!razorpayInstance) {
        return initializeRazorpay();
    }
    return razorpayInstance;
}
