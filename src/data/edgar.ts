import type { Institution } from "./types";

export async function fetchInstitution(cik: string): Promise<Institution> {
  const res = await fetch(`/api/13f/${cik}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}
