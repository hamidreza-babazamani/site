import { model, models, Schema } from "mongoose";
import {
  HERO_TECHNOLOGY_ECOSYSTEM_DEFAULT,
  HERO_TECHNOLOGY_HEX_COLOR_PATTERN,
  HERO_TECHNOLOGY_LIMITS,
} from "./hero-technology-config";

const localized = new Schema(
  { fa: { type: String, default: "" }, en: { type: String, default: "" } },
  { _id: false },
);
// const media = new Schema(
//   { url: { type: String, required: true }, key: String, alt: localized },
//   { _id: false },
// );
const media = new Schema(
  {
    url: { type: String, required: true },
    key: String,
    fileId: String,
    alt: localized,
  },
  { _id: false },
);
const opts = { timestamps: true, versionKey: false } as const;

const heroTechnologyPosition = new Schema(
  {
    horizontalAnchor: { type: String, enum: ["left", "right"], required: true },
    horizontalOffsetPercent: {
      type: Number,
      min: HERO_TECHNOLOGY_LIMITS.minPositionOffsetPercent,
      max: HERO_TECHNOLOGY_LIMITS.maxPositionOffsetPercent,
      required: true,
    },
    verticalAnchor: { type: String, enum: ["top", "bottom"], required: true },
    verticalOffsetPercent: {
      type: Number,
      min: HERO_TECHNOLOGY_LIMITS.minPositionOffsetPercent,
      max: HERO_TECHNOLOGY_LIMITS.maxPositionOffsetPercent,
      required: true,
    },
  },
  { _id: false },
);

const heroTechnologyBreakpoint = new Schema(
  {
    isVisible: { type: Boolean, required: true },
    position: { type: heroTechnologyPosition, required: true },
  },
  { _id: false },
);

const heroTechnologyItem = new Schema(
  {
    technologyId: {
      type: Schema.Types.ObjectId,
      ref: "Technology",
      required: true,
    },
    isVisible: { type: Boolean, default: true, required: true },
    order: {
      type: Number,
      min: 0,
      max: HERO_TECHNOLOGY_LIMITS.maxOrder,
      required: true,
    },
    color: {
      light: { type: String, match: HERO_TECHNOLOGY_HEX_COLOR_PATTERN, required: true },
      dark: { type: String, match: HERO_TECHNOLOGY_HEX_COLOR_PATTERN, required: true },
    },
    iconSize: {
      type: Number,
      min: HERO_TECHNOLOGY_LIMITS.minIconSize,
      max: HERO_TECHNOLOGY_LIMITS.maxIconSize,
      required: true,
    },
    responsive: {
      desktop: { type: heroTechnologyBreakpoint, required: true },
      tablet: { type: heroTechnologyBreakpoint, required: true },
      mobile: { type: heroTechnologyBreakpoint, required: true },
    },
    animation: {
      isEnabled: { type: Boolean, required: true },
      durationMs: {
        type: Number,
        min: HERO_TECHNOLOGY_LIMITS.minAnimationDurationMs,
        max: HERO_TECHNOLOGY_LIMITS.maxAnimationDurationMs,
        required: true,
      },
      delayMs: {
        type: Number,
        min: HERO_TECHNOLOGY_LIMITS.minAnimationDelayMs,
        max: HERO_TECHNOLOGY_LIMITS.maxAnimationDelayMs,
        required: true,
      },
    },
  },
  { _id: false },
);

const heroTechnologyEcosystem = new Schema(
  {
    isVisible: { type: Boolean, default: true, required: true },
    items: {
      type: [heroTechnologyItem],
      default: [],
      validate: {
        validator: (items: Array<{ technologyId?: unknown }>) =>
          items.length <= HERO_TECHNOLOGY_LIMITS.maxItems &&
          new Set(items.map((item) => String(item.technologyId))).size === items.length,
        message: "Hero technology items must be unique and within the item limit",
      },
    },
  },
  { _id: false },
);

export const Admin =
  models.Admin ??
  model(
    "Admin",
    new Schema(
      {
        email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
        },
        passwordHash: { type: String, required: true, select: false },
        role: { type: String, default: "admin" },
      },
      { timestamps: true },
    ),
  );
export const Hero =
  models.Hero ??
  model(
    "Hero",
    new Schema(
      {
        key: { type: String, unique: true, default: "default" },
        jobTitle: { type: localized, required: true },
        headline: { type: localized, required: true },
        description: localized,
        image: media,
        primaryCta: localized,
        primaryCtaUrl: String,
        isVisible: { type: Boolean, default: true },
        technologyEcosystem: {
          type: heroTechnologyEcosystem,
          default: () => ({
            isVisible: HERO_TECHNOLOGY_ECOSYSTEM_DEFAULT.isVisible,
            items: [],
          }),
        },
      },
      opts,
    ),
  );
export const Profile =
  models.Profile ??
  model(
    "Profile",
    new Schema(
      {
        key: { type: String, unique: true, default: "default" },
        name: { type: localized, required: true },
        bio: { type: localized, required: true },
        location: localized,
        availability: localized,
        image: media,
        email: String,
      },
      opts,
    ),
  );
export const SiteSettings =
  models.SiteSettings ??
  model(
    "SiteSettings",
    new Schema(
      {
        key: { type: String, unique: true, default: "default" },
        siteName: localized,
        title: localized,
        description: localized,
        keywords: {
          fa: { type: [String], default: undefined },
          en: { type: [String], default: undefined },
        },
        robots: {
          index: Boolean,
          follow: Boolean,
        },
        logo: media,
        openGraphImage: media,
        favicon: media,
        fallbackImage: media,
      },
      opts,
    ),
  );
export const Experience =
  models.Experience ??
  model(
    "Experience",
    new Schema(
      {
        company: { type: String, required: true, trim: true },
        role: { type: localized, required: true },
        description: localized,
        startDate: { type: Date, required: true },
        endDate: Date,
        current: Boolean,
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
      },
      opts,
    ),
  );
export const Service =
  models.Service ??
  model(
    "Service",
    new Schema(
      {
        title: { type: localized, required: true },
        description: { type: localized, required: true },
        icon: String,
        image: media,
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
      },
      opts,
    ),
  );
export const Technology =
  models.Technology ??
  model(
    "Technology",
    new Schema(
      {
        name: { type: localized, required: true },
        category: String,
        icon: String,
        iconMedia: media,
        proficiency: { type: Number, min: 0, max: 100 },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
      },
      opts,
    ),
  );
export const Language =
  models.Language ??
  model(
    "Language",
    new Schema(
      {
        name: { type: localized, required: true },
        level: { type: localized, required: true },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
      },
      opts,
    ),
  );
export const Project =
  models.Project ??
  model(
    "Project",
    new Schema(
      {
        title: { type: localized, required: true },
        slug: {
          type: String,
          required: true,
          unique: true,
          trim: true,
          lowercase: true,
        },
        shortDescription: localized,
        description: localized,
        technologies: { type: [String], default: [] },
        images: { type: [media], default: [] },
        liveUrl: String,
        repositoryUrl: String,
        featured: Boolean,
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
      },
      opts,
    ),
  );
export const Resume =
  models.Resume ??
  model(
    "Resume",
    new Schema(
      {
        key: { type: String, unique: true, default: "default" },
        title: localized,
        file: { type: media, default: null },
        updatedBy: String,
      },
      opts,
    ),
  );
export const ContactMethod =
  models.ContactMethod ??
  model(
    "ContactMethod",
    new Schema(
      {
        type: { type: String, required: true },
        label: { type: localized },
        value: { type: String, required: true },
        url: String,
        icon: String,
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
      },
      opts,
    ),
  );
export const ContactMessage =
  models.ContactMessage ??
  model(
    "ContactMessage",
    new Schema(
      {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        email: { type: String, required: true, trim: true, lowercase: true },
        subject: { type: String, maxlength: 200 },
        message: { type: String, required: true, maxlength: 5000 },
        locale: { type: String, enum: ["fa", "en"], default: "en" },
        status: {
          type: String,
          enum: ["new", "read", "replied", "archived"],
          default: "new",
        },
        readAt: Date,
      },
      opts,
    ),
  );
export const Stat =
  models.Stat ??
  model(
    "Stat",
    new Schema(
      {
        label: { type: localized, required: true },
        value: { type: Number, required: true },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
      },
      opts,
    ),
  );
