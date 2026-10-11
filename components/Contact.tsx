
"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createContactMessage } from "@/lib/api/requests/contact";
import type { PublicContactMethod } from "@/lib/services/public-portfolio";

import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  LoaderCircle,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

import {
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

const safeContactHref = (item: PublicContactMethod): string | undefined => {
  if (item.url) {
    try {
      const url = new URL(item.url);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
    } catch { return undefined; }
  }
  if (item.type === "email" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.value)) return `mailto:${item.value}`;
  if (item.type === "phone" && /^[+\d][\d\s()-]{5,}$/.test(item.value)) return `tel:${item.value.replace(/\s/g, "")}`;
  return undefined;
};

const SERVICE_OPTIONS = [
  {
    value: "frontend",
    fa: "توسعه فرانت‌اند",
    en: "Frontend Development",
  },
  {
    value: "backend",
    fa: "توسعه بک‌اند و API",
    en: "Backend & API Development",
  },
  {
    value: "fullstack",
    fa: "توسعه فول‌استک",
    en: "Full-Stack Development",
  },
  {
    value: "javascript",
    fa: "برنامه‌نویسی با جاوااسکریپت خام",
    en: "Vanilla JavaScript Development",
  },
  {
    value: "ai",
    fa: "توسعه نرم‌افزار با قابلیت‌های هوش مصنوعی",
    en: "AI-Powered Applications",
  },
  {
    value: "ecommerce",
    fa: "توسعه فروشگاه اینترنتی اختصاصی",
    en: "Custom E-commerce Development",
  },
  {
    value: "optimization",
    fa: "بهینه‌سازی عملکرد و سئو فنی",
    en: "Performance & Technical SEO",
  },
  {
    value: "other",
    fa: "سایر خدمات و مشاوره",
    en: "Other / Consultation",
  },
] as const;

type FormData = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

type TranslationFn = (key: string) => string;

function createSchema(t: TranslationFn) {
  return z.object({
    firstname: z
      .string()
      .trim()
      .min(2, t("validations.firstnameError")),

    lastname: z
      .string()
      .trim()
      .min(2, t("validations.lastnameError")),

    email: z
      .string()
      .trim()
      .email(t("validations.emailError")),

    phone: z
      .string()
      .trim()
      .min(8, t("validations.phoneError")),

    service: z
      .string()
      .min(1, t("validations.serviceError")),

    message: z
      .string()
      .trim()
      .min(5, t("validations.messageError")),
  });
}

const fieldClass = cn(
  "h-12 w-full rounded-xl",
  "border-slate-200/80",
  "bg-white/70 px-4",
  "text-sm text-slate-900",
  "shadow-none",
  "placeholder:text-slate-400",
  "transition-[border-color,box-shadow]",
  "focus-visible:border-emerald-500/50",
  "focus-visible:ring-2",
  "focus-visible:ring-emerald-500/10",
  "dark:border-white/10",
  "dark:bg-white/[0.04]",
  "dark:text-slate-100",
  "dark:placeholder:text-slate-500",
  "dark:focus-visible:border-emerald-400/40"
);

const panelClass = cn(
  "rounded-[28px]",
  "border border-emerald-900/[0.08]",
  "bg-white/70",
  "shadow-[0_12px_45px_rgba(15,23,42,0.04)]",
  "backdrop-blur-xl",
  "dark:border-white/[0.08]",
  "dark:bg-white/[0.035]",
  "dark:shadow-none"
);

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="
          block text-sm font-semibold
          text-slate-700
          dark:text-slate-200
        "
      >
        {label}
      </label>

      {children}

      {error && (
        <p
          role="alert"
          className="text-xs text-rose-600 dark:text-rose-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function WorkComponent({ initialContactMethods = [] }: { initialContactMethods?: PublicContactMethod[] }) {
  const locale = useLocale();
  const t = useTranslations("HomePage");
  const isFa = locale === "fa";

  const [requestError, setRequestError] = useState(false);

  const schema = createSchema(t);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
      isSubmitSuccessful,
    },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    },
    mode: "onTouched",
  });

  // TODO(Codex): Preserve the existing public endpoint:
  // POST /api/public/contact-messages
  //
  // Before changing payload fields, inspect:
  // - docs/API_FA.md
  // - ContactMessage Mongoose schema
  // - Public route validation
  //
  // Current backend contract uses:
  // { name, email, subject, message, locale }
  //
  // Do NOT call /api/admin/* from this public form.
  // Do NOT expose admin authentication data.
  //
  // If phone/service need dedicated DB fields,
  // update backend validation and schema together,
  // not just the frontend request.
  //
  // Add server-side anti-spam protection and
  // rate limiting when implementing production
  // hardening. Client validation is not sufficient.

  const onSubmit = async (data: FormData) => {
    setRequestError(false);

    const selectedService = SERVICE_OPTIONS.find(
      (item) => item.value === data.service
    );

    const serviceLabel = selectedService
      ? selectedService[isFa ? "fa" : "en"]
      : data.service;

    try {
      await createContactMessage({
        name: `${data.firstname} ${data.lastname}`.trim(),
        email: data.email.trim(),
        subject: serviceLabel,
        message: `Phone: ${data.phone.trim()}\n\n${data.message.trim()}`,
        locale: locale === "fa" ? "fa" : "en",
      });

      toast.success(t("contact.sucsend"));
      reset();
    } catch {
      setRequestError(true);
      toast.error(t("contact.errorMessage"));
    }
  };

  const contactItems = initialContactMethods.map((item) => ({
      id: item._id,
      title: item.label?.[locale as "fa" | "en"] || item.label?.en || item.value,
      value: item.value,
      href: safeContactHref(item),
      icon: item.type === "email" ? Mail : item.type === "phone" ? Phone : item.type === "telegram" ? FaTelegramPlane : item.type === "whatsapp" ? FaWhatsapp : MessageCircle,
      external: Boolean(item.url),
    })).filter((item): item is typeof item & { href: string } => Boolean(item.href));
  /* const contactItems = [
    {
      id: "email",
      title: t("contact.email"),
      value: "kamyarkamali021@gmail.com",
      href: "mailto:kamyarkamali021@gmail.com",
      icon: Mail,
      external: false,
    },
    {
      id: "phone",
      title: t("contact.title1"),
      value: "+98 935 437 8110",
      href: "tel:+989354378110",
      icon: Phone,
      external: false,
    },
    {
      id: "telegram",
      title: t("contact.telegram"),
      value: "@KamDevJs",
      href: "https://t.me/KamDevJs",
      icon: FaTelegramPlane,
      external: true,
    },
    {
      id: "whatsapp",
      title: t("contact.WhatsApp"),
      value: "WhatsApp",
      href: "https://wa.me/989354378110",
      icon: FaWhatsapp,
      external: true,
    },
  ]; */

  return (
    <section
      dir={isFa ? "rtl" : "ltr"}
      className="
        relative isolate overflow-hidden
        px-4 py-16
        sm:px-6 sm:py-20
        lg:py-24
      "
    >
      {/* Aurora background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="
            absolute -top-40 -start-40
            size-[440px] rounded-full
            bg-emerald-300/15 blur-[100px]
            dark:bg-emerald-500/[0.07]
          "
        />
        <div
          className="
            absolute -bottom-40 -end-40
            size-[440px] rounded-full
            bg-cyan-300/15 blur-[100px]
            dark:bg-cyan-500/[0.07]
          "
        />
      </div>

      <div className="container mx-auto max-w-7xl">
        {/* Page heading */}
        <header className="mb-10 max-w-2xl space-y-4 sm:mb-12">
          <span
            className="
              inline-flex items-center gap-2
              rounded-full
              border border-emerald-500/15
              bg-emerald-500/[0.07]
              px-4 py-2
              text-xs font-semibold
              text-emerald-700
              dark:text-emerald-300
            "
          >
            <Sparkles size={15} aria-hidden="true" />
            {isFa ? "ارتباط و همکاری" : "Contact & Collaboration"}
          </span>

          <h1
            className="
              text-3xl font-bold tracking-tight
              text-slate-900
              dark:text-white
              sm:text-4xl
            "
          >
            {t("contact.work")}
          </h1>

          <p
            className="
              text-sm leading-8
              text-slate-600
              dark:text-slate-400
              sm:text-base
            "
          >
            {t("contact.moshaver")}
          </p>
        </header>

        <div
          className="
            grid items-start gap-6
            lg:grid-cols-[minmax(0,1fr)_340px]
            xl:gap-8
          "
        >
          {/* Form */}
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className={cn(
              panelClass,
              "relative min-w-0 overflow-hidden p-5 sm:p-8"
            )}
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute -end-24 -top-24
                size-64 rounded-full
                bg-emerald-300/15 blur-3xl
                dark:bg-emerald-400/[0.06]
              "
            />

            <div className="relative">
              <div className="mb-8 flex items-center gap-3">
                <span
                  className="
                    flex size-12 items-center justify-center
                    rounded-2xl
                    border border-emerald-500/15
                    bg-emerald-500/[0.08]
                    text-emerald-700
                    dark:text-emerald-300
                  "
                >
                  <MessageCircle
                    size={22}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <h2
                    className="
                      text-lg font-bold
                      text-slate-900 dark:text-white
                    "
                  >
                    {isFa
                      ? "درباره پروژه‌ات صحبت کنیم"
                      : "Tell me about your project"}
                  </h2>

                  <p
                    className="
                      mt-1 text-xs
                      text-slate-500 dark:text-slate-400
                    "
                  >
                    {isFa
                      ? "جزئیات درخواستت رو در فرم زیر وارد کن"
                      : "Share the details of your request below"}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label={t("contact.name")}
                  htmlFor="contact-firstname"
                  error={errors.firstname?.message}
                >
                  <Input
                    id="contact-firstname"
                    autoComplete="given-name"
                    aria-invalid={!!errors.firstname}
                    aria-describedby={
                      errors.firstname
                        ? "contact-firstname-error"
                        : undefined
                    }
                    className={fieldClass}
                    placeholder={t("contact.name")}
                    {...register("firstname")}
                  />
                </Field>

                <Field
                  label={t("contact.last")}
                  htmlFor="contact-lastname"
                  error={errors.lastname?.message}
                >
                  <Input
                    id="contact-lastname"
                    autoComplete="family-name"
                    aria-invalid={!!errors.lastname}
                    className={fieldClass}
                    placeholder={t("contact.last")}
                    {...register("lastname")}
                  />
                </Field>

                <Field
                  label={t("contact.email")}
                  htmlFor="contact-email"
                  error={errors.email?.message}
                >
                  <Input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    className={cn(fieldClass, "text-left")}
                    dir="ltr"
                    placeholder="name@example.com"
                    {...register("email")}
                  />
                </Field>

                <Field
                  label={t("contact.title1")}
                  htmlFor="contact-phone"
                  error={errors.phone?.message}
                >
                  <Input
                    id="contact-phone"
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                    className={cn(fieldClass, "text-left")}
                    dir="ltr"
                    placeholder="+98 ..."
                    {...register("phone")}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field
                    label={t("contact.service")}
                    htmlFor="contact-service"
                    error={errors.service?.message}
                  >
                    <Controller
                      name="service"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id="contact-service"
                            aria-invalid={!!errors.service}
                            className={fieldClass}
                          >
                            <SelectValue
                              placeholder={t("contact.service")}
                            />
                          </SelectTrigger>

                          <SelectContent
                            dir={isFa ? "rtl" : "ltr"}
                            className="
                              border-slate-200
                              bg-white
                              dark:border-white/10
                              dark:bg-[#17212b]
                            "
                          >
                            {SERVICE_OPTIONS.map((item) => (
                              <SelectItem
                                key={item.value}
                                value={item.value}
                              >
                                {item[isFa ? "fa" : "en"]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label={t("contact.messege")}
                    htmlFor="contact-message"
                    error={errors.message?.message}
                  >
                    <Textarea
                      id="contact-message"
                      rows={6}
                      aria-invalid={!!errors.message}
                      placeholder={t("contact.messege")}
                      className={cn(
                        fieldClass,
                        "h-auto min-h-40 resize-y py-3"
                      )}
                      {...register("message")}
                    />
                  </Field>
                </div>
              </div>

              {requestError && (
                <p
                  role="alert"
                  className="
                    mt-5 rounded-xl
                    border border-rose-500/15
                    bg-rose-500/[0.06]
                    px-4 py-3
                    text-sm text-rose-700
                    dark:text-rose-300
                  "
                >
                  {t("contact.errorMessage")}
                </p>
              )}

              {isSubmitSuccessful && !requestError && (
                <div
                  role="status"
                  className="
                    mt-5 flex items-center gap-2
                    rounded-xl
                    border border-emerald-500/15
                    bg-emerald-500/[0.07]
                    px-4 py-3
                    text-sm text-emerald-800
                    dark:text-emerald-300
                  "
                >
                  <CheckCircle2 size={18} aria-hidden="true" />
                  {t("contact.sucsend")}
                </div>
              )}

              <div
                className="
                  mt-7 flex flex-col gap-3
                  border-t border-slate-200/70 pt-6
                  dark:border-white/10
                  sm:flex-row sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    text-xs leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {isFa
                    ? "اطلاعاتت فقط برای پاسخ به درخواستت استفاده می‌شود."
                    : "Your details will be used to respond to your request."}
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    inline-flex min-h-12
                    shrink-0 items-center justify-center gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-emerald-600 to-teal-600
                    px-6 py-3
                    text-sm font-semibold text-white
                    shadow-[0_8px_24px_rgba(16,185,129,0.18)]
                    transition-[box-shadow,transform]
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-[0_12px_30px_rgba(16,185,129,0.25)]
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-emerald-500
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    motion-reduce:transform-none
                  "
                >
                  {isSubmitting ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : (
                    <Send size={18} aria-hidden="true" />
                  )}

                  {isSubmitting
                    ? t("contact.sending")
                    : t("contact.send")}
                </button>
              </div>
            </div>
          </form>

          {/* Contact information */}
          <aside className="space-y-4">
            <div className={cn(panelClass, "p-5 sm:p-6")}>
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="
                    flex size-11 items-center justify-center
                    rounded-2xl
                    border border-emerald-500/15
                    bg-emerald-500/[0.08]
                    text-emerald-700
                    dark:text-emerald-300
                  "
                >
                  <Mail size={20} aria-hidden="true" />
                </span>

                <div>
                  <h2
                    className="
                      text-base font-bold
                      text-slate-900 dark:text-white
                    "
                  >
                    {isFa
                      ? "راه‌های ارتباطی"
                      : "Contact information"}
                  </h2>

                  <p
                    className="
                      mt-1 text-xs
                      text-slate-500 dark:text-slate-400
                    "
                  >
                    {isFa
                      ? "از روش دلخواهت با من در ارتباط باش"
                      : "Reach out using your preferred channel"}
                  </p>
                </div>
              </div>

              <ul className="space-y-2">
                {contactItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        target={
                          item.external ? "_blank" : undefined
                        }
                        rel={
                          item.external
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="
                          group flex min-w-0
                          items-center gap-3
                          rounded-2xl
                          border border-transparent
                          p-3
                          transition-colors duration-200
                          hover:border-emerald-500/10
                          hover:bg-emerald-500/[0.06]
                          focus-visible:outline-2
                          focus-visible:outline-emerald-500
                          dark:hover:border-white/10
                          dark:hover:bg-white/[0.04]
                        "
                      >
                        <span
                          className="
                            flex size-11 shrink-0
                            items-center justify-center
                            rounded-xl
                            bg-slate-900/[0.04]
                            text-slate-600
                            transition-colors
                            group-hover:bg-emerald-500/10
                            group-hover:text-emerald-700
                            dark:bg-white/[0.06]
                            dark:text-slate-300
                            dark:group-hover:text-emerald-300
                          "
                        >
                          <Icon size={19} aria-hidden="true" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="
                              block text-xs
                              text-slate-500 dark:text-slate-400
                            "
                          >
                            {item.title}
                          </span>

                          <span
                            className="
                              mt-1 block break-all
                              text-sm font-semibold
                              text-slate-800
                              dark:text-slate-100
                            "
                            dir="auto"
                          >
                            {item.value}
                          </span>
                        </span>

                        <ArrowUpRight
                          size={16}
                          aria-hidden="true"
                          className="
                            shrink-0 text-slate-300
                            transition-colors
                            group-hover:text-emerald-600
                            dark:text-slate-600
                            dark:group-hover:text-emerald-300
                          "
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div
              className={cn(
                panelClass,
                "relative overflow-hidden p-5 sm:p-6"
              )}
            >
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute -end-16 -bottom-16
                  size-44 rounded-full
                  bg-emerald-300/15 blur-3xl
                  dark:bg-emerald-400/[0.07]
                "
              />

              <div className="relative">
                <Code2
                  size={24}
                  className="mb-4 text-emerald-700 dark:text-emerald-300"
                  aria-hidden="true"
                />

                <h3
                  className="
                    text-base font-bold
                    text-slate-900 dark:text-white
                  "
                >
                  {isFa
                    ? "برای همکاری آماده‌ای؟"
                    : "Have a project in mind?"}
                </h3>

                <p
                  className="
                    mt-2 text-sm leading-7
                    text-slate-600 dark:text-slate-400
                  "
                >
                  {isFa
                    ? "جزئیات ایده یا پروژه‌ات رو ارسال کن تا درباره مسیر اجرا صحبت کنیم."
                    : "Share your idea or project details so we can discuss the next steps."}
                </p>

                <a
                  href="mailto:kamyarkamali021@gmail.com"
                  className="
                    mt-5 inline-flex items-center gap-2
                    text-sm font-semibold
                    text-emerald-700
                    hover:underline
                    underline-offset-4
                    dark:text-emerald-300
                  "
                >
                  {isFa ? "ارسال ایمیل" : "Send an email"}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
