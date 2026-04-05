import fetch from "node-fetch";
import type { FilingsByQuarter, Institution } from "../src/data/types";

const SEC = "https://data.sec.gov";
const UA = "WhalewisdomClone contact@example.com";
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; data: Institution }>();

function validateCik(cik: string): string {
  const clean = cik.replace(/\D/g, "").padStart(10, "0");
  if (!/^\d{10}$/.test(clean)) {
    throw new Error(`Invalid CIK: ${cik}`);
  }
  return clean;
}

function formatQuarter(dateString: string): string {
  const [year, month] = dateString.split("-").map(Number);
  if (!year || !month) return "Latest";
  const quarter = Math.floor((month - 1) / 3) + 1;
  return `${year} Q${quarter}`;
}

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
  const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, "i");
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

async function fetchFilingXml(cik: string, accession: string, primaryDoc: string) {
  const filingUrl = `${SEC}/Archives/edgar/data/${parseInt(cik, 10)}/${accession}/${primaryDoc}`;
  const filingRes = await fetch(filingUrl, { headers: { "User-Agent": UA } });
  if (!filingRes.ok) {
    throw new Error(`SEC filing request failed: ${filingRes.status} ${filingRes.statusText}`);
  }
  return filingRes.text();
}

function buildHoldings(
  infoTables: InfoTableEntry[],
  previousHoldings = new Map<string, number>()
) {
  const totalValue = infoTables.reduce((sum, item) => sum + item.value, 0);
  const holdings = infoTables.map((item) => {
    const holdingValue = item.value;
    const weight = totalValue > 0 ? (holdingValue / totalValue) * 100 : 0;
    const previousShares = previousHoldings.get(item.cusip) ?? 0;
    return {
      cusip: item.cusip,
      name: item.nameOfIssuer,
      ticker: "",
      shares: item.sshPrnamt,
      value: holdingValue,
      weight,
      changeShares: item.sshPrnamt - previousShares,
    };
  });
  return { holdings, totalValue };
}

export async function fetchTwoQuarters(cik: string, quarter?: string): Promise<Institution> {
  const normalizedCik = validateCik(cik);
  const url = `${SEC}/submissions/CIK${normalizedCik}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    throw new Error(`SEC submissions request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const name = data.name;
  const filings = data.filings.recent;
  const indices: number[] = [];
  filings.form.forEach((form: string, index: number) => {
    if (form === "13F-HR") indices.push(index);
  });
  if (indices.length === 0) {
    throw new Error("No 13F-HR filing found for this CIK");
  }

  const filingEntries = indices.map((index) => {
    const reportDate = filings.reportDate?.[index] ?? filings.filingDate?.[index];
    return {
      index,
      quarter: reportDate ? formatQuarter(reportDate) : "Latest",
    };
  });
  const filingHistory = filingEntries.map((entry) => entry.quarter);
  const uniqueHistory = Array.from(new Set(filingHistory));

  const targetIndex = quarter
    ? filingEntries.findIndex((entry) => entry.quarter === quarter)
    : 0;
  if (targetIndex === -1) {
    throw new Error(`Quarter ${quarter} not found for this CIK`);
  }

  const latestEntry = filingEntries[targetIndex];
  const previousEntry = filingEntries[targetIndex + 1];
  const latestIdx = latestEntry.index;
  const previousIdx = previousEntry?.index;

  const latestAccession = filings.accessionNumber[latestIdx].replace(/-/g, "");
  const latestDoc = filings.primaryDocument[latestIdx];
  const latestXml = await fetchFilingXml(normalizedCik, latestAccession, latestDoc);
  const latestTables = parseInfoTables(latestXml);

  let previousTables: InfoTableEntry[] = [];
  if (previousIdx !== undefined) {
    const previousAccession = filings.accessionNumber[previousIdx].replace(/-/g, "");
    const previousDoc = filings.primaryDocument[previousIdx];
    const previousXml = await fetchFilingXml(normalizedCik, previousAccession, previousDoc);
    previousTables = parseInfoTables(previousXml);
  }

  const previousHoldingsMap = new Map(
    previousTables.map((item) => [item.cusip, item.sshPrnamt])
  );
  const latest = buildHoldings(latestTables, previousHoldingsMap);
  const previous = buildHoldings(previousTables, new Map());

  const latestQuarter = latestEntry.quarter;
  const previousQuarter = previousEntry?.quarter;

  const filingsByQuarter: FilingsByQuarter = {
    [latestQuarter]: {
      holdings: latest.holdings,
      totalValue: latest.totalValue,
    },
  };
  if (previousQuarter) {
    filingsByQuarter[previousQuarter] = {
      holdings: previous.holdings,
      totalValue: previous.totalValue,
    };
  }

  return {
    cik: normalizedCik,
    name,
    quarter: latestQuarter,
    totalValue: latest.totalValue,
    holdings: latest.holdings,
    filingHistory: uniqueHistory,
    filingsByQuarter,
  };
}

export async function fetch13F(
  cik: string = "0001067983",
  quarter?: string
): Promise<Institution> {
  const normalizedCik = validateCik(cik);
  const cached = cache.get(normalizedCik);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const institution = await fetchTwoQuarters(normalizedCik, quarter);
  cache.set(normalizedCik, { expiresAt: Date.now() + CACHE_TTL_MS, data: institution });
  return institution;
}
