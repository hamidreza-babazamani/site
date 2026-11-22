"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Plus,
  Save,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import ResumeDocument from "@/components/ResumeDocument";
import { requestAdmin } from "@/lib/api/requests/admin";
import type {
  PublicContactMethod,
  PublicEducation,
  PublicExperience,
  PublicLanguage,
  PublicProfile,
  PublicProject,
  PublicTechnology,
} from "@/lib/services/public-portfolio";

type SectionKey =
  | "summary"
  | "projects"
  | "experience"
  | "education"
  | "skills"
  | "languages";

type DraftState = {
  professionalSummary: { fa: string; en: string };
  sectionOrder: SectionKey[];
  sectionVisibility: Record<SectionKey, boolean>;
  experienceIds: string[];
  projectIds: string[];
  technologyIds: string[];
  educationIds: string[];
  languageIds: string[];
  contactMethodIds: string[];
};

const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "summary",
  "projects",
  "experience",
  "education",
  "skills",
  "languages",
];

const SECTION_LABELS: Record<SectionKey, { fa: string; en: string }> = {
  summary: { fa: "معرفی و پروفایل (Profile)", en: "Profile Summary" },
  projects: { fa: "پروژه‌ها (Projects)", en: "Projects" },
  experience: { fa: "سوابق کاری (Experience)", en: "Work Experience" },
  education: { fa: "تحصیلات (Education)", en: "Education" },
  skills: { fa: "مهارت‌های فنی (Skills)", en: "Technical Skills" },
  languages: { fa: "زبان‌ها (Languages)", en: "Languages" },
};

const EMPTY_DRAFT: DraftState = {
  professionalSummary: { fa: "", en: "" },
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  sectionVisibility: {
    summary: true,
    projects: true,
    experience: true,
    education: true,
    skills: true,
    languages: true,
  },
  experienceIds: [],
  projectIds: [],
  technologyIds: [],
  educationIds: [],
  languageIds: [],
  contactMethodIds: [],
};

const asIds = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => String(item)) : [];

const normalizeDraft = (raw: Record<string, unknown> | undefined | null): DraftState => {
  if (!raw) return EMPTY_DRAFT;
  const summary = (raw.professionalSummary as { fa?: string; en?: string } | undefined) || {};
  const rawOrder = Array.isArray(raw.sectionOrder)
    ? raw.sectionOrder.filter((k): k is SectionKey =>
        DEFAULT_SECTION_ORDER.includes(k as SectionKey),
      )
    : [];
  const sectionOrder =
    rawOrder.length === DEFAULT_SECTION_ORDER.length
      ? rawOrder
      : [...DEFAULT_SECTION_ORDER];
  const rawVis = (raw.sectionVisibility as Record<string, unknown> | undefined) || {};
  return {
    professionalSummary: {
      fa: typeof summary.fa === "string" ? summary.fa : "",
      en: typeof summary.en === "string" ? summary.en : "",
    },
    sectionOrder,
    sectionVisibility: {
      summary: rawVis.summary !== false,
      projects: rawVis.projects !== false,
      experience: rawVis.experience !== false,
      education: rawVis.education !== false,
      skills: rawVis.skills !== false,
      languages: rawVis.languages !== false,
    },
    experienceIds: asIds(raw.experienceIds),
    projectIds: asIds(raw.projectIds),
    technologyIds: asIds(raw.technologyIds),
    educationIds: asIds(raw.educationIds),
    languageIds: asIds(raw.languageIds),
    contactMethodIds: asIds(raw.contactMethodIds),
  };
};

function moveItem<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

export default function ResumeBuilder({
  locale,
  notify,
  onNavigate,
}: {
  locale: string;
  notify: (message: string, error?: boolean) => void;
  onNavigate?: (section: string) => void;
}) {
  const fa = locale === "fa";
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [previewLocale, setPreviewLocale] = useState<"fa" | "en">(
    locale === "fa" ? "fa" : "en",
  );

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [experiences, setExperiences] = useState<PublicExperience[]>([]);
  const [education, setEducation] = useState<PublicEducation[]>([]);
  const [technologies, setTechnologies] = useState<PublicTechnology[]>([]);
  const [languages, setLanguages] = useState<PublicLanguage[]>([]);
  const [contactMethods, setContactMethods] = useState<PublicContactMethod[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        resumeRes,
        profileRes,
        projectsRes,
        experiencesRes,
        educationRes,
        technologiesRes,
        languagesRes,
        contactsRes,
      ] = await Promise.all([
        requestAdmin<{ data: Record<string, unknown> | null }>("/api/admin/resume"),
        requestAdmin<{ data: PublicProfile | null }>("/api/admin/profile"),
        requestAdmin<{ data: PublicProject[] }>("/api/admin/projects?limit=100"),
        requestAdmin<{ data: PublicExperience[] }>("/api/admin/experiences?limit=100"),
        requestAdmin<{ data: PublicEducation[] }>("/api/admin/education?limit=100"),
        requestAdmin<{ data: PublicTechnology[] }>("/api/admin/technologies?limit=100"),
        requestAdmin<{ data: PublicLanguage[] }>("/api/admin/languages?limit=100"),
        requestAdmin<{ data: PublicContactMethod[] }>("/api/admin/contact-methods?limit=100"),
      ]);

      const resumeDoc = resumeRes.data;
      setStatus(resumeDoc?.status === "published" ? "published" : "draft");
      setPublishedAt(
        typeof resumeDoc?.publishedAt === "string" ? resumeDoc.publishedAt : null,
      );
      setDraft(normalizeDraft(resumeDoc?.draft as Record<string, unknown> | undefined));
      setProfile(profileRes.data || null);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      setExperiences(Array.isArray(experiencesRes.data) ? experiencesRes.data : []);
      setEducation(Array.isArray(educationRes.data) ? educationRes.data : []);
      setTechnologies(Array.isArray(technologiesRes.data) ? technologiesRes.data : []);
      setLanguages(Array.isArray(languagesRes.data) ? languagesRes.data : []);
      setContactMethods(Array.isArray(contactsRes.data) ? contactsRes.data : []);
    } catch {
      notify(
        fa ? "خطا در دریافت اطلاعات رزومه‌ساز" : "Unable to load Resume Builder data",
        true,
      );
    } finally {
      setLoading(false);
    }
  }, [fa, notify]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const saveDraft = async () => {
    setBusy(true);
    try {
      await requestAdmin("/api/admin/resume/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      notify(fa ? "پیش‌نویس رزومه ذخیره شد." : "Resume draft saved.");
      return true;
    } catch (error) {
      const msg = (error as { message?: string })?.message;
      notify(
        msg && msg !== "REQUEST_FAILED"
          ? msg
          : fa
            ? "خطا در ذخیره پیش‌نویس. مطمئن شوید خلاصه فارسی و انگلیسی هر دو پر یا هر دو خالی باشند."
            : "Failed to save draft.",
        true,
      );
      return false;
    } finally {
      setBusy(false);
    }
  };

  const publishResume = async () => {
    setBusy(true);
    try {
      await requestAdmin("/api/admin/resume/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const res = await requestAdmin<{ data: { publishedAt?: string } }>(
        "/api/admin/resume/publish",
        { method: "POST" },
      );
      setStatus("published");
      setPublishedAt(res.data?.publishedAt ?? new Date().toISOString());
      notify(
        fa
          ? "رزومه با موفقیت روی سایت منتشر شد!"
          : "Resume published to your live site!",
      );
    } catch (error) {
      const msg = (error as { message?: string })?.message;
      notify(
        msg && msg !== "REQUEST_FAILED"
          ? msg
          : fa
            ? "برای انتشار، اگر بخش معرفی روشن است باید خلاصه فارسی و انگلیسی هر دو تکمیل شوند."
            : "Failed to publish resume. Fill both FA and EN summaries if summary is visible.",
        true,
      );
    } finally {
      setBusy(false);
    }
  };

  const unpublishResume = async () => {
    setBusy(true);
    try {
      await requestAdmin("/api/admin/resume/unpublish", { method: "POST" });
      setStatus("draft");
      notify(
        fa
          ? "انتشار رزومه پویا لغو شد (حالت پیش‌نویس)."
          : "Resume unpublished (reverted to draft).",
      );
    } catch {
      notify(fa ? "خطا در تغییر وضعیت انتشار" : "Unable to unpublish", true);
    } finally {
      setBusy(false);
    }
  };

  const importPdfSeed = async () => {
    setBusy(true);
    try {
      await requestAdmin("/api/admin/resume/import-pdf-seed", {
        method: "POST",
      });
      await loadAll();
      notify(
        fa
          ? "اطلاعات رزومه PDF شما با موفقیت به فارسی و انگلیسی وارد شد!"
          : "Your PDF resume data has been imported in both FA and EN!",
      );
    } catch {
      notify(
        fa ? "خطا در وارد کردن اطلاعات رزومه" : "Failed to import PDF data",
        true,
      );
    } finally {
      setBusy(false);
    }
  };

  const openPrintablePdf = async (targetLocale: "fa" | "en") => {
    const saved = await saveDraft();
    if (!saved) return;
    window.open(
      `/${targetLocale}/resume/print?source=draft&autoprint=1`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const toggleId = (
    field:
      | "projectIds"
      | "experienceIds"
      | "educationIds"
      | "technologyIds"
      | "languageIds"
      | "contactMethodIds",
    id: string,
  ) => {
    setDraft((current) => {
      const list = current[field];
      const next = list.includes(id)
        ? list.filter((item) => item !== id)
        : [...list, id];
      return { ...current, [field]: next };
    });
  };

  const moveSelectedId = (
    field:
      | "projectIds"
      | "experienceIds"
      | "educationIds"
      | "technologyIds"
      | "languageIds"
      | "contactMethodIds",
    id: string,
    delta: -1 | 1,
  ) => {
    setDraft((current) => {
      const idx = current[field].indexOf(id);
      if (idx === -1) return current;
      return { ...current, [field]: moveItem(current[field], idx, delta) };
    });
  };

  if (loading) {
    return (
      <div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-white/[0.04]" />
    );
  }

  const renderItemSelector = <T extends { _id: string }>(
    titleFa: string,
    titleEn: string,
    field:
      | "projectIds"
      | "experienceIds"
      | "educationIds"
      | "technologyIds"
      | "languageIds"
      | "contactMethodIds",
    allItems: T[],
    getLabel: (item: T) => string,
    manageSection?: string,
  ) => {
    const selectedIds = draft[field];
    const selectedMap = new Map(allItems.map((item) => [item._id, item]));
    const orderedSelected = selectedIds.flatMap((id) => {
      const item = selectedMap.get(id);
      return item ? [item] : [];
    });
    const unselected = allItems.filter((item) => !selectedIds.includes(item._id));

    return (
      <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold">
            {fa ? titleFa : titleEn}{" "}
            <span className="text-xs font-normal text-slate-400">
              ({orderedSelected.length}/{allItems.length})
            </span>
          </h3>
          {manageSection && onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate(manageSection)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
            >
              <Plus size={12} />
              <span>{fa ? "افزودن / ویرایش" : "Add / Edit"}</span>
            </button>
          )}
        </div>

        {allItems.length === 0 ? (
          <p className="text-xs text-slate-400">
            {fa
              ? "هنوز موردی ثبت نشده است. از دکمه بالا اضافه کنید یا اطلاعات PDF را وارد کنید."
              : "No records yet. Add one above or import your PDF data."}
          </p>
        ) : (
          <div className="space-y-1.5">
            {orderedSelected.map((item, idx) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-2 text-xs"
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <input
                    type="checkbox"
                    checked
                    onChange={() => toggleId(field, item._id)}
                    className="size-4 accent-emerald-500"
                  />
                  <span className="truncate">{getLabel(item)}</span>
                </label>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSelectedId(field, item._id, -1)}
                    aria-label={fa ? "انتقال به بالا" : "Move up"}
                    className="rounded-md p-1 text-slate-500 hover:bg-white disabled:opacity-30 dark:hover:bg-white/10"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === orderedSelected.length - 1}
                    onClick={() => moveSelectedId(field, item._id, 1)}
                    aria-label={fa ? "انتقال به پایین" : "Move down"}
                    className="rounded-md p-1 text-slate-500 hover:bg-white disabled:opacity-30 dark:hover:bg-white/10"
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>
              </div>
            ))}

            {unselected.map((item) => (
              <label
                key={item._id}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04]"
              >
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleId(field, item._id)}
                  className="size-4 accent-emerald-500"
                />
                <span className="truncate">{getLabel(item)}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="rounded-3xl border border-emerald-500/20 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#101820] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <FileText size={18} className="text-emerald-500" />
              <h2 className="text-lg font-black">
                {fa
                  ? "رزومه‌ساز دو زبانه و خروجی PDF"
                  : "Bilingual Resume Builder & PDF Export"}
              </h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  status === "published"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                }`}
              >
                {status === "published" && <CheckCircle2 size={12} />}
                {status === "published"
                  ? fa
                    ? "منتشر شده در سایت"
                    : "Published"
                  : fa
                    ? "پیش‌نویس"
                    : "Draft"}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-6 text-slate-500 dark:text-slate-400">
              {fa
                ? "بخش‌ها و آیتم‌های دلخواه‌تان را به فارسی و انگلیسی انتخاب و مرتب کنید، در سایت منتشر کنید و هر زمان خواستید مستقیم خروجی PDF بگیرید."
                : "Choose, add, remove, and reorder sections for both Persian and English, publish to your site, and export A4 PDFs anytime."}
              {publishedAt && status === "published" && (
                <span className="ms-2 text-[11px] text-slate-400">
                  ({new Date(publishedAt).toLocaleDateString(locale)})
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={importPdfSeed}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-700 transition hover:bg-cyan-500/20 disabled:opacity-50 dark:text-cyan-300"
            >
              <Sparkles size={14} />
              <span>
                {fa
                  ? "وارد کردن اطلاعات PDF رزومه من"
                  : "Import My PDF Resume Data"}
              </span>
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={saveDraft}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
            >
              <Save size={14} />
              <span>{fa ? "ذخیره پیش‌نویس" : "Save Draft"}</span>
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={publishResume}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              <UploadCloud size={14} />
              <span>{fa ? "انتشار روی سایت" : "Publish"}</span>
            </button>

            {status === "published" && (
              <button
                type="button"
                disabled={busy}
                onClick={unpublishResume}
                className="rounded-xl border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-500/10 disabled:opacity-50 dark:text-amber-300"
              >
                {fa ? "تبدیل به پیش‌نویس" : "Unpublish"}
              </button>
            )}
          </div>
        </div>

        {/* Direct PDF Download Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-4 dark:border-white/10">
          <span className="text-xs font-semibold text-slate-500">
            {fa ? "خروجی و دانلود مستقیم PDF:" : "Download A4 PDF:"}
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => openPrintablePdf("en")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            <Download size={14} />
            <span>{fa ? "دانلود PDF نسخه انگلیسی (EN)" : "Download English PDF"}</span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => openPrintablePdf("fa")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            <Download size={14} />
            <span>{fa ? "دانلود PDF نسخه فارسی (FA)" : "Download Persian PDF"}</span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace: Controls + Live A4 Preview */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Controls Column */}
        <div className="space-y-5">
          {/* Professional Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#101820] sm:p-5">
            <h3 className="mb-3 text-sm font-bold">
              {fa ? "۱. معرفی و خلاصه پروفایل (Profile)" : "1. Profile Summary"}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="block text-xs font-semibold text-slate-500">
                  فارسی (FA)
                </span>
                <textarea
                  dir="rtl"
                  rows={4}
                  value={draft.professionalSummary.fa}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      professionalSummary: {
                        ...current.professionalSummary,
                        fa: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-6 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/[0.04]"
                />
              </label>
              <label className="space-y-1.5">
                <span className="block text-xs font-semibold text-slate-500">
                  English (EN)
                </span>
                <textarea
                  dir="ltr"
                  rows={4}
                  value={draft.professionalSummary.en}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      professionalSummary: {
                        ...current.professionalSummary,
                        en: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-6 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/[0.04]"
                />
              </label>
            </div>
          </div>

          {/* Section Order & Visibility */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#101820] sm:p-5">
            <h3 className="mb-3 text-sm font-bold">
              {fa ? "۲. ترتیب و نمایش بخش‌های رزومه" : "2. Section Order & Visibility"}
            </h3>
            <div className="space-y-2">
              {draft.sectionOrder.map((key, index) => {
                const visible = draft.sectionVisibility[key] !== false;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <span className="font-semibold">
                      {index + 1}. {SECTION_LABELS[key][fa ? "fa" : "en"]}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            sectionVisibility: {
                              ...current.sectionVisibility,
                              [key]: !visible,
                            },
                          }))
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold ${
                          visible
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-200/70 text-slate-500 dark:bg-white/10"
                        }`}
                      >
                        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{visible ? (fa ? "نمایش" : "Shown") : (fa ? "مخفی" : "Hidden")}</span>
                      </button>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            sectionOrder: moveItem(current.sectionOrder, index, -1),
                          }))
                        }
                        className="rounded-md p-1.5 text-slate-500 hover:bg-white disabled:opacity-30 dark:hover:bg-white/10"
                        aria-label="Move section up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={index === draft.sectionOrder.length - 1}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            sectionOrder: moveItem(current.sectionOrder, index, 1),
                          }))
                        }
                        className="rounded-md p-1.5 text-slate-500 hover:bg-white disabled:opacity-30 dark:hover:bg-white/10"
                        aria-label="Move section down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Item Selectors */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#101820] sm:p-5">
            <h3 className="text-sm font-bold">
              {fa
                ? "۳. انتخاب و چیدمان موارد داخل هر بخش (افزودن / کسر کردن)"
                : "3. Select & Order Items in Each Section"}
            </h3>

            {renderItemSelector(
              "راه‌های ارتباطی بالای رزومه (تلفن، ایمیل، گیت‌هاب، لینکدین)",
              "Header Contact Info",
              "contactMethodIds",
              contactMethods,
              (item) => `${item.label?.[fa ? "fa" : "en"] || item.type}: ${item.value}`,
              "contact-methods",
            )}

            {renderItemSelector(
              "پروژه‌ها",
              "Projects",
              "projectIds",
              projects,
              (item) => item.title?.[fa ? "fa" : "en"] || item.title?.en || item._id,
              "projects",
            )}

            {renderItemSelector(
              "سوابق کاری",
              "Work Experience",
              "experienceIds",
              experiences,
              (item) =>
                `${item.role?.[fa ? "fa" : "en"] || item.role?.en || ""} — ${item.company}`,
              "experiences",
            )}

            {renderItemSelector(
              "تحصیلات",
              "Education",
              "educationIds",
              education,
              (item) =>
                `${item.institution?.[fa ? "fa" : "en"] || item.institution?.en || ""} — ${item.degree?.[fa ? "fa" : "en"] || item.degree?.en || ""}`,
              "education",
            )}

            {renderItemSelector(
              "مهارت‌ها و ابزارها",
              "Skills & Technologies",
              "technologyIds",
              technologies,
              (item) =>
                `${item.name?.[fa ? "fa" : "en"] || item.name?.en || ""}${item.category ? ` (${item.category})` : ""}`,
              "technologies",
            )}

            {renderItemSelector(
              "زبان‌ها",
              "Languages",
              "languageIds",
              languages,
              (item) =>
                `${item.name?.[fa ? "fa" : "en"] || item.name?.en || ""} — ${item.level?.[fa ? "fa" : "en"] || item.level?.en || ""}`,
              "languages",
            )}
          </div>
        </div>

        {/* Live A4 Preview Column */}
        <div className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-[#101820]">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Globe size={15} className="text-emerald-500" />
              <span>{fa ? "پیش‌نمایش زنده فایل PDF:" : "Live PDF Preview:"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewLocale("fa")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  previewLocale === "fa"
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                }`}
              >
                فارسی (RTL)
              </button>
              <button
                type="button"
                onClick={() => setPreviewLocale("en")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  previewLocale === "en"
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                }`}
              >
                English (LTR)
              </button>
            </div>
          </div>

          <div className="max-h-[82vh] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-white/10 dark:bg-slate-900/50">
            <ResumeDocument
              locale={previewLocale}
              compact
              data={{
                profile,
                composition: draft,
                projects,
                experiences,
                education,
                technologies,
                languages,
                contactMethods,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
