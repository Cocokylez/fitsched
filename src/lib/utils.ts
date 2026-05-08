import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getDayName(day: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[day];
}

export function getDayFullName(day: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day];
}

export function getMuscleGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    CHEST: "Chest & Triceps",
    BACK: "Back & Biceps",
    LEGS: "Legs",
    SHOULDERS: "Shoulders & Core",
    CORE: "Core",
    ARMS: "Arms & Core",
    FULL_BODY: "Full Body",
    CARDIO: "Cardio",
    REST: "Rest",
  };
  return labels[group] || group;
}

export function getWeekDates() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
}

export function getWeekdayFromDate(date: Date): number {
  return date.getDay();
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function generateVapidKeys() {
  if (typeof window === "undefined") {
    const webpush = require("web-push");
    return webpush.generateVAPIDKeys();
  }
  return null;
}
