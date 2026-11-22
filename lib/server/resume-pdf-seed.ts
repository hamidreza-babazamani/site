import "server-only";
import {
  ContactMethod,
  Education,
  Language,
  Profile,
  Project,
  Resume,
  Technology,
} from "./models";

const SEED_SUMMARY = {
  en: "Backend Developer with approximately one year of hands-on experience building REST APIs using Node.js, Express.js, MongoDB, and PostgreSQL. Experienced in authentication systems (JWT, OTP, Passport.js), real-time messaging (Socket.IO, Ably), API security, and Docker. Focused on writing clean, maintainable code and building reliable backend services.",
  fa: "توسعه‌دهنده بک‌اند با حدود یک سال تجربه عملی در طراحی و پیاده‌سازی REST API با استفاده از Node.js، Express.js، MongoDB و PostgreSQL. مسلط به سیستم‌های احراز هویت (JWT، OTP، Passport.js)، ارتباطات بلادرنگ (Socket.IO، Ably)، امنیت API و Docker؛ متمرکز بر نوشتن کد تمیز، قابل نگهداری و ساخت سرویس‌های پایدار.",
};

const SEED_PROJECTS = [
  {
    slug: "gym-backend",
    title: { fa: "بک‌اند مدیریت باشگاه (Gym Backend)", en: "Gym Backend" },
    shortDescription: {
      fa: "API مدیریت باشگاه با احراز هویت JWT، کنترل دسترسی، چت بلادرنگ و تست خودکار.",
      en: "Gym management REST API with JWT auth, RBAC, workout programs, and Socket.IO chat.",
    },
    description: {
      fa: "توسعه REST API مدیریت باشگاه ورزشی شامل احراز هویت JWT، کنترل دسترسی مبتنی بر نقش (RBAC)، مدیریت مربی و شاگرد، برنامه‌های تمرینی، پرداخت آزمایشی، اشتراک‌ها، چت بلادرنگ با Socket.IO، اعتبارسنجی ورودی با Zod و تست خودکار با Vitest.",
      en: "Developed a gym management REST API featuring JWT authentication, role-based access control, coach–student management, workout programs, mock payments, subscriptions, real-time chat with Socket.IO, input validation with Zod, and automated testing with Vitest.",
    },
    technologies: ["TypeScript", "Express 5", "Prisma", "PostgreSQL"],
    repositoryUrl: "https://github.com/hamidreza-babazamani/gym-Backend",
    featured: true,
    order: 1,
  },
  {
    slug: "technostore-backend",
    title: {
      fa: "بک‌اند فروشگاه تکنواستور (TechnoStore)",
      en: "TechnoStore Backend",
    },
    shortDescription: {
      fa: "API فروشگاهی ماژولار با تایپ‌اسکریپت، امنیت Helmet و بیش از ۳۳ تست یکپارچه.",
      en: "Modular e-commerce REST API using TypeScript, MongoDB, Jest, and Supertest.",
    },
    description: {
      fa: "توسعه REST API فروشگاهی با TypeScript و معماری ماژولار\nپیاده‌سازی احراز هویت ادمین، محدودیت نرخ درخواست (Rate Limiting) و هدرهای امنیتی Helmet\nجلوگیری از منفی شدن موجودی در سفارش‌های هم‌زمان با به‌روزرسانی‌های شرطی دیتابیس\nنگارش بیش از ۳۳ تست یکپارچه با Jest و Supertest و مستندسازی API با Swagger",
      en: "Developed an e-commerce REST API using TypeScript and a modular architecture.\nImplemented admin authentication, rate limiting, and Helmet security headers.\nPrevented negative inventory during concurrent order processing using conditional database updates.\nWrote 33+ integration tests with Jest and Supertest and documented API endpoints with Swagger.",
    },
    technologies: ["Node.js", "Express.js", "TypeScript", "MongoDB", "Jest", "Supertest"],
    repositoryUrl: "https://github.com/hamidreza-babazamani/technoStore",
    featured: false,
    order: 2,
  },
  {
    slug: "divar-classified-ads-backend",
    title: {
      fa: "بک‌اند نیازمندی‌ها و آگهی دیوار (Divar)",
      en: "Divar — Classified Ads Backend",
    },
    shortDescription: {
      fa: "بک‌اند ثبت آگهی با ورود OTP/JWT، دسته‌بندی درختی، آپلود تصویر و Docker.",
      en: "Classified ads backend with OTP/JWT auth, RBAC, Swagger, and Docker.",
    },
    description: {
      fa: "توسعه بک‌اند ثبت آگهی با احراز هویت OTP/JWT و کنترل دسترسی مبتنی بر نقش (RBAC)\nپیاده‌سازی دسته‌بندی‌های سلسله‌مراتبی، آپلود تصویر و اعتبارسنجی ورودی‌ها\nمستندسازی اندپوینت‌ها با Swagger و پیکربندی Docker برای استقرار یکپارچه",
      en: "Developed a classified ads backend with OTP/JWT authentication and role-based access control (RBAC).\nImplemented hierarchical categories, image uploads, and input validation.\nDocumented API endpoints with Swagger and configured Docker for consistent deployment.",
    },
    technologies: ["Node.js", "Express.js", "MongoDB", "Docker"],
    repositoryUrl: "https://github.com/hamidreza-babazamani/divar",
    featured: false,
    order: 3,
  },
  {
    slug: "realtime-chat-backend",
    title: {
      fa: "بک‌اند چت بلادرنگ (Real-Time Chat)",
      en: "Real-Time Chat Backend",
    },
    shortDescription: {
      fa: "سرویس پیام‌رسانی آنی با Socket.IO، وضعیت آنلاین و تیک خوانده شدن پیام.",
      en: "Real-time messaging backend with JWT, Socket.IO, online presence, and read receipts.",
    },
    description: {
      fa: "پیاده‌سازی بک‌اند پیام‌رسان بلادرنگ با احراز هویت JWT و Socket.IO\nپیاده‌سازی وضعیت آنلاین کاربران، شمارنده پیام‌های خوانده‌نشده و رسید خواندن پیام\nتوسعه اندپوینت‌های REST API با Express.js، MongoDB و Mongoose",
      en: "Built a real-time messaging backend with JWT authentication and Socket.IO.\nImplemented online user presence, unseen message counts, and message read receipts.\nDeveloped REST API endpoints using Express.js, MongoDB, and Mongoose.",
    },
    technologies: ["Node.js", "Express.js", "MongoDB", "Mongoose", "Socket.IO", "JWT"],
    repositoryUrl: "https://github.com/hamidreza-babazamani/chat-realTime",
    featured: false,
    order: 4,
  },
  {
    slug: "authentication-api",
    title: {
      fa: "سرویس احراز هویت (Authentication API)",
      en: "Authentication API",
    },
    shortDescription: {
      fa: "سرویس امن احراز هویت با JWT، رفرش توکن، bcrypt و Rate Limiting.",
      en: "JWT-based authentication API with refresh tokens, bcrypt hashing, and rate limiting.",
    },
    description: {
      fa: "توسعه API احراز هویت مبتنی بر JWT با پشتیبانی از ثبت‌نام، ورود، Refresh Token و مدیریت پروفایل\nپیاده‌سازی هش رمز عبور با bcrypt، اعتبارسنجی ورودی و محدودسازی درخواست",
      en: "Developed a JWT-based authentication API supporting registration, login, refresh tokens, and profile management.\nImplemented password hashing with bcrypt, input validation, and rate limiting.",
    },
    technologies: ["Node.js", "Express.js", "MongoDB", "JWT"],
    repositoryUrl: "https://github.com/hamidreza-babazamani/Authentication",
    featured: false,
    order: 5,
  },
  {
    slug: "havan-realtime-chat-app",
    title: {
      fa: "اپلیکیشن چت بلادرنگ هاوان (Havan)",
      en: "Havan — Real-Time Chat App",
    },
    shortDescription: {
      fa: "اپلیکیشن چت فول‌استک با Next.js، TypeScript، MongoDB و Ably.",
      en: "Responsive real-time chat app built with Next.js, React, TypeScript, MongoDB, and Ably.",
    },
    description: {
      fa: "توسعه وب‌اپلیکیشن چت بلادرنگ و واکنش‌گرا با احراز هویت کاربران و پیام خصوصی\nپیاده‌سازی سنجاق کردن پیام، حذف پیام و انتخابگر ایموجی",
      en: "Developed a responsive real-time chat application with user authentication and private messaging.\nImplemented message pinning, message deletion, and an emoji picker.",
    },
    technologies: ["Next.js", "React", "TypeScript", "MongoDB", "Ably"],
    repositoryUrl: "https://github.com/hamidreza-babazamani/havan-chatApp",
    featured: false,
    order: 6,
  },
];

const SEED_TECHNOLOGIES = [
  { name: { fa: "JavaScript", en: "JavaScript" }, category: "Languages", proficiency: 90, order: 1 },
  { name: { fa: "TypeScript", en: "TypeScript" }, category: "Languages", proficiency: 88, order: 2 },
  { name: { fa: "Node.js", en: "Node.js" }, category: "Backend", proficiency: 90, order: 3 },
  { name: { fa: "Express.js", en: "Express.js" }, category: "Backend", proficiency: 90, order: 4 },
  { name: { fa: "REST API", en: "REST API" }, category: "Backend", proficiency: 92, order: 5 },
  { name: { fa: "JWT", en: "JWT" }, category: "Backend", proficiency: 90, order: 6 },
  { name: { fa: "Passport.js", en: "Passport.js" }, category: "Backend", proficiency: 80, order: 7 },
  { name: { fa: "Socket.IO", en: "Socket.IO" }, category: "Backend", proficiency: 85, order: 8 },
  { name: { fa: "MongoDB", en: "MongoDB" }, category: "Databases", proficiency: 88, order: 9 },
  { name: { fa: "PostgreSQL", en: "PostgreSQL" }, category: "Databases", proficiency: 84, order: 10 },
  { name: { fa: "Mongoose", en: "Mongoose" }, category: "Databases", proficiency: 88, order: 11 },
  { name: { fa: "MySQL", en: "MySQL" }, category: "Databases", proficiency: 78, order: 12 },
  { name: { fa: "Docker", en: "Docker" }, category: "Tools & DevOps", proficiency: 82, order: 13 },
  { name: { fa: "Git", en: "Git" }, category: "Tools & DevOps", proficiency: 88, order: 14 },
  { name: { fa: "VS Code", en: "VS Code" }, category: "Tools & DevOps", proficiency: 92, order: 15 },
  { name: { fa: "Jest", en: "Jest" }, category: "Tools & DevOps", proficiency: 82, order: 16 },
  { name: { fa: "Supertest", en: "Supertest" }, category: "Tools & DevOps", proficiency: 82, order: 17 },
  { name: { fa: "Swagger", en: "Swagger" }, category: "Tools & DevOps", proficiency: 85, order: 18 },
];

const SEED_LANGUAGES = [
  { name: { fa: "فارسی", en: "Persian" }, level: { fa: "زبان مادری", en: "Native" }, order: 1 },
  { name: { fa: "انگلیسی", en: "English" }, level: { fa: "متوسط", en: "Intermediate" }, order: 2 },
];

const SEED_CONTACTS = [
  {
    type: "phone",
    label: { fa: "تلفن", en: "Phone" },
    value: "+98 912 045 3490",
    order: 1,
  },
  {
    type: "email",
    label: { fa: "ایمیل", en: "Email" },
    value: "hamidrezababazamani@gmail.com",
    order: 2,
  },
  {
    type: "github",
    label: { fa: "گیت‌هاب", en: "GitHub" },
    value: "github.com/hamidreza-babazamani",
    url: "https://github.com/hamidreza-babazamani",
    order: 3,
  },
  {
    type: "linkedin",
    label: { fa: "لینکدین", en: "LinkedIn" },
    value: "linkedin.com/in/hamidreza-babazamani-49b7aa248",
    url: "https://www.linkedin.com/in/hamidreza-babazamani-49b7aa248",
    order: 4,
  },
];

export async function importPdfSeedToResumeDraft() {
  // Ensure Profile exists with user's basic data if missing
  const existingProfile = await Profile.findOne({ key: "default" }).lean();
  if (!existingProfile) {
    await Profile.create({
      key: "default",
      name: { fa: "حمیدرضا بابازمانی", en: "Hamidreza Babazamani" },
      bio: SEED_SUMMARY,
      location: { fa: "تهران، ایران", en: "Tehran, Iran" },
      availability: {
        fa: "آماده همکاری در پروژه‌های بک‌اند و فول‌استک",
        en: "Open to Backend & Full-Stack opportunities",
      },
      email: "hamidrezababazamani@gmail.com",
    });
  }

  const projectIds: string[] = [];
  for (const item of SEED_PROJECTS) {
    const existing = await Project.findOne({ slug: item.slug });
    if (existing) {
      projectIds.push(existing._id.toString());
    } else {
      const created = await Project.create({ ...item, isVisible: true });
      projectIds.push(created._id.toString());
    }
  }

  const technologyIds: string[] = [];
  for (const item of SEED_TECHNOLOGIES) {
    const existing = await Technology.findOne({ "name.en": item.name.en });
    if (existing) {
      technologyIds.push(existing._id.toString());
    } else {
      const created = await Technology.create({ ...item, isVisible: true });
      technologyIds.push(created._id.toString());
    }
  }

  let educationDoc = await Education.findOne({
    "institution.en": "Islamic Azad University",
    "degree.en": "Bachelor of Public Administration",
  });
  if (!educationDoc) {
    educationDoc = await Education.create({
      institution: { fa: "دانشگاه آزاد اسلامی", en: "Islamic Azad University" },
      degree: {
        fa: "کارشناسی مدیریت دولتی",
        en: "Bachelor of Public Administration",
      },
      location: { fa: "تهران، ایران", en: "Tehran, Iran" },
      endDate: new Date("2023-06-01"),
      current: false,
      description: { fa: "- معدل: ۱۷ از ۲۰", en: "- GPA: 17/20" },
      order: 1,
      isVisible: true,
    });
  }

  const languageIds: string[] = [];
  for (const item of SEED_LANGUAGES) {
    const existing = await Language.findOne({ "name.en": item.name.en });
    if (existing) {
      languageIds.push(existing._id.toString());
    } else {
      const created = await Language.create({ ...item, isVisible: true });
      languageIds.push(created._id.toString());
    }
  }

  const contactMethodIds: string[] = [];
  for (const item of SEED_CONTACTS) {
    const existing = await ContactMethod.findOne({
      type: item.type,
      value: item.value,
    });
    if (existing) {
      contactMethodIds.push(existing._id.toString());
    } else {
      const created = await ContactMethod.create({ ...item, isVisible: true });
      contactMethodIds.push(created._id.toString());
    }
  }

  const draft = {
    professionalSummary: SEED_SUMMARY,
    sectionOrder: [
      "summary",
      "projects",
      "experience",
      "education",
      "skills",
      "languages",
    ],
    sectionVisibility: {
      summary: true,
      projects: true,
      experience: false,
      education: true,
      skills: true,
      languages: true,
    },
    experienceIds: [],
    projectIds,
    technologyIds,
    educationIds: [educationDoc._id.toString()],
    languageIds,
    contactMethodIds,
  };

  const updated = await Resume.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        draft,
        title: {
          fa: "رزومه حمیدرضا بابازمانی",
          en: "Hamidreza Babazamani Resume",
        },
      },
      $setOnInsert: { key: "default" },
    },
    { upsert: true, new: true, runValidators: true },
  ).lean();

  return updated;
}
