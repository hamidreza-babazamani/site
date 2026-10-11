
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2",
    "whitespace-nowrap rounded-xl",
    "text-sm font-semibold",
    "select-none",
    "transition-[background-color,color,border-color,box-shadow,transform]",
    "duration-300 ease-out",
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-emerald-500/50",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[#f8fafc]",
    "dark:focus-visible:ring-offset-[#0c1118]",
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
    "aria-disabled:pointer-events-none",
    "aria-disabled:opacity-50",
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
    "motion-reduce:transition-none",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary — دکمه اصلی سایت
        default: [
          "bg-gradient-to-r",
          "from-emerald-600 via-emerald-500 to-teal-500",
          "text-white",
          "border border-emerald-500/20",
          "shadow-[0_6px_20px_rgba(16,185,129,0.20)]",
          "hover:from-emerald-500",
          "hover:via-teal-500",
          "hover:to-cyan-500",
          "hover:shadow-[0_10px_28px_rgba(16,185,129,0.28)]",
          "active:scale-[0.98]",
          "dark:from-emerald-500",
          "dark:via-teal-500",
          "dark:to-cyan-600",
          "dark:text-[#061512]",
          "dark:hover:from-emerald-400",
          "dark:hover:via-teal-400",
          "dark:hover:to-cyan-500",
          "dark:shadow-[0_6px_22px_rgba(16,185,129,0.12)]",
        ].join(" "),

        // Secondary — شیشه‌ای
        secondary: [
          "border border-emerald-900/10",
          "bg-white/70",
          "text-slate-800",
          "shadow-[0_4px_16px_rgba(15,118,110,0.05)]",
          "backdrop-blur-md",
          "hover:border-emerald-500/30",
          "hover:bg-emerald-50/90",
          "hover:text-emerald-800",
          "dark:border-white/10",
          "dark:bg-white/[0.05]",
          "dark:text-slate-200",
          "dark:hover:border-emerald-400/30",
          "dark:hover:bg-emerald-400/[0.08]",
          "dark:hover:text-emerald-200",
        ].join(" "),

        // Outline — مناسب دکمه‌های فرعی
        outline: [
          "border border-emerald-500/40",
          "bg-transparent",
          "text-emerald-700",
          "hover:border-emerald-500",
          "hover:bg-emerald-500/10",
          "dark:border-emerald-400/35",
          "dark:text-emerald-300",
          "dark:hover:border-emerald-400",
          "dark:hover:bg-emerald-400/10",
        ].join(" "),

        // Ghost — برای آیکون‌ها و کنترل‌های کوچک
        ghost: [
          "border border-transparent",
          "bg-transparent",
          "text-slate-700",
          "hover:bg-emerald-500/[0.08]",
          "hover:text-emerald-800",
          "dark:text-slate-300",
          "dark:hover:bg-emerald-400/[0.08]",
          "dark:hover:text-emerald-300",
        ].join(" "),

        // Destructive — برای عملیات حساس
        destructive: [
          "bg-red-600",
          "text-white",
          "border border-red-600",
          "hover:bg-red-700",
          "focus-visible:ring-red-500/50",
          "dark:bg-red-600",
          "dark:hover:bg-red-500",
        ].join(" "),

        // Link — دکمه با ظاهر لینک
        link: [
          "border border-transparent",
          "bg-transparent",
          "text-emerald-700",
          "underline-offset-4",
          "hover:underline",
          "dark:text-emerald-300",
        ].join(" "),
      },

      size: {
        default: "h-11 px-6 text-sm",
        md: "h-12 px-6 text-sm",
        lg: "h-14 px-8 text-sm tracking-wide",
        sm: "h-9 px-4 text-xs",
        icon: "size-10 p-0",
      },

      radius: {
        default: "rounded-xl",
        full: "rounded-full",
        lg: "rounded-2xl",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  radius,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(
        buttonVariants({
          variant,
          size,
          radius,
          className,
        })
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
