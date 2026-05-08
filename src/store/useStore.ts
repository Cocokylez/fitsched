import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CalendarEvent {
  id: string;
  summary: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
}

interface ScheduleBlock {
  time: string;
  label: string;
  kind: "cls" | "free" | "wrk" | "rst";
  duration: string;
}

interface AppState {
  selectedDay: number;
  theme: "light" | "dark" | "system";
  calendarEvents: Record<number, CalendarEvent[]>;
  scheduleBlocks: Record<number, ScheduleBlock[]>;
  isCalendarConnected: boolean;
  setSelectedDay: (day: number) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setCalendarEvents: (
    day: number,
    events: CalendarEvent[]
  ) => void;
  setScheduleBlocks: (
    day: number,
    blocks: ScheduleBlock[]
  ) => void;
  setCalendarConnected: (connected: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      selectedDay: new Date().getDay(),
      theme: "system",
      calendarEvents: {},
      scheduleBlocks: {},
      isCalendarConnected: false,
      setSelectedDay: (day) => set({ selectedDay: day }),
      setTheme: (theme) => set({ theme }),
      setCalendarEvents: (day, events) =>
        set((state) => ({
          calendarEvents: { ...state.calendarEvents, [day]: events },
        })),
      setScheduleBlocks: (day, blocks) =>
        set((state) => ({
          scheduleBlocks: { ...state.scheduleBlocks, [day]: blocks },
        })),
      setCalendarConnected: (connected) =>
        set({ isCalendarConnected: connected }),
    }),
    {
      name: "fitsched-storage",
      partialize: (state) => ({
        theme: state.theme,
        isCalendarConnected: state.isCalendarConnected,
      }),
    }
  )
);
