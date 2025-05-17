"use client";

import { Mode } from "@/types/type";
import { useCallback, useEffect, useState } from "react";

function useDarkMode() {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Mode) || "system";
    }
    return "system";
  });

  const applyTheme = useCallback((isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const changeMode = useCallback(
    (newMode: Mode) => {
      setMode(newMode);
      localStorage.setItem("theme", newMode);
      if (newMode === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        applyTheme(systemPrefersDark);
      } else {
        applyTheme(newMode === "dark");
      }
    },
    [applyTheme]
  );

  useEffect(() => {
    // وقتی کامپوننت mount میشه تم رو اعمال کن
    if (mode === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      applyTheme(systemPrefersDark);
    } else {
      applyTheme(mode === "dark");
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (mode === "system") {
        applyTheme(event.matches);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [mode, applyTheme]);

  return { mode, changeMode };
}

export { useDarkMode };
