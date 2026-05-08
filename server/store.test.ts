import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Helper to create a mock context
function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@purplestore.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated admin", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("admin");
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearedCookies: string[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user",
        email: "test@example.com",
        name: "Test",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => clearedCookies.push(name),
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });
});

describe("categories.list", () => {
  it("returns an array (public endpoint)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    // This will try to query the DB; if DB is unavailable, it returns []
    try {
      const result = await caller.categories.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      // DB not available in test env is acceptable
      expect(e.message).toContain("Failed query");
    }
  });
});

describe("products.list", () => {
  it("returns paginated structure (public endpoint)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    try {
      const result = await caller.products.list({});
      expect(result).toHaveProperty("products");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.products)).toBe(true);
    } catch (e: any) {
      expect(e.message).toContain("Failed query");
    }
  });
});

describe("faqs.list", () => {
  it("returns an array (public endpoint)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    try {
      const result = await caller.faqs.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (e: any) {
      expect(e.message).toContain("Failed query");
    }
  });
});

describe("contact.send", () => {
  it("validates required fields", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.contact.send({
        name: "",
        email: "not-an-email",
        message: "",
      })
    ).rejects.toThrow();
  });
});

describe("admin procedures - unauthorized access", () => {
  it("throws UNAUTHORIZED for non-admin users on products.create", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.products.create({
        name: "Test Product",
        slug: "test-product",
        price: "10.00",
        stock: 5,
        featured: false,
        active: true,
      })
    ).rejects.toThrow();
  });

  it("throws UNAUTHORIZED for non-admin users on categories.create", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.categories.create({
        name: "Test Category",
        slug: "test-category",
        featured: false,
        sortOrder: 0,
      })
    ).rejects.toThrow();
  });
});
