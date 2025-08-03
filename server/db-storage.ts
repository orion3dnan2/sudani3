import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { users, stores, products, orders } from "@shared/schema";
import type { User, Store, Product, Order, InsertUser, InsertStore, InsertProduct, InsertOrder } from "@shared/schema";
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

  async createStore(insertStore: InsertStore): Promise<Store> {
    const result = await db.insert(stores).values(insertStore).returning();
    return result[0];
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<Store | undefined> {
    const result = await db.update(stores).set(updates).where(eq(stores.id, id)).returning();
    return result[0];
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

  async getOrdersByMerchant(merchantId: string): Promise<Order[]> {
    return await db.select({
      id: orders.id,
      customerId: orders.customerId,
      storeId: orders.storeId,
      items: orders.items,
      totalAmount: orders.totalAmount,
      status: orders.status,
      shippingAddress: orders.shippingAddress,
      notes: orders.notes,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(stores, eq(orders.storeId, stores.id))
    .where(eq(stores.ownerId, merchantId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(insertOrder).returning();
    return result[0];
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return result[0];
  }
}