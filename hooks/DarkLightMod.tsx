"use client";

import { Mode } from "@/types/type";
import { useCallback, useEffect, useState } from "react";

function useDarkMode() {
  const [mode, setMode] = useState<Mode>("system");

  const applyTheme = useCallback((isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const syncMode = useCallback(
    (targetMode: Mode) => {
      if (targetMode === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        applyTheme(systemPrefersDark);
      } else {
        applyTheme(targetMode === "dark");
      }
    },
    [applyTheme]
  );

  const changeMode = useCallback(
    (newMode: Mode) => {
      setMode(newMode);
      localStorage.setItem("theme", newMode);
      syncMode(newMode);
    },
    [syncMode]
  );

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const resolved: Mode =
      saved === "light" || saved === "dark" || saved === "system"
        ? saved
        : "system";
    setMode(resolved);
    syncMode(resolved);
  }, [syncMode]);

  useEffect(() => {
    syncMode(mode);

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
  }, [mode, applyTheme, syncMode]);

  return { mode, changeMode };
}

export { useDarkMode };
