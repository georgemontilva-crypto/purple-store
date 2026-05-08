import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import * as db from "./db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "./email";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Categories Router ────────────────────────────────────────────────────────
const categoriesRouter = router({
  list: publicProcedure.query(() => db.getCategories()),
  featured: publicProcedure.query(() => db.getFeaturedCategories()),
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) =>
    db.getCategoryBySlug(input.slug)
  ),
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        featured: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(({ input }) => db.createCategory(input)),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        featured: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateCategory(id, data);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteCategory(input.id)),
});

// ─── Products Router ──────────────────────────────────────────────────────────
const productsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        page: z.number().optional(),
        limit: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => db.getProducts({ ...input, active: true })),
  adminList: adminProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        page: z.number().optional(),
        limit: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => db.getProducts({ ...input })),
  featured: publicProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => db.getFeaturedProducts(input?.limit)),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => db.getProductBySlug(input.slug)),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getProductById(input.id)),
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        price: z.string(),
        comparePrice: z.string().optional(),
        stock: z.number().optional(),
        categoryId: z.number().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        images: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        active: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(({ input }) => db.createProduct(input)),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        comparePrice: z.string().optional(),
        stock: z.number().optional(),
        categoryId: z.number().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        images: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        active: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateProduct(id, data);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteProduct(input.id)),
});

// ─── Orders Router ────────────────────────────────────────────────────────────
const ordersRouter = router({
  list: adminProcedure
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => db.getOrders(input)),
  byId: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      const items = await db.getOrderItems(input.id);
      return { ...order, items };
    }),
  byNumber: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const order = await db.getOrderByNumber(input.orderNumber);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      const items = await db.getOrderItems(order.id);
      return { ...order, items };
    }),
  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(({ input }) => db.updateOrderStatus(input.id, input.status)),
  create: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        guestEmail: z.string().email(),
        guestName: z.string().min(1),
        guestPhone: z.string().optional(),
        shippingAddress: z.string().min(1),
        shippingCity: z.string().min(1),
        shippingCountry: z.string().min(1),
        shippingZip: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cartData = await db.getCartItems(input.sessionId);
      if (!cartData.length) throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });

      const productIds = cartData.map((c) => c.productId);
      const productList = await Promise.all(productIds.map((id) => db.getProductById(id)));

      const items = cartData.map((cartItem) => {
        const product = productList.find((p) => p?.id === cartItem.productId);
        if (!product) throw new TRPCError({ code: "BAD_REQUEST", message: "Product not found" });
        const price = parseFloat(product.price);
        const subtotal = price * cartItem.quantity;
        return {
          productId: product.id,
          productName: product.name,
          productImage: product.imageUrl ?? undefined,
          price: price.toFixed(2),
          quantity: cartItem.quantity,
          subtotal: subtotal.toFixed(2),
        };
      });

      const subtotal = items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
      const shipping = 0;
      const total = subtotal + shipping;
      const orderNumber = `ORD-${Date.now()}-${nanoid(4).toUpperCase()}`;

      const order = await db.createOrder(
        {
          orderNumber,
          userId: ctx.user?.id,
          guestEmail: input.guestEmail,
          guestName: input.guestName,
          guestPhone: input.guestPhone,
          subtotal: subtotal.toFixed(2),
          shipping: shipping.toFixed(2),
          total: total.toFixed(2),
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingCountry: input.shippingCountry,
          shippingZip: input.shippingZip,
          notes: input.notes,
        },
        items
      );

      await db.clearCart(input.sessionId);
      return order;
    }),
});

// ─── Cart Router ──────────────────────────────────────────────────────────────
const cartRouter = router({
  get: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const items = await db.getCartItems(input.sessionId);
      const productList = await Promise.all(
        items.map((item) => db.getProductById(item.productId))
      );
      return items.map((item) => ({
        ...item,
        product: productList.find((p) => p?.id === item.productId) ?? null,
      }));
    }),
  upsert: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        productId: z.number(),
        quantity: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      if (input.quantity === 0) {
        await db.removeCartItem(input.sessionId, input.productId);
      } else {
        await db.upsertCartItem(input.sessionId, input.productId, input.quantity);
      }
      return { success: true };
    }),
  remove: publicProcedure
    .input(z.object({ sessionId: z.string(), productId: z.number() }))
    .mutation(({ input }) => db.removeCartItem(input.sessionId, input.productId)),
  clear: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(({ input }) => db.clearCart(input.sessionId)),
});

// ─── Content Router ───────────────────────────────────────────────────────────
const contentRouter = router({
  get: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(({ input }) => db.getSiteContent(input.key)),
  getAll: publicProcedure.query(() => db.getAllSiteContent()),
  set: adminProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.enum(["text", "image", "json", "html"]).optional(),
        label: z.string().optional(),
      })
    )
    .mutation(({ input }) => db.setSiteContent(input.key, input.value, input.type, input.label)),
  setBulk: adminProcedure
    .input(
      z.array(
        z.object({
          key: z.string(),
          value: z.string(),
          type: z.enum(["text", "image", "json", "html"]).optional(),
          label: z.string().optional(),
        })
      )
    )
    .mutation(async ({ input }) => {
      await Promise.all(
        input.map((item) => db.setSiteContent(item.key, item.value, item.type, item.label))
      );
      return { success: true };
    }),
});

// ─── FAQs Router ──────────────────────────────────────────────────────────────
const faqsRouter = router({
  list: publicProcedure.query(() => db.getFaqs(true)),
  adminList: adminProcedure.query(() => db.getFaqs(false)),
  create: adminProcedure
    .input(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
        sortOrder: z.number().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => db.createFaq(input)),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        question: z.string().optional(),
        answer: z.string().optional(),
        sortOrder: z.number().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateFaq(id, data);
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteFaq(input.id)),
});

// ─── Contact Router ───────────────────────────────────────────────────────────
const contactRouter = router({
  send: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().optional(),
        message: z.string().min(1),
      })
    )
    .mutation(({ input }) => db.createContactMessage(input)),
  list: adminProcedure
    .input(z.object({ page: z.number().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => db.getContactMessages(input?.page, input?.limit)),
  markRead: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.markMessageRead(input.id)),
});

// ─── Customers Router ─────────────────────────────────────────────────────────
const customersRouter = router({
  list: adminProcedure
    .input(z.object({ page: z.number().optional(), limit: z.number().optional() }).optional())
    .query(({ input }) => db.getAllUsers(input?.page, input?.limit)),
});

// ─── Upload Router ────────────────────────────────────────────────────────────
const uploadRouter = router({
  image: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        data: z.string(), // base64
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.data, "base64");
      const key = `uploads/${nanoid()}-${input.filename}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url, key };
    }),
});

// ─── Dashboard Router ─────────────────────────────────────────────────────────
const dashboardRouter = router({
  stats: adminProcedure.query(() => db.getDashboardStats()),
  recentOrders: adminProcedure.query(() => db.getOrders({ page: 1, limit: 5 })),
});
// ─── Custom Auth Router ─────────────────────────────────────────────────────────────────────────────────
function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createCustomSession(userId: number, res: any, req: any) {
  const secret = new TextEncoder().encode(ENV.cookieSecret + "_custom");
  const token = await new SignJWT({ sub: String(userId), type: "custom" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie("custom_session", token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
}

const customAuthRouter = router({
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
      email: z.string().email("Email inválido"),
      password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    }))
    .mutation(async ({ input }) => {
      const existing = await db.getUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Ya existe una cuenta con ese email" });
      }
      const passwordHash = await bcrypt.hash(input.password, 12);
      await db.createLocalUser({ name: input.name, email: input.email, passwordHash });
      const pin = generatePin();
      await db.createEmailVerification(input.email, pin);
      const result = await sendVerificationEmail(input.email, input.name, pin);
      return { success: true, previewUrl: result.previewUrl };
    }),

  verifyPin: publicProcedure
    .input(z.object({
      email: z.string().email(),
      pin: z.string().length(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const verification = await db.getLatestVerification(input.email);
      if (!verification) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No hay un código pendiente para este email" });
      }
      if (verification.used) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este código ya fue usado" });
      }
      if (new Date() > verification.expiresAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "El código ha expirado. Solicita uno nuevo" });
      }
      if (verification.pin !== input.pin) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Código incorrecto" });
      }
      await db.markVerificationUsed(verification.id);
      const user = await db.verifyUserEmail(input.email);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado" });
      await createCustomSession(user.id, ctx.res, ctx.req);
      return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email o contraseña incorrectos" });
      }
      if (!user.isVerified) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Debes verificar tu email antes de iniciar sesión" });
      }
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email o contraseña incorrectos" });
      }
      await createCustomSession(user.id, ctx.res, ctx.req);
      return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }),

  resendPin: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "No existe cuenta con ese email" });
      if (user.isVerified) throw new TRPCError({ code: "BAD_REQUEST", message: "Esta cuenta ya está verificada" });
      const pin = generatePin();
      await db.createEmailVerification(input.email, pin);
      const result = await sendVerificationEmail(input.email, user.name ?? "Usuario", pin);
      return { success: true, previewUrl: result.previewUrl };
    }),

  me: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.req.cookies?.custom_session;
    if (!token) return null;
    try {
      const secret = new TextEncoder().encode(ENV.cookieSecret + "_custom");
      const { payload } = await jwtVerify(token, secret);
      if (payload.type !== "custom" || !payload.sub) return null;
      const user = await db.getUserById(parseInt(payload.sub));
      if (!user) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified };
    } catch {
      return null;
    }
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie("custom_session", { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ─── App Router ─────────────────────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  categories: categoriesRouter,
  products: productsRouter,
  orders: ordersRouter,
  cart: cartRouter,
  content: contentRouter,
  faqs: faqsRouter,
  contact: contactRouter,
  customers: customersRouter,
  upload: uploadRouter,
  dashboard: dashboardRouter,
  customAuth: customAuthRouter,
});

export type AppRouter = typeof appRouter;
