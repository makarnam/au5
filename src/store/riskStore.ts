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
import { supabase } from "../lib/supabase";

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
  deleteRisk: (id: UUID) => Promise<void>;
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

/** Utility: create in-app notification via RPC (non-blocking). */
async function createAppNotification(params: {
  user_id: string;
  title: string;
  body?: string | null;
  type?: string;
  entity_type?: string | null;
  entity_id?: string | null;
  meta?: Record<string, any> | null;
}) {
  try {
    const { error } = await supabase.rpc("create_notification", {
      p_user_id: params.user_id,
      p_title: params.title,
      p_body: params.body ?? null,
      p_type: params.type ?? "reminder",
      p_entity_type: params.entity_type ?? "risk",
      p_entity_id: params.entity_id ?? null,
      p_meta: params.meta ?? null,
    });
    if (error) throw error;
  } catch (e) {
    // do not throw; notifications are best-effort
    console.warn("create_notification failed:", e);
  }
}

/** Utility: basic appetite mapper fallback; replace with backend map_score_to_appetite if exposed */
function mapScoreToAppetite(score: number, _org: "org"): "green" | "amber" | "red" {
  if (score >= 15) return "red";
  if (score >= 9) return "amber";
  return "green";
}

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

    deleteRisk: async (id) => {
      set((s) => ({ loading: { ...s.loading, delete: true }, error: null }));
      try {
        await riskService.deleteRisk(id);
        // refresh list after delete
        await get().loadRisks();
        // clear selected risk if it was the deleted one
        const selected = get().selectedRisk;
        if (selected && selected.id === id) {
          set({ selectedRisk: null });
        }
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to delete risk" });
        throw e;
      } finally {
        set((s) => ({ loading: { ...s.loading, delete: false } }));
      }
    },

    addAssessment: async (riskId, payload) => {
      set((s) => ({ loading: { ...s.loading, update: true }, error: null }));
      try {
        const id = await riskService.addAssessment(riskId, payload);
        // refresh local list
        const a = await riskService.getAssessments(riskId);
        set({ assessments: a });

        // Notifications: Appetite breach -> notify owner/assignee/BU
        const selected = get().selectedRisk || (await riskService.getRisk(riskId));
        const prob = payload.probability ?? 3;
        const imp = payload.impact ?? 3;
        const score = payload.risk_score ?? (prob * imp);
        const appetite = mapScoreToAppetite(score, "org");
        if (appetite === "red") {
          const ownerId = (selected as Risk | null)?.owner_id;
          if (ownerId) {
            void createAppNotification({
              user_id: ownerId,
              title: "Risk appetite breach",
              body: `Assessment score ${score} exceeded appetite for risk "${(selected as any)?.title ?? ""}"`,
              type: "reminder",
              entity_type: "risk",
              entity_id: riskId,
              meta: { risk_id: riskId, score, appetite },
            });
          }
          // TODO: optionally notify assignee/BU when fields are available in schema/client
        }

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

        // Notifications: due/overdue
        const target = (payload as any)?.target_date as string | undefined;
        const status = (payload as any)?.status;
        if (target && status !== "completed") {
          const today = new Date().toISOString().slice(0, 10);
          if (target < today) {
            const selected = get().selectedRisk || (await riskService.getRisk(riskId));
            const ownerId = (selected as Risk | null)?.owner_id;
            if (ownerId) {
              void createAppNotification({
                user_id: ownerId,
                title: "Treatment overdue",
                body: `Treatment "${(payload as any)?.title ?? ""}" target date ${target} has passed.`,
                type: "reminder",
                entity_type: "risk",
                entity_id: riskId,
                meta: { risk_id: riskId, treatment_id: id, target_date: target, status },
              });
            }
          }
        }

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

          // Notifications: due/overdue on update as well
          const target = (payload as any)?.target_date as string | undefined;
          const status = (payload as any)?.status;
          const today = new Date().toISOString().slice(0, 10);
          if (target && status !== "completed" && target < today) {
            const ownerId = (selected as Risk | null)?.owner_id;
            if (ownerId) {
              void createAppNotification({
                user_id: ownerId,
                title: "Treatment overdue",
                body: `Treatment update indicates overdue (target ${target}).`,
                type: "reminder",
                entity_type: "risk",
                entity_id: selected.id,
                meta: { risk_id: selected.id, treatment_id: id, target_date: target, status },
              });
            }
          }
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