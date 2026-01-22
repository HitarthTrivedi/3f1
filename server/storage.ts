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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private currentId: number;
  private currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
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
}

export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new FirestoreStorage();
