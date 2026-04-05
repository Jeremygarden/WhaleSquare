import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetch13F } from "../../server/edgarProxy";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cik = Array.isArray(req.query.cik) ? req.query.cik[0] : req.query.cik;
  const quarter =
    typeof req.query.quarter === "string" ? req.query.quarter : undefined;

  if (!cik) {
    return res.status(400).json({ error: "Missing cik parameter" });
  }

  try {
    const data = await fetch13F(cik, quarter);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: message });
  }
}
