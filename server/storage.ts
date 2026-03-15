import { type User, type InsertUser, users, type Transaction, transactions } from "@shared/schema";
import { db } from "./db";
import { FirestoreStorage } from "./lib/firestore-storage";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(userId: number, credits: number): Promise<User>;
  decrementFreePrompt(userId: number): Promise<User>;
  createTransaction(transaction: { userId: number; type: string; amount: number; razorpayOrderId?: string; razorpayPaymentId?: string; status?: string }): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;

  // Debate Session Persistence
  saveActiveDebate(userId: number, debateData: { topic: string; agents: any[]; messages: any[] }): Promise<void>;
  getActiveDebate(userId: number): Promise<{ topic: string; agents: any[]; messages: any[] } | null>;
  clearActiveDebate(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db!.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserCredits(userId: number, credits: number): Promise<User> {
    const [user] = await db!
      .update(users)
      .set({ credits })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async decrementFreePrompt(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const [updatedUser] = await db!
      .update(users)
      .set({ freePrompts: user.freePrompts - 1 })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async createTransaction(transaction: { userId: number; type: string; amount: number; razorpayOrderId?: string; razorpayPaymentId?: string; status?: string }): Promise<Transaction> {
    const [newTransaction] = await db!.insert(transactions).values({
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      razorpayOrderId: transaction.razorpayOrderId,
      razorpayPaymentId: transaction.razorpayPaymentId,
      status: transaction.status || "completed",
      createdAt: Date.now(),
    }).returning();
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return db!.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async saveActiveDebate(userId: number, debateData: { topic: string; agents: any[]; messages: any[] }): Promise<void> {
    // We would need to import activeDebates from schema
    const { activeDebates } = await import("@shared/schema");

    // Check if exists
    const existing = await db!.select().from(activeDebates).where(eq(activeDebates.userId, userId));

    if (existing && existing.length > 0) {
      await db!.update(activeDebates)
        .set({
          topic: debateData.topic,
          agents: debateData.agents,
          messages: debateData.messages,
          updatedAt: Date.now()
        })
        .where(eq(activeDebates.userId, userId));
    } else {
      await db!.insert(activeDebates).values({
        userId,
        topic: debateData.topic,
        agents: debateData.agents,
        messages: debateData.messages,
        updatedAt: Date.now()
      });
    }
  }

  async getActiveDebate(userId: number): Promise<{ topic: string; agents: any[]; messages: any[] } | null> {
    const { activeDebates } = await import("@shared/schema");
    const [debate] = await db!.select().from(activeDebates).where(eq(activeDebates.userId, userId));

    if (!debate) return null;
    return {
      topic: debate.topic,
      agents: debate.agents as any[],
      messages: debate.messages as any[]
    };
  }

  async clearActiveDebate(userId: number): Promise<void> {
    const { activeDebates } = await import("@shared/schema");
    await db!.delete(activeDebates).where(eq(activeDebates.userId, userId));
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private activeDebates: Map<number, { topic: string; agents: any[]; messages: any[] }>;
  private currentId: number;
  private currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.activeDebates = new Map();
    this.currentId = 1;
    this.currentTransactionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      displayName: insertUser.displayName || null,
      credits: 0,
      freePrompts: 1,
      createdAt: Date.now(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserCredits(userId: number, credits: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, credits };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async decrementFreePrompt(userId: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, freePrompts: user.freePrompts - 1 };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createTransaction(transaction: { userId: number; type: string; amount: number; razorpayOrderId?: string; razorpayPaymentId?: string; status?: string }): Promise<Transaction> {
    const id = this.currentTransactionId++;
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
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }

  async saveActiveDebate(userId: number, debateData: { topic: string; agents: any[]; messages: any[] }): Promise<void> {
    this.activeDebates.set(userId, debateData);
  }

  async getActiveDebate(userId: number): Promise<{ topic: string; agents: any[]; messages: any[] } | null> {
    return this.activeDebates.get(userId) || null;
  }

  async clearActiveDebate(userId: number): Promise<void> {
    this.activeDebates.delete(userId);
  }
}

export const storage = (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("your_database_url"))
  ? new DatabaseStorage()
  : new FirestoreStorage();
