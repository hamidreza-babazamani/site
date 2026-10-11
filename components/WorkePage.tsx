
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  Github,
  LayoutGrid,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { listPublicProjects } from "@/lib/api/requests/projects";

// TODO(Codex): Move these types to types/project.ts.
// Verify the exact response shape against the existing
// public projects API before changing this contract.

type Localized = {
  fa?: string;
  en?: string;
};

export type ApiProject = {
  _id?: string;
  id?: string;
  title?: Localized;
  description?: Localized;
  shortDescription?: Localized;
  images?: {
    url: string;
    alt?: Localized;
  }[];
  technologies?: string[];
  liveUrl?: string;
  repositoryUrl?: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  imageAlt: string;
  technologies: string[];
  liveUrl: string | null;
  repositoryUrl: string | null;
};

function localize(
  value: Localized | undefined,
  locale: string
): string {
  if (!value) return "";

  const selected = locale === "fa" ? value.fa : value.en;

  return selected?.trim() ||
    value.en?.trim() ||
    value.fa?.trim() ||
    "";
}

function safeExternalUrl(
  value: string | undefined
): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function mapProject(
  item: ApiProject,
  locale: string,
  index: number
): Project {
  const title = localize(item.title, locale) || "Project";
  const firstImage = item.images?.find((image) => image.url);

  return {
    id: item._id || item.id || `project-${index}`,
    title,
    description:
      localize(item.shortDescription, locale) ||
      localize(item.description, locale),
    image: firstImage?.url || null,
    imageAlt:
      localize(firstImage?.alt, locale) || title,
    technologies: Array.isArray(item.technologies)
      ? item.technologies.filter(
          (tech): tech is string => typeof tech === "string"
        )
      : [],
    liveUrl: safeExternalUrl(item.liveUrl),
    repositoryUrl: safeExternalUrl(item.repositoryUrl),
  };
}

function ProjectImage({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  const source = project.image;

  return (
    <div
      className="
        group/image relative
        aspect-[16/10] w-full
        overflow-hidden
        bg-gradient-to-br
        from-emerald-50
        via-slate-100
        to-cyan-50
        dark:from-[#16252a]
        dark:via-[#111b24]
        dark:to-[#172a30]
      "
    >
      {source && !failed ? (
        <Image
          src={source}
          alt={project.imageAlt}
          fill
          priority={priority}
          quality={80}
          sizes={
            priority
              ? "(max-width: 1024px) 100vw, 60vw"
              : "(max-width: 640px) 100vw, 50vw"
          }
          className="
            object-contain p-3
            transition-transform duration-700
            ease-out
            motion-safe:group-hover/image:scale-[1.035]
            motion-reduce:transition-none
            sm:p-5
          "
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="
            absolute inset-0 flex
            flex-col items-center justify-center gap-3
            text-slate-400 dark:text-slate-500
          "
        >
          <Code2 size={36} strokeWidth={1.2} />
          <span className="text-xs font-medium">
            Project preview
          </span>
        </div>
      )}

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-gradient-to-t
          from-slate-950/[0.04]
          to-transparent
          dark:from-black/15
        "
      />
    </div>
  );
}

function ProjectActions({
  project,
  liveLabel,
}: {
  project: Project;
  liveLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex min-h-11 items-center
            justify-center gap-2
            rounded-xl
            bg-gradient-to-r
            from-emerald-600 to-teal-600
            px-4 py-2.5
            text-sm font-semibold text-white
            shadow-[0_6px_20px_rgba(16,185,129,0.15)]
            transition-[box-shadow,transform]
            duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_10px_25px_rgba(16,185,129,0.25)]
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-emerald-500
            motion-reduce:transform-none
          "
        >
          {liveLabel}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      )}

      {project.repositoryUrl && (
        <a
          href={project.repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub: ${project.title}`}
          className="
            inline-flex min-h-11 items-center
            justify-center gap-2 rounded-xl
            border border-emerald-900/10
            bg-white/70 px-4 py-2.5
            text-sm font-semibold text-slate-700
            transition-colors duration-200
            hover:border-emerald-500/30
            hover:bg-emerald-500/[0.07]
            dark:border-white/10
            dark:bg-white/[0.05]
            dark:text-slate-200
            dark:hover:border-emerald-400/25
          "
        >
          <Github size={18} aria-hidden="true" />
          GitHub
        </a>
      )}
    </div>
  );
}

function TechnologyTags({
  items,
}: {
  items: string[];
}) {
  if (!items.length) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((technology, index) => (
        <li
          key={`${technology}-${index}`}
          className="
            rounded-full
            border border-emerald-500/10
            bg-emerald-500/[0.06]
            px-3 py-1.5
            text-xs font-medium
            text-emerald-800
            dark:border-emerald-400/10
            dark:bg-emerald-400/[0.07]
            dark:text-emerald-200
          "
        >
          {technology}
        </li>
      ))}
    </ul>
  );
}

function FeaturedProject({
  project,
  liveLabel,
  featuredLabel,
}: {
  project: Project;
  liveLabel: string;
  featuredLabel: string;
}) {
  return (
    <article
      className="
        group overflow-hidden
        rounded-[28px]
        border border-emerald-900/[0.08]
        bg-white/70
        shadow-[0_12px_50px_rgba(15,23,42,0.05)]
        backdrop-blur-xl
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-none
      "
    >
      <div className="grid lg:grid-cols-2">
        <ProjectImage
          key={`${project.id}-${project.image}`}
          project={project}
          priority
        />

        <div
          className="
            flex min-w-0 flex-col
            justify-center gap-5
            p-6 sm:p-8 lg:p-10
          "
        >
          <div
            className="
              flex items-center gap-2
              text-xs font-semibold
              tracking-wider
              text-emerald-700
              dark:text-emerald-300
            "
          >
            <Sparkles size={15} aria-hidden="true" />
            {featuredLabel}
          </div>

          <h2
            className="
              text-2xl font-bold leading-snug
              tracking-tight text-slate-900
              dark:text-white
              sm:text-3xl
            "
          >
            {project.title}
          </h2>

          <p
            className="
              text-sm leading-7
              text-slate-600
              dark:text-slate-400
              sm:text-base sm:leading-8
            "
          >
            {project.description}
          </p>

          <TechnologyTags items={project.technologies} />

          <div
            className="
              mt-2 border-t
              border-slate-200/70 pt-5
              dark:border-white/10
            "
          >
            <ProjectActions
              project={project}
              liveLabel={liveLabel}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectCard({
  project,
  index,
  liveLabel,
}: {
  project: Project;
  index: number;
  liveLabel: string;
}) {
  return (
    <article
      className="
        group flex h-full flex-col
        overflow-hidden rounded-[24px]
        border border-emerald-900/[0.08]
        bg-white/65
        shadow-[0_8px_35px_rgba(15,23,42,0.035)]
        backdrop-blur-lg
        transition-[border-color,box-shadow,transform]
        duration-300
        hover:-translate-y-1
        hover:border-emerald-500/25
        hover:shadow-[0_18px_45px_rgba(16,185,129,0.08)]
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-none
        dark:hover:border-emerald-400/25
        motion-reduce:transform-none
      "
    >
      <ProjectImage
        key={`${project.id}-${project.image}`}
        project={project}
      />

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <span
          className="
            text-xs font-semibold tracking-widest
            text-emerald-700
            dark:text-emerald-300
          "
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <h3
          className="
            text-lg font-bold leading-snug
            text-slate-900
            dark:text-slate-100
            sm:text-xl
          "
        >
          {project.title}
        </h3>

        <p
          className="
            line-clamp-3
            text-sm leading-7
            text-slate-600
            dark:text-slate-400
          "
        >
          {project.description}
        </p>

        <TechnologyTags items={project.technologies} />

        <div className="mt-auto pt-3">
          <ProjectActions
            project={project}
            liveLabel={liveLabel}
          />
        </div>
      </div>
    </article>
  );
}

function ProjectStatus({
  type,
  onRetry,
  locale,
}: {
  type: "loading" | "error" | "empty";
  onRetry: () => void;
  locale: string;
}) {
  const fa = locale === "fa";

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className="
        flex min-h-72 flex-col
        items-center justify-center
        gap-4 rounded-[26px]
        border border-emerald-900/[0.08]
        bg-white/65 p-8 text-center
        dark:border-white/10
        dark:bg-white/[0.035]
      "
    >
      {type === "loading" ? (
        <LoaderCircle
          size={30}
          className="
            animate-spin text-emerald-600
            dark:text-emerald-300
            motion-reduce:animate-none
          "
        />
      ) : (
        <BriefcaseBusiness
          size={30}
          className="text-emerald-600 dark:text-emerald-300"
        />
      )}

      <p className="text-sm text-slate-600 dark:text-slate-300">
        {type === "loading"
          ? fa
            ? "در حال دریافت نمونه‌کارها..."
            : "Loading projects..."
          : type === "error"
            ? fa
              ? "دریافت نمونه‌کارها با مشکل مواجه شد."
              : "Could not load projects."
            : fa
              ? "هنوز نمونه‌کاری برای نمایش منتشر نشده است."
              : "No published projects yet."}
      </p>

      {type === "error" && (
        <button
          type="button"
          onClick={onRetry}
          className="
            inline-flex min-h-11 items-center gap-2
            rounded-xl border border-emerald-500/20
            bg-emerald-500/10 px-4
            text-sm font-semibold
            text-emerald-700
            hover:bg-emerald-500/15
            dark:text-emerald-300
          "
        >
          <RefreshCw size={16} aria-hidden="true" />
          {fa ? "تلاش مجدد" : "Try again"}
        </button>
      )}
    </div>
  );
}

export default function WorkePage({
  initialProjects,
  embedded = false,
}: {
  initialProjects?: ApiProject[];
  embedded?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("HomePage.project");

  const [projects, setProjects] = useState<Project[]>(() =>
    initialProjects?.map((item, index) => mapProject(item, locale, index)) ?? [],
  );
  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  > (initialProjects ? "success" : "loading");
  const [retryKey, setRetryKey] = useState(0);

  // TODO(Codex): Preserve this existing public endpoint.
  // Inspect the real API response and project schema.
  // Verify whether it supports pagination, visibility,
  // ordering, featured projects and image galleries.
  //
  // In the final architecture:
  // - Fetch public projects in a Server Component.
  // - Use a typed mapper for localized content.
  // - Keep the visual components reusable.
  // - Never fetch /api/admin/* from the public page.
  // - Do not send admin cookies or tokens.
  // - Add cache/revalidation based on the existing
  //   admin update/invalidation strategy.
  // - Handle empty, error and loading states explicitly.
  // - Never silently replace API failures with fake data.

  useEffect(() => {
    // Reset on locale changes to prevent stale-language UI.
    if (initialProjects) {
      setProjects(initialProjects.map((item, index) => mapProject(item, locale, index)));
      setStatus("success");
      return;
    }
    setStatus("loading");

    listPublicProjects()
      .then((result) => {
        if (!Array.isArray(result.data)) throw new Error("Invalid projects response");
        setProjects(result.data.map((item, index) => mapProject(item, locale, index)));
        setStatus("success");
      })
      .catch(() => setStatus("error"));

  }, [locale, retryKey, initialProjects]);

  const featured = projects[0];
  const remaining = projects.slice(1);

  return (
    <section
      dir={locale === "fa" ? "rtl" : "ltr"}
      className={`
        relative isolate min-h-[75vh]
        overflow-hidden
        px-4 py-16
        sm:px-6 sm:py-20
        lg:py-24
      ${embedded ? "px-0 py-0" : ""}
      `}
    >
      {/* Subtle aurora background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="
            absolute -top-40 -start-40
            size-[450px] rounded-full
            bg-emerald-300/15 blur-[100px]
            dark:bg-emerald-500/[0.07]
          "
        />
        <div
          className="
            absolute -bottom-40 -end-40
            size-[450px] rounded-full
            bg-cyan-300/15 blur-[100px]
            dark:bg-cyan-500/[0.07]
          "
        />
      </div>

      <div className="container mx-auto max-w-7xl">
        {/* Heading */}
        <header className="mb-10 flex flex-col gap-4 sm:mb-12">
          <div
            className="
              inline-flex w-fit items-center gap-2
              rounded-full
              border border-emerald-500/15
              bg-emerald-500/[0.07]
              px-4 py-2
              text-xs font-semibold
              text-emerald-700
              dark:text-emerald-300
            "
          >
            <LayoutGrid size={15} aria-hidden="true" />
            {locale === "fa" ? "نمونه‌کارها" : "Selected Work"}
          </div>

          <h1
            className="
              text-3xl font-bold tracking-tight
              text-slate-900 dark:text-white
              sm:text-4xl
            "
          >
            {locale === "fa"
              ? "پروژه‌هایی که ساخته‌ام"
              : "Projects I've built"}
          </h1>

          <p
            className="
              max-w-2xl text-sm leading-7
              text-slate-600 dark:text-slate-400
              sm:text-base
            "
          >
            {locale === "fa"
              ? "مجموعه‌ای از پروژه‌ها، فناوری‌ها و تجربه‌های توسعه وب."
              : "A collection of projects, technologies and web development experiences."}
          </p>
        </header>

        {status !== "success" ? (
          <ProjectStatus
            type={status}
            locale={locale}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : projects.length === 0 ? (
          <ProjectStatus
            type="empty"
            locale={locale}
            onRetry={() => setRetryKey((value) => value + 1)}
          />
        ) : (
          <div className="space-y-6">
            <FeaturedProject
              project={featured}
              featuredLabel={
                locale === "fa"
                  ? "پروژه منتخب"
                  : "Featured Project"
              }
              liveLabel={t("live")}
            />

            {remaining.length > 0 && (
              <div
                className="
                  grid gap-5
                  md:grid-cols-2
                  xl:gap-6
                "
              >
                {remaining.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index + 1}
                    liveLabel={t("live")}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
