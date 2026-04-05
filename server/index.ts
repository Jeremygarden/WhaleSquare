import express from "express";
import cors from "cors";
import { fetch13F } from "./edgarProxy";

const app = express();
app.use(cors());

app.get("/api/13f/:cik", async (req, res) => {
  const cik = req.params.cik;
  const quarter = typeof req.query.quarter === "string" ? req.query.quarter : undefined;
  try {
    const data = await fetch13F(cik, quarter);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(5174, () => console.log("EDGAR proxy on :5174"));
