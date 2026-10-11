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
  Technology,
} from "@/lib/server/models";

export type LocalizedValue = { fa: string; en: string };
export type PublicMedia = {
  url: string;
  alt?: Partial<LocalizedValue>;
};
const safeExternalUrl = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
};
const safeMedia = (value: unknown): PublicMedia | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const media = value as { url?: unknown; alt?: Partial<LocalizedValue> };
  if (typeof media.url !== "string" || !media.url.trim()) return undefined;
  return { url: media.url, ...(media.alt ? { alt: media.alt } : {}) };
};

export type PublicHero = {
  jobTitle: LocalizedValue;
  headline: LocalizedValue;
  description?: Partial<LocalizedValue>;
  primaryCta?: Partial<LocalizedValue>;
  primaryCtaUrl?: string;
  image?: PublicMedia | null;
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
};

export type PublicTechnology = {
  _id: string;
  name: LocalizedValue;
  category?: string;
  icon?: string;
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

  const [hero, profile, experiences, services, technologies, projects, contactMethods, resume] =
    await Promise.all([
      Hero.findOne({ key: "default", isVisible: true })
        .select("jobTitle headline description primaryCta primaryCtaUrl image")
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
    ]);

  return {
    hero: hero
      ? {
          ...hero,
          primaryCtaUrl: safeExternalUrl(hero.primaryCtaUrl),
          image: safeMedia(hero.image),
        }
      : null,
    profile: profile
      ? { ...profile, image: safeMedia(profile.image) }
      : null,
    experiences: experiences.map((item) => ({ ...item, _id: item._id.toString() })),
    services: services.map((item) => ({ ...item, _id: item._id.toString() })),
    technologies: technologies.map((item) => ({ ...item, _id: item._id.toString() })),
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

