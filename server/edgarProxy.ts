import fetch from "node-fetch";
import type { Institution } from "../src/data/types";

const SEC = "https://data.sec.gov";
const UA = "WhalewisdomClone contact@example.com";
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; data: Institution }>();

type InfoTableEntry = {
  nameOfIssuer: string;
  cusip: string;
  value: number;
  sshPrnamt: number;
  sshPrnamtType: string;
  investmentDiscretion: string;
  votingAuthority: string;
};

function getTagValue(block: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(regex);
  return match ? match[1].trim() : "";
}

function parseInfoTables(xml: string): InfoTableEntry[] {
  const tables: InfoTableEntry[] = [];
  const infoTableRegex = /<infoTable>([\s\S]*?)<\/infoTable>/gi;
  let match: RegExpExecArray | null;
  while ((match = infoTableRegex.exec(xml))) {
    const block = match[1];
    const entry: InfoTableEntry = {
      nameOfIssuer: getTagValue(block, "nameOfIssuer"),
      cusip: getTagValue(block, "cusip"),
      value: Number(getTagValue(block, "value")) || 0,
      sshPrnamt: Number(getTagValue(block, "sshPrnamt")) || 0,
      sshPrnamtType: getTagValue(block, "sshPrnamtType"),
      investmentDiscretion: getTagValue(block, "investmentDiscretion"),
      votingAuthority: getTagValue(block, "votingAuthority"),
    };
    tables.push(entry);
  }
  return tables;
}

export async function fetch13F(cik: string = "0001067983"): Promise<Institution> {
  const normalizedCik = cik.padStart(10, "0");
  const cached = cache.get(normalizedCik);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = `${SEC}/submissions/CIK${normalizedCik}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    throw new Error(`SEC submissions request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const name = data.name;
  const filings = data.filings.recent;
  const idx = filings.form.findIndex((f: string) => f === "13F-HR");
  if (idx === -1) {
    throw new Error("No 13F-HR filing found for this CIK");
  }
  const accession = filings.accessionNumber[idx].replace(/-/g, "");
  const primaryDoc = filings.primaryDocument[idx];
  const filingUrl = `${SEC}/Archives/edgar/data/${parseInt(cik, 10)}/${accession}/${primaryDoc}`;
  const filingRes = await fetch(filingUrl, { headers: { "User-Agent": UA } });
  if (!filingRes.ok) {
    throw new Error(`SEC filing request failed: ${filingRes.status} ${filingRes.statusText}`);
  }
  const xml = await filingRes.text();
  const infoTables = parseInfoTables(xml);

  const totalValue = infoTables.reduce((sum, item) => sum + item.value, 0);
  const holdings = infoTables.map((item) => {
    const holdingValue = item.value;
    const weight = totalValue > 0 ? (holdingValue / totalValue) * 100 : 0;
    return {
      cusip: item.cusip,
      name: item.nameOfIssuer,
      ticker: "",
      shares: item.sshPrnamt,
      value: holdingValue,
      weight,
      changeShares: 0,
    };
  });

  const institution: Institution = {
    cik: normalizedCik,
    name,
    quarter: "Latest",
    totalValue,
    holdings,
  };

  cache.set(normalizedCik, { expiresAt: Date.now() + CACHE_TTL_MS, data: institution });
  return institution;
}
