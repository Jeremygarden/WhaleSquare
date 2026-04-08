import type { VercelRequest, VercelResponse } from "@vercel/node";

type Holding = {
  cusip: string;
  name: string;
  ticker: string;
  shares: number;
  value: number;
  weight: number;
  changeShares: number;
};

type FilingsByQuarter = Record<string, { holdings: Holding[]; totalValue: number }>;

type Institution = {
  cik: string;
  name: string;
  quarter: string;
  totalValue: number;
  holdings: Holding[];
  filingHistory?: string[];
  filingsByQuarter?: FilingsByQuarter;
};

const SEC_DATA = "https://data.sec.gov";
const SEC_WWW = "https://www.sec.gov";
const UA = "WhaleSquare contact@example.com";

function validateCik(cik: string): string {
  const clean = cik.replace(/\D/g, "").padStart(10, "0");
  if (!/^\d{10}$/.test(clean)) throw new Error(`Invalid CIK: ${cik}`);
  return clean;
}

function formatQuarter(dateString: string): string {
  const [year, month] = dateString.split("-").map(Number);
  if (!year || !month) return "Latest";
  return `${year} Q${Math.floor((month - 1) / 3) + 1}`;
}

type InfoTableEntry = { nameOfIssuer: string; cusip: string; value: number; sshPrnamt: number };

function getTagValue(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function parseInfoTables(xml: string): InfoTableEntry[] {
  const tables: InfoTableEntry[] = [];
  const re = /<infoTable>([\s\S]*?)<\/infoTable>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    // handle nested <shrsOrPrnAmt><sshPrnamt>...</sshPrnamt></shrsOrPrnAmt>
    const sshPrnamt =
      Number(getTagValue(m[1], "sshPrnamt")) ||
      Number(getTagValue(m[1], "sshprnamttype") ? "0" : getTagValue(m[1], "sshPrnamt")) ||
      0;
    tables.push({
      nameOfIssuer: getTagValue(m[1], "nameOfIssuer"),
      cusip: getTagValue(m[1], "cusip"),
      value: Number(getTagValue(m[1], "value")) || 0,
      sshPrnamt,
    });
  }
  return tables;
}

// Fetch the filing index and find the info table XML filename
async function findInfoTableDoc(cikInt: number, accessionDashed: string): Promise<string | null> {
  const indexUrl = `${SEC_WWW}/Archives/edgar/data/${cikInt}/${accessionDashed.replace(/-/g, "")}/`;
  const res = await fetch(indexUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const html = await res.text();
  // Look for INFORMATION TABLE link in the index
  const match = html.match(/href="[^"]*\/([^"/]+\.xml)"/gi)?.find(h =>
    !h.includes("xslForm") && !h.includes("primary_doc")
  );
  if (match) {
    const filename = match.match(/href="[^"]*\/([^"/]+\.xml)"/i)?.[1];
    return filename ?? null;
  }
  return null;
}

async function fetchInfoTableXml(cikInt: number, accession: string): Promise<string> {
  const accNoDash = accession.replace(/-/g, "");
  // First try: find info table doc from filing index
  const infoTableDoc = await findInfoTableDoc(cikInt, accession);
  if (infoTableDoc) {
    const url = `${SEC_WWW}/Archives/edgar/data/${cikInt}/${accNoDash}/${infoTableDoc}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return res.text();
  }
  // Fallback: try primary_doc.xml directly
  const url = `${SEC_WWW}/Archives/edgar/data/${cikInt}/${accNoDash}/primary_doc.xml`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`SEC filing fetch failed: ${res.status} (CIK ${cikInt}, acc ${accNoDash})`);
  return res.text();
}

function buildHoldings(entries: InfoTableEntry[], prev = new Map<string, number>()) {
  const totalValue = entries.reduce((s, e) => s + e.value, 0);
  return {
    holdings: entries.map((e) => ({
      cusip: e.cusip,
      name: e.nameOfIssuer,
      ticker: "",
      shares: e.sshPrnamt,
      value: e.value,
      weight: totalValue > 0 ? (e.value / totalValue) * 100 : 0,
      changeShares: e.sshPrnamt - (prev.get(e.cusip) ?? 0),
    })),
    totalValue,
  };
}

async function fetch13F(cik: string, quarter?: string): Promise<Institution> {
  const n = validateCik(cik);
  const cikInt = parseInt(n, 10);
  const res = await fetch(`${SEC_DATA}/submissions/CIK${n}.json`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`SEC submissions failed: ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  const filings = data.filings.recent;
  const indices: number[] = [];
  filings.form.forEach((f: string, i: number) => { if (f === "13F-HR") indices.push(i); });
  if (!indices.length) throw new Error("No 13F-HR filing found");

  const entries = indices.map((i) => ({
    index: i,
    accession: filings.accessionNumber[i] as string,
    quarter: formatQuarter(filings.reportDate?.[i] ?? filings.filingDate?.[i] ?? ""),
  }));

  const ti = quarter ? entries.findIndex((e) => e.quarter === quarter) : 0;
  if (ti === -1) throw new Error(`Quarter ${quarter} not found`);

  const cur = entries[ti];
  const prev = entries[ti + 1];

  const curXml = await fetchInfoTableXml(cikInt, cur.accession);
  const curTables = parseInfoTables(curXml);

  let prevTables: InfoTableEntry[] = [];
  if (prev) {
    const prevXml = await fetchInfoTableXml(cikInt, prev.accession);
    prevTables = parseInfoTables(prevXml);
  }

  const prevMap = new Map(prevTables.map((e) => [e.cusip, e.sshPrnamt]));
  const latest = buildHoldings(curTables, prevMap);
  const previous = buildHoldings(prevTables);

  const fbq: FilingsByQuarter = {
    [cur.quarter]: { holdings: latest.holdings, totalValue: latest.totalValue },
  };
  if (prev) fbq[prev.quarter] = { holdings: previous.holdings, totalValue: previous.totalValue };

  return {
    cik: n,
    name: data.name,
    quarter: cur.quarter,
    totalValue: latest.totalValue,
    holdings: latest.holdings,
    filingHistory: [...new Set(entries.map((e) => e.quarter))],
    filingsByQuarter: fbq,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cik = Array.isArray(req.query.cik) ? req.query.cik[0] : req.query.cik;
  const quarter = typeof req.query.quarter === "string" ? req.query.quarter : undefined;
  if (!cik) return res.status(400).json({ error: "Missing cik parameter" });

  try {
    const data = await fetch13F(cik, quarter);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.json(data);
  } catch (e: unknown) {
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
