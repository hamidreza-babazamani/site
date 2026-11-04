import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { connectDatabase } from "@/lib/server/db";
import {
  ContactMethod,
  Experience,
  Hero,
  Profile,
  Project,
  Resume,
  Service,
  SiteSettings,
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
  logo?: PublicMedia;
  favicon?: PublicMedia;
};

/** Read only the public-safe brand media used by the shared site layout and metadata. */
export async function getPublicSiteBranding(): Promise<PublicSiteBranding> {
  noStore();
  await connectDatabase();
  const settings = await SiteSettings.findOne({ key: "default" })
    .select("logo favicon")
    .lean();

  const safeBrandMedia = (value: unknown): PublicMedia | undefined => {
    if (!value || typeof value !== "object") return undefined;
    const media = value as { url?: unknown; alt?: unknown };
    const url = safeExternalUrl(media.url);
    return url ? safeMedia({ url, alt: media.alt }) : undefined;
  };

  const logo = safeBrandMedia(settings?.logo);
  const favicon = safeBrandMedia(settings?.favicon);
  return {
    ...(logo ? { logo } : {}),
    ...(favicon ? { favicon } : {}),
  };
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
  startDate: Date;
  endDate?: Date | null;
  current?: boolean;
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
  services: PublicService[];
  technologies: PublicTechnology[];
  projects: PublicProject[];
  contactMethods: PublicContactMethod[];
  resumeAvailable: boolean;
};

export async function getPublicPortfolio(): Promise<PublicPortfolio> {
  noStore();
  await connectDatabase();

  const [hero, profile, experiences, services, technologies, projects, contactMethods, resume, siteSettings] =
    await Promise.all([
      Hero.findOne({ key: "default", isVisible: true })
        .select("jobTitle headline description primaryCta primaryCtaUrl image technologyEcosystem")
        .lean<PublicHero | null>(),
      Profile.findOne({ key: "default" })
        .select("name bio location availability image")
        .lean<PublicProfile | null>(),
      Experience.find({ isVisible: true })
        .sort({ order: 1, startDate: -1 })
        .lean<PublicExperience[]>(),
      Service.find({ isVisible: true }).sort({ order: 1 }).lean<PublicService[]>(),
      Technology.find({ isVisible: true }).sort({ order: 1 }).lean<PublicTechnology[]>(),
      Project.find({ isVisible: true })
        .sort({ featured: -1, order: 1 })
        .lean<PublicProject[]>(),
      ContactMethod.find({ isVisible: true })
        .sort({ order: 1 })
        .lean<PublicContactMethod[]>(),
      Resume.findOne({ key: "default" }).select("file.url").lean(),
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
    experiences: experiences.map((item) => ({ ...item, _id: item._id.toString() })),
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
    resumeAvailable: Boolean(resume?.file?.url),
  };
}

