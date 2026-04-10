import { create } from "zustand";
import type { FilingsByQuarter, Institution } from "../data/types";
import { mockInstitution } from "../data/mock";
import { fetchInstitution } from "../data/edgar";

// In-memory cache: cik → Institution (persists for the lifetime of the browser session)
const institutionCache = new Map<string, Institution>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

function isCacheValid(cik: string): boolean {
  const ts = cacheTimestamps.get(cik);
  if (!ts) return false;
  return Date.now() - ts < CACHE_TTL_MS;
}

type State = {
  institution: Institution | null;
  loading: boolean;
  selectedCik: string;
  selectedQuarter: string;
  filingsByQuarter: FilingsByQuarter;
  loadMock: () => void;
  loadReal: (cik: string) => Promise<Institution>;
  setSelectedCik: (cik: string) => Promise<void>;
  setSelectedQuarter: (quarter: string) => void;
};

function buildFilingsMap(institution: Institution): FilingsByQuarter {
  if (institution.filingsByQuarter && Object.keys(institution.filingsByQuarter).length) {
    return institution.filingsByQuarter;
  }
  return {
    [institution.quarter]: {
      holdings: institution.holdings,
      totalValue: institution.totalValue,
    },
  };
}

function applyInstitution(institution: Institution, selectedQuarter?: string) {
  const filingsByQuarter = buildFilingsMap(institution);
  const latestQuarter = institution.filingHistory?.[0] ?? institution.quarter;
  const quarter = selectedQuarter && filingsByQuarter[selectedQuarter]
    ? selectedQuarter
    : latestQuarter;
  const active = filingsByQuarter[quarter] ?? {
    holdings: institution.holdings,
    totalValue: institution.totalValue,
  };
  return {
    institution: {
      ...institution,
      quarter,
      holdings: active.holdings,
      totalValue: active.totalValue,
    },
    filingsByQuarter,
    selectedQuarter: quarter,
  };
}

export const useHoldingsStore = create<State>((set, get) => ({
  institution: null,
  loading: false,
  selectedCik: "0001067983",
  selectedQuarter: "",
  filingsByQuarter: {},

  loadMock: () => {
    const filingsByQuarter = buildFilingsMap(mockInstitution);
    const selectedQuarter = mockInstitution.quarter;
    const active = filingsByQuarter[selectedQuarter];
    set({
      institution: {
        ...mockInstitution,
        quarter: selectedQuarter,
        holdings: active?.holdings ?? mockInstitution.holdings,
        totalValue: active?.totalValue ?? mockInstitution.totalValue,
      },
      filingsByQuarter,
      loading: false,
      selectedQuarter,
    });
  },

  loadReal: async (cik: string) => {
    // Serve from cache immediately (no loading flash) if still valid
    if (isCacheValid(cik) && institutionCache.has(cik)) {
      const cached = institutionCache.get(cik)!;
      set({ selectedCik: cik, loading: false, ...applyInstitution(cached) });
      return cached;
    }

    set({ loading: true, selectedCik: cik });
    // Track which request is current to prevent stale overwrites
    const requestCik = cik;
    try {
      // Do NOT pass selectedQuarter when switching institutions — it may not exist for the new one
      const institution = await fetchInstitution(cik);

      // Bail out if a newer request has already taken over
      if (get().selectedCik !== requestCik) return institution;

      // Store in cache
      institutionCache.set(cik, institution);
      cacheTimestamps.set(cik, Date.now());

      set({ loading: false, ...applyInstitution(institution) });
      return institution;
    } catch (error) {
      if (get().selectedCik === requestCik) set({ loading: false });
      throw error;
    }
  },

  setSelectedCik: async (cik: string) => {
    set({ selectedCik: cik });
    await get().loadReal(cik);
  },

  setSelectedQuarter: (quarter: string) =>
    set((state) => {
      if (!state.institution) return { selectedQuarter: quarter };
      const active = state.filingsByQuarter[quarter];
      if (!active) return { selectedQuarter: quarter, institution: { ...state.institution, quarter } };
      return {
        selectedQuarter: quarter,
        institution: {
          ...state.institution,
          quarter,
          holdings: active.holdings,
          totalValue: active.totalValue,
        },
      };
    }),
}));
