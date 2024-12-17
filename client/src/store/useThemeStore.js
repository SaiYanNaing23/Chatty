import { create } from "zustand";

export const useThemeStore = create((set)=> ({
    theme : localStorage.getItem("chat_theme") || "luxury",
    setTheme : (theme) => {
        localStorage.setItem("chat_theme", theme);
        set({ theme });
    }
}))