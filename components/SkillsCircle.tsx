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
  if (skills.length === 0) return null;

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
                {skills.map((skill) => (
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
      </div>
    </section>
  );
}
