import { type User, type InsertUser, type Store, type InsertStore, type Product, type InsertProduct, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Store operations
  getStore(id: string): Promise<Store | undefined>;
  getStoresByOwner(ownerId: string): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, updates: Partial<Store>): Promise<Store | undefined>;
  
  // Product operations
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByStore(storeId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  
  // Order operations
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByStore(storeId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  
  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    totalViews: number;
    totalSales: string;
    totalOrders: number;
    totalProducts: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private stores: Map<string, Store>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.stores = new Map();
    this.products = new Map();
    this.orders = new Map();
    
    // Seed demo users
    this.seedDemoData();
  }

  private seedDemoData() {
    // Create demo admin user
    const adminId = randomUUID();
    const adminUser: User = {
      id: adminId,
      username: "admin",
      email: "admin@bayt-sudani.com",
      password: "admin123", // In real app, this would be hashed
      fullName: "مدير النظام",
      phone: "+966501234567",
      country: "السعودية",
      city: "الرياض",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(adminId, adminUser);

    // Create demo merchant user
    const merchantId = randomUUID();
    const merchantUser: User = {
      id: merchantId,
      username: "merchant",
      email: "merchant@bayt-sudani.com",
      password: "merchant123",
      fullName: "أحمد محمد التاجر",
      phone: "+966501234568",
      country: "السعودية",
      city: "جدة",
      role: "merchant",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(merchantId, merchantUser);

    // Create demo store for merchant
    const storeId = randomUUID();
    const demoStore: Store = {
      id: storeId,
      name: "رؤل أقلامي",
      description: "متجر متخصص في المنتجات السودانية الأصيلة - حلويات وعطور وبخور",
      ownerId: merchantId,
      isActive: true,
      settings: {},
      createdAt: new Date(),
    };
    this.stores.set(storeId, demoStore);

    // Create sample products for the store
    const product1Id = randomUUID();
    const product1: Product = {
      id: product1Id,
      storeId: storeId,
      name: "طلب أقلامي فراولة وسط",
      description: "طلب الأقلامي فراولة وسط أصل من مطعم رؤل أقلامي - فراولة منضوج طازج بالطريقة السودانية التقليدية مع الحلوى",
      price: "8.00",
      category: "حلويات",
      stock: 50,
      weight: null,
      dimensions: null,
      specifications: null,
      tags: null,
      isActive: true,
      image: "https://via.placeholder.com/300x200?text=أقلامي+فراولة",
      createdAt: new Date(),
    };
    this.products.set(product1Id, product1);

    const product2Id = randomUUID();
    const product2: Product = {
      id: product2Id,
      storeId: storeId,
      name: "عطر صندل سوداني",
      description: "عطر صندل سوداني أصلي من أفضل أنواع الصندل المستخرج من الأشجار السودانية الطبيعية",
      price: "25.00",
      category: "عطور",
      stock: 30,
      weight: null,
      dimensions: null,
      specifications: null,
      tags: null,
      isActive: true,
      image: "https://via.placeholder.com/300x200?text=عطر+صندل",
      createdAt: new Date(),
    };
    this.products.set(product2Id, product2);

    const product3Id = randomUUID();
    const product3: Product = {
      id: product3Id,
      storeId: storeId,
      name: "دكركة طيبش",
      description: "دكركة طيبش أصلية مصنوعة بالطريقة التقليدية السودانية من أجود أنواع البخور والطيب",
      price: "15.00",
      category: "بخور",
      stock: 20,
      weight: null,
      dimensions: null,
      specifications: null,
      tags: null,
      isActive: true,
      image: "https://via.placeholder.com/300x200?text=دكركة+طيبش",
      createdAt: new Date(),
    };
    this.products.set(product3Id, product3);

    // Create demo orders
    for (let i = 1; i <= 5; i++) {
      const orderId = randomUUID();
      const order: Order = {
        id: orderId,
        orderNumber: `ORD-00${i}`,
        customerId: randomUUID(),
        storeId: storeId,
        status: i === 1 ? "pending" : i === 2 ? "confirmed" : i === 3 ? "shipped" : "delivered",
        totalAmount: (Math.random() * 200 + 50).toFixed(2),
        items: [{ productId: randomUUID(), quantity: Math.floor(Math.random() * 3) + 1, price: "25.00" }],
        shippingAddress: { city: "الرياض", country: "السعودية" },
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      };
      this.orders.set(orderId, order);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getStore(id: string): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoresByOwner(ownerId: string): Promise<Store[]> {
    return Array.from(this.stores.values()).filter(store => store.ownerId === ownerId);
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = randomUUID();
    const store: Store = { 
      ...insertStore, 
      id, 
      createdAt: new Date() 
    };
    this.stores.set(id, store);
    return store;
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<Store | undefined> {
    const store = this.stores.get(id);
    if (!store) return undefined;
    
    const updatedStore = { ...store, ...updates };
    this.stores.set(id, updatedStore);
    return updatedStore;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.storeId === storeId);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: new Date() 
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.customerId === customerId);
  }

  async getOrdersByStore(storeId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.storeId === storeId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const orderNumber = `ORD-${String(this.orders.size + 1).padStart(3, '0')}`;
    const order: Order = { 
      ...insertOrder, 
      id, 
      orderNumber,
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
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
      const orders = await this.getOrdersByStore(storeId);
      const products = await this.getProductsByStore(storeId);
      
      totalOrders += orders.length;
      totalProducts += products.length;
      totalSales += orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    }
    
    return {
      totalViews: 2340,
      totalSales: `$${totalSales.toFixed(2)}`,
      totalOrders,
      totalProducts,
    };
  }
}

export const storage = new MemStorage();
