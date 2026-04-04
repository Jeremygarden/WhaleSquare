import { create } from "zustand";
import type { Institution } from "../data/types";
import { mockInstitution } from "../data/mock";

type State = {
  institution: Institution | null;
  loading: boolean;
  loadMock: () => void;
};

export const useHoldingsStore = create<State>((set) => ({
  institution: null,
  loading: false,
  loadMock: () => set({ institution: mockInstitution, loading: false }),
}));
