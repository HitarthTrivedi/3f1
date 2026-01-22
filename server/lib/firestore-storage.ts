import { type User, type InsertUser, type Transaction } from "@shared/schema";
import { type IStorage } from "../storage";
import { getFirebaseAdmin } from "./firebase-admin";

export class FirestoreStorage implements IStorage {
    private get db() {
        return getFirebaseAdmin().firestore();
    }

    // Helper to get next ID from a counter
    private async getNextId(counterName: string): Promise<number> {
        const counterRef = this.db.collection("counters").doc(counterName);

        return await this.db.runTransaction(async (t) => {
            const doc = await t.get(counterRef);
            let newCount = 1;

            if (doc.exists) {
                newCount = (doc.data()?.count || 0) + 1;
            }

            t.set(counterRef, { count: newCount });
            return newCount;
        });
    }

    // Helper to find user doc by numeric ID
    private async getUserDocById(id: number) {
        const snapshot = await this.db.collection("users").where("id", "==", id).limit(1).get();
        if (snapshot.empty) return null;
        return snapshot.docs[0];
    }

    async getUser(id: number): Promise<User | undefined> {
        const doc = await this.getUserDocById(id);
        return doc ? (doc.data() as User) : undefined;
    }

    async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
        const doc = await this.db.collection("users").doc(firebaseUid).get();
        return doc.exists ? (doc.data() as User) : undefined;
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const id = await this.getNextId("users");

        const newUser: User = {
            id,
            firebaseUid: insertUser.firebaseUid,
            email: insertUser.email,
            displayName: insertUser.displayName || null,
            credits: 0,
            freePrompts: 1,
            createdAt: Date.now(),
        };

        // Use firebaseUid as the document ID for easy lookup
        await this.db.collection("users").doc(insertUser.firebaseUid).set(newUser);
        return newUser;
    }

    async updateUserCredits(userId: number, credits: number): Promise<User> {
        const doc = await this.getUserDocById(userId);
        if (!doc) throw new Error("User not found");

        const updatedData = { credits };
        await doc.ref.update(updatedData);

        return { ...(doc.data() as User), ...updatedData };
    }

    async decrementFreePrompt(userId: number): Promise<User> {
        return await this.db.runTransaction(async (t) => {
            // Need to query inside transaction safely? 
            // Firestore transactions require reads to happen before writes.
            // Querying by ID is a read but complex queries might be tricky in transactions if not careful.
            // However, simple .where() is fine.

            const snapshot = await t.get(this.db.collection("users").where("id", "==", userId).limit(1));
            if (snapshot.empty) throw new Error("User not found");

            const doc = snapshot.docs[0];
            const userData = doc.data() as User;
            const newFreePrompts = Math.max(0, userData.freePrompts - 1); // Prevent negative

            t.update(doc.ref, { freePrompts: newFreePrompts });

            return { ...userData, freePrompts: newFreePrompts };
        });
    }

    async createTransaction(transaction: { userId: number; type: string; amount: number; razorpayOrderId?: string; razorpayPaymentId?: string; status?: string }): Promise<Transaction> {
        const id = await this.getNextId("transactions");

        const newTransaction: Transaction = {
            id,
            userId: transaction.userId,
            type: transaction.type,
            amount: transaction.amount,
            razorpayOrderId: transaction.razorpayOrderId || null,
            razorpayPaymentId: transaction.razorpayPaymentId || null,
            status: transaction.status || "completed",
            createdAt: Date.now(),
        };

        // Auto-generate doc ID for transactions
        await this.db.collection("transactions").add(newTransaction);
        return newTransaction;
    }

    async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
        const snapshot = await this.db.collection("transactions")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        return snapshot.docs.map(doc => doc.data() as Transaction);
    }
}
