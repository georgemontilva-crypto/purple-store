import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { parse as parseCookies } from "cookie";
import { jwtVerify } from "jose";
import * as db from "../db";
import { ENV } from "./env";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Try OAuth session first
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    // fall through to custom auth
  }

  // Fall back to custom session cookie
  if (!user) {
    try {
      const cookies = parseCookies(opts.req.headers.cookie ?? "");
      const token = cookies.custom_session;
      if (token) {
        const secret = new TextEncoder().encode(ENV.cookieSecret + "_custom");
        const { payload } = await jwtVerify(token, secret);
        if (payload.type === "custom" && payload.sub) {
          user = await db.getUserById(parseInt(payload.sub as string)) ?? null;
        }
      }
    } catch {
      user = null;
    }
  }

  return { req: opts.req, res: opts.res, user };
}
