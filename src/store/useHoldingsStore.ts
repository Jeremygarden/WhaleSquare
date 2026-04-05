import { create } from "zustand";
import type { Institution } from "../data/types";
import { mockInstitution } from "../data/mock";
import { fetchInstitution } from "../data/edgar";

type State = {
  institution: Institution | null;
  loading: boolean;
  selectedCik: string;
  selectedQuarter: string;
  loadMock: () => void;
  loadReal: (cik: string) => Promise<Institution>;
  setSelectedQuarter: (quarter: string) => void;
};

export const useHoldingsStore = create<State>((set) => ({
  institution: null,
  loading: false,
  selectedCik: "0001067983",
  selectedQuarter: "",
  loadMock: () =>
    set({
      institution: mockInstitution,
      loading: false,
      selectedQuarter: mockInstitution.quarter,
    }),
  loadReal: async (cik: string) => {
    set({ loading: true, selectedCik: cik });
    try {
      const institution = await fetchInstitution(cik);
      const latestQuarter = institution.filingHistory?.[0] ?? institution.quarter;
      set({ institution, loading: false, selectedQuarter: latestQuarter });
      return institution;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  setSelectedQuarter: (quarter: string) => set({ selectedQuarter: quarter }),
}));
