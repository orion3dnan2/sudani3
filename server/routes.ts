import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRestaurantSchema, insertJobSchema } from "@shared/schema";
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
          phone: user.phone,
          country: user.country,
          city: user.city,
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
      
      // Auto-create store for merchants
      if (user.role === 'merchant') {
        try {
          await storage.createStore({
            name: `متجر ${user.fullName}`,
            description: `متجر ${user.fullName} - متخصص في المنتجات عالية الجودة`,
            ownerId: user.id,
            isActive: true,
            settings: {
              category: "food-fragrance",
              address: "",
              openTime: "09:00",
              closeTime: "22:00",
              workingDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
            },
          });
        } catch (error) {
          console.log("Error creating default store:", error);
        }
      }
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          country: user.country,
          city: user.city,
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

  // Get all active stores
  app.get("/api/stores", async (req, res) => {
    try {
      const { category, search, city } = req.query;
      const stores = await storage.getAllStores({
        category: category as string,
        search: search as string,
        city: city as string,
      });
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Get store by ID with details
  app.get("/api/stores/:storeId", async (req, res) => {
    try {
      const { storeId } = req.params;
      const store = await storage.getStoreById(storeId);
      
      if (!store) {
        return res.status(404).json({ message: "المتجر غير موجود" });
      }
      
      res.json(store);
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

  app.post("/api/products", async (req, res) => {
    try {
      const productData = req.body;
      
      // Use current user ID (should be the merchant ID from login)
      // For now, using a fixed merchant ID since we don't have session management
      const userId = "109fb3f0-f57b-4976-8d9b-07e9d91eedae";
      console.log("Current user ID:", userId);
      
      // Get or create store for user
      let stores = await storage.getStoresByOwner(userId);
      console.log("Found stores:", stores.length);
      
      // If no store exists, create a default one
      if (stores.length === 0) {
        console.log("Creating new store for user:", userId);
        const newStore = await storage.createStore({
          name: "رؤل أقلامي",
          description: "متجر المنتجات السودانية الأصيلة",
          ownerId: userId,
          isActive: true,
          settings: {},
        });
        stores = [newStore];
        console.log("Created store:", newStore.id);
      }

      // Convert price to string for storage
      const productToCreate = {
        ...productData,
        price: productData.price.toString(),
        weight: productData.weight ? productData.weight.toString() : null,
        storeId: stores[0].id,
        isActive: true,
      };

      console.log("Creating product:", productToCreate);
      const product = await storage.createProduct(productToCreate);

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "خطأ في إنشاء المنتج" });
    }
  });

  app.patch("/api/stores/:storeId", async (req, res) => {
    try {
      const { storeId } = req.params;
      const updateData = req.body;
      
      const updatedStore = await storage.updateStore(storeId, updateData);
      
      if (!updatedStore) {
        return res.status(404).json({ message: "المتجر غير موجود" });
      }
      
      res.json(updatedStore);
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(500).json({ message: "خطأ في تحديث المتجر" });
    }
  });

  // Restaurant routes
  app.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const restaurant = await storage.getRestaurant(id);
      
      if (!restaurant) {
        return res.status(404).json({ message: "المطعم غير موجود" });
      }
      
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/restaurants/owner/:ownerId", async (req, res) => {
    try {
      const { ownerId } = req.params;
      const restaurants = await storage.getRestaurantsByOwner(ownerId);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    try {
      const restaurantData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(restaurantData);
      res.status(201).json(restaurant);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      res.status(400).json({ message: "خطأ في البيانات المرسلة" });
    }
  });

  app.patch("/api/restaurants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedRestaurant = await storage.updateRestaurant(id, updateData);
      
      if (!updatedRestaurant) {
        return res.status(404).json({ message: "المطعم غير موجود" });
      }
      
      res.json(updatedRestaurant);
    } catch (error) {
      console.error("Error updating restaurant:", error);
      res.status(500).json({ message: "خطأ في تحديث المطعم" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "الوظيفة غير موجودة" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/jobs/poster/:posterId", async (req, res) => {
    try {
      const { posterId } = req.params;
      const jobs = await storage.getJobsByPoster(posterId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(400).json({ message: "خطأ في البيانات المرسلة" });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedJob = await storage.updateJob(id, updateData);
      
      if (!updatedJob) {
        return res.status(404).json({ message: "الوظيفة غير موجودة" });
      }
      
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "خطأ في تحديث الوظيفة" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
