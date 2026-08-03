import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType = "success" | "info" | "error";

export interface AppNotification {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
}

interface NotificationsState {
  items: AppNotification[];
  add: (n: { title: string; description?: string; type: NotificationType }) => void;
  markAllRead: () => void;
  clear: () => void;
}

const MAX_NOTIFICATIONS = 30;

export const useNotifications = create<NotificationsState>()(
  persist(
    (set) => ({
      items: [],
      add: (n) =>
        set((state) => ({
          items: [
            {
              id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              title: n.title,
              description: n.description,
              type: n.type,
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...state.items,
          ].slice(0, MAX_NOTIFICATIONS),
        })),
      markAllRead: () =>
        set((state) => ({ items: state.items.map((i) => ({ ...i, read: true })) })),
      clear: () => set({ items: [] }),
    }),
    { name: "crm-notifications" }
  )
);
