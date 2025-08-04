import { db } from "./server/db";
import { users, stores, products, orders, restaurants, jobs, ads } from "./shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(orders);
  await db.delete(products);
  await db.delete(stores);
  await db.delete(restaurants);
  await db.delete(jobs);
  await db.delete(ads);
  await db.delete(users);

  // Create demo admin user
  const [adminUser] = await db.insert(users).values({
    username: "admin",
    email: "admin@bayt-sudani.com",
    password: "admin123", // In real app, this would be hashed
    fullName: "مدير النظام",
    phone: "+966501234567",
    country: "السعودية",
    city: "الرياض",
    role: "admin",
    isActive: true,
  }).returning();

  // Create demo merchant user with fixed ID
  const [merchantUser] = await db.insert(users).values({
    username: "merchant",
    email: "merchant@bayt-sudani.com",
    password: "merchant123",
    fullName: "أحمد محمد التاجر",
    phone: "+966501234568",
    country: "السعودية",
    city: "جدة",
    role: "merchant",
    isActive: true,
  }).returning();

  // Create demo store for merchant
  const [demoStore] = await db.insert(stores).values({
    name: "رؤل أقلامي",
    description: "متجر متخصص في المنتجات السودانية الأصيلة - حلويات وعطور وبخور",
    ownerId: merchantUser.id,
    isActive: true,
    settings: {
      category: "food-fragrance",
      address: "",
      openTime: "09:00",
      closeTime: "22:00",
      workingDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
    },
  }).returning();

  // Create sample products for the store
  await db.insert(products).values([
    {
      storeId: demoStore.id,
      name: "طلب أقلامي فراولة وسط",
      description: "طلب الأقلامي فراولة وسط أصل من مطعم رؤل أقلامي - فراولة منضوج طازج بالطريقة السودانية التقليدية مع الحلوى",
      price: "8.00",
      category: "حلويات",
      stock: 50,
      isActive: true,
      image: "https://via.placeholder.com/300x200?text=أقلامي+فراولة",
    },
    {
      storeId: demoStore.id,
      name: "عطر صندل سوداني",
      description: "عطر صندل سوداني أصلي من أفضل أنواع الصندل المستخرج من الأشجار السودانية الطبيعية",
      price: "25.00",
      category: "عطور",
      stock: 30,
      isActive: true,
      image: "https://via.placeholder.com/300x200?text=عطر+صندل",
    },
    {
      storeId: demoStore.id,
      name: "دكركة طيبش",
      description: "دكركة طيبش أصلية مصنوعة بالطريقة التقليدية السودانية من أجود أنواع البخور والطيب",
      price: "15.00",
      category: "بخور",
      stock: 20,
      isActive: true,
      image: "https://via.placeholder.com/300x200?text=دكركة+طيبش",
    },
  ]);

  // Create demo restaurants
  await db.insert(restaurants).values([
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
      ownerId: merchantUser.id,
      isActive: true,
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
      ownerId: adminUser.id,
      isActive: true,
    },
  ]);

  // Create demo jobs
  await db.insert(jobs).values([
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
      posterId: adminUser.id,
      isActive: true,
    },
  ]);

  // Create demo ads
  await db.insert(ads).values([
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
      posterId: merchantUser.id,
      isActive: true,
    },
  ]);

  console.log("Database seeded successfully!");
}

seedDatabase().catch(console.error);