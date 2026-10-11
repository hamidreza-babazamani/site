
"use client";

import { useDarkMode } from "@/hooks/DarkLightMod";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Laptop, Moon, Sun } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeMode = "light" | "dark" | "system";

export default function ThemeToggle() {
  const t = useTranslations("HomePage");
  const { mode, changeMode } = useDarkMode();

  const options = [
    {
      value: "light" as const,
      label: t("dark.light"),
      icon: Sun,
    },
    {
      value: "dark" as const,
      label: t("dark.darks"),
      icon: Moon,
    },
    {
      value: "system" as const,
      label: t("dark.system"),
      icon: Laptop,
    },
  ];

  const current =
    options.find((option) => option.value === mode) ??
    options[2];

  const CurrentIcon = current.icon;

  const handleThemeChange = (value: ThemeMode) => {
    if (value === mode) return;
    changeMode(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={current.label}
          className="
            group inline-flex h-10
            max-w-[155px]
            items-center justify-center
            gap-2
            rounded-xl
            border border-emerald-900/10
            bg-white/70
            px-3
            text-sm font-medium
            text-slate-700
            shadow-[0_4px_16px_rgba(15,118,110,0.04)]
            backdrop-blur-md
            outline-none
            transition-[color,background-color,border-color,box-shadow]
            duration-300
            hover:border-emerald-500/30
            hover:bg-emerald-50/80
            hover:text-emerald-800
            focus-visible:ring-2
            focus-visible:ring-emerald-500/50
            dark:border-white/10
            dark:bg-white/[0.05]
            dark:text-slate-200
            dark:hover:border-emerald-400/30
            dark:hover:bg-emerald-400/[0.08]
            dark:hover:text-emerald-200
            sm:h-11
            sm:px-3.5
          "
        >
          <CurrentIcon
            size={17}
            aria-hidden="true"
            className="
              shrink-0
              text-emerald-600
              dark:text-emerald-400
            "
          />

          <span className="truncate">
            {current.label}
          </span>

          <ChevronDown
            size={14}
            aria-hidden="true"
            className="
              shrink-0
              text-slate-400
              transition-transform duration-200
              group-data-[state=open]:rotate-180
              dark:text-slate-500
            "
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="
          z-50
          min-w-[175px]
          rounded-2xl
          border border-emerald-900/10
          bg-white/95
          p-1.5
          text-slate-800
          shadow-[0_16px_45px_rgba(15,23,42,0.12)]
          backdrop-blur-xl
          dark:border-white/10
          dark:bg-[#141c26]/95
          dark:text-slate-100
          dark:shadow-[0_16px_45px_rgba(0,0,0,0.4)]
        "
      >
        {options.map((option) => {
          const Icon = option.icon;
          const selected = mode === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() =>
                handleThemeChange(option.value)
              }
              className={`
                flex cursor-pointer
                items-center gap-3
                rounded-xl
                px-3 py-2.5
                text-sm
                outline-none
                transition-colors
                focus:bg-emerald-500/10
                focus:text-emerald-800
                dark:focus:bg-emerald-400/10
                dark:focus:text-emerald-200
                ${
                  selected
                    ? "bg-emerald-500/10 font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300"
                    : "text-slate-700 dark:text-slate-300"
                }
              `}
            >
              <Icon
                size={17}
                aria-hidden="true"
                className={
                  selected
                    ? "shrink-0 text-emerald-600 dark:text-emerald-400"
                    : "shrink-0 text-slate-500 dark:text-slate-400"
                }
              />

              <span className="flex-1">
                {option.label}
              </span>

              {selected && (
                <Check
                  size={16}
                  aria-hidden="true"
                  className="
                    shrink-0
                    text-emerald-600
                    dark:text-emerald-400
                  "
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
