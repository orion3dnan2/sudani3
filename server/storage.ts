import { type User, type InsertUser, type Store, type InsertStore, type Product, type InsertProduct, type Order, type InsertOrder, type Restaurant, type InsertRestaurant, type Job, type InsertJob, type Ad, type InsertAd } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Store operations
  getStore(id: string): Promise<Store | undefined>;
  getStoresByOwner(ownerId: string): Promise<Store[]>;
  getAllStores(filters?: { category?: string; search?: string; city?: string }): Promise<(Store & { owner: { fullName: string; city: string } })[]>;
  getAllStoresWithOwners(): Promise<(Store & { owner: { fullName: string; city: string; email: string; phone: string } })[]>;
  getStoreById(id: string): Promise<(Store & { owner: { fullName: string; city: string; phone: string } }) | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, updates: Partial<Store>): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;
  
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
  
  // Restaurant operations
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | undefined>;
  
  // Job operations
  getJob(id: string): Promise<Job | undefined>;
  getJobs(): Promise<Job[]>;
  getJobsByPoster(posterId: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined>;
  
  // Ad operations
  getAd(id: string): Promise<Ad | undefined>;
  getAds(): Promise<Ad[]>;
  getAdsByPoster(posterId: string): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: string, updates: Partial<Ad>): Promise<Ad | undefined>;
  
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
  private restaurants: Map<string, Restaurant>;
  private jobs: Map<string, Job>;
  private ads: Map<string, Ad>;

  constructor() {
    this.users = new Map();
    this.stores = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.restaurants = new Map();
    this.jobs = new Map();
    this.ads = new Map();
    
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

    // Create demo merchant user with fixed ID
    const merchantId = "109fb3f0-f57b-4976-8d9b-07e9d91eedae"; // Fixed ID to match login
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

    // Create demo restaurants
    const restaurants = [
      {
        name: "مطعم الشارقة السوداني",
        description: "أشهى المأكولات السودانية التقليدية",
        cuisine: "سوداني",
        address: "شارع الملك فهد، الرياض",
        phone: "+966501234567",
        email: "sharqa@restaurants.com",
        rating: "4.5",
        openHours: "12:00 ص - 11:00 م",
        deliveryPrice: "10.00",
        minOrderAmount: "30.00",
        image: "https://via.placeholder.com/400x300?text=مطعم+الشارقة",
        ownerId: merchantId
      },
      {
        name: "مطعم النيل الأزرق",
        description: "مطعم متخصص في الأسماك والمشاوي السودانية",
        cuisine: "مشاوي",
        address: "حي العليا، الرياض",
        phone: "+966501234568",
        email: "bluenile@restaurants.com",
        rating: "4.2",
        openHours: "2:00 ص - 12:00 ص",
        deliveryPrice: "15.00",
        minOrderAmount: "50.00",
        image: "https://via.placeholder.com/400x300?text=مطعم+النيل+الأزرق",
        ownerId: adminId
      },
      {
        name: "مطعم دار السلام",
        description: "مطعم عائلي يقدم أفضل الأطباق السودانية",
        cuisine: "عائلي",
        address: "شارع التحلية، جدة",
        phone: "+966501234569",
        email: "darsalam@restaurants.com",
        rating: "4.8",
        openHours: "11:00 ص - 11:30 م", 
        deliveryPrice: "12.00",
        minOrderAmount: "40.00",
        image: "https://via.placeholder.com/400x300?text=مطعم+دار+السلام",
        ownerId: merchantId
      }
    ];

    restaurants.forEach(restaurant => {
      const restaurantId = randomUUID();
      const newRestaurant: Restaurant = {
        id: restaurantId,
        ...restaurant,
        isActive: true,
        createdAt: new Date()
      };
      this.restaurants.set(restaurantId, newRestaurant);
    });

    // Create demo jobs
    const jobs = [
      {
        title: "مطور تطبيقات جوال",
        description: "مطلوب مطور تطبيقات جوال للعمل في شركة تقنية رائدة. الخبرة في React Native وFlutter مطلوبة.",
        company: "شركة التقنيات المتقدمة",
        location: "الرياض، السعودية",
        jobType: "full-time",
        category: "تقنية المعلومات",
        salary: "8000 - 12000 ريال",
        requirements: "خبرة 3 سنوات في تطوير التطبيقات، إتقان React Native أو Flutter، معرفة بـ JavaScript/TypeScript",
        benefits: "راتب مجزي، تأمين صحي، إجازات مدفوعة",
        contactEmail: "jobs@techcompany.com",
        contactPhone: "+966501234567",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        posterId: adminId
      },
      {
        title: "مسؤول خدمة عملاء",
        description: "مطلوب مسؤول خدمة عملاء للعمل في مركز اتصالات. يفضل الخبرة في خدمة العملاء.",
        company: "مركز الاتصالات الرقمي",
        location: "جدة، السعودية",
        jobType: "full-time",
        category: "خدمة عملاء",
        salary: "4000 - 6000 ريال",
        requirements: "خبرة سنة على الأقل، مهارات تواصل ممتازة، إتقان اللغة العربية والإنجليزية",
        benefits: "راتب أساسي + عمولات، تأمين طبي",
        contactEmail: "hr@callcenter.com",
        contactPhone: "+966501234568",
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        posterId: merchantId
      },
      {
        title: "محاسب مالي",
        description: "مطلوب محاسب مالي للعمل في شركة تجارية كبيرة. الخبرة في الأنظمة المحاسبية مطلوبة.",
        company: "الشركة التجارية الكبرى",
        location: "الدمام، السعودية",
        jobType: "full-time",
        category: "محاسبة ومالية",
        salary: "6000 - 9000 ريال",
        requirements: "شهادة محاسبة، خبرة 2-4 سنوات، معرفة بأنظمة ERP",
        benefits: "راتب ثابت، بدلات، تأمين شامل",
        contactEmail: "accounting@trading.com",
        contactPhone: "+966501234569",
        expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        posterId: adminId
      }
    ];

    jobs.forEach(job => {
      const jobId = randomUUID();
      const newJob: Job = {
        id: jobId,
        ...job,
        isActive: true,
        createdAt: new Date()
      };
      this.jobs.set(jobId, newJob);
    });

    // Create demo ads
    const ads = [
      {
        title: "شقة للإيجار في الرياض",
        description: "شقة مفروشة 3 غرف نوم، 2 حمام، صالة، مطبخ في حي الملقا. قريبة من الخدمات والمواصلات.",
        category: "عقارات",
        type: "rent",
        price: "2500.00",
        location: "الرياض - حي الملقا",
        contactName: "أحمد السعد",
        contactPhone: "+966501234570",
        contactEmail: "ahmed.saad@email.com",
        images: ["https://via.placeholder.com/400x300?text=شقة+للإيجار"],
        isPremium: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        posterId: merchantId
      },
      {
        title: "سيارة كامري 2020 للبيع",
        description: "تويوتا كامري 2020، لون أبيض، ماشية 50,000 كم، حالة ممتازة، فحص شامل، سعر قابل للتفاوض.",
        category: "سيارات",
        type: "sale",
        price: "65000.00",
        location: "جدة - حي السلامة",
        contactName: "محمد عبدالله",
        contactPhone: "+966501234571",
        contactEmail: "mohammed.a@email.com",
        images: ["https://via.placeholder.com/400x300?text=كامري+2020"],
        isPremium: false,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        posterId: adminId
      },
      {
        title: "خدمات صيانة أجهزة كهربائية",
        description: "نقدم خدمات صيانة وإصلاح الأجهزة الكهربائية المنزلية. خبرة 10 سنوات، ضمان على الخدمة، أسعار مناسبة.",
        category: "خدمات",
        type: "service",
        price: null,
        location: "الدمام",
        contactName: "فني الأجهزة",
        contactPhone: "+966501234572",
        contactEmail: "repair.service@email.com",
        images: ["https://via.placeholder.com/400x300?text=صيانة+أجهزة"],
        isPremium: false,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        posterId: merchantId
      },
      {
        title: "لابتوب ديل للبيع",
        description: "لابتوب ديل انسبايرون 15، معالج i7، ذاكرة 16GB، قرص SSD 512GB، كارت شاشة منفصل، حالة ممتازة.",
        category: "إلكترونيات",
        type: "sale",
        price: "3200.00",
        location: "المدينة المنورة",
        contactName: "سارة محمد",
        contactPhone: "+966501234573",
        contactEmail: "sara.m@email.com",
        images: ["https://via.placeholder.com/400x300?text=لابتوب+ديل"],
        isPremium: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        posterId: adminId
      },
      {
        title: "أبحث عن مدرس خصوصي",
        description: "أبحث عن مدرس خصوصي لمادة الرياضيات للمرحلة الثانوية، يفضل أن يكون متخصص وذو خبرة.",
        category: "خدمات",
        type: "wanted",
        price: null,
        location: "مكة المكرمة",
        contactName: "أم عبدالرحمن",
        contactPhone: "+966501234574",
        contactEmail: null,
        images: [],
        isPremium: false,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        posterId: merchantId
      }
    ];

    ads.forEach(ad => {
      const adId = randomUUID();
      const newAd: Ad = {
        id: adId,
        ...ad,
        isActive: true,
        createdAt: new Date()
      };
      this.ads.set(adId, newAd);
    });
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
      phone: insertUser.phone ?? null,
      country: insertUser.country ?? null,
      city: insertUser.city ?? null,
      role: insertUser.role ?? "customer",
      isActive: insertUser.isActive ?? true,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getStore(id: string): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoresByOwner(ownerId: string): Promise<Store[]> {
    return Array.from(this.stores.values()).filter(store => store.ownerId === ownerId);
  }

  async getAllStores(filters?: { category?: string; search?: string; city?: string }): Promise<(Store & { owner: { fullName: string; city: string } })[]> {
    const stores = Array.from(this.stores.values()).filter(store => store.isActive);
    const storesWithOwners = stores.map(store => {
      const owner = this.users.get(store.ownerId);
      return {
        ...store,
        owner: {
          fullName: owner?.fullName || '',
          city: owner?.city || ''
        }
      };
    });

    let filteredStores = storesWithOwners;
    
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
    const store = this.stores.get(id);
    if (!store) return undefined;
    
    const owner = this.users.get(store.ownerId);
    return {
      ...store,
      owner: {
        fullName: owner?.fullName || '',
        city: owner?.city || '',
        phone: owner?.phone || ''
      }
    };
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = randomUUID();
    const store: Store = { 
      ...insertStore, 
      id, 
      description: insertStore.description ?? null,
      isActive: insertStore.isActive ?? true,
      settings: insertStore.settings ?? {},
      createdAt: new Date() 
    };
    this.stores.set(id, store);
    return store;
  }

  async getAllStoresWithOwners(): Promise<(Store & { owner: { fullName: string; city: string; email: string; phone: string } })[]> {
    const stores = Array.from(this.stores.values());
    const storesWithOwners = stores.map(store => {
      const owner = this.users.get(store.ownerId);
      return {
        ...store,
        owner: {
          fullName: owner?.fullName || '',
          city: owner?.city || '',
          email: owner?.email || '',
          phone: owner?.phone || ''
        }
      };
    });
    return storesWithOwners;
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<Store | undefined> {
    const store = this.stores.get(id);
    if (!store) return undefined;
    
    const updatedStore = { ...store, ...updates };
    this.stores.set(id, updatedStore);
    return updatedStore;
  }

  async deleteStore(id: string): Promise<boolean> {
    return this.stores.delete(id);
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
      description: insertProduct.description ?? null,
      stock: insertProduct.stock ?? 0,
      weight: insertProduct.weight ?? null,
      dimensions: insertProduct.dimensions ?? null,
      specifications: insertProduct.specifications ?? null,
      tags: insertProduct.tags ?? null,
      isActive: insertProduct.isActive ?? true,
      image: insertProduct.image ?? null,
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
      status: insertOrder.status ?? "pending",
      shippingAddress: insertOrder.shippingAddress ?? {},
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

  // Restaurant operations
  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(restaurant => restaurant.isActive);
  }

  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(restaurant => restaurant.ownerId === ownerId);
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = randomUUID();
    const restaurant: Restaurant = {
      ...insertRestaurant,
      id,
      description: insertRestaurant.description ?? null,
      email: insertRestaurant.email ?? null,
      rating: insertRestaurant.rating ?? "0.0",
      image: insertRestaurant.image ?? null,
      openHours: insertRestaurant.openHours ?? null,
      deliveryPrice: insertRestaurant.deliveryPrice ?? "0.00",
      minOrderAmount: insertRestaurant.minOrderAmount ?? "0.00",
      isActive: insertRestaurant.isActive ?? true,
      createdAt: new Date()
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | undefined> {
    const restaurant = this.restaurants.get(id);
    if (!restaurant) return undefined;
    
    const updatedRestaurant = { ...restaurant, ...updates };
    this.restaurants.set(id, updatedRestaurant);
    return updatedRestaurant;
  }

  // Job operations
  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.isActive);
  }

  async getJobsByPoster(posterId: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.posterId === posterId);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      salary: insertJob.salary ?? null,
      benefits: insertJob.benefits ?? null,
      contactPhone: insertJob.contactPhone ?? null,
      isActive: insertJob.isActive ?? true,
      expiresAt: insertJob.expiresAt ?? null,
      createdAt: new Date()
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  // Ad operations
  async getAd(id: string): Promise<Ad | undefined> {
    return this.ads.get(id);
  }

  async getAds(): Promise<Ad[]> {
    return Array.from(this.ads.values()).filter(ad => ad.isActive);
  }

  async getAdsByPoster(posterId: string): Promise<Ad[]> {
    return Array.from(this.ads.values()).filter(ad => ad.posterId === posterId);
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const id = randomUUID();
    const ad: Ad = {
      ...insertAd,
      id,
      price: insertAd.price ?? null,
      location: insertAd.location ?? null,
      contactEmail: insertAd.contactEmail ?? null,
      images: insertAd.images ?? [],
      isActive: insertAd.isActive ?? true,
      isPremium: insertAd.isPremium ?? false,
      expiresAt: insertAd.expiresAt ?? null,
      createdAt: new Date()
    };
    this.ads.set(id, ad);
    return ad;
  }

  async updateAd(id: string, updates: Partial<Ad>): Promise<Ad | undefined> {
    const ad = this.ads.get(id);
    if (!ad) return undefined;
    
    const updatedAd = { ...ad, ...updates };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }
}

// Use Database Storage since we have DATABASE_URL
import { DatabaseStorage } from './db-storage';
export const storage = new DatabaseStorage();
