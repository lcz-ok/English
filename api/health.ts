// Ping / health endpoint. Useful to verify the deployment is live.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors, jsonOk } from "../lib-server/shared";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  return jsonOk(cors(res), {
    service: "LinguaVerse Cloud",
    time: new Date().toISOString(),
    kvAvailable: process.env.KV_ENABLED === "1",
  });
}
