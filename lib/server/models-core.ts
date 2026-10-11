import { model, models, Schema } from "mongoose";

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
