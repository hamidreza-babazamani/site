import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import ResumeDocument from "@/components/ResumeDocument";
import ResumePrintToolbar from "@/components/ResumePrintToolbar";
import { getAdminSession } from "@/lib/server/api";
import { connectDatabase } from "@/lib/server/db";
import {
  ContactMethod,
  Education,
  Experience,
  Language,
  Profile,
  Project,
  Resume,
  Technology,
} from "@/lib/server/models";
import type { PublicResumeComposition } from "@/lib/services/public-portfolio";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFa = locale === "fa";
  return {
    title: isFa
      ? "رزومه PDF | حمیدرضا بابازمانی"
      : "Resume PDF | Hamidreza Babazamani",
    robots: { index: false, follow: false },
  };
}

export default async function ResumePrintPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; autoprint?: string }>;
}) {
  const locale = (await getLocale()) === "fa" ? "fa" : "en";
  const isFa = locale === "fa";
  const params = await searchParams;
  const requestedDraft = params.source === "draft";
  const autoPrint = params.autoprint === "1";

  const admin = requestedDraft ? await getAdminSession() : null;
  const useDraft = Boolean(requestedDraft && admin);

  await connectDatabase();

  const [
    resume,
    profile,
    projects,
    experiences,
    education,
    technologies,
    languages,
    contactMethods,
  ] = await Promise.all([
    Resume.findOne({ key: "default" }).lean(),
    Profile.findOne({ key: "default" })
      .select("name bio location availability image")
      .lean(),
    Project.find(useDraft ? {} : { isVisible: true })
      .sort({ featured: -1, order: 1 })
      .lean(),
    Experience.find(useDraft ? {} : { isVisible: true })
      .sort({ order: 1, startDate: -1 })
      .lean(),
    Education.find(useDraft ? {} : { isVisible: true })
      .sort({ order: 1, startDate: -1 })
      .lean(),
    Technology.find(useDraft ? {} : { isVisible: true })
      .sort({ order: 1 })
      .lean(),
    Language.find(useDraft ? {} : { isVisible: true })
      .sort({ order: 1 })
      .lean(),
    ContactMethod.find(useDraft ? {} : { isVisible: true })
      .sort({ order: 1 })
      .lean(),
  ]);

  const rawComposition = useDraft
    ? resume?.draft
    : resume?.status === "published"
      ? resume?.published
      : null;

  if (!rawComposition) {
    return (
      <div
        dir={isFa ? "rtl" : "ltr"}
        className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6 text-center text-slate-700"
      >
        <p className="text-base font-bold">
          {isFa
            ? "هنوز رزومه پویا منتشر نشده است."
            : "No published resume composition is available yet."}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {isFa
            ? "ابتدا در پنل ادمین بخش رزومه‌ساز را تکمیل و منتشر کنید."
            : "Create and publish your resume in the Admin Resume Builder first."}
        </p>
      </div>
    );
  }

  const toIds = (value: unknown) =>
    Array.isArray(value) ? value.map((v) => String(v)) : [];

  const composition: PublicResumeComposition = {
    professionalSummary: rawComposition.professionalSummary,
    sectionOrder: Array.isArray(rawComposition.sectionOrder)
      ? rawComposition.sectionOrder.map(String)
      : undefined,
    sectionVisibility: rawComposition.sectionVisibility,
    experienceIds: toIds(rawComposition.experienceIds),
    projectIds: toIds(rawComposition.projectIds),
    technologyIds: toIds(rawComposition.technologyIds),
    educationIds: toIds(rawComposition.educationIds),
    languageIds: toIds(rawComposition.languageIds),
    contactMethodIds: toIds(rawComposition.contactMethodIds),
  };

  return (
    <div className="min-h-screen bg-slate-200/80 pb-12 print:min-h-0 print:bg-white print:pb-0">
      <ResumePrintToolbar
        locale={locale}
        source={useDraft ? "draft" : "published"}
        autoPrint={autoPrint}
      />

      <div className="px-3 pt-6 sm:px-6 print:p-0">
        <ResumeDocument
          locale={locale}
          data={{
            profile: profile
              ? {
                  name: profile.name,
                  bio: profile.bio,
                  location: profile.location,
                  availability: profile.availability,
                }
              : null,
            composition,
            projects: projects.map((item) => ({
              ...item,
              _id: item._id.toString(),
              images: [],
            })),
            experiences: experiences.map((item) => ({
              _id: item._id.toString(),
              company: item.company,
              role: item.role,
              description: item.description,
              startDate: item.startDate ? new Date(item.startDate).toISOString() : "",
              endDate: item.endDate ? new Date(item.endDate).toISOString() : null,
              current: item.current,
            })),
            education: education.map((item) => ({
              _id: item._id.toString(),
              institution: item.institution,
              degree: item.degree,
              fieldOfStudy: item.fieldOfStudy,
              location: item.location,
              startDate: item.startDate ? new Date(item.startDate).toISOString() : null,
              endDate: item.endDate ? new Date(item.endDate).toISOString() : null,
              current: item.current,
              description: item.description,
            })),
            technologies: technologies.map((item) => ({
              _id: item._id.toString(),
              name: item.name,
              category: item.category,
              proficiency: item.proficiency,
            })),
            languages: languages.map((item) => ({
              _id: item._id.toString(),
              name: item.name,
              level: item.level,
            })),
            contactMethods: contactMethods.map((item) => ({
              _id: item._id.toString(),
              type: item.type,
              label: item.label,
              value: item.value,
              url: item.url,
            })),
          }}
        />
      </div>
    </div>
  );
}
