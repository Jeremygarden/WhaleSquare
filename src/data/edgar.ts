import type { Institution } from "./types";

export async function fetchInstitution(cik: string, quarter?: string): Promise<Institution> {
  const params = quarter ? `?quarter=${encodeURIComponent(quarter)}` : "";
  const res = await fetch(`/api/13f/${cik}${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}
