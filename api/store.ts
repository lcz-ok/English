// Single-key cloud store endpoint.
// GET  /api/store?key=users
// POST /api/store   body: { key, value }
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors, handleOptions, jsonError, jsonOk, readBucket, writeBucket } from "../lib-server/shared";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (handleOptions(req, res)) return;

  if (req.method === "GET") {
    const key = typeof req.query.key === "string" ? req.query.key : "";
    if (!key) return jsonError(res, 400, "missing key");
    const value = await readBucket<unknown>(key, null);
    return jsonOk(res, { key, value });
  }

  if (req.method === "POST") {
    const body = (req.body ?? {}) as { key?: string; value?: unknown };
    if (!body.key || typeof body.key !== "string") {
      return jsonError(res, 400, "missing key");
    }
    await writeBucket(body.key, body.value ?? null);
    return jsonOk(res, { key: body.key, saved: true });
  }

  return jsonError(res, 405, "method not allowed");
}
