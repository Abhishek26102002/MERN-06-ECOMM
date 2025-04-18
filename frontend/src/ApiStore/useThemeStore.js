import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("Echoes-theme") || "light",
  setTheme: (theme) => {
    localStorage.setItem("Echoes-theme", theme);
    set({ theme });
  },
}));
