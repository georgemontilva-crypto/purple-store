import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db helpers
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getUserByEmail: vi.fn(),
    createLocalUser: vi.fn(),
    createEmailVerification: vi.fn(),
    getLatestVerification: vi.fn(),
    markVerificationUsed: vi.fn(),
    verifyUserEmail: vi.fn(),
    getUserById: vi.fn(),
  };
});

// Mock email
vi.mock("./email", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue({ previewUrl: "https://ethereal.email/test" }),
}));

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

import * as db from "./db";
import bcrypt from "bcryptjs";

function createCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  const cookies: Record<string, string> = {};
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies,
    } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

describe("customAuth.register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a user and sends verification email", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue(null);
    vi.mocked(db.createLocalUser).mockResolvedValue({
      id: 1, name: "Test", email: "test@test.com", role: "user",
      openId: "local_1", passwordHash: "hashed", isVerified: false,
      loginMethod: "email", phone: null, address: null, city: null, country: null,
      verifiedAt: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    });
    vi.mocked(db.createEmailVerification).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(createCtx());
    const result = await caller.customAuth.register({
      name: "Test User",
      email: "test@test.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.previewUrl).toBeDefined();
    expect(db.getUserByEmail).toHaveBeenCalledWith("test@test.com");
    expect(db.createLocalUser).toHaveBeenCalled();
    expect(db.createEmailVerification).toHaveBeenCalled();
  });

  it("throws CONFLICT if email already exists", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue({
      id: 1, name: "Existing", email: "test@test.com", role: "user",
      openId: "local_1", passwordHash: "hashed", isVerified: true,
      loginMethod: "email", phone: null, address: null, city: null, country: null,
      verifiedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    });

    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.customAuth.register({ name: "Test", email: "test@test.com", password: "password123" })
    ).rejects.toThrow("Ya existe una cuenta con ese email");
  });
});

describe("customAuth.verifyPin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("verifies pin and creates session", async () => {
    const futureDate = new Date(Date.now() + 10 * 60 * 1000);
    vi.mocked(db.getLatestVerification).mockResolvedValue({
      id: 1, email: "test@test.com", pin: "123456", used: false,
      expiresAt: futureDate, createdAt: new Date(),
    });
    vi.mocked(db.markVerificationUsed).mockResolvedValue(undefined);
    vi.mocked(db.verifyUserEmail).mockResolvedValue({
      id: 1, name: "Test", email: "test@test.com", role: "user",
      openId: "local_1", passwordHash: "hashed", isVerified: true,
      loginMethod: "email", phone: null, address: null, city: null, country: null,
      verifiedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    });

    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.customAuth.verifyPin({ email: "test@test.com", pin: "123456" });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe("test@test.com");
    expect(db.markVerificationUsed).toHaveBeenCalledWith(1);
    expect(db.verifyUserEmail).toHaveBeenCalledWith("test@test.com");
  });

  it("throws BAD_REQUEST for wrong pin", async () => {
    const futureDate = new Date(Date.now() + 10 * 60 * 1000);
    vi.mocked(db.getLatestVerification).mockResolvedValue({
      id: 1, email: "test@test.com", pin: "999999", used: false,
      expiresAt: futureDate, createdAt: new Date(),
    });

    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.customAuth.verifyPin({ email: "test@test.com", pin: "123456" })
    ).rejects.toThrow("Código incorrecto");
  });
});

describe("customAuth.login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("logs in with correct credentials", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue({
      id: 1, name: "Test", email: "test@test.com", role: "user",
      openId: "local_1", passwordHash: "hashed_password", isVerified: true,
      loginMethod: "email", phone: null, address: null, city: null, country: null,
      verifiedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.customAuth.login({ email: "test@test.com", password: "password123" });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe("test@test.com");
  });

  it("throws FORBIDDEN if email not verified", async () => {
    vi.mocked(db.getUserByEmail).mockResolvedValue({
      id: 1, name: "Test", email: "test@test.com", role: "user",
      openId: "local_1", passwordHash: "hashed_password", isVerified: false,
      loginMethod: "email", phone: null, address: null, city: null, country: null,
      verifiedAt: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    });

    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.customAuth.login({ email: "test@test.com", password: "password123" })
    ).rejects.toThrow("verificar");
  });
});

describe("customAuth.logout", () => {
  it("clears the custom_session cookie", async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.customAuth.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalledWith("custom_session", expect.objectContaining({ maxAge: -1 }));
  });
});
