"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock,
  Handshake,
  LoaderCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createContactMessage } from "@/lib/api/requests/contact";
import { cn } from "@/lib/utils";

const OPEN_EVENT = "portfolio:open-collaboration-modal";

export function openCollaborationModal(detail?: { projectType?: string }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail }));
}

const PROJECT_TYPES = [
  {
    value: "corporate-website",
    fa: "سایت شرکتی و معرفی برند",
    en: "Corporate / Brand Website",
  },
  {
    value: "ecommerce-store",
    fa: "فروشگاه اینترنتی اختصاصی",
    en: "Custom E-Commerce Store",
  },
  {
    value: "nextjs-webapp",
    fa: "وب‌اپلیکیشن و داشبورد (React / Next.js)",
    en: "Web App & Dashboard (React / Next.js)",
  },
  {
    value: "ai-application",
    fa: "اپلیکیشن و ابزار هوش مصنوعی (AI / LLM)",
    en: "AI & LLM Application",
  },
  {
    value: "wordpress-elementor",
    fa: "طراحی سایت وردپرس و المنتور",
    en: "WordPress & Elementor Website",
  },
  {
    value: "seo-optimization",
    fa: "بهینه‌سازی سرعت، سئو و دیباگ",
    en: "Performance, SEO & Bug Fixing",
  },
  {
    value: "consultation-other",
    fa: "مشاوره فنی / پروژه اختصاصی دیگر",
    en: "Technical Consultation / Other",
  },
] as const;

const BUDGET_OPTIONS = [
  { value: "starter", fa: "اقتصادی (تا ۳۰ م.ت)", en: "Starter (< $1k)" },
  { value: "standard", fa: "استاندارد (۳۰ تا ۸۰ م.ت)", en: "Standard ($1k–$3k)" },
  { value: "pro", fa: "حرفه‌ای (بالای ۸۰ م.ت)", en: "Enterprise ($3k+)" },
  { value: "flexible", fa: "توافقی / نیاز به برآورد", en: "Flexible / Estimate" },
] as const;

const TIMELINE_OPTIONS = [
  { value: "urgent", fa: "فوری (زیر ۲ هفته)", en: "Urgent (< 2 weeks)" },
  { value: "one-month", fa: "حدود ۱ ماه", en: "~1 Month" },
  { value: "one-to-three-months", fa: "۱ تا ۳ ماه", en: "1–3 Months" },
  { value: "flexible", fa: "زمان‌بندی انعطاف‌پذیر", en: "Flexible" },
] as const;

type CollaborationFormValues = {
  fullName: string;
  phone: string;
  email: string;
  projectType: string;
  budget: string;
  timeline: string;
  description: string;
  websiteTrap: string;
};

const fieldClass = cn(
  "h-11 w-full rounded-xl",
  "border-slate-200/80 bg-white/80 px-3.5",
  "text-sm text-slate-900 shadow-none",
  "placeholder:text-slate-400",
  "focus-visible:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500/15",
  "dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:border-emerald-400/50",
);

export function StartCollaborationButton({
  projectType,
  label,
  variant = "default",
  size = "default",
  className,
  onAfterClick,
  showIcon = true,
}: {
  projectType?: string;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  onAfterClick?: () => void;
  showIcon?: boolean;
}) {
  const locale = useLocale();
  const isFa = locale === "fa";

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        onAfterClick?.();
        openCollaborationModal({ projectType });
      }}
    >
      {showIcon && <Handshake className="size-4" aria-hidden="true" />}
      <span>{label || (isFa ? "شروع همکاری" : "Start Collaboration")}</span>
    </Button>
  );
}

export default function CollaborationModal() {
  const locale = useLocale();
  const isFa = locale === "fa";
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const schema = z.object({
    fullName: z
      .string()
      .trim()
      .min(3, isFa ? "لطفاً نام و نام خانوادگی را وارد کنید" : "Please enter your full name")
      .max(120),
    phone: z
      .string()
      .trim()
      .regex(
        /^[+\d][\d\s().-]{7,25}$/,
        isFa ? "شماره تماس معتبر نیست (مثلاً 09123456789)" : "Please enter a valid phone number",
      ),
    email: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
        isFa ? "فرمت ایمیل معتبر نیست" : "Please enter a valid email address",
      ),
    projectType: z
      .string()
      .min(1, isFa ? "لطفاً نوع پروژه را انتخاب کنید" : "Please select a project type"),
    budget: z.string(),
    timeline: z.string(),
    description: z.string().trim().max(3000),
    websiteTrap: z.string(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CollaborationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      projectType: "",
      budget: "flexible",
      timeline: "one-month",
      description: "",
      websiteTrap: "",
    },
  });

  const selectedBudget = watch("budget");
  const selectedTimeline = watch("timeline");

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ projectType?: string }>;
      setSubmitted(false);
      setSubmitError("");
      if (custom.detail?.projectType) {
        setValue("projectType", custom.detail.projectType);
      }
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, [setValue]);

  const handleClose = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubmitError("");
      setSubmitted(false);
    }
  };

  const onSubmit = async (values: CollaborationFormValues) => {
    if (values.websiteTrap) return;
    setSubmitError("");

    const projectLabel =
      PROJECT_TYPES.find((item) => item.value === values.projectType)?.[
        isFa ? "fa" : "en"
      ] ?? values.projectType;
    const budgetLabel =
      BUDGET_OPTIONS.find((item) => item.value === values.budget)?.[
        isFa ? "fa" : "en"
      ] ?? values.budget;
    const timelineLabel =
      TIMELINE_OPTIONS.find((item) => item.value === values.timeline)?.[
        isFa ? "fa" : "en"
      ] ?? values.timeline;

    const details = [
      `${isFa ? "نوع پروژه" : "Project Type"}: ${projectLabel}`,
      `${isFa ? "شماره تماس" : "Phone"}: ${values.phone.trim()}`,
      values.email.trim()
        ? `${isFa ? "ایمیل" : "Email"}: ${values.email.trim()}`
        : null,
      `${isFa ? "بودجه تخمینی" : "Budget"}: ${budgetLabel}`,
      `${isFa ? "زمان‌بندی" : "Timeline"}: ${timelineLabel}`,
      values.description.trim()
        ? `\n${isFa ? "توضیحات" : "Details"}:\n${values.description.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await createContactMessage({
        name: values.fullName.trim(),
        phone: values.phone.trim(),
        ...(values.email.trim() ? { email: values.email.trim() } : {}),
        subject: `${isFa ? "درخواست همکاری" : "Collaboration Request"}: ${projectLabel}`,
        projectType: projectLabel,
        budget: budgetLabel,
        timeline: timelineLabel,
        source: "collaboration_modal",
        message: details,
        locale: isFa ? "fa" : "en",
      });

      setSubmitted(true);
      toast.success(
        isFa
          ? "درخواست همکاری شما با موفقیت ثبت شد!"
          : "Your collaboration request has been sent!",
      );
      reset();
    } catch {
      const errorText = isFa
        ? "ارسال درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید."
        : "Unable to send your request. Please try again.";
      setSubmitError(errorText);
      toast.error(errorText);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        dir={isFa ? "rtl" : "ltr"}
        className="max-h-[92svh] overflow-y-auto"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-[28px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"
        />

        <DialogHeader className="pe-10">
          <div className="mb-1 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Sparkles size={13} aria-hidden="true" />
            <span>{isFa ? "مشاوره و شروع پروژه" : "Project Inquiry"}</span>
          </div>

          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
            {isFa ? "شروع همکاری جدید" : "Start a Collaboration"}
          </DialogTitle>

          <DialogDescription className="text-xs leading-6 sm:text-sm">
            {isFa
              ? "مشخصات تماس و نوع پروژه‌تان را ثبت کنید تا در سریع‌ترین زمان برای مشاوره رایگان با شما تماس بگیرم."
              : "Share your contact details and project type so we can schedule a free discovery call."}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="my-4 flex flex-col items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-8 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 size={30} aria-hidden="true" />
            </span>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isFa ? "درخواست شما ثبت شد!" : "Request Received!"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
              {isFa
                ? "ممنون از پیام شما. اطلاعات پروژه دریافت شد و حداکثر ظرف ۲۴ ساعت با شما تماس می‌گیرم."
                : "Thank you for reaching out. I have received your project details and will get back to you within 24 hours."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSubmitted(false)}
              >
                {isFa ? "ثبت درخواست جدید" : "Send Another Request"}
              </Button>
              <Button type="button" onClick={() => setOpen(false)}>
                {isFa ? "بستن پنجره" : "Done"}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Honeypot field */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
              {...register("websiteTrap")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="collab-fullname"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 sm:text-sm"
                >
                  <UserRound size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{isFa ? "نام و نام خانوادگی *" : "Full Name *"}</span>
                </label>
                <Input
                  id="collab-fullname"
                  autoComplete="name"
                  placeholder={isFa ? "مثلاً علی رضایی" : "e.g. Alex Carter"}
                  className={fieldClass}
                  aria-invalid={!!errors.fullName}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="collab-phone"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 sm:text-sm"
                >
                  <Phone size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{isFa ? "شماره تماس *" : "Phone Number *"}</span>
                </label>
                <Input
                  id="collab-phone"
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  placeholder={isFa ? "0912 345 6789" : "+1 555 123 4567"}
                  className={cn(fieldClass, "text-left")}
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="collab-project-type"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 sm:text-sm"
                >
                  {isFa ? "نوع پروژه *" : "Project Type *"}
                </label>
                <Controller
                  name="projectType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id="collab-project-type"
                        className={fieldClass}
                        aria-invalid={!!errors.projectType}
                      >
                        <SelectValue
                          placeholder={
                            isFa ? "نوع پروژه را انتخاب کنید" : "Select project type"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent
                        dir={isFa ? "rtl" : "ltr"}
                        className="border-slate-200 bg-white dark:border-white/10 dark:bg-[#17212b]"
                      >
                        {PROJECT_TYPES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item[isFa ? "fa" : "en"]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.projectType && (
                  <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
                    {errors.projectType.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="collab-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 sm:text-sm"
                >
                  {isFa ? "ایمیل (اختیاری)" : "Email (Optional)"}
                </label>
                <Input
                  id="collab-email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={cn(fieldClass, "text-left")}
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && (
                  <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 sm:text-sm">
                <Wallet size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>{isFa ? "بازه بودجه تخمینی" : "Estimated Budget"}</span>
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BUDGET_OPTIONS.map((item) => {
                  const active = selectedBudget === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setValue("budget", item.value)}
                      className={cn(
                        "rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors",
                        active
                          ? "border-emerald-500/50 bg-emerald-500/15 font-semibold text-emerald-800 dark:border-emerald-400/50 dark:bg-emerald-400/15 dark:text-emerald-200"
                          : "border-slate-200/80 bg-white/60 text-slate-600 hover:border-emerald-500/30 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300",
                      )}
                    >
                      {item[isFa ? "fa" : "en"]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 sm:text-sm">
                <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>{isFa ? "زمان‌بندی مورد نظر" : "Target Timeline"}</span>
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TIMELINE_OPTIONS.map((item) => {
                  const active = selectedTimeline === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setValue("timeline", item.value)}
                      className={cn(
                        "rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors",
                        active
                          ? "border-emerald-500/50 bg-emerald-500/15 font-semibold text-emerald-800 dark:border-emerald-400/50 dark:bg-emerald-400/15 dark:text-emerald-200"
                          : "border-slate-200/80 bg-white/60 text-slate-600 hover:border-emerald-500/30 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300",
                      )}
                    >
                      {item[isFa ? "fa" : "en"]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project brief */}
            <div className="space-y-1.5">
              <label
                htmlFor="collab-description"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200 sm:text-sm"
              >
                {isFa ? "توضیحات مختصر پروژه (اختیاری)" : "Project Brief (Optional)"}
              </label>
              <Textarea
                id="collab-description"
                rows={3}
                placeholder={
                  isFa
                    ? "خلاصه‌ای از ایده، امکانات مورد نیاز یا لینک سایت نمونه بنویسید..."
                    : "Briefly describe your goals, key features, or reference links..."
                }
                className={cn(fieldClass, "h-auto min-h-24 resize-y py-2.5")}
                {...register("description")}
              />
            </div>

            {submitError && (
              <p
                role="alert"
                className="rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300"
              >
                {submitError}
              </p>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {isFa
                    ? "مشاوره اولیه رایگان · پاسخگویی زیر ۲۴ ساعت"
                    : "Free initial consultation · Reply within 24h"}
                </span>
              </div>

              <div className="flex w-full flex-col-reverse items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-center text-xs font-semibold text-slate-500 underline-offset-4 hover:text-emerald-700 hover:underline dark:text-slate-400 dark:hover:text-emerald-300"
                >
                  {isFa ? "صفحه تماس کامل" : "Full contact page"}
                </Link>

                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Send size={16} aria-hidden="true" />
                  )}
                  <span>
                    {isSubmitting
                      ? isFa
                        ? "در حال ارسال..."
                        : "Sending..."
                      : isFa
                        ? "ثبت درخواست همکاری"
                        : "Submit Request"}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
