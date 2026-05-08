/**
 * Storage helpers — supports two backends:
 *  1. Manus Forge (default on Manus hosting): uses BUILT_IN_FORGE_API_KEY
 *  2. Cloudflare R2 (Railway / external hosting): uses R2_* env vars
 *
 * The backend is chosen automatically at runtime based on which env vars are set.
 * URLs returned:
 *  - Forge: /manus-storage/{key}  (proxied by storageProxy.ts)
 *  - R2:    {R2_PUBLIC_URL}/{key} (served directly from R2 public bucket)
 */

import { ENV } from "./_core/env";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── Backend detection ────────────────────────────────────────────────────────

function useR2(): boolean {
  return !!(ENV.r2AccessKeyId && ENV.r2SecretAccessKey && ENV.r2BucketName && ENV.r2AccountId);
}

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${ENV.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ENV.r2AccessKeyId,
      secretAccessKey: ENV.r2SecretAccessKey,
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

// ─── storagePut ───────────────────────────────────────────────────────────────

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));

  if (useR2()) {
    // ── Cloudflare R2 path ──
    const client = getR2Client();
    const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data as any);

    await client.send(
      new PutObjectCommand({
        Bucket: ENV.r2BucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    const publicBase = ENV.r2PublicUrl.replace(/\/+$/, "");
    return { key, url: `${publicBase}/${key}` };
  }

  // ── Manus Forge path ──
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;

  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set either R2_* vars or BUILT_IN_FORGE_API_URL + BUILT_IN_FORGE_API_KEY",
    );
  }

  const presignUrl = new URL("v1/storage/presign/put", forgeUrl.replace(/\/+$/, "") + "/");
  presignUrl.searchParams.set("path", key);

  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }

  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");

  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });

  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }

  return { key, url: `/manus-storage/${key}` };
}

// ─── storageGet ───────────────────────────────────────────────────────────────

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  if (useR2()) {
    const publicBase = ENV.r2PublicUrl.replace(/\/+$/, "");
    return { key, url: `${publicBase}/${key}` };
  }

  return { key, url: `/manus-storage/${key}` };
}

// ─── storageGetSignedUrl ──────────────────────────────────────────────────────

export async function storageGetSignedUrl(relKey: string, expiresIn = 3600): Promise<string> {
  const key = normalizeKey(relKey);

  if (useR2()) {
    const client = getR2Client();
    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: ENV.r2BucketName, Key: key }),
      { expiresIn },
    );
  }

  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;

  if (!forgeUrl || !forgeKey) {
    throw new Error("Storage config missing");
  }

  const getUrl = new URL("v1/storage/presign/get", forgeUrl.replace(/\/+$/, "") + "/");
  getUrl.searchParams.set("path", key);

  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
  }

  const { url } = (await resp.json()) as { url: string };
  return url;
}
