import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, ChevronDown, Download, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";

import {
  getPublicPortfolio,
  type PublicEducation,
  type PublicExperience,
  type PublicLanguage,
  type PublicProject,
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
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7 space-y-3 text-start sm:mb-9">
      {eyebrow && (
        <span className="inline-flex items-center rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
          {eyebrow}
        </span>
      )}

      {title && (
        <h2 className="text-start text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h2>
      )}

      {description && (
        <p className="max-w-3xl whitespace-pre-line text-start text-sm leading-7 text-slate-500 dark:text-slate-400">
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


const formatDate = (value: string | null | undefined, locale: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "short",
  });
};

function orderByIds<T extends { _id: string }>(items: T[], ids?: string[]) {
  if (!ids || ids.length === 0) return items;
  const map = new Map(items.map((item) => [item._id, item]));
  return ids.flatMap((id) => {
    const found = map.get(id);
    return found ? [found] : [];
  });
}

function ExperienceList({
  items,
  locale,
  fa,
}: {
  items: PublicExperience[];
  locale: string;
  fa: boolean;
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((item) => {
        const start = formatDate(item.startDate, locale);
        const end = item.current
          ? fa
            ? "اکنون"
            : "Present"
          : formatDate(item.endDate, locale);
        const description = text(item.description, locale);
        return (
          <li key={item._id} className={cn(panel, "min-w-0 p-4 sm:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="break-words text-base font-bold text-slate-900 dark:text-white">
                  {text(item.role, locale)}
                </h3>
                <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {item.company}
                </p>
              </div>
              {(start || end) && (
                <span className="rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {start}
                  {end ? ` — ${end}` : ""}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function EducationList({
  items,
  locale,
  fa,
}: {
  items: PublicEducation[];
  locale: string;
  fa: boolean;
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((item) => {
        const start = formatDate(item.startDate, locale);
        const end = item.current
          ? fa
            ? "در حال تحصیل"
            : "Present"
          : formatDate(item.endDate, locale);
        const field = text(item.fieldOfStudy, locale);
        const location = text(item.location, locale);
        const description = text(item.description, locale);
        return (
          <li key={item._id} className={cn(panel, "min-w-0 p-4 sm:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="break-words text-base font-bold text-slate-900 dark:text-white">
                  {text(item.degree, locale)}
                  {field ? ` — ${field}` : ""}
                </h3>
                <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {text(item.institution, locale)}
                  {location ? ` · ${location}` : ""}
                </p>
              </div>
              {(start || end) && (
                <span className="rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {start}
                  {end ? `${start ? " — " : ""}${end}` : ""}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function LanguagesList({
  items,
  locale,
}: {
  items: PublicLanguage[];
  locale: string;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item._id}
          className={cn(panel, "flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-2xl p-4")}
        >
          <span className="font-semibold text-slate-900 dark:text-white">
            {text(item.name, locale)}
          </span>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {text(item.level, locale)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ProjectsList({
  items,
  locale,
}: {
  items: PublicProject[];
  locale: string;
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((project) => {
        const title = text(project.title, locale);
        const desc =
          text(project.description, locale) ||
          text(project.shortDescription, locale);
        const url = project.repositoryUrl || project.liveUrl;
        return (
          <li key={project._id} className={cn(panel, "flex min-w-0 flex-col p-4 sm:p-6")}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="min-w-0 break-words text-base font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  <span>GitHub</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              )}
            </div>
            {project.technologies.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {desc && (
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-400">
                {desc}
              </p>
            )}
          </li>
        );
      })}
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

  const published = data.publishedResume;
  const visibility = published?.sectionVisibility;
  const technologies = published
    ? orderByIds(data.technologies, published.technologyIds)
    : data.technologies;
  const experiences = published
    ? orderByIds(data.experiences, published.experienceIds)
    : data.experiences;
  const projects = published
    ? orderByIds(data.projects, published.projectIds)
    : data.projects;
  const education = published
    ? orderByIds(data.education, published.educationIds)
    : data.education;
  const languages = published
    ? orderByIds(data.languages, published.languageIds)
    : data.languages;
  const summaryText = text(published?.professionalSummary, locale);

  const visibleSkills = technologies.slice(0, 12);
  const remainingSkills = technologies.slice(12);

  const defaultOrder = [
    "summary",
    "projects",
    "experience",
    "education",
    "skills",
    "languages",
  ];
  const sectionOrder =
    published?.sectionOrder && published.sectionOrder.length > 0
      ? published.sectionOrder
      : defaultOrder;

  const renderSection = (sectionKey: string) => {
    if (sectionKey === "summary" && summaryText && visibility?.summary !== false) {
      return (
        <section key="summary" aria-labelledby="summary-heading">
          <div id="summary-heading">
            <Heading
              eyebrow={fa ? "خلاصه حرفه‌ای" : "Summary"}
              title={fa ? "درباره مسیر حرفه‌ای" : "Professional Summary"}
              description={summaryText}
            />
          </div>
        </section>
      );
    }
    if (sectionKey === "projects" && published && projects.length > 0 && visibility?.projects !== false) {
      return (
        <section key="projects" aria-labelledby="projects-heading">
          <div id="projects-heading">
            <Heading
              eyebrow={fa ? "پروژه‌های رزومه" : "Projects"}
              title={fa ? "پروژه‌های کلیدی" : "Selected Projects"}
              description=""
            />
          </div>
          <ProjectsList items={projects} locale={locale} />
        </section>
      );
    }
    if (sectionKey === "experience" && experiences.length > 0 && visibility?.experience !== false) {
      return (
        <section key="experience" aria-labelledby="experience-heading">
          <div id="experience-heading">
            <Heading
              eyebrow={fa ? "سوابق کاری" : "Experience"}
              title={fa ? "تجربیات شغلی" : "Work Experience"}
              description=""
            />
          </div>
          <ExperienceList items={experiences} locale={locale} fa={fa} />
        </section>
      );
    }
    if (sectionKey === "skills" && visibility?.skills !== false) {
      return (
        <section key="skills" aria-labelledby="skills-heading">
          <div id="skills-heading">
            <Heading
              eyebrow="Tech Stack"
              title={t("Resume.title2")}
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
      );
    }
    if (sectionKey === "education" && education.length > 0 && visibility?.education !== false) {
      return (
        <section key="education" aria-labelledby="education-heading">
          <div id="education-heading">
            <Heading
              eyebrow={fa ? "تحصیلات" : "Education"}
              title={fa ? "سوابق تحصیلی" : "Education"}
              description=""
            />
          </div>
          <EducationList items={education} locale={locale} fa={fa} />
        </section>
      );
    }
    if (sectionKey === "languages" && languages.length > 0 && visibility?.languages !== false) {
      return (
        <section key="languages" aria-labelledby="languages-heading">
          <div id="languages-heading">
            <Heading
              eyebrow={fa ? "زبان‌ها" : "Languages"}
              title={fa ? "زبان‌های مسلط" : "Languages"}
              description=""
            />
          </div>
          <LanguagesList items={languages} locale={locale} />
        </section>
      );
    }
    return null;
  };

  return (
    <section
      dir={fa ? "rtl" : "ltr"}
      className={cn(
        "relative isolate min-h-[75vh]",
        "overflow-x-clip px-4 py-12",
        "sm:px-6 sm:py-16 lg:py-20",
        fa ? "text-right" : "text-left",
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
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t("Resume.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t("Resume.description")}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            {published && (
              <Link
                href="/resume/print"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 sm:w-auto"
              >
                <FileText size={16} aria-hidden="true" />
                <span>
                  {fa ? "مشاهده و دانلود رزومه PDF" : "View & Download PDF"}
                </span>
              </Link>
            )}
            {data.hasResumeFile && (
              <a
                href="/api/public/resume/download"
                download
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition sm:w-auto",
                  published
                    ? "border border-emerald-500/30 bg-white/80 text-emerald-700 hover:bg-emerald-50 dark:bg-white/[0.05] dark:text-emerald-300"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:brightness-110",
                )}
              >
                <Download size={16} aria-hidden="true" />
                <span>{t("me.download")}</span>
              </a>
            )}
          </div>
        </div>

        <div className="space-y-16 lg:space-y-20">
          {sectionOrder.map(renderSection)}
        </div>
      </div>
    </section>
  );
}
