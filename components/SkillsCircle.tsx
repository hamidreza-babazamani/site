"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PublicTechnology } from "@/lib/services/public-portfolio";

const text = (
  value: { fa?: string; en?: string } | undefined,
  locale: string,
) =>
  (locale === "fa" ? value?.fa : value?.en)?.trim() ||
  value?.en?.trim() ||
  value?.fa?.trim() ||
  "";

function SkillCard({
  skill,
  locale,
}: {
  skill: PublicTechnology;
  locale: string;
}) {
  const name = text(skill.name, locale);

  return (
    <div
      className="
        group/card flex w-[128px] shrink-0
        flex-col items-center justify-center gap-3
        rounded-2xl border border-emerald-900/10
        bg-white/70 px-3 py-5
        backdrop-blur-sm
        transition-all duration-300
        hover:border-emerald-500/40
        hover:bg-emerald-50/90
        dark:border-white/10
        dark:bg-white/[0.04]
        dark:hover:border-emerald-400/30
        dark:hover:bg-emerald-400/[0.07]
        sm:w-[148px]
      "
    >
      {skill.iconMedia?.url?.trim() && (
        <img
          src={skill.iconMedia.url.trim()}
          alt={text(skill.iconMedia.alt, locale) || name}
          className="size-12 object-contain"
          loading="lazy"
          decoding="async"
        />
      )}
      <span className="text-center text-xs font-semibold text-slate-800 dark:text-slate-100 sm:text-sm">
        {name}
      </span>

      {skill.category && (
        <span className="text-[10px] font-medium text-emerald-700/80 dark:text-emerald-300/70">
          {skill.category}
        </span>
      )}
    </div>
  );
}

export default function SkillsCircle({
  skills,
  locale,
}: {
  skills: PublicTechnology[];
  locale: string;
}) {
  const uniqueSkills = useMemo(() => {
    const seen = new Set<string>();
    return skills.filter((skill) => {
      if (!skill?._id || seen.has(skill._id)) return false;
      seen.add(skill._id);
      return true;
    });
  }, [skills]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || uniqueSkills.length === 0) return;

    const CARD_GAP = 16;

    const measure = () => {
      const containerWidth = container.clientWidth;
      if (containerWidth <= 0) return;

      const isSmUp =
        typeof window !== "undefined" &&
        window.matchMedia("(min-width: 640px)").matches;
      const cardWidth = isSmUp ? 148 : 128;
      // Require copy length >= containerWidth + cardWidth so a duplicate card
      // can never appear at both edges of the viewport simultaneously.
      const singleCycleWidth = uniqueSkills.length * (cardWidth + CARD_GAP);
      setShouldMarquee(singleCycleWidth >= containerWidth + cardWidth);
    };

    const rafId = requestAnimationFrame(measure);
    if (typeof ResizeObserver === "undefined") {
      return () => cancelAnimationFrame(rafId);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [uniqueSkills.length]);

  if (uniqueSkills.length === 0) return null;

  return (
    <section
      aria-label={locale === "fa" ? "فناوری‌ها و ابزارها" : "Technologies and tools"}
      className="relative overflow-hidden py-12 sm:py-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />

          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">
            {locale === "fa" ? "فناوری‌ها و ابزارها" : "Technologies & Tools"}
          </h2>

          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/25 to-transparent" />
        </div>

        <div ref={containerRef} className="w-full overflow-hidden">
          {shouldMarquee ? (
            <div
              dir="ltr"
              className="
                group/marquee relative overflow-hidden
                [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]
              "
            >
              <div className="flex w-max items-stretch animate-skills-marquee motion-safe:group-hover/marquee:[animation-play-state:paused]">
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    aria-hidden={copy === 1}
                    className="flex shrink-0 gap-4 pr-4"
                  >
                    {uniqueSkills.map((skill) => (
                      <SkillCard
                        key={`${copy}-${skill._id}`}
                        skill={skill}
                        locale={locale}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              dir={locale === "fa" ? "rtl" : "ltr"}
              className="flex flex-wrap items-stretch justify-center gap-4"
            >
              {uniqueSkills.map((skill) => (
                <SkillCard key={skill._id} skill={skill} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
