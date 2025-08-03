import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ message: "الحساب غير مفعل" });
      }
      
      // In a real app, you'd use proper session management
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        }
      });
    } catch (error) {
      res.status(400).json({ message: "خطأ في البيانات المرسلة" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
      }
      
      const user = await storage.createUser(userData);
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        }
      });
    } catch (error) {
      res.status(400).json({ message: "خطأ في البيانات المرسلة" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/dashboard/orders/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stores = await storage.getStoresByOwner(userId);
      const allOrders = [];
      
      for (const store of stores) {
        const orders = await storage.getOrdersByStore(store.id);
        allOrders.push(...orders);
      }
      
      // Sort by creation date (newest first)
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(allOrders);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Store routes
  app.get("/api/stores/owner/:ownerId", async (req, res) => {
    try {
      const { ownerId } = req.params;
      const stores = await storage.getStoresByOwner(ownerId);
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Product routes
  app.get("/api/products/store/:storeId", async (req, res) => {
    try {
      const { storeId } = req.params;
      const products = await storage.getProductsByStore(storeId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/products/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stores = await storage.getStoresByOwner(userId);
      const allProducts = [];
      
      for (const store of stores) {
        const products = await storage.getProductsByStore(store.id);
        allProducts.push(...products);
      }
      
      res.json(allProducts);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
