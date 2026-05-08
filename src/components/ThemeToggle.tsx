"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      className={`fixed top-4 right-4 z-[100] w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${className || ""}`}
      style={{
        background: "var(--bg1)",
        borderColor: "var(--border)",
        color: "var(--t2)",
        boxShadow: "var(--shadow)",
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
    </motion.button>
  );
}
