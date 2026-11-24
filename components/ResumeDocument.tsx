import type {
  PublicContactMethod,
  PublicEducation,
  PublicExperience,
  PublicLanguage,
  PublicProfile,
  PublicProject,
  PublicResumeComposition,
  PublicTechnology,
} from "@/lib/services/public-portfolio";

export type ResumeDocumentData = {
  profile: PublicProfile | null;
  composition: PublicResumeComposition;
  projects: PublicProject[];
  experiences: PublicExperience[];
  education: PublicEducation[];
  technologies: PublicTechnology[];
  languages: PublicLanguage[];
  contactMethods: PublicContactMethod[];
};

const localize = (
  value: { fa?: string; en?: string } | undefined | null,
  locale: "fa" | "en",
) =>
  (locale === "fa" ? value?.fa : value?.en)?.trim() ||
  value?.en?.trim() ||
  value?.fa?.trim() ||
  "";

function orderSelected<T extends { _id: string }>(items: T[], ids?: string[]) {
  if (!ids || ids.length === 0) return [];
  const map = new Map(items.map((item) => [item._id, item]));
  return ids.flatMap((id) => {
    const match = map.get(id);
    return match ? [match] : [];
  });
}

const formatYearOrRange = (
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  current: boolean | undefined,
  locale: "fa" | "en",
) => {
  const formatOne = (raw?: string | null) => {
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return locale === "fa"
      ? d.toLocaleDateString("fa-IR", { year: "numeric", month: "short" })
      : d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };
  const start = formatOne(startDate);
  const end = current
    ? locale === "fa"
      ? "اکنون"
      : "Present"
    : formatOne(endDate);
  if (start && end) return `${start} – ${end}`;
  return end || start;
};

const CONTACT_LABELS_FA: Record<string, string> = {
  email: "ایمیل",
  phone: "تلفن",
  github: "گیت‌هاب",
  linkedin: "لینکدین",
  telegram: "تلگرام",
  whatsapp: "واتساپ",
  instagram: "اینستاگرام",
  website: "وب‌سایت",
};

const resolveContactLabel = (
  contact: PublicContactMethod,
  locale: "fa" | "en",
) => {
  if (locale === "fa") {
    const faLabel = contact.label?.fa?.trim();
    if (faLabel) return faLabel;
    const mapped = CONTACT_LABELS_FA[contact.type.trim().toLowerCase()];
    if (mapped) return mapped;
    return contact.label?.en?.trim() || contact.type;
  }
  return contact.label?.en?.trim() || contact.label?.fa?.trim() || contact.type;
};

const toLines = (raw: string) =>
  raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);

const SECTION_TITLES: Record<string, { fa: string; en: string }> = {
  summary: { fa: "پروفایل و خلاصه حرفه‌ای", en: "PROFILE" },
  projects: { fa: "پروژه‌ها", en: "PROJECTS" },
  experience: { fa: "سوابق کاری", en: "EXPERIENCE" },
  education: { fa: "تحصیلات", en: "EDUCATION" },
  skills: { fa: "مهارت‌های فنی", en: "SKILLS" },
  languages: { fa: "زبان‌ها", en: "LANGUAGES" },
};

const DEFAULT_ORDER = [
  "summary",
  "projects",
  "experience",
  "education",
  "skills",
  "languages",
];

export default function ResumeDocument({
  data,
  locale,
  compact = false,
}: {
  data: ResumeDocumentData;
  locale: "fa" | "en";
  compact?: boolean;
}) {
  const isFa = locale === "fa";
  const { composition, profile } = data;
  const visibility = composition.sectionVisibility ?? {};
  const sectionOrder =
    composition.sectionOrder && composition.sectionOrder.length > 0
      ? composition.sectionOrder
      : DEFAULT_ORDER;

  const selectedProjects = orderSelected(data.projects, composition.projectIds);
  const selectedExperiences = orderSelected(
    data.experiences,
    composition.experienceIds,
  );
  const selectedEducation = orderSelected(
    data.education,
    composition.educationIds,
  );
  const selectedTechnologies = orderSelected(
    data.technologies,
    composition.technologyIds,
  );
  const selectedLanguages = orderSelected(
    data.languages,
    composition.languageIds,
  );
  const selectedContacts = orderSelected(
    data.contactMethods,
    composition.contactMethodIds,
  );

  const name =
    localize(profile?.name, locale) ||
    (isFa ? "حمیدرضا بابازمانی" : "Hamidreza Babazamani");
  const location = localize(profile?.location, locale);
  const phoneContact = selectedContacts.find(
    (c) => c.type.toLowerCase() === "phone",
  );
  const otherContacts = selectedContacts.filter(
    (c) => c.type.toLowerCase() !== "phone",
  );
  const summaryText = localize(composition.professionalSummary, locale);

  // Group skills by category preserving insertion order
  const groupedSkills = new Map<string, string[]>();
  for (const tech of selectedTechnologies) {
    const cat = tech.category?.trim() || (isFa ? "سایر مهارت‌ها" : "General");
    const techName = localize(tech.name, locale);
    if (!techName) continue;
    const list = groupedSkills.get(cat) ?? [];
    list.push(techName);
    groupedSkills.set(cat, list);
  }

  const sectionHeadingClass = `mb-2.5 border-b border-slate-800 pb-1 text-start text-[13px] font-bold text-slate-900 ${
    isFa ? "tracking-normal" : "tracking-[0.14em]"
  }`;

  const renderSection = (key: string) => {
    if (visibility[key] === false) return null;

    if (key === "summary") {
      if (!summaryText) return null;
      return (
        <section key={key} className="mb-5 break-inside-avoid text-start">
          <h2 className={sectionHeadingClass}>
            {SECTION_TITLES.summary[locale]}
          </h2>
          <p className="whitespace-pre-line text-start text-[12.5px] leading-[1.85] text-slate-800">
            {summaryText}
          </p>
        </section>
      );
    }

    if (key === "projects") {
      if (selectedProjects.length === 0) return null;
      return (
        <section key={key} className="mb-5 text-start">
          <h2 className={sectionHeadingClass}>
            {SECTION_TITLES.projects[locale]}
          </h2>
          <div className="space-y-3.5">
            {selectedProjects.map((project) => {
              const title = localize(project.title, locale);
              const desc =
                localize(project.description, locale) ||
                localize(project.shortDescription, locale);
              const lines = toLines(desc);
              const url = project.repositoryUrl || project.liveUrl;
              return (
                <article key={project._id} className="break-inside-avoid text-start">
                  <div className="text-start text-[13px] leading-snug text-slate-900">
                    <span className="font-bold">{title}</span>
                    {project.technologies.length > 0 && (
                      <span className="text-slate-700">
                        {" "}
                        | <bdi dir="ltr">{project.technologies.join(", ")}</bdi>
                      </span>
                    )}
                  </div>
                  {url && (
                    <div className="mt-0.5 text-start text-[11.5px]">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="inline-block break-all text-blue-700 underline underline-offset-2"
                      >
                        {url}
                      </a>
                    </div>
                  )}
                  {lines.length > 1 ? (
                    <ul className="mt-1.5 list-disc space-y-0.5 ps-5 text-start text-[12px] leading-[1.7] text-slate-800">
                      {lines.map((line, idx) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    lines[0] && (
                      <p className="mt-1 text-start text-[12px] leading-[1.7] text-slate-800">
                        {lines[0]}
                      </p>
                    )
                  )}
                </article>
              );
            })}
          </div>
        </section>
      );
    }

    if (key === "experience") {
      if (selectedExperiences.length === 0) return null;
      return (
        <section key={key} className="mb-5 text-start">
          <h2 className={sectionHeadingClass}>
            {SECTION_TITLES.experience[locale]}
          </h2>
          <div className="space-y-3">
            {selectedExperiences.map((exp) => {
              const role = localize(exp.role, locale);
              const range = formatYearOrRange(
                exp.startDate,
                exp.endDate,
                exp.current,
                locale,
              );
              const lines = toLines(localize(exp.description, locale));
              return (
                <article key={exp._id} className="break-inside-avoid text-start">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-start text-[13px] text-slate-900">
                    <div>
                      <span className="font-bold">{role}</span>
                      {exp.company && (
                        <span className="text-slate-700"> — {exp.company}</span>
                      )}
                    </div>
                    {range && (
                      <span className="text-[11.5px] text-slate-600">
                        <bdi dir={isFa ? "rtl" : "ltr"}>{range}</bdi>
                      </span>
                    )}
                  </div>
                  {lines.length > 1 ? (
                    <ul className="mt-1 list-disc space-y-0.5 ps-5 text-start text-[12px] leading-[1.7] text-slate-800">
                      {lines.map((line, idx) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    lines[0] && (
                      <p className="mt-1 text-start text-[12px] leading-[1.7] text-slate-800">
                        {lines[0]}
                      </p>
                    )
                  )}
                </article>
              );
            })}
          </div>
        </section>
      );
    }

    if (key === "education") {
      if (selectedEducation.length === 0) return null;
      return (
        <section key={key} className="mb-5 break-inside-avoid text-start">
          <h2 className={sectionHeadingClass}>
            {SECTION_TITLES.education[locale]}
          </h2>
          <div className="space-y-2.5">
            {selectedEducation.map((edu) => {
              const institution = localize(edu.institution, locale);
              const eduLocation = localize(edu.location, locale);
              const degree = localize(edu.degree, locale);
              const field = localize(edu.fieldOfStudy, locale);
              const endYear = edu.current
                ? isFa
                  ? "در حال تحصیل"
                  : "Present"
                : edu.endDate
                  ? new Date(edu.endDate).getFullYear().toString()
                  : "";
              const desc = localize(edu.description, locale);
              return (
                <div key={edu._id} className="text-start text-[12.5px] leading-[1.7] text-slate-900">
                  <div>
                    <span className="font-bold">{institution}</span>
                    {eduLocation && (
                      <span className="text-slate-700"> — {eduLocation}</span>
                    )}
                  </div>
                  <div className="text-slate-800">
                    {degree}
                    {field ? ` (${field})` : ""}
                    {endYear ? ` | ${endYear}` : ""}
                  </div>
                  {desc && <div className="text-slate-700">{desc}</div>}
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (key === "skills") {
      if (groupedSkills.size === 0 && selectedLanguages.length === 0) return null;
      if (groupedSkills.size === 0) return null;
      return (
        <section key={key} className="mb-4 break-inside-avoid text-start">
          <h2 className={sectionHeadingClass}>
            {SECTION_TITLES.skills[locale]}
          </h2>
          <div className="space-y-1 text-start text-[12.5px] leading-[1.75] text-slate-800">
            {Array.from(groupedSkills.entries()).map(([category, names]) => (
              <div key={category}>
                <span className="font-bold text-slate-900">{category}: </span>
                <bdi dir="auto">{names.join(isFa ? "، " : ", ")}</bdi>
              </div>
            ))}
            {visibility.languages !== false && selectedLanguages.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">
                  {isFa ? "زبان‌ها: " : "Languages: "}
                </span>
                <span>
                  {selectedLanguages
                    .map(
                      (lang) =>
                        `${localize(lang.name, locale)} (${localize(lang.level, locale)})`,
                    )
                    .join(isFa ? "، " : ", ")}
                </span>
              </div>
            )}
          </div>
        </section>
      );
    }

    if (key === "languages") {
      // If skills section is visible and already displayed languages inline, skip duplicate block unless skills is hidden or empty
      if (visibility.skills !== false && groupedSkills.size > 0) return null;
      if (selectedLanguages.length === 0) return null;
      return (
        <section key={key} className="mb-4 break-inside-avoid text-start">
          <h2 className={sectionHeadingClass}>
            {SECTION_TITLES.languages[locale]}
          </h2>
          <p className="text-start text-[12.5px] text-slate-800">
            {selectedLanguages
              .map(
                (lang) =>
                  `${localize(lang.name, locale)} (${localize(lang.level, locale)})`,
              )
              .join(isFa ? "، " : ", ")}
          </p>
        </section>
      );
    }

    return null;
  };

  return (
    <div
      dir={isFa ? "rtl" : "ltr"}
      className={`resume-a4-sheet mx-auto w-full bg-white text-slate-900 shadow-lg ring-1 ring-slate-200 print:m-0 print:w-full print:max-w-none print:p-0 print:shadow-none print:ring-0 ${
        compact ? "p-5 text-[12px] sm:p-6" : "max-w-[210mm] p-6 sm:p-12"
      } ${isFa ? "text-right" : "font-serif text-left"}`}
    >
      {/* Header matching the user's PDF */}
      <header className="mb-5">
        <h1
          className={`text-center font-bold text-slate-950 ${
            compact ? "text-xl" : "text-2xl sm:text-[26px]"
          } ${isFa ? "" : "italic"}`}
        >
          {name}
        </h1>

        {(location || phoneContact) && (
          <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 text-center text-[12px] text-slate-700">
            {location && <span>{location}</span>}
            {location && phoneContact?.value && (
              <span aria-hidden="true">|</span>
            )}
            {phoneContact?.value && (
              <bdi dir="ltr">{phoneContact.value}</bdi>
            )}
          </p>
        )}

        {otherContacts.length > 0 && (
          <div
            className={`mt-2.5 space-y-0.5 text-[12px] leading-[1.6] text-slate-800 ${
              isFa ? "text-right" : "text-left"
            }`}
          >
            {otherContacts.map((contact) => {
              const label = resolveContactLabel(contact, locale);
              const displayValue = contact.url || contact.value;
              const href =
                contact.url ||
                (contact.type.toLowerCase() === "email"
                  ? `mailto:${contact.value}`
                  : undefined);
              return (
                <div
                  key={contact._id}
                  className="flex flex-wrap items-baseline justify-start gap-x-1.5"
                >
                  <span className="shrink-0 font-bold text-slate-900">
                    {label}:
                  </span>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      dir="ltr"
                      className="inline-block break-all text-left text-blue-700 underline underline-offset-2"
                    >
                      {displayValue.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  ) : (
                    <bdi dir="ltr" className="break-all">
                      {displayValue}
                    </bdi>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* Dynamic Ordered Sections */}
      <div className={isFa ? "text-right" : "text-left"}>
        {sectionOrder.map(renderSection)}
      </div>
    </div>
  );
}
