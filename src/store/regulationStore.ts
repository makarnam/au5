import { create } from 'zustand';
import type { Regulation } from '../types/regulation';
import { regulationService } from '../services/regulationService';

type State = {
  regulations: Regulation[];
  loading: boolean;
  error?: string;
  search: string;
  refresh: () => Promise<void>;
  setSearch: (q: string) => void;
};

export const useRegulationStore = create<State>((set, get) => ({
  regulations: [],
  loading: false,
  error: undefined,
  search: '',
  setSearch: (q) => set({ search: q }),
  refresh: async () => {
    set({ loading: true, error: undefined });
    try {
      const regs = await regulationService.listRegulations({ search: get().search });
      set({ regulations: regs, loading: false });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load regulations', loading: false });
    }
  },
}));


