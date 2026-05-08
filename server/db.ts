import { and, desc, eq, ilike, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  type InsertUser,
  bannerSlides,
  cartItems,
  categories,
  contactMessages,
  emailVerifications,
  faqs,
  orderItems,
  orders,
  products,
  siteContent,
  users,
  welcomePopup,
  newsletterSubscribers,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getAllUsers(page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  const offset = (page - 1) * limit;
  const [rows, countResult] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(users),
  ]);
  return { users: rows, total: Number(countResult[0]?.count ?? 0) };
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder, categories.name);
}

export async function getFeaturedCategories() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(categories)
    .where(eq(categories.featured, true))
    .orderBy(categories.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  featured?: boolean;
  sortOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(categories).values(data);
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, data.slug))
    .limit(1);
  return result[0];
}

export async function updateCategory(
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    imageKey: string;
    featured: boolean;
    sortOrder: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0];
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProducts(opts?: {
  categoryId?: number;
  search?: string;
  featured?: boolean;
  active?: boolean;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { products: [], total: 0 };

  const { categoryId, search, featured, active = true, page = 1, limit = 20 } = opts ?? {};
  const offset = (page - 1) * limit;

  const conditions = [];
  if (active !== undefined) conditions.push(eq(products.active, active));
  if (categoryId !== undefined) conditions.push(eq(products.categoryId, categoryId));
  if (featured !== undefined) conditions.push(eq(products.featured, featured));
  if (search) {
    conditions.push(
      or(
        like(products.name, `%${search}%`),
        like(products.description, `%${search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where),
  ]);

  return { products: rows, total: Number(countResult[0]?.count ?? 0) };
}

export async function getFeaturedProducts(limit = 8) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(and(eq(products.featured, true), eq(products.active, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: {
  name: string;
  slug: string;
  description?: string;
  price: string;
  comparePrice?: string;
  stock?: number;
  categoryId?: number;
  imageUrl?: string;
  imageKey?: string;
  images?: string[];
  featured?: boolean;
  active?: boolean;
  tags?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(products).values(data as any);
  const result = await db.select().from(products).where(eq(products.slug, data.slug)).limit(1);
  return result[0];
}

export async function updateProduct(
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    price: string;
    comparePrice: string;
    stock: number;
    categoryId: number;
    imageUrl: string;
    imageKey: string;
    images: string[];
    featured: boolean;
    active: boolean;
    tags: string[];
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(products).set(data as any).where(eq(products.id, id));
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(products).where(eq(products.id, id));
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getOrders(opts?: { page?: number; limit?: number; status?: string }) {
  const db = await getDb();
  if (!db) return { orders: [], total: 0 };
  const { page = 1, limit = 20, status } = opts ?? {};
  const offset = (page - 1) * limit;
  const where = status ? eq(orders.status, status as any) : undefined;
  const [rows, countResult] = await Promise.all([
    db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(where),
  ]);
  return { orders: rows, total: Number(countResult[0]?.count ?? 0) };
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result[0];
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrder(
  order: {
    orderNumber: string;
    userId?: number;
    guestEmail?: string;
    guestName?: string;
    guestPhone?: string;
    subtotal: string;
    shipping?: string;
    total: string;
    shippingAddress?: string;
    shippingCity?: string;
    shippingCountry?: string;
    shippingZip?: string;
    notes?: string;
  },
  items: {
    productId: number;
    productName: string;
    productImage?: string;
    price: string;
    quantity: number;
    subtotal: string;
  }[]
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(orders).values(order as any);
  const orderResult = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, order.orderNumber))
    .limit(1);
  const newOrder = orderResult[0];
  if (!newOrder) throw new Error("Order creation failed");
  await db.insert(orderItems).values(items.map((i) => ({ ...i, orderId: newOrder.id })) as any);
  return newOrder;
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export async function getCartItems(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
}

export async function upsertCartItem(sessionId: string, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)))
    .limit(1);
  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)));
  } else {
    await db.insert(cartItems).values({ sessionId, productId, quantity });
  }
}

export async function removeCartItem(sessionId: string, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, productId)));
}

export async function clearCart(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
}

// ─── Site Content ─────────────────────────────────────────────────────────────
export async function getSiteContent(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(siteContent).where(eq(siteContent.key, key)).limit(1);
  return result[0] ?? null;
}

export async function getAllSiteContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteContent).orderBy(siteContent.key);
}

export async function setSiteContent(
  key: string,
  value: string,
  type: "text" | "image" | "json" | "html" = "text",
  label?: string
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .insert(siteContent)
    .values({ key, value, type, label })
    .onDuplicateKeyUpdate({ set: { value, type, ...(label ? { label } : {}) } });
  const result = await db.select().from(siteContent).where(eq(siteContent.key, key)).limit(1);
  return result[0];
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────
export async function getFaqs(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const where = activeOnly ? eq(faqs.active, true) : undefined;
  return db.select().from(faqs).where(where).orderBy(faqs.sortOrder, faqs.createdAt);
}

export async function createFaq(data: {
  question: string;
  answer: string;
  sortOrder?: number;
  active?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(faqs).values(data);
  const result = await db
    .select()
    .from(faqs)
    .orderBy(desc(faqs.createdAt))
    .limit(1);
  return result[0];
}

export async function updateFaq(
  id: number,
  data: Partial<{ question: string; answer: string; sortOrder: number; active: boolean }>
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(faqs).set(data).where(eq(faqs.id, id));
  const result = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  return result[0];
}

export async function deleteFaq(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(faqs).where(eq(faqs.id, id));
}

// ─── Contact Messages ─────────────────────────────────────────────────────────
export async function createContactMessage(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(contactMessages).values(data);
}

export async function getContactMessages(page = 1, limit = 20) {
  const db = await getDb();
  if (!db) return { messages: [], total: 0 };
  const offset = (page - 1) * limit;
  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(contactMessages),
  ]);
  return { messages: rows, total: Number(countResult[0]?.count ?? 0) };
}

export async function markMessageRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(contactMessages).set({ read: true }).where(eq(contactMessages.id, id));
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalCustomers: 0 };
  const [orderStats, productCount, customerCount] = await Promise.all([
    db.select({
      count: sql<number>`count(*)`,
      revenue: sql<number>`COALESCE(SUM(total), 0)`,
    }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(users),
  ]);
  return {
    totalOrders: Number(orderStats[0]?.count ?? 0),
    totalRevenue: Number(orderStats[0]?.revenue ?? 0),
    totalProducts: Number(productCount[0]?.count ?? 0),
    totalCustomers: Number(customerCount[0]?.count ?? 0),
  };
}

// ─── Custom Auth Helpers ──────────────────────────────────────────────────────
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createLocalUser(data: { name: string; email: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const openId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    loginMethod: "email",
    isVerified: false,
    role: "user",
    lastSignedIn: new Date(),
  });
  const result = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  return result[0];
}

export async function verifyUserEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(users).set({ isVerified: true, verifiedAt: new Date() }).where(eq(users.email, email));
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function createEmailVerification(email: string, pin: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await db.insert(emailVerifications).values({ email, pin, expiresAt });
}

export async function getLatestVerification(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.email, email))
    .orderBy(desc(emailVerifications.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function markVerificationUsed(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(emailVerifications).set({ used: true }).where(eq(emailVerifications.id, id));
}

// --- Banner Slides ---
export async function getBannerSlides() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bannerSlides).where(eq(bannerSlides.active, true)).orderBy(bannerSlides.sortOrder);
}
export async function getAllBannerSlides() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bannerSlides).orderBy(bannerSlides.sortOrder);
}
export async function createBannerSlide(data: { url: string; type: "image" | "video"; title?: string; subtitle?: string; sortOrder?: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(bannerSlides).values({ ...data, sortOrder: data.sortOrder ?? 0 });
}
export async function updateBannerSlide(id: number, data: Partial<{ url: string; type: "image" | "video"; title: string; subtitle: string; sortOrder: number; active: boolean }>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(bannerSlides).set(data).where(eq(bannerSlides.id, id));
}
export async function deleteBannerSlide(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(bannerSlides).where(eq(bannerSlides.id, id));
}

// --- Welcome Popup ---
export async function getWelcomePopup() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(welcomePopup).limit(1);
  return rows[0] ?? null;
}
export async function upsertWelcomePopup(data: Partial<{
  title: string; subtitle: string; body: string; imageUrl: string;
  buttonText: string; buttonUrl: string; showNewsletter: boolean;
  active: boolean; delaySeconds: number; showOnce: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select().from(welcomePopup).limit(1);
  if (existing.length > 0) {
    await db.update(welcomePopup).set(data).where(eq(welcomePopup.id, existing[0].id));
  } else {
    await db.insert(welcomePopup).values({
      title: data.title ?? "¡Bienvenida a BoraHae Art!",
      ...data,
    });
  }
  const rows = await db.select().from(welcomePopup).limit(1);
  return rows[0] ?? null;
}

// --- Newsletter Subscribers ---
export async function subscribeNewsletter(email: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // Upsert: si ya existe, reactivar
  const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email)).limit(1);
  if (existing.length > 0) {
    await db.update(newsletterSubscribers).set({ active: true, name: name ?? existing[0].name }).where(eq(newsletterSubscribers.email, email));
    return { alreadySubscribed: true };
  }
  await db.insert(newsletterSubscribers).values({ email, name: name ?? null });
  return { alreadySubscribed: false };
}
export async function getNewsletterSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.active, true)).orderBy(desc(newsletterSubscribers.subscribedAt));
}
export async function deleteNewsletterSubscriber(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(newsletterSubscribers).set({ active: false }).where(eq(newsletterSubscribers.id, id));
}
