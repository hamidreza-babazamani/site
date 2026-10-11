
import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
  UserRound,
} from "lucide-react";
import { getLocale } from "next-intl/server";
import { getPublicPortfolio } from "@/lib/services/public-portfolio";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title:
      locale === "fa"
        ? "پروفایل | کامیار کمالی"
        : "Profile | Kamyar Kamali",
  };
}

type Localized = {
  fa?: string;
  en?: string;
};

const localize = (
  value: Localized | undefined,
  locale: string,
) =>
  (locale === "fa" ? value?.fa : value?.en)?.trim() ||
  value?.en?.trim() ||
  value?.fa?.trim() ||
  "";

export default async function ProfilePage() {
  const locale = await getLocale();
  const fa = locale === "fa";
  const profile = (await getPublicPortfolio()).profile;

  if (!profile) {
    return (
      <main className="container mx-auto px-4 py-24">
        <div className="rounded-3xl border border-dashed border-emerald-500/20 p-12 text-center text-slate-500 dark:text-slate-400">
          {fa
            ? "اطلاعات پروفایل هنوز ثبت نشده است."
            : "Profile information is not available yet."}
        </div>
      </main>
    );
  }

  const name = localize(profile.name, locale);
  const bio = localize(profile.bio, locale);
  const location = localize(profile.location, locale);
  const availability = localize(profile.availability, locale);
  const imageUrl = profile.image?.url;

  return (
    <main
      dir={fa ? "rtl" : "ltr"}
      className="relative isolate min-h-[80vh] overflow-hidden px-4 py-16 sm:px-6 sm:py-24"
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 -start-40 size-[420px] rounded-full bg-emerald-300/10 blur-[100px] dark:bg-emerald-500/[0.06]" />
        <div className="absolute -bottom-40 -end-40 size-[420px] rounded-full bg-cyan-300/10 blur-[100px] dark:bg-cyan-500/[0.06]" />
      </div>

      <div className="container mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <UserRound size={15} />
            {fa ? "بیشتر درباره من" : "Get to know me"}
          </span>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {fa ? "داستان من" : "My Story"}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
            {fa
              ? "نگاهی نزدیک‌تر به مسیر حرفه‌ای، تخصص‌ها و علایق من"
              : "A closer look at my professional journey, expertise, and interests"}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10">
          {/* Profile Card */}
          <aside className="relative overflow-hidden rounded-[32px] border border-emerald-500/10 bg-gradient-to-b from-emerald-50 via-cyan-50/50 to-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] dark:border-white/10 dark:from-emerald-500/[0.08] dark:via-cyan-500/[0.03] dark:to-white/[0.03] sm:p-8">
            <div className="absolute start-5 top-5 z-10 rounded-full border border-emerald-500/15 bg-white/90 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur dark:bg-slate-900/90 dark:text-emerald-300">
              {fa ? "توسعه‌دهنده وب" : "Web Developer"}
            </div>

            {/* Profile Image */}
            <div className="relative mx-auto mt-4 aspect-[4/4.5] w-full max-w-[260px] overflow-hidden rounded-[28px] border-4 border-white bg-slate-100 shadow-xl shadow-emerald-900/5 dark:border-white/10 dark:bg-slate-800">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={
                    localize(profile.image?.alt, locale) ||
                    name
                  }
                  fill
                  sizes="(max-width: 640px) 260px, 260px"
                  className="object-cover object-center"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
                  <UserRound size={72} strokeWidth={1} />
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="mt-7 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {name}
              </h2>

              <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Front-End Developer
              </p>

              {location && (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin size={15} />
                  <span>{location}</span>
                </div>
              )}
            </div>

            {/* Availability */}
            {availability && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/10 bg-white/70 p-4 dark:bg-white/[0.04]">
                <BriefcaseBusiness
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                />

                <p className="text-start text-xs leading-6 text-slate-600 dark:text-slate-300">
                  {availability}
                </p>
              </div>
            )}
          </aside>

          {/* Biography Card */}
          <article className="relative overflow-hidden rounded-[32px] border border-emerald-500/10 bg-white/75 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] sm:p-9 lg:p-11">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-transparent" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  {fa ? "معرفی شخصی" : "Personal Introduction"}
                </p>

                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {fa ? "درباره من" : "About Me"}
                </h2>
              </div>

              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/[0.07] text-emerald-600 dark:text-emerald-400">
                <UserRound size={22} />
              </div>
            </div>

            <div className="my-7 h-px bg-gradient-to-r from-emerald-500/15 via-slate-200 to-transparent dark:via-white/10" />

            <div className="max-w-none">
              <p className="whitespace-pre-line break-words text-justify text-[15px] leading-[2.2] text-slate-600 dark:text-slate-300 sm:text-base">
                {bio}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-white/10">
              <span className="text-xs font-medium text-slate-400">
                {fa
                  ? "علاقه‌مند به فناوری و یادگیری مستمر"
                  : "Passionate about technology and continuous learning"}
              </span>

              <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {fa ? "ساخت آینده با فناوری" : "Building with technology"}
                <ArrowUpRight size={15} />
              </span>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
