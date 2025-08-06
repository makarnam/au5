import create from "zustand";
import { devtools } from "zustand/middleware";
import riskService, {
  Risk,
  RiskAssessment,
  RiskIncident,
  RiskReview,
  RiskTreatment,
  RiskFilter,
  UUID,
} from "../services/riskService";

type LoadingState = {
  list: boolean;
  details: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  stats: boolean;
};

type RiskStats = {
  total: number;
  byStatus: Record<string, number>;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
};

type RiskStore = {
  // Data
  risks: Risk[];
  selectedRisk: Risk | null;
  assessments: RiskAssessment[];
  treatments: RiskTreatment[];
  incidents: RiskIncident[];
  reviews: RiskReview[];
  stats: RiskStats | null;

  // UI/filter
  filter: RiskFilter;
  loading: LoadingState;
  error: string | null;

  // Actions
  setFilter: (f: Partial<RiskFilter>) => void;
  resetError: () => void;

  // Loads
  loadRisks: (filter?: RiskFilter) => Promise<void>;
  loadRiskDetails: (id: UUID) => Promise<void>;
  loadRiskStats: (filter?: RiskFilter) => Promise<void>;

  // Mutations
  createRisk: (payload: Partial<Risk>) => Promise<UUID>;
  addAssessment: (riskId: UUID, payload: Partial<RiskAssessment>) => Promise<UUID>;
  updateAssessment: (id: UUID, payload: Partial<RiskAssessment>) => Promise<void>;
  deleteAssessment: (id: UUID) => Promise<void>;

  addTreatment: (riskId: UUID, payload: Partial<RiskTreatment>) => Promise<UUID>;
  updateTreatment: (id: UUID, payload: Partial<RiskTreatment>) => Promise<void>;
  deleteTreatment: (id: UUID) => Promise<void>;

  addIncident: (riskId: UUID, payload: Partial<RiskIncident>) => Promise<UUID>;
  updateIncident: (id: UUID, payload: Partial<RiskIncident>) => Promise<void>;
  deleteIncident: (id: UUID) => Promise<void>;

  addReview: (riskId: UUID, payload: Partial<RiskReview>) => Promise<UUID>;
  updateReview: (id: UUID, payload: Partial<RiskReview>) => Promise<void>;
  deleteReview: (id: UUID) => Promise<void>;

  linkControl: (riskId: UUID, controlId: UUID) => Promise<void>;
};

export const useRiskStore = create<RiskStore>()(
  devtools((set, get) => ({
    // Initial state
    risks: [],
    selectedRisk: null,
    assessments: [],
    treatments: [],
    incidents: [],
    reviews: [],
    stats: null,

    filter: {
      status: "all",
      level: "all",
    },
    loading: {
      list: false,
      details: false,
      create: false,
      update: false,
      delete: false,
      stats: false,
    },
    error: null,

    // Helpers
    setFilter: (f) => set((state) => ({ filter: { ...state.filter, ...f } })),
    resetError: () => set({ error: null }),

    // Loads
    loadRisks: async (filter) => {
      set((s) => ({ loading: { ...s.loading, list: true }, error: null }));
      try {
        const list = await riskService.getRisks(filter ?? get().filter);
        set({ risks: list });
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to load risks" });
      } finally {
        set((s) => ({ loading: { ...s.loading, list: false } }));
      }
    },

    loadRiskDetails: async (id) => {
      set((s) => ({ loading: { ...s.loading, details: true }, error: null }));
      try {
        const [risk, a, t, i, v] = await Promise.all([
          riskService.getRisk(id),
          riskService.getAssessments(id),
          riskService.getTreatments(id),
          riskService.getIncidents(id),
          riskService.getReviews(id),
        ]);
        set({
          selectedRisk: risk,
          assessments: a,
          treatments: t,
          incidents: i,
          reviews: v,
        });
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to load risk details" });
      } finally {
        set((s) => ({ loading: { ...s.loading, details: false } }));
      }
    },

    loadRiskStats: async (filter) => {
      set((s) => ({ loading: { ...s.loading, stats: true }, error: null }));
      try {
        const stats = await riskService.getStats(filter ?? get().filter);
        set({ stats });
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to load risk stats" });
      } finally {
        set((s) => ({ loading: { ...s.loading, stats: false } }));
      }
    },

    // Mutations
    createRisk: async (payload) => {
      set((s) => ({ loading: { ...s.loading, create: true }, error: null }));
      try {
        const id = await riskService.createRisk(payload);
        // refresh list after create
        await get().loadRisks();
        return id;
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to create risk" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, create: false } }));
      }
    },

    addAssessment: async (riskId, payload) => {
      set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
      try {
        const id = await riskService.addAssessment(riskId, payload);
        // refresh local list
        const a = await riskService.getAssessments(riskId);
        set({ assessments: a });
        return id;
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to add assessment" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, update: false } }));
      }
    },

    updateAssessment: async (id, payload) => {
      set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
      try {
        await riskService.updateAssessment(id, payload);
        const selected = get().selectedRisk;
        if (selected) {
          const a = await riskService.getAssessments(selected.id);
          set({ assessments: a });
        }
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to update assessment" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, update: false } }));
      }
    },

    deleteAssessment: async (id) => {
      set((s) => ({ loading: { ...s.loading, delete: true }, error: null }));
      try {
        await riskService.deleteAssessment(id);
        const selected = get().selectedRisk;
        if (selected) {
          const a = await riskService.getAssessments(selected.id);
          set({ assessments: a });
        }
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to delete assessment" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, delete: false } }));
      }
    },

    addTreatment: async (riskId, payload) => {
      set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
      try {
        const id = await riskService.addTreatment(riskId, payload);
        const t = await riskService.getTreatments(riskId);
        set({ treatments: t });
        return id;
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to add treatment" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, update: false } }));
      }
    },

    updateTreatment: async (id, payload) => {
      set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
      try {
        await riskService.updateTreatment(id, payload);
        const selected = get().selectedRisk;
        if (selected) {
          const t = await riskService.getTreatments(selected.id);
          set({ treatments: t });
        }
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to update treatment" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, update: false } }));
      }
    },

    deleteTreatment: async (id) => {
      set((s) => ({ loading: { ...s.loading, delete: true }, error: null }));
      try {
        await riskService.deleteTreatment(id);
        const selected = get().selectedRisk;
        if (selected) {
          const t = await riskService.getTreatments(selected.id);
          set({ treatments: t });
        }
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to delete treatment" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, delete: false } }));
      }
    },

    addIncident: async (riskId, payload) => {
      set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
      try {
        const id = await riskService.addIncident(riskId, payload);
        const list = await riskService.getIncidents(riskId);
        set({ incidents: list });
        return id;
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to add incident" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, update: false } }));
      }
    },

    updateIncident: async (id, payload) => {
      set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
      try {
        await riskService.updateIncident(id, payload);
        const selected = get().selectedRisk;
        if (selected) {
          const list = await riskService.getIncidents(selected.id);
          set({ incidents: list });
        }
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to update incident" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, update: false } }));
      }
    },

    deleteIncident: async (id) => {
      set((s) => ({ loading: { ...s.loading, delete: true }, error: null }));
      try {
        await riskService.deleteIncident(id);
        const selected = get().selectedRisk;
        if (selected) {
          const list = await riskService.getIncidents(selected.id);
          set({ incidents: list });
        }
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to delete incident" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, delete: false } }));
      }
    },

    addReview: async (riskId, payload) => {
      set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
      try {
        const id = await riskService.addReview(riskId, payload);
        const list = await riskService.getReviews(riskId);
        set({ reviews: list });
        return id;
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to add review" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, update: false } }));
      }
    },

    updateReview: async (id, payload) => {
      set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
      try {
        await riskService.updateReview(id, payload);
        const selected = get().selectedRisk;
        if (selected) {
          const list = await riskService.getReviews(selected.id);
          set({ reviews: list });
        }
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to update review" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, update: false } }));
      }
    },

    deleteReview: async (id) => {
      set((s) => ({ loading: { ...s.loading, delete: true }, error: null }));
      try {
        await riskService.deleteReview(id);
        const selected = get().selectedRisk;
        if (selected) {
          const list = await riskService.getReviews(selected.id);
          set({ reviews: list });
        }
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to delete review" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, delete: false } }));
      }
    },

    linkControl: async (riskId, controlId) => {
      set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
      try {
        await riskService.linkControl(riskId, controlId);
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to link control" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, update: false } }));
      }
    },
  })),
);

export default useRiskStore;