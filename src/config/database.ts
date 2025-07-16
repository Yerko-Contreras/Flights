import mongoose from 'mongoose';

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/flights';
      await mongoose.connect(mongoUri);
      this.isConnected = true;
    } catch (error) {
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    try {
      await mongoose.disconnect();
      this.isConnected = false;
    } catch (error) {
      throw error;
    }
  }
} 