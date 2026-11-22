import "server-only";

import { unstable_cache } from "next/cache";
import { connectDatabase } from "@/lib/server/db";
import {
  ContactMethod,
  Education,
  Experience,
  Hero,
  Language,
  Profile,
  Project,
  Resume,
  Service,
  SiteSettings,
  Stat,
  Technology,
} from "@/lib/server/models";
import {
  HERO_TECHNOLOGY_ECOSYSTEM_DEFAULT,
  type HeroTechnologyItemConfig,
} from "@/lib/server/hero-technology-config";

export type LocalizedValue = { fa: string; en: string };
export type PublicMedia = {
  url: string;
  alt?: Partial<LocalizedValue>;
};
const safeExternalUrl = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
};
const safeMedia = (value: unknown): PublicMedia | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const media = value as { url?: unknown; alt?: unknown };
  if (typeof media.url !== "string" || !media.url.trim()) return undefined;
  const sourceAlt = media.alt;
  const alt =
    sourceAlt && typeof sourceAlt === "object" && !Array.isArray(sourceAlt)
      ? sourceAlt as Record<string, unknown>
      : undefined;
  const safeAlt: Partial<LocalizedValue> | undefined = alt
    ? {
        ...(typeof alt.fa === "string" ? { fa: alt.fa } : {}),
        ...(typeof alt.en === "string" ? { en: alt.en } : {}),
      }
    : undefined;
  return {
    url: media.url,
    ...(safeAlt && Object.keys(safeAlt).length > 0 ? { alt: safeAlt } : {}),
  };
};

export type PublicSiteBranding = {
  siteName?: Partial<LocalizedValue>;
  title?: Partial<LocalizedValue>;
  description?: Partial<LocalizedValue>;
  keywords?: { fa?: string[]; en?: string[] };
  robots?: { index?: boolean; follow?: boolean };
  logo?: PublicMedia;
  openGraphImage?: PublicMedia;
  favicon?: PublicMedia;
};

const cleanLocalizedPartial = (value: unknown): Partial<LocalizedValue> | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const fa = typeof record.fa === "string" && record.fa.trim() ? record.fa.trim() : undefined;
  const en = typeof record.en === "string" && record.en.trim() ? record.en.trim() : undefined;
  if (!fa && !en) return undefined;
  return { ...(fa ? { fa } : {}), ...(en ? { en } : {}) };
};

const fetchPublicSiteBranding = unstable_cache(
  async (): Promise<PublicSiteBranding> => {
    await connectDatabase();
    const settings = await SiteSettings.findOne({ key: "default" })
      .select("siteName title description keywords robots logo openGraphImage favicon")
      .lean();

    const safeBrandMedia = (value: unknown): PublicMedia | undefined => {
      if (!value || typeof value !== "object") return undefined;
      const media = value as { url?: unknown; alt?: unknown };
      const url = safeExternalUrl(media.url);
      return url ? safeMedia({ url, alt: media.alt }) : undefined;
    };

    const siteName = cleanLocalizedPartial(settings?.siteName);
    const title = cleanLocalizedPartial(settings?.title);
    const description = cleanLocalizedPartial(settings?.description);
    const rawKeywords = settings?.keywords as { fa?: unknown; en?: unknown } | undefined;
    const keywordsFa = Array.isArray(rawKeywords?.fa)
      ? rawKeywords.fa.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : undefined;
    const keywordsEn = Array.isArray(rawKeywords?.en)
      ? rawKeywords.en.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : undefined;
    const keywords =
      (keywordsFa?.length || keywordsEn?.length)
        ? {
            ...(keywordsFa?.length ? { fa: keywordsFa } : {}),
            ...(keywordsEn?.length ? { en: keywordsEn } : {}),
          }
        : undefined;
    const robotsRecord = settings?.robots as { index?: unknown; follow?: unknown } | undefined;
    const robots =
      robotsRecord &&
      (typeof robotsRecord.index === "boolean" || typeof robotsRecord.follow === "boolean")
        ? {
            ...(typeof robotsRecord.index === "boolean" ? { index: robotsRecord.index } : {}),
            ...(typeof robotsRecord.follow === "boolean" ? { follow: robotsRecord.follow } : {}),
          }
        : undefined;

    const logo = safeBrandMedia(settings?.logo);
    const openGraphImage = safeBrandMedia(settings?.openGraphImage);
    const favicon = safeBrandMedia(settings?.favicon);
    return {
      ...(siteName ? { siteName } : {}),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(keywords ? { keywords } : {}),
      ...(robots ? { robots } : {}),
      ...(logo ? { logo } : {}),
      ...(openGraphImage ? { openGraphImage } : {}),
      ...(favicon ? { favicon } : {}),
    };
  },
  ["public-site-branding"],
  { tags: ["site-settings"], revalidate: 300 },
);

/** Read only the public-safe brand & metadata settings used by the shared site layout. */
export async function getPublicSiteBranding(): Promise<PublicSiteBranding> {
  return fetchPublicSiteBranding();
}

export type PublicHero = {
  jobTitle: LocalizedValue;
  headline: LocalizedValue;
  description?: Partial<LocalizedValue>;
  primaryCta?: Partial<LocalizedValue>;
  primaryCtaUrl?: string;
  image?: PublicMedia | null;
  technologyEcosystem: PublicHeroTechnologyEcosystem;
};

export type PublicHeroTechnologyItem = HeroTechnologyItemConfig & {
  name: LocalizedValue;
  iconMedia?: PublicMedia;
};

export type PublicHeroTechnologyEcosystem = {
  isVisible: boolean;
  items: PublicHeroTechnologyItem[];
};

export type PublicProfile = {
  name: LocalizedValue;
  bio: LocalizedValue;
  location?: Partial<LocalizedValue>;
  availability?: Partial<LocalizedValue>;
  image?: PublicMedia | null;
};

export type PublicExperience = {
  _id: string;
  company: string;
  role: LocalizedValue;
  description?: Partial<LocalizedValue>;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
};

export type PublicEducation = {
  _id: string;
  institution: LocalizedValue;
  degree: LocalizedValue;
  fieldOfStudy?: Partial<LocalizedValue>;
  location?: Partial<LocalizedValue>;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
  description?: Partial<LocalizedValue>;
};

export type PublicLanguage = {
  _id: string;
  name: LocalizedValue;
  level: LocalizedValue;
};

export type PublicStat = {
  _id: string;
  label: LocalizedValue;
  value: number;
};

export type PublicResumeComposition = {
  professionalSummary?: Partial<LocalizedValue>;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
  experienceIds?: string[];
  projectIds?: string[];
  technologyIds?: string[];
  educationIds?: string[];
  languageIds?: string[];
  contactMethodIds?: string[];
};

export type PublicService = {
  _id: string;
  title: LocalizedValue;
  description: LocalizedValue;
  icon?: string;
  image?: PublicMedia;
};

export type PublicTechnology = {
  _id: string;
  name: LocalizedValue;
  category?: string;
  icon?: string;
  iconMedia?: PublicMedia;
  proficiency?: number;
};

export type PublicProject = {
  _id: string;
  title: LocalizedValue;
  shortDescription?: Partial<LocalizedValue>;
  description?: Partial<LocalizedValue>;
  technologies: string[];
  images: PublicMedia[];
  liveUrl?: string;
  repositoryUrl?: string;
};

export type PublicContactMethod = {
  _id: string;
  type: string;
  label?: Partial<LocalizedValue>;
  value: string;
  url?: string;
  icon?: string;
};

export type PublicPortfolio = {
  hero: PublicHero | null;
  fallbackImage?: PublicMedia;
  profile: PublicProfile | null;
  experiences: PublicExperience[];
  education: PublicEducation[];
  languages: PublicLanguage[];
  stats: PublicStat[];
  services: PublicService[];
  technologies: PublicTechnology[];
  projects: PublicProject[];
  contactMethods: PublicContactMethod[];
  resumeAvailable: boolean;
  hasResumeFile: boolean;
  publishedResume: PublicResumeComposition | null;
};

const toIsoDate = (value: unknown): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const fetchPublicPortfolio = unstable_cache(
  async (): Promise<PublicPortfolio> => {
    await connectDatabase();

    const [
      hero,
      profile,
      experiences,
      education,
      languages,
      stats,
      services,
      technologies,
      projects,
      contactMethods,
      resume,
      siteSettings,
    ] = await Promise.all([
      Hero.findOne({ key: "default", isVisible: true })
        .select("jobTitle headline description primaryCta primaryCtaUrl image technologyEcosystem")
        .lean<PublicHero | null>(),
      Profile.findOne({ key: "default" })
        .select("name bio location availability image")
        .lean<PublicProfile | null>(),
      Experience.find({ isVisible: true })
        .sort({ order: 1, startDate: -1 })
        .lean(),
      Education.find({ isVisible: true })
        .sort({ order: 1, startDate: -1 })
        .lean(),
      Language.find({ isVisible: true }).sort({ order: 1 }).lean(),
      Stat.find({ isVisible: true }).sort({ order: 1 }).lean(),
      Service.find({ isVisible: true }).sort({ order: 1 }).lean<PublicService[]>(),
      Technology.find({ isVisible: true }).sort({ order: 1 }).lean<PublicTechnology[]>(),
      Project.find({ isVisible: true })
        .sort({ featured: -1, order: 1 })
        .lean<PublicProject[]>(),
      ContactMethod.find({ isVisible: true })
        .sort({ order: 1 })
        .lean<PublicContactMethod[]>(),
      Resume.findOne({ key: "default" }).select("file.url status published").lean(),
      SiteSettings.findOne({ key: "default" }).select("fallbackImage").lean(),
    ]);

    const settingsFallback = siteSettings?.fallbackImage as
      | { url?: unknown; alt?: unknown }
      | undefined;
    const fallbackUrl = safeExternalUrl(settingsFallback?.url);
    const fallbackImage = fallbackUrl
      ? safeMedia({ ...settingsFallback, url: fallbackUrl })
      : undefined;

    const technologyById = new Map(
      technologies.map((technology) => [technology._id.toString(), technology]),
    );
    const ecosystem = hero?.technologyEcosystem ?? HERO_TECHNOLOGY_ECOSYSTEM_DEFAULT;
    const publicEcosystem: PublicHeroTechnologyEcosystem = {
      isVisible: ecosystem.isVisible !== false,
      items: Array.isArray(ecosystem.items)
        ? ecosystem.items.flatMap((item) => {
            const technologyId = String(item.technologyId);
            const technology = technologyById.get(technologyId);
            if (!technology) return [];
            const iconUrl = safeExternalUrl(technology.iconMedia?.url);
            const iconMedia = iconUrl
              ? safeMedia({ ...technology.iconMedia, url: iconUrl })
              : undefined;
            return [{
              ...item,
              technologyId,
              name: technology.name,
              ...(iconMedia ? { iconMedia } : {}),
            }];
          })
        : [],
    };

    const rawPublished =
      resume?.status === "published" && resume.published && typeof resume.published === "object"
        ? (resume.published as Record<string, unknown>)
        : null;
    const toIdArray = (value: unknown) =>
      Array.isArray(value) ? value.map((id) => String(id)) : [];
    const publishedResume: PublicResumeComposition | null = rawPublished
      ? {
          professionalSummary: cleanLocalizedPartial(rawPublished.professionalSummary),
          sectionOrder: Array.isArray(rawPublished.sectionOrder)
            ? rawPublished.sectionOrder.map((item) => String(item))
            : undefined,
          sectionVisibility:
            rawPublished.sectionVisibility && typeof rawPublished.sectionVisibility === "object"
              ? (rawPublished.sectionVisibility as Record<string, boolean>)
              : undefined,
          experienceIds: toIdArray(rawPublished.experienceIds),
          projectIds: toIdArray(rawPublished.projectIds),
          technologyIds: toIdArray(rawPublished.technologyIds),
          educationIds: toIdArray(rawPublished.educationIds),
          languageIds: toIdArray(rawPublished.languageIds),
          contactMethodIds: toIdArray(rawPublished.contactMethodIds),
        }
      : null;

    return {
      hero: hero
        ? {
            ...hero,
            primaryCtaUrl: safeExternalUrl(hero.primaryCtaUrl),
            image: safeMedia(hero.image),
            technologyEcosystem: publicEcosystem,
          }
        : null,
      ...(fallbackImage ? { fallbackImage } : {}),
      profile: profile
        ? { ...profile, image: safeMedia(profile.image) }
        : null,
      experiences: experiences.map((item) => ({
        _id: item._id.toString(),
        company: item.company,
        role: item.role,
        description: item.description,
        startDate: toIsoDate(item.startDate) ?? "",
        endDate: toIsoDate(item.endDate),
        current: item.current,
      })),
      education: education.map((item) => ({
        _id: item._id.toString(),
        institution: item.institution,
        degree: item.degree,
        fieldOfStudy: item.fieldOfStudy,
        location: item.location,
        startDate: toIsoDate(item.startDate),
        endDate: toIsoDate(item.endDate),
        current: item.current,
        description: item.description,
      })),
      languages: languages.map((item) => ({
        _id: item._id.toString(),
        name: item.name,
        level: item.level,
      })),
      stats: stats.map((item) => ({
        _id: item._id.toString(),
        label: item.label,
        value: item.value,
      })),
      services: services.map(({ image, ...item }) => {
        const safeImage = safeMedia(image);
        return {
          ...item,
          _id: item._id.toString(),
          ...(safeImage ? { image: safeImage } : {}),
        };
      }),
      technologies: technologies.map(({ iconMedia, ...item }) => {
        const safeIconMedia = safeMedia(iconMedia);
        return {
          ...item,
          _id: item._id.toString(),
          ...(safeIconMedia ? { iconMedia: safeIconMedia } : {}),
        };
      }),
      projects: projects.map((item) => ({
        ...item,
        _id: item._id.toString(),
        liveUrl: safeExternalUrl(item.liveUrl),
        repositoryUrl: safeExternalUrl(item.repositoryUrl),
        images: Array.isArray(item.images)
          ? item.images
              .map(safeMedia)
              .filter((image): image is PublicMedia => Boolean(image?.url))
          : [],
      })),
      contactMethods: contactMethods.map((item) => ({
        ...item,
        _id: item._id.toString(),
        url: safeExternalUrl(item.url),
      })),
      hasResumeFile: Boolean(resume?.file?.url),
      resumeAvailable: Boolean(resume?.file?.url || publishedResume),
      publishedResume,
    };
  },
  ["public-portfolio"],
  { tags: ["portfolio"], revalidate: 300 },
);

export async function getPublicPortfolio(): Promise<PublicPortfolio> {
  return fetchPublicPortfolio();
}

