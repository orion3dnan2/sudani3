import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { users, stores, products, orders, restaurants, jobs, ads } from "@shared/schema";
import type { User, Store, Product, Order, Restaurant, Job, Ad, InsertUser, InsertStore, InsertProduct, InsertOrder, InsertRestaurant, InsertJob, InsertAd } from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getStore(id: string): Promise<Store | undefined> {
    const result = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
    return result[0];
  }

  async getStoresByOwner(ownerId: string): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.ownerId, ownerId));
  }

  async getAllStores(filters?: { category?: string; search?: string; city?: string }): Promise<(Store & { owner: { fullName: string; city: string } })[]> {
    let query = db.select({
      id: stores.id,
      name: stores.name,
      description: stores.description,
      ownerId: stores.ownerId,
      isActive: stores.isActive,
      settings: stores.settings,
      createdAt: stores.createdAt,
      owner: {
        fullName: users.fullName,
        city: users.city || '',
      }
    })
    .from(stores)
    .innerJoin(users, eq(stores.ownerId, users.id))
    .where(eq(stores.isActive, true));

    const result = await query;
    
    // Apply filters
    let filteredStores = result;
    
    if (filters?.category && filters.category !== 'all') {
      filteredStores = filteredStores.filter(store => 
        (store.settings as any)?.category === filters.category
      );
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredStores = filteredStores.filter(store => 
        store.name.toLowerCase().includes(searchLower) ||
        (store.description && store.description.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters?.city && filters.city !== 'all') {
      filteredStores = filteredStores.filter(store => 
        store.owner.city === filters.city
      );
    }
    
    return filteredStores;
  }

  async getStoreById(id: string): Promise<(Store & { owner: { fullName: string; city: string; phone: string } }) | undefined> {
    const result = await db.select({
      id: stores.id,
      name: stores.name,
      description: stores.description,
      ownerId: stores.ownerId,
      isActive: stores.isActive,
      settings: stores.settings,
      createdAt: stores.createdAt,
      owner: {
        fullName: users.fullName,
        city: users.city || '',
        phone: users.phone || '',
      }
    })
    .from(stores)
    .innerJoin(users, eq(stores.ownerId, users.id))
    .where(eq(stores.id, id))
    .limit(1);
    
    return result[0];
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const result = await db.insert(stores).values(insertStore).returning();
    return result[0];
  }

  async getAllStoresWithOwners(): Promise<(Store & { owner: { fullName: string; city: string; email: string; phone: string } })[]> {
    const result = await db.select({
      id: stores.id,
      name: stores.name,
      description: stores.description,
      ownerId: stores.ownerId,
      isActive: stores.isActive,
      settings: stores.settings,
      createdAt: stores.createdAt,
      owner: {
        fullName: users.fullName,
        city: users.city || '',
        email: users.email,
        phone: users.phone || '',
      }
    })
    .from(stores)
    .innerJoin(users, eq(stores.ownerId, users.id));

    return result as any;
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<Store | undefined> {
    const result = await db.update(stores).set(updates).where(eq(stores.id, id)).returning();
    return result[0];
  }

  async deleteStore(id: string): Promise<boolean> {
    const result = await db.delete(stores).where(eq(stores.id, id)).returning();
    return result.length > 0;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.storeId, storeId));
  }

  async getProductsByUser(userId: string): Promise<Product[]> {
    return await db.select({
      id: products.id,
      storeId: products.storeId,
      name: products.name,
      description: products.description,
      price: products.price,
      category: products.category,
      stock: products.stock,
      weight: products.weight,
      dimensions: products.dimensions,
      specifications: products.specifications,
      tags: products.tags,
      isActive: products.isActive,
      image: products.image,
      createdAt: products.createdAt,
    })
    .from(products)
    .innerJoin(stores, eq(products.storeId, stores.id))
    .where(eq(stores.ownerId, userId));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const result = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return result[0];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.customerId, customerId));
  }

  async getOrdersByStore(storeId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.storeId, storeId));
  }

  async getOrdersByMerchant(merchantId: string): Promise<Order[]> {
    return await db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerId: orders.customerId,
      storeId: orders.storeId,
      items: orders.items,
      totalAmount: orders.totalAmount,
      status: orders.status,
      shippingAddress: orders.shippingAddress,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(stores, eq(orders.storeId, stores.id))
    .where(eq(stores.ownerId, merchantId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const orderNumber = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const orderData = {
      ...insertOrder,
      orderNumber,
      status: insertOrder.status ?? "pending",
      shippingAddress: insertOrder.shippingAddress ?? {}
    };
    const result = await db.insert(orders).values(orderData).returning();
    return result[0];
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async getDashboardStats(userId: string): Promise<{
    totalViews: number;
    totalSales: string;
    totalOrders: number;
    totalProducts: number;
  }> {
    const userStores = await this.getStoresByOwner(userId);
    const storeIds = userStores.map(store => store.id);
    
    let totalOrders = 0;
    let totalSales = 0;
    let totalProducts = 0;
    
    for (const storeId of storeIds) {
      const storeOrders = await this.getOrdersByStore(storeId);
      const storeProducts = await this.getProductsByStore(storeId);
      
      totalOrders += storeOrders.length;
      totalProducts += storeProducts.length;
      totalSales += storeOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    }
    
    return {
      totalViews: 2340,
      totalSales: `$${totalSales.toFixed(2)}`,
      totalOrders,
      totalProducts,
    };
  }

  // Restaurant operations
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const result = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
    return result[0];
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.isActive, true));
  }

  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(eq(restaurants.ownerId, ownerId));
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const result = await db.insert(restaurants).values(insertRestaurant).returning();
    return result[0];
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | undefined> {
    const result = await db.update(restaurants).set(updates).where(eq(restaurants.id, id)).returning();
    return result[0];
  }

  // Job operations
  async getJob(id: string): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return result[0];
  }

  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.isActive, true));
  }

  async getJobsByPoster(posterId: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.posterId, posterId));
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(insertJob).returning();
    return result[0];
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const result = await db.update(jobs).set(updates).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  // Ad operations
  async getAd(id: string): Promise<Ad | undefined> {
    const result = await db.select().from(ads).where(eq(ads.id, id)).limit(1);
    return result[0];
  }

  async getAds(): Promise<Ad[]> {
    return await db.select().from(ads).where(eq(ads.isActive, true));
  }

  async getAdsByPoster(posterId: string): Promise<Ad[]> {
    return await db.select().from(ads).where(eq(ads.posterId, posterId));
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const result = await db.insert(ads).values(insertAd).returning();
    return result[0];
  }

  async updateAd(id: string, updates: Partial<Ad>): Promise<Ad | undefined> {
    const result = await db.update(ads).set(updates).where(eq(ads.id, id)).returning();
    return result[0];
  }
}