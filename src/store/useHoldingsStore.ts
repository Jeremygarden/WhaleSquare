import { create } from "zustand";
import type { FilingsByQuarter, Institution } from "../data/types";
import { mockInstitution } from "../data/mock";
import { fetchInstitution } from "../data/edgar";

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
    set({ loading: true, selectedCik: cik });
    try {
      const selectedQuarter = get().selectedQuarter || undefined;
      const institution = await fetchInstitution(cik, selectedQuarter);
      const filingsByQuarter = buildFilingsMap(institution);
      const latestQuarter = institution.filingHistory?.[0] ?? institution.quarter;
      const active = filingsByQuarter[latestQuarter] ?? {
        holdings: institution.holdings,
        totalValue: institution.totalValue,
      };
      set({
        institution: {
          ...institution,
          quarter: latestQuarter,
          holdings: active.holdings,
          totalValue: active.totalValue,
        },
        filingsByQuarter,
        loading: false,
        selectedQuarter: latestQuarter,
      });
      return institution;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  setSelectedCik: async (cik: string) => {
    set({ selectedCik: cik });
    await get().loadReal(cik);
  },
  setSelectedQuarter: (quarter: string) =>
    set((state) => {
      if (!state.institution) {
        return { selectedQuarter: quarter };
      }
      const active = state.filingsByQuarter[quarter];
      if (!active) {
        return {
          selectedQuarter: quarter,
          institution: {
            ...state.institution,
            quarter,
          },
        };
      }
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
