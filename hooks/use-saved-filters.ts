import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CustomerFilters, SavedFilter } from "@/types/customer";

const TEMPLATES: SavedFilter[] = [
  {
    id: "tpl_active",
    name: "Active Customers",
    isTemplate: true,
    filters: { status: ["active"], companies: [], dateFrom: null, dateTo: null, phone: "", email: "" },
  },
  {
    id: "tpl_recent",
    name: "Recent Contacts",
    isTemplate: true,
    filters: {
      status: [],
      companies: [],
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      dateTo: null,
      phone: "",
      email: "",
    },
  },
  {
    id: "tpl_inactive",
    name: "Inactive Leads",
    isTemplate: true,
    filters: { status: ["inactive"], companies: [], dateFrom: null, dateTo: null, phone: "", email: "" },
  },
];

interface SavedFiltersState {
  saved: SavedFilter[];
  addFilter: (name: string, filters: CustomerFilters) => void;
  removeFilter: (id: string) => void;
  reorder: (fromId: string, toId: string) => void;
}

export const useSavedFilters = create<SavedFiltersState>()(
  persist(
    (set) => ({
      saved: TEMPLATES,
      addFilter: (name, filters) =>
        set((state) => ({
          saved: [
            ...state.saved,
            { id: `sf_${Date.now()}`, name, filters, isTemplate: false },
          ],
        })),
      removeFilter: (id) =>
        set((state) => ({ saved: state.saved.filter((f) => f.id !== id) })),
      reorder: (fromId, toId) =>
        set((state) => {
          const items = [...state.saved];
          const fromIndex = items.findIndex((f) => f.id === fromId);
          const toIndex = items.findIndex((f) => f.id === toId);
          if (fromIndex === -1 || toIndex === -1) return state;
          const [moved] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, moved);
          return { saved: items };
        }),
    }),
    { name: "crm-saved-filters" }
  )
);
