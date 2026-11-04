"use client";

import type { CSSProperties } from "react";
import type {
  PublicHeroTechnologyEcosystem,
  PublicHeroTechnologyItem,
} from "@/lib/services/public-portfolio";

const localized = (
  value: { fa?: string; en?: string } | undefined,
  locale: string,
) =>
  (locale === "fa" ? value?.fa : value?.en)?.trim() ||
  value?.en?.trim() ||
  value?.fa?.trim() ||
  "";

const breakpointStyle = (
  item: PublicHeroTechnologyItem,
  breakpoint: "desktop" | "tablet" | "mobile",
) => {
  const config = item.responsive[breakpoint];
  const position = config.position;
  const percent = (value: number) => String(value) + "%";
  return {
    left: position.horizontalAnchor === "left"
      ? percent(position.horizontalOffsetPercent)
      : "auto",
    right: position.horizontalAnchor === "right"
      ? percent(position.horizontalOffsetPercent)
      : "auto",
    top: position.verticalAnchor === "top"
      ? percent(position.verticalOffsetPercent)
      : "auto",
    bottom: position.verticalAnchor === "bottom"
      ? percent(position.verticalOffsetPercent)
      : "auto",
    display: config.isVisible && item.isVisible ? "block" : "none",
  };
};

const cssVariables = (
  item: PublicHeroTechnologyItem,
): CSSProperties & Record<string, string> => {
  const values = {
    desktop: breakpointStyle(item, "desktop"),
    tablet: breakpointStyle(item, "tablet"),
    mobile: breakpointStyle(item, "mobile"),
  };
  return {
    "--hero-tech-left-desktop": values.desktop.left,
    "--hero-tech-right-desktop": values.desktop.right,
    "--hero-tech-top-desktop": values.desktop.top,
    "--hero-tech-bottom-desktop": values.desktop.bottom,
    "--hero-tech-display-desktop": values.desktop.display,
    "--hero-tech-left-tablet": values.tablet.left,
    "--hero-tech-right-tablet": values.tablet.right,
    "--hero-tech-top-tablet": values.tablet.top,
    "--hero-tech-bottom-tablet": values.tablet.bottom,
    "--hero-tech-display-tablet": values.tablet.display,
    "--hero-tech-left-mobile": values.mobile.left,
    "--hero-tech-right-mobile": values.mobile.right,
    "--hero-tech-top-mobile": values.mobile.top,
    "--hero-tech-bottom-mobile": values.mobile.bottom,
    "--hero-tech-display-mobile": values.mobile.display,
    "--hero-tech-color-light": item.color.light,
    "--hero-tech-color-dark": item.color.dark,
  };
};

function TechnologyCard({
  item,
  locale,
}: {
  item: PublicHeroTechnologyItem;
  locale: string;
}) {
  const name = localized(item.name, locale);
  const cardClassName = [
    item.animation.isEnabled ? "hero-tech-float" : "",
    "flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90",
    "px-2.5 py-2 shadow-[0_8px_25px_rgba(15,23,42,0.12)] backdrop-blur-xl",
    "dark:border-white/15 dark:bg-[#17242f]/90 dark:shadow-[0_8px_25px_rgba(0,0,0,0.25)]",
    "sm:rounded-2xl sm:px-3 sm:py-2.5",
  ].filter(Boolean).join(" ");

  return (
    <div
      className="hero-tech-configured-item"
      style={cssVariables(item)}
      role="listitem"
      aria-label={name}
    >
      <div
        className={cardClassName}
        style={{
          animationDelay: String(item.animation.delayMs) + "ms",
          animationDuration: String(item.animation.durationMs) + "ms",
        }}
      >
        {item.iconMedia?.url ? (
          <span
            className="hero-tech-configured-image-wrap flex shrink-0 items-center justify-center rounded-full"
            style={{ width: item.iconSize, height: item.iconSize }}
          >
            <img
              src={item.iconMedia.url}
              alt={localized(item.iconMedia.alt, locale) || name}
              width={item.iconSize}
              height={item.iconSize}
              className="hero-tech-configured-icon object-contain"
              loading="lazy"
              decoding="async"
            />
          </span>
        ) : (
          <>
          <span
            aria-hidden="true"
            className="hero-tech-configured-icon-fallback flex shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ width: item.iconSize, height: item.iconSize }}
          >
            {name.slice(0, 1)}
          </span>
          <span className="sr-only">{name}</span>
          </>
        )}
        <span className="hero-tech-configured-label hidden text-xs font-semibold lg:block">
          {name}
        </span>
      </div>
    </div>
  );
}

export default function HeroTechEcosystem({
  ecosystem,
  locale,
}: {
  ecosystem?: PublicHeroTechnologyEcosystem;
  locale: string;
}) {
  if (ecosystem?.isVisible === false) return null;
  const items = (ecosystem?.items || [])
    .filter((item) => item.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      role="list"
      aria-label={locale === "fa" ? "فناوری‌های Hero" : "Hero technologies"}
      className="pointer-events-none absolute inset-0 z-20"
    >
      <div
        aria-hidden="true"
        className="
          absolute inset-[-4%]
          rounded-full
          border border-dashed
          border-emerald-500/20
          dark:border-emerald-400/20
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute inset-[7%]
          rounded-full
          border border-cyan-500/10
          dark:border-cyan-400/15
        "
      />

      {items.map((item) => (
        <TechnologyCard key={item.technologyId} item={item} locale={locale} />
      ))}
    </div>
  );
}
