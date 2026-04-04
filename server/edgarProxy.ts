import fetch from "node-fetch";
import type { Institution } from "../src/data/types";

const SEC = "https://data.sec.gov";
const UA = "WhalewisdomClone contact@example.com";

export async function fetch13F(cik: string): Promise<Institution> {
  const url = `${SEC}/submissions/CIK${cik.padStart(10, "0")}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const data = await res.json();
  const name = data.name;
  const filings = data.filings.recent;
  const idx = filings.form.findIndex((f: string) => f === "13F-HR");
  const accession = filings.accessionNumber[idx].replace(/-/g, "");
  const primaryDoc = filings.primaryDocument[idx];
  const filingUrl = `${SEC}/Archives/edgar/data/${parseInt(cik)}/${accession}/${primaryDoc}`;
  const filingRes = await fetch(filingUrl, { headers: { "User-Agent": UA } });
  const xml = await filingRes.text();
  // NOTE: parsing simplified; replace with real XML parsing in a later task
  return { cik, name, quarter: "Latest", totalValue: 0, holdings: [] };
}
