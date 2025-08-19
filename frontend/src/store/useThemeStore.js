import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("Nexus-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("Nexus-theme", theme);
    set({ theme });
  },
}));
