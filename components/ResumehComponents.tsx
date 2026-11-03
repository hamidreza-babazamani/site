import { getLocale, getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";

import {
  getPublicPortfolio,
  type PublicTechnology,
} from "@/lib/services/public-portfolio";

import { cn } from "@/lib/utils";

// -------------------------------------
// Shared styles
// -------------------------------------

const panel = cn(
  "rounded-[26px] border border-emerald-900/[0.08]",
  "bg-white/65 backdrop-blur-xl",
  "shadow-[0_8px_35px_rgba(15,23,42,0.035)]",
  "dark:border-white/[0.08]",
  "dark:bg-white/[0.035]",
  "dark:shadow-none",
);

// -------------------------------------
// Helpers
// -------------------------------------

type Localized = {
  fa?: string;
  en?: string;
};

const text = (value: Localized | undefined, locale: string) =>
  (locale === "fa" ? value?.fa : value?.en)?.trim() ||
  value?.en?.trim() ||
  value?.fa?.trim() ||
  "";

// -------------------------------------
// Empty State
// -------------------------------------

function Empty({ label }: { label: string }) {
  return (
    <div
      className={cn(
        panel,
        "flex min-h-40 items-center justify-center",
        "p-8 text-center text-sm",
        "text-slate-500 dark:text-slate-400",
      )}
    >
      {label}
    </div>
  );
}


function Heading({
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7 space-y-3 sm:mb-9">
     


      {description && (
        <p className="max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

// -------------------------------------
// Compact Skill Card
// -------------------------------------

function SkillCard({
  item,
  locale,
}: {
  item: PublicTechnology;
  locale: string;
}) {
  return (
    <li className="min-w-0">
      <div
        className={cn(
          panel,
          "group flex min-h-16 items-center gap-3",
          "rounded-xl p-3",
          "transition-[border-color,background-color,transform]",
          "duration-200",
          "hover:-translate-y-0.5",
          "hover:border-emerald-500/25",
          "hover:bg-emerald-500/[0.04]",
          "motion-reduce:transform-none",
          "motion-reduce:transition-none",
        )}
      >
        {item.iconMedia?.url?.trim() && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center",
              "rounded-lg bg-emerald-500/[0.07]",
            )}
          >
            <img
              src={item.iconMedia.url.trim()}
              alt={
                text(item.iconMedia.alt, locale) || text(item.name, locale)
              }
              className="size-full object-contain p-1"
            />
          </span>
        )}
        <span className="min-w-0 break-words text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200 sm:text-sm">
          {text(item.name, locale)}
        </span>
      </div>
    </li>
  );
}

// -------------------------------------
// Skills Grid
// -------------------------------------

function SkillsGrid({
  items,
  locale,
}: {
  items: PublicTechnology[];
  locale: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-2",
        "sm:grid-cols-3",
        "lg:grid-cols-4",
        "xl:grid-cols-6",
      )}
    >
      {items.map((item) => (
        <SkillCard key={item._id} item={item} locale={locale} />
      ))}
    </ul>
  );
}


export default async function ResumehComponents() {
  const locale = await getLocale();
  const t = await getTranslations("HomePage");
  const data = await getPublicPortfolio();

  const fa = locale === "fa";

  const empty = fa
    ? "اطلاعاتی برای نمایش وجود ندارد."
    : "No information available yet.";

  const technologies = data.technologies;

  const visibleSkills = technologies.slice(0, 12);
  const remainingSkills = technologies.slice(12);

  return (
    <section
      dir={fa ? "rtl" : "ltr"}
      className={cn(
        "relative isolate min-h-[75vh]",
        "overflow-hidden px-4 py-16",
        "sm:px-6 sm:py-20 lg:py-24",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 -start-40 size-[420px] rounded-full bg-emerald-300/15 blur-[100px] dark:bg-emerald-500/[0.07]" />

        <div className="absolute -bottom-40 -end-40 size-[420px] rounded-full bg-cyan-300/15 blur-[100px] dark:bg-cyan-500/[0.07]" />
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="space-y-16 lg:space-y-20">

          <section aria-labelledby="skills-heading">
            <div id="skills-heading">
              <Heading
                eyebrow="Tech Stack"
                title={t("title2")}
                description={
                  fa
                    ? "فناوری‌ها و ابزارهایی که با آن‌ها کار می‌کنم."
                    : "Technologies and tools I work with."
                }
              />
            </div>

            {technologies.length > 0 ? (
              <div className="space-y-5">
                <SkillsGrid items={visibleSkills} locale={locale} />

                {remainingSkills.length > 0 && (
                  <details className="group">
                    <summary
                      className={cn(
                        "mx-auto flex w-fit cursor-pointer",
                        "list-none items-center justify-center gap-2",
                        "rounded-xl border border-emerald-500/20",
                        "px-5 py-2.5 text-sm font-semibold",
                        "text-emerald-700 dark:text-emerald-300",
                        "transition-colors",
                        "hover:bg-emerald-500/[0.06]",
                        "focus-visible:outline-2",
                        "focus-visible:outline-offset-2",
                        "focus-visible:outline-emerald-500",
                        "[&::-webkit-details-marker]:hidden",
                      )}
                    >
                      <span className="group-open:hidden">
                        {fa
                          ? `نمایش ${remainingSkills.length} مهارت دیگر`
                          : `Show ${remainingSkills.length} more skills`}
                      </span>

                      <span className="hidden group-open:inline">
                        {fa ? "نمایش کمتر" : "Show less"}
                      </span>

                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={cn(
                          "transition-transform duration-200",
                          "group-open:rotate-180",
                          "motion-reduce:transition-none",
                        )}
                      />
                    </summary>

                    <div className="mt-5">
                      <SkillsGrid items={remainingSkills} locale={locale} />
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <Empty label={empty} />
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
