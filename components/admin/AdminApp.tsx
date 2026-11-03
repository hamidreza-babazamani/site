"use client";

import {
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Languages,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { requestAdmin } from "@/lib/api/requests/admin";

type Localized = { fa: string; en: string };
type ResourceKey =
  | "projects"
  | "technologies"
  | "experiences"
  | "services"
  | "languages"
  | "contact-methods";
type Section = string;
type MediaItem = {
  key: string;
  url: string;
  alt?: Localized;
  fileId?: string;
};
// مدل‌های پنل چندشکل هستند؛ نوع مقدار از JSON برای حفظ قراردادهای فعلی استفاده می‌شود.
type DynamicValue = ReturnType<JSON["parse"]>;
type Item = Record<string, DynamicValue> & { _id?: string };

const labels: Record<string, { en: string; fa: string; icon: LucideIcon }> = {
  "site-settings": { en: "Site settings", fa: "تنظیمات سایت", icon: Settings2 },
  overview: { en: "Overview", fa: "نمای کلی", icon: LayoutDashboard },
  projects: { en: "Projects", fa: "پروژه‌ها", icon: BriefcaseBusiness },
  technologies: { en: "Technologies", fa: "مهارت‌ها", icon: Zap },
  experiences: { en: "Experience", fa: "سوابق کاری", icon: ClipboardList },
  services: { en: "Services", fa: "خدمات", icon: Sparkles },
  languages: { en: "Languages", fa: "زبان‌ها", icon: Languages },
  "contact-methods": {
    en: "Contact methods",
    fa: "راه‌های ارتباطی",
    icon: Send,
  },
  hero: { en: "Hero section", fa: "بخش معرفی", icon: LibraryBig },
  profile: { en: "Profile", fa: "پروفایل", icon: UserRound },
  resume: { en: "Resume", fa: "رزومه", icon: FileText },
  messages: { en: "Messages", fa: "پیام‌ها", icon: Mail },
};
const resourceKeys: ResourceKey[] = [
  "projects",
  "technologies",
  "experiences",
  "services",
  "languages",
  "contact-methods",
];
const emptyLocalized = (): Localized => ({ fa: "", en: "" });
const localized = (value: unknown): Localized => ({
  fa: (value as Partial<Localized> | undefined)?.fa ?? "",
  en: (value as Partial<Localized> | undefined)?.en ?? "",
});
const text = (value: unknown, locale: string) => {
  if (value && typeof value === "object") {
    const localizedValue = value as Record<string, unknown>;
    const selected =
      localizedValue[locale] ?? localizedValue.en ?? localizedValue.fa;
    return typeof selected === "string" ? selected : "";
  }
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
};
const defaultFor = (key: ResourceKey): Item => ({
  ...(key === "projects"
    ? {
        title: emptyLocalized(),
        slug: "",
        shortDescription: emptyLocalized(),
        description: emptyLocalized(),
        technologies: [],
        liveUrl: "",
        repositoryUrl: "",
        featured: false,
      }
    : {}),
  ...(key === "technologies"
    ? { name: emptyLocalized(), category: "", proficiency: 80 }
    : {}),
  ...(key === "experiences"
    ? {
        company: "",
        role: emptyLocalized(),
        description: emptyLocalized(),
        startDate: "",
        endDate: "",
        current: false,
      }
    : {}),
  ...(key === "services"
    ? { title: emptyLocalized(), description: emptyLocalized(), icon: "" }
    : {}),
  ...(key === "languages"
    ? { name: emptyLocalized(), level: emptyLocalized() }
    : {}),
  ...(key === "contact-methods"
    ? { type: "email", label: emptyLocalized(), value: "", url: "", icon: "" }
    : {}),
  order: 0,
  isVisible: true,
});

async function api(path: string, init?: RequestInit) {
  // درخواست واقعی از لایه Axios متمرکز عبور می‌کند؛ کد قدیمی زیر در فاز بعدی حذف می‌شود.
  return requestAdmin<Record<string, DynamicValue>>(path, init);
  /*
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  const headers = new Headers(init?.headers);
  // The browser must add the multipart boundary itself. Removing a caller's
  // stale JSON header also makes this helper safe for every upload surface.
  if (init?.body instanceof FormData) headers.delete("Content-Type");
  try {
    const response = await removedRequest(path, {
      credentials: "include",
      ...init,
      headers,
      signal: init?.signal ?? controller.signal,
    });
    const raw = await response.text();
    const result = (() => {
      try { return raw ? JSON.parse(raw) : {}; }
      catch { return { message: raw }; }
    })();
    const payload = result && typeof result === "object" ? result as Record<string, unknown> : {};
    if (response.status === 401) {
      window.dispatchEvent(new Event("admin:expired"));
      throw Object.assign(new Error("AUTH_REQUIRED"), { code: 401 });
    }
    if (!response.ok) {
      throw Object.assign(new Error(String(payload.message || "REQUEST_FAILED")), {
        code: response.status,
        errors: payload.errors && typeof payload.errors === "object" ? payload.errors as Record<string, string> : undefined,
      });
    }
    if (!result || typeof result !== "object")
      throw Object.assign(new Error("INVALID_RESPONSE"), { code: 502 });
    // پاسخ endpointها شکل‌های متفاوتی دارد؛ قرارداد موجود را بدون تغییر نگه می‌داریم.
    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw Object.assign(new Error("REQUEST_TIMEOUT"), { code: 408 });
    if (error instanceof TypeError)
      throw Object.assign(new Error("NETWORK_ERROR"), { code: 0 });
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
  */
}

type AdminError = Error & { code?: number; errors?: Record<string, string> };
const messages = {
  en: {
    validation: "Please fix the highlighted fields.",
    upload: "Upload failed. Check the file and try again.",
    network: "Network error. Please try again.",
    auth: "Your session has expired. Please sign in again.",
    server: "Something went wrong. Please try again.",
    required: "This field is required.",
    localized: "Enter both Persian and English text.",
    email: "Please enter a valid email address.",
    url: "Please enter a valid URL.",
    date: "Please enter a valid date.",
    number: "Please enter a valid number.",
    image: "Choose a JPEG, PNG, WebP, or AVIF image up to 4 MB.",
    pdf: "Choose a PDF file up to 4 MB.",
    saved: "Saved successfully.",
    uploaded: "File uploaded successfully.",
  },
  fa: {
    validation: "لطفاً خطاهای مشخص‌شده را اصلاح کنید.",
    upload: "بارگذاری انجام نشد. فایل را بررسی و دوباره تلاش کنید.",
    network: "خطای شبکه. لطفاً دوباره تلاش کنید.",
    auth: "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.",
    server: "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
    required: "پر کردن این فیلد الزامی است.",
    localized: "متن فارسی و انگلیسی را وارد کنید.",
    email: "لطفاً ایمیل معتبر وارد کنید.",
    url: "آدرس واردشده معتبر نیست.",
    date: "لطفاً تاریخ معتبر وارد کنید.",
    number: "لطفاً عدد معتبر وارد کنید.",
    image: "تصویر JPEG، PNG، WebP یا AVIF تا حجم ۴ مگابایت انتخاب کنید.",
    pdf: "فایل PDF تا حجم ۴ مگابایت انتخاب کنید.",
    saved: "با موفقیت ذخیره شد.",
    uploaded: "فایل با موفقیت بارگذاری شد.",
  },
} as const;
const localizedServerErrors = (error: unknown, locale: string) => {
  const lang = locale === "fa" ? messages.fa : messages.en;
  const errors = (error as AdminError)?.errors || {};
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => {
      const raw = String(value).toLowerCase();
      if (key.toLowerCase().includes("email") || raw.includes("email"))
        return [key, lang.email];
      if (key.toLowerCase().includes("url") || raw.includes("http"))
        return [key, lang.url];
      if (key.toLowerCase().includes("date")) return [key, lang.date];
      if (raw.includes("number")) return [key, lang.number];
      if (raw.includes("required")) return [key, lang.required];
      return [key, lang.localized];
    }),
  );
};
const localizedError = (error: unknown, locale: string, upload = false) => {
  const lang = locale === "fa" ? messages.fa : messages.en;
  const status = (error as AdminError)?.code;
  if (status === 401 || (error as Error)?.message === "AUTH_REQUIRED")
    return lang.auth;
  if (status === 403)
    return locale === "fa"
      ? "شما اجازه انجام این کار را ندارید."
      : "You do not have permission to perform this action.";
  if (status === 404)
    return locale === "fa"
      ? "مورد درخواستی پیدا نشد."
      : "The requested item was not found.";
  if (status === 408 || (error as Error)?.message === "REQUEST_TIMEOUT")
    return locale === "fa"
      ? "پاسخ‌گویی درخواست بیش از حد طول کشید. دوباره تلاش کنید."
      : "The request took too long. Please try again.";
  if (status === 429)
    return locale === "fa"
      ? "تعداد تلاش‌ها زیاد است. کمی صبر و دوباره تلاش کنید."
      : "Too many attempts. Please wait and try again.";
  if (
    upload ||
    status === 413 ||
    /file|image|pdf|upload|media/i.test((error as Error)?.message || "")
  )
    return lang.upload;
  if (status && status >= 500) return lang.server;
  if ((error as AdminError)?.errors || status === 400) return lang.validation;
  return lang.network;
};
const isHttpUrl = (value: string) => {
  const normalized = value.trim();
  try {
    const url = new URL(normalized);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      normalized.length <= 2048
    );
  } catch {
    return false;
  }
};

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxImageSize = 4 * 1024 * 1024;

/** Keep object URLs stable and release them when files change or unmount. */
function LocalImagePreview({
  file,
  alt,
  className,
}: {
  file: File;
  alt: string;
  className: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return src ? (
    <img src={src} alt={alt} className={className} />
  ) : (
    <div
      className={`${className} animate-pulse bg-slate-100 dark:bg-white/10`}
      aria-hidden="true"
    />
  );
}

function ImageDropzone({
  locale,
  files,
  onFiles,
  alts,
  onAltChange,
  notify,
}: {
  locale: string;
  files: File[];
  onFiles: (files: File[]) => void;
  alts: Record<string, Localized>;
  onAltChange: (file: File, alt: Localized) => void;
  notify?: (message: string, error?: boolean) => void;
}) {
  const fa = locale === "fa";
  const [error, setError] = useState("");
  const fileKey = (file: File) =>
    `${file.name}-${file.lastModified}-${file.size}`;
  const addFiles = (incoming: File[]) => {
    const invalid = incoming.find(
      (file) => !imageTypes.includes(file.type) || file.size > maxImageSize,
    );
    if (invalid) {
      setError(
        fa
          ? "فرمت تصویر نامعتبر است یا حجم آن بیشتر از ۴ مگابایت است."
          : "Use JPEG, PNG, WebP, or AVIF images up to 4 MB.",
      );
      notify?.(fa ? messages.fa.image : messages.en.image, true);
      return;
    }
    setError("");
    onFiles([...files, ...incoming]);
  };
  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    addFiles(Array.from(event.dataTransfer.files));
  };
  return (
    <div className="space-y-3">
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={drop}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-400/50 bg-emerald-400/[0.04] px-4 py-6 text-center transition hover:bg-emerald-400/[0.08] focus-within:ring-4 focus-within:ring-emerald-400/10"
      >
        <Upload className="mb-2 text-emerald-500" size={22} />
        <span className="text-sm font-semibold">
          {fa
            ? "تصاویر را بکشید و رها کنید یا انتخاب کنید"
            : "Drag images here or choose files"}
        </span>
        <span className="mt-1 text-xs text-slate-400">
          JPEG, PNG, WebP, AVIF · 4MB max
        </span>
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(event) => addFiles(Array.from(event.target.files || []))}
        />
      </label>
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {files.map((file, index) => {
            const key = fileKey(file);
            const alt = alts[key] || emptyLocalized();
            return (
              <div
                key={key}
                className="relative rounded-xl border border-slate-200 p-2 dark:border-white/10"
              >
                <LocalImagePreview
                  file={file}
                  alt={file.name}
                  className="aspect-video w-full rounded-lg object-cover"
                />

                <button
                  type="button"
                  aria-label={fa ? "حذف پیش‌نمایش" : "Remove preview"}
                  onClick={() =>
                    onFiles(files.filter((_, itemIndex) => itemIndex !== index))
                  }
                  className="absolute end-3 top-3 rounded-full bg-slate-950/70 p-1 text-white"
                >
                  <X size={13} />
                </button>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    aria-label="Persian alt text"
                    value={alt.fa}
                    onChange={(event) =>
                      onAltChange(file, { ...alt, fa: event.target.value })
                    }
                    placeholder="Alt FA"
                    className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-white/10"
                  />
                  <input
                    aria-label="English alt text"
                    value={alt.en}
                    onChange={(event) =>
                      onAltChange(file, { ...alt, en: event.target.value })
                    }
                    placeholder="Alt EN"
                    className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-white/10"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
  error,
  name,
}: {
  label: string;
  value: Localized;
  onChange: (next: Localized) => void;
  multiline?: boolean;
  error?: string;
  name?: string;
}) {
  const Control = multiline ? "textarea" : "input";
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="relative">
          <span className="absolute end-3 top-3 text-[10px] font-bold uppercase text-slate-400">
            FA
          </span>
          <Control
            id={`${name || label}-fa`}
            value={value.fa}
            onChange={(e) => onChange({ ...value, fa: e.target.value })}
            aria-invalid={!!error}
            aria-describedby={error ? `${name || label}-error` : undefined}
            dir="rtl"
            rows={multiline ? 3 : undefined}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pe-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-white/[0.04]"
          />
        </label>
        <label className="relative">
          <span className="absolute end-3 top-3 text-[10px] font-bold uppercase text-slate-400">
            EN
          </span>
          <Control
            id={`${name || label}-en`}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            aria-invalid={!!error}
            aria-describedby={error ? `${name || label}-error` : undefined}
            dir="ltr"
            rows={multiline ? 3 : undefined}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pe-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-white/[0.04]"
          />
        </label>
      </div>
      {error && (
        <p
          id={`${name || label}-error`}
          role="alert"
          className="text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  error,
  name,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  name?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <input
        id={name}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
        aria-invalid={!!error}
        aria-describedby={error && name ? `${name}-error` : undefined}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 dark:border-white/10 dark:bg-white/[0.04]"
      />
      {error && (
        <p
          id={name ? `${name}-error` : undefined}
          role="alert"
          className="text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-start text-sm transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-white/10 dark:bg-white/[0.04]"
    >
      <span>{label}</span>
      <span
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-emerald-400" : "bg-slate-300 dark:bg-slate-700"}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${value ? "end-1" : "start-1"}`}
        />
      </span>
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
  closeLabel = "Close dialog",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
  closeLabel?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialogRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`max-h-[calc(100dvh-2rem)] w-full overflow-y-auto overscroll-contain rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#101820] sm:max-h-[calc(100dvh-3rem)] sm:p-7 ${wide ? "max-w-4xl" : "max-w-2xl"}`}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10"
            aria-label={closeLabel}
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  busy = false,
}: {
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
}) {
  return (
    <Modal title={title} onClose={busy ? () => undefined : onCancel}>
      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
        {message}
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="min-h-11 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/[0.06]"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => void onConfirm()}
          disabled={busy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-wait disabled:opacity-60"
        >
          {busy && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

function ResourceEditor({
  resource,
  initial,
  locale,
  onClose,
  onSaved,
  notify,
}: {
  resource: ResourceKey;
  initial: Item;
  locale: string;
  onClose: () => void;
  onSaved: (item: Item) => void;
  notify: (message: string, error?: boolean) => void;
}) {
  const fa = locale === "fa";
  const [form, setForm] = useState<Item>(initial);
  const [projectId, setProjectId] = useState(initial._id);
  const [technologyId, setTechnologyId] = useState(initial._id);
  const [serviceId, setServiceId] = useState(initial._id);
  const submitInProgress = useRef(false);
  const [busy, setBusy] = useState(false);
  const [technologyLogoFile, setTechnologyLogoFile] = useState<File | null>(null);
  const [technologyLogoRemovalPending, setTechnologyLogoRemovalPending] =
    useState(false);
  const [technologyLogoBusy, setTechnologyLogoBusy] = useState(false);
  const [technologyLogoStatus, setTechnologyLogoStatus] = useState("");
  const [technologyLogoError, setTechnologyLogoError] = useState("");
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [serviceImageRemovalPending, setServiceImageRemovalPending] =
    useState(false);
  const [serviceImageBusy, setServiceImageBusy] = useState(false);
  const [serviceImageStatus, setServiceImageStatus] = useState("");
  const [serviceImageError, setServiceImageError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [newAlts, setNewAlts] = useState<Record<string, Localized>>({});
  const [replacements, setReplacements] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [confirmation, setConfirmation] = useState<
    { type: "discard" } | { type: "image"; key: string } | null
  >(null);
  const requestClose = () => {
    if (busy) return;
    if (isDirty) {
      setConfirmation({ type: "discard" });
      return;
    }
    onClose();
  };
  const fieldError = (key: string) => errors[key];
  const title = initial._id ? (fa ? "ویرایش" : "Edit") : fa ? "افزودن" : "Add";
  const set = (key: string, value: unknown) => {
    setIsDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };
  const removeTechnologyLogo = () => {
    setTechnologyLogoFile(null);
    setTechnologyLogoRemovalPending(Boolean(form.iconMedia));
    setTechnologyLogoError("");
    setTechnologyLogoStatus("");
    setIsDirty(true);
  };
  const removeServiceImage = () => {
    setServiceImageFile(null);
    setServiceImageRemovalPending(Boolean(form.image));
    setServiceImageError("");
    setServiceImageStatus("");
    setIsDirty(true);
  };
  const common = (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={fa ? "ترتیب نمایش" : "Display order"}
          type="number"
          value={form.order}
          onChange={(v) => set("order", v)}
          name="order"
          error={fieldError("order")}
        />
        <Toggle
          label={fa ? "نمایش در سایت" : "Visible on site"}
          value={form.isVisible !== false}
          onChange={(v) => set("isVisible", v)}
        />
      </div>
    </>
  );
  function fields() {
    if (resource === "projects")
      return (
        <>
          <LocalizedField
            label={fa ? "عنوان" : "Title"}
            value={localized(form.title)}
            onChange={(v) => set("title", v)}
            name="title"
            error={fieldError("title")}
          />
          <LocalizedField
            label={fa ? "توضیح کوتاه" : "Short description"}
            value={localized(form.shortDescription)}
            onChange={(v) => set("shortDescription", v)}
            multiline
            name="shortDescription"
            error={fieldError("shortDescription")}
          />
          <LocalizedField
            label={fa ? "توضیحات" : "Description"}
            value={localized(form.description)}
            onChange={(v) => set("description", v)}
            multiline
            name="description"
            error={fieldError("description")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Slug"
              value={form.slug}
              onChange={(v) => set("slug", v)}
              name="slug"
              error={fieldError("slug")}
            />
            <Field
              label={fa ? "تکنولوژی‌ها" : "Technologies"}
              value={
                Array.isArray(form.technologies)
                  ? form.technologies.join(", ")
                  : ""
              }
              onChange={(v) =>
                set(
                  "technologies",
                  String(v)
                    .split(",")
                    .map((x: string) => x.trim())
                    .filter(Boolean),
                )
              }
            />
            <Field
              label="Live URL"
              value={form.liveUrl}
              onChange={(v) => set("liveUrl", v)}
              name="liveUrl"
              placeholder="Optional — https://example.com"
              error={fieldError("liveUrl")}
            />
            <Field
              label={fa ? "لینک مخزن" : "Repository URL"}
              value={form.repositoryUrl}
              onChange={(v) => set("repositoryUrl", v)}
              name="repositoryUrl"
              placeholder="Optional — https://github.com/..."
              error={fieldError("repositoryUrl")}
            />
          </div>
          <Toggle
            label={fa ? "پروژه منتخب" : "Featured project"}
            value={!!form.featured}
            onChange={(v) => set("featured", v)}
          />
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-white/15">
            <p className="mb-3 text-sm font-semibold">
              {fa ? "تصاویر پروژه" : "Project images"}
            </p>
            <ImageDropzone
              locale={locale}
              files={files}
              onFiles={(next) => {
                setIsDirty(true);
                setFiles(next);
              }}
              alts={newAlts}
              onAltChange={(file, alt) => {
                setIsDirty(true);
                setNewAlts((current) => ({
                  ...current,
                  [`${file.name}-${file.lastModified}-${file.size}`]: alt,
                }));
              }}
              notify={notify}
            />
            {fieldError("images") && (
              <p role="alert" className="mt-2 text-xs text-red-500">
                {fieldError("images")}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              {fa
                ? "تصاویر جدید هنگام ذخیره بارگذاری می‌شوند."
                : "New images upload when you save the project."}
            </p>
            {(form.images || []).map((image: MediaItem) => {
              const replacement = replacements[image.key];
              return (
                <div
                  key={image.key}
                  className="mt-3 flex flex-col gap-3 rounded-xl bg-slate-50 p-2 dark:bg-white/[0.04] sm:flex-row sm:items-center"
                >
                  {replacement ? (
                    <LocalImagePreview
                      file={replacement}
                      alt={text(image.alt, locale)}
                      className="h-20 w-full rounded-lg object-cover sm:w-28"
                    />
                  ) : (
                    <img
                      src={image.url}
                      alt={text(image.alt, locale)}
                      className="h-20 w-full rounded-lg object-cover sm:w-28"
                    />
                  )}
                  <div className="grid flex-1 gap-1 sm:grid-cols-2">
                    <input
                      aria-label="Persian alt"
                      value={image.alt?.fa || ""}
                      onChange={(e) =>
                        set(
                          "images",
                          form.images.map((x: MediaItem) =>
                            x.key === image.key
                              ? { ...x, alt: { ...x.alt, fa: e.target.value } }
                              : x,
                          ),
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-white/10"
                      placeholder="Alt FA"
                    />
                    <input
                      aria-label="English alt"
                      value={image.alt?.en || ""}
                      onChange={(e) =>
                        set(
                          "images",
                          form.images.map((x: MediaItem) =>
                            x.key === image.key
                              ? { ...x, alt: { ...x.alt, en: e.target.value } }
                              : x,
                          ),
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-white/10"
                      placeholder="Alt EN"
                    />
                  </div>
                  <label className="cursor-pointer rounded-lg border border-slate-200 px-2 py-2 text-center text-xs dark:border-white/10">
                    <span>{fa ? "جایگزینی" : "Replace"}</span>
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) => {
                        const next = e.target.files?.[0];
                        if (!next) return;
                        if (
                          !imageTypes.includes(next.type) ||
                          next.size <= 0 ||
                          next.size > maxImageSize
                        ) {
                          notify(messages[fa ? "fa" : "en"].image, true);
                          e.currentTarget.value = "";
                          return;
                        }
                        setIsDirty(true);
                        setReplacements((current) => ({
                          ...current,
                          [image.key]: next,
                        }));
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeImage(image.key)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-400/10"
                    aria-label={fa ? "حذف تصویر" : "Remove image"}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      );
    if (resource === "technologies")
      return (
        <>
          <LocalizedField
            label={fa ? "نام مهارت" : "Technology name"}
            value={localized(form.name)}
            onChange={(v) => set("name", v)}
            name="name"
            error={fieldError("name")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={fa ? "دسته‌بندی" : "Category"}
              value={form.category}
              onChange={(v) => set("category", v)}
            />
            <Field
              label={fa ? "درصد تسلط" : "Proficiency"}
              type="number"
              value={form.proficiency}
              onChange={(v) => set("proficiency", v)}
              name="proficiency"
              error={fieldError("proficiency")}
            />
          </div>
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-white/15">
            <div className="mb-3">
              <p className="text-sm font-semibold">
                {fa ? "لوگوی مهارت (اختیاری)" : "Technology logo (optional)"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {fa
                  ? "JPEG، PNG، WebP یا AVIF تا ۴ مگابایت. تصویر هنگام ذخیره بارگذاری می‌شود."
                  : "JPEG, PNG, WebP, or AVIF up to 4 MB. The logo uploads when you save."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {technologyLogoFile ? (
                <LocalImagePreview
                  file={technologyLogoFile}
                  alt={text(form.name, locale)}
                  className="h-24 w-24 rounded-xl border border-slate-200 object-contain p-2 dark:border-white/10"
                />
              ) : !technologyLogoRemovalPending && form.iconMedia?.url ? (
                <img
                  src={form.iconMedia.url}
                  alt={text(form.name, locale)}
                  className="h-24 w-24 rounded-xl border border-slate-200 object-contain p-2 dark:border-white/10"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200 text-xs text-slate-400 dark:border-white/10">
                  {fa ? "بدون لوگو" : "No logo"}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-white/10">
                  {form.iconMedia?.url || technologyLogoFile
                    ? fa
                      ? "جایگزینی لوگو"
                      : "Choose or replace logo"
                    : fa
                      ? "انتخاب لوگو"
                      : "Choose logo"}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={busy}
                    onChange={(event) => {
                      const next = event.currentTarget.files?.[0];
                      event.currentTarget.value = "";
                      if (!next) return;
                      if (
                        !imageTypes.includes(next.type) ||
                        next.size <= 0 ||
                        next.size > maxImageSize
                      ) {
                        setTechnologyLogoError(
                          fa
                            ? "فرمت یا حجم تصویر معتبر نیست. حداکثر حجم ۴ مگابایت است."
                            : "Use JPEG, PNG, WebP, or AVIF images up to 4 MB.",
                        );
                        return;
                      }
                      setTechnologyLogoError("");
                      setTechnologyLogoStatus("");
                      setTechnologyLogoFile(next);
                      setTechnologyLogoRemovalPending(false);
                      setIsDirty(true);
                    }}
                  />
                </label>
                {!technologyLogoRemovalPending &&
                  (form.iconMedia?.url || technologyLogoFile) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={removeTechnologyLogo}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 disabled:opacity-50 dark:border-red-400/30"
                  >
                    {fa ? "حذف لوگو" : "Remove logo"}
                  </button>
                )}
                {technologyLogoRemovalPending && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setTechnologyLogoRemovalPending(false);
                      setIsDirty(true);
                    }}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 disabled:opacity-50"
                  >
                    {fa ? "لغو حذف" : "Undo removal"}
                  </button>
                )}
              </div>
            </div>
            {technologyLogoRemovalPending && (
              <p role="status" className="mt-3 text-xs text-slate-500">
                {fa
                  ? "لوگو پس از ذخیره حذف می‌شود."
                  : "The logo will be removed when you save."}
              </p>
            )}
            {technologyLogoBusy && (
              <p role="status" className="mt-3 text-xs text-emerald-600">
                {technologyLogoStatus || (fa ? "در حال پردازش لوگو..." : "Processing logo...")}
              </p>
            )}
            {technologyLogoError && (
              <p role="alert" className="mt-3 text-xs text-red-500">
                {technologyLogoError}
              </p>
            )}
          </div>
        </>
      );
    if (resource === "experiences")
      return (
        <>
          <Field
            label={fa ? "شرکت" : "Company"}
            value={form.company}
            onChange={(v) => set("company", v)}
            name="company"
            error={fieldError("company")}
          />
          <LocalizedField
            label={fa ? "عنوان شغلی" : "Role"}
            value={localized(form.role)}
            onChange={(v) => set("role", v)}
            name="role"
            error={fieldError("role")}
          />
          <LocalizedField
            label={fa ? "توضیحات" : "Description"}
            value={localized(form.description)}
            onChange={(v) => set("description", v)}
            multiline
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={fa ? "شروع" : "Start date"}
              type="date"
              value={String(form.startDate || "").slice(0, 10)}
              onChange={(v) => set("startDate", v)}
              name="startDate"
              error={fieldError("startDate")}
            />
            <Field
              label={fa ? "پایان" : "End date"}
              type="date"
              value={String(form.endDate || "").slice(0, 10)}
              onChange={(v) => set("endDate", v)}
              name="endDate"
              error={fieldError("endDate")}
            />
          </div>
          <Toggle
            label={fa ? "همکاری فعلی" : "Current role"}
            value={!!form.current}
            onChange={(v) => set("current", v)}
          />
        </>
      );
    if (resource === "services")
      return (
        <>
          <LocalizedField
            label={fa ? "عنوان" : "Title"}
            value={localized(form.title)}
            onChange={(v) => set("title", v)}
            name="title"
            error={fieldError("title")}
          />
          <LocalizedField
            label={fa ? "توضیحات" : "Description"}
            value={localized(form.description)}
            onChange={(v) => set("description", v)}
            multiline
            name="description"
            error={fieldError("description")}
          />
          <Field
            label={fa ? "نام آیکون" : "Icon name"}
            value={form.icon}
            onChange={(v) => set("icon", v)}
          />
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-white/15">
            <div className="mb-3">
              <p className="text-sm font-semibold">
                {fa ? "تصویر خدمت (اختیاری)" : "Service image (optional)"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {fa
                  ? "JPEG، PNG، WebP یا AVIF تا ۴ مگابایت. تصویر هنگام ذخیره بارگذاری می‌شود."
                  : "JPEG, PNG, WebP, or AVIF up to 4 MB. The image uploads when you save."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {serviceImageFile ? (
                <LocalImagePreview
                  file={serviceImageFile}
                  alt={text(form.title, locale)}
                  className="h-24 w-24 rounded-xl border border-slate-200 object-contain p-2 dark:border-white/10"
                />
              ) : !serviceImageRemovalPending && form.image?.url ? (
                <img
                  src={form.image.url}
                  alt={text(form.title, locale)}
                  className="h-24 w-24 rounded-xl border border-slate-200 object-contain p-2 dark:border-white/10"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200 text-xs text-slate-400 dark:border-white/10">
                  {fa ? "بدون تصویر" : "No image"}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-white/10">
                  {form.image?.url || serviceImageFile
                    ? fa
                      ? "جایگزینی تصویر"
                      : "Choose or replace image"
                    : fa
                      ? "انتخاب تصویر"
                      : "Choose image"}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={busy}
                    onChange={(event) => {
                      const next = event.currentTarget.files?.[0];
                      event.currentTarget.value = "";
                      if (!next) return;
                      if (
                        !imageTypes.includes(next.type) ||
                        next.size <= 0 ||
                        next.size > maxImageSize
                      ) {
                        setServiceImageError(
                          fa
                            ? "فرمت یا حجم تصویر معتبر نیست. حداکثر حجم ۴ مگابایت است."
                            : "Use JPEG, PNG, WebP, or AVIF images up to 4 MB.",
                        );
                        return;
                      }
                      setServiceImageError("");
                      setServiceImageStatus("");
                      setServiceImageFile(next);
                      setServiceImageRemovalPending(false);
                      setIsDirty(true);
                    }}
                  />
                </label>
                {!serviceImageRemovalPending &&
                  (form.image?.url || serviceImageFile) && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={removeServiceImage}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 disabled:opacity-50 dark:border-red-400/30"
                    >
                      {fa ? "حذف تصویر" : "Remove image"}
                    </button>
                  )}
                {serviceImageRemovalPending && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setServiceImageRemovalPending(false);
                      setIsDirty(true);
                    }}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 disabled:opacity-50"
                  >
                    {fa ? "لغو حذف" : "Undo removal"}
                  </button>
                )}
              </div>
            </div>
            {serviceImageRemovalPending && (
              <p role="status" className="mt-3 text-xs text-slate-500">
                {fa
                  ? "تصویر پس از ذخیره حذف می‌شود."
                  : "The image will be removed when you save."}
              </p>
            )}
            {serviceImageBusy && (
              <p role="status" className="mt-3 text-xs text-emerald-600">
                {serviceImageStatus || (fa ? "در حال پردازش تصویر..." : "Processing image...")}
              </p>
            )}
            {serviceImageError && (
              <p role="alert" className="mt-3 text-xs text-red-500">
                {serviceImageError}
              </p>
            )}
          </div>
        </>
      );
    if (resource === "languages")
      return (
        <>
          <LocalizedField
            label={fa ? "نام زبان" : "Language"}
            value={localized(form.name)}
            onChange={(v) => set("name", v)}
            name="name"
            error={fieldError("name")}
          />
          <LocalizedField
            label={fa ? "سطح" : "Level"}
            value={localized(form.level)}
            onChange={(v) => set("level", v)}
            name="level"
            error={fieldError("level")}
          />
        </>
      );
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={fa ? "نوع" : "Type"}
            value={form.type}
            onChange={(v) => set("type", v)}
            name="type"
            error={fieldError("type")}
          />
          <Field
            label={fa ? "مقدار" : "Value"}
            value={form.value}
            onChange={(v) => set("value", v)}
            name="value"
            error={fieldError("value")}
          />
          <Field
            label={fa ? "لینک" : "URL"}
            value={form.url}
            onChange={(v) => set("url", v)}
            name="url"
            placeholder={
              fa ? "اختیاری — https://..." : "Optional — https://..."
            }
            error={fieldError("url")}
          />
          <Field
            label={fa ? "آیکون" : "Icon"}
            value={form.icon}
            onChange={(v) => set("icon", v)}
          />
        </div>
        <LocalizedField
          label={fa ? "برچسب (اختیاری)" : "Label (optional)"}
          value={localized(form.label)}
          onChange={(v) => set("label", v)}
          name="label"
          error={fieldError("label")}
        />
      </>
    );
  }
  async function removeImage(key: string) {
    setConfirmation({ type: "image", key });
  }
  async function confirmImageRemoval(key: string) {
    const currentProjectId = projectId || initial._id;
    if (!currentProjectId || busy) return;
    setBusy(true);
    try {
      const result = await api(
        `/api/admin/projects/${currentProjectId}/images/${encodeURIComponent(key)}`,
        { method: "DELETE" },
      );
      set("images", result.data);
      setConfirmation(null);
      notify(fa ? "تصویر حذف شد" : "Image deleted");
    } catch (e) {
      notify(localizedError(e, locale), true);
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitInProgress.current || busy) return;
    const next: Record<string, string> = {};
    const requiredLocalized = (key: string) => {
      const value = localized(form[key]);
      if (!value.fa.trim() || !value.en.trim())
        next[key] = messages[fa ? "fa" : "en"].localized;
    };
    const optionalLocalized = (key: string) => {
      const value = localized(form[key]);
      if (
        (value.fa.trim() || value.en.trim()) &&
        (!value.fa.trim() || !value.en.trim())
      )
        next[key] = messages[fa ? "fa" : "en"].localized;
    };
    if (resource === "projects") {
      requiredLocalized("title");
      optionalLocalized("shortDescription");
      optionalLocalized("description");
      if (!String(form.slug || "").trim())
        next.slug = messages[fa ? "fa" : "en"].required;
      else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(form.slug).trim()))
        next.slug = fa
          ? "اسلاگ باید با حروف کوچک، عدد و خط تیره باشد."
          : "Use lowercase letters, numbers, and hyphens for the slug.";
      if (String(form.liveUrl || "").trim() && !isHttpUrl(String(form.liveUrl)))
        next.liveUrl = messages[fa ? "fa" : "en"].url;
      if (
        String(form.repositoryUrl || "").trim() &&
        !isHttpUrl(String(form.repositoryUrl))
      )
        next.repositoryUrl = messages[fa ? "fa" : "en"].url;
    }
    if (resource === "technologies" || resource === "languages")
      requiredLocalized("name");
    if (resource === "languages") requiredLocalized("level");
    if (resource === "services") {
      requiredLocalized("title");
      requiredLocalized("description");
    }
    if (resource === "experiences") {
      if (!String(form.company || "").trim())
        next.company = messages[fa ? "fa" : "en"].required;
      requiredLocalized("role");
      optionalLocalized("description");
      if (
        !String(form.startDate || "").trim() ||
        Number.isNaN(Date.parse(String(form.startDate)))
      )
        next.startDate = fa
          ? "تاریخ شروع معتبر وارد کنید."
          : "Enter a valid start date.";
      if (form.current && form.endDate)
        next.endDate = fa
          ? "برای شغل فعلی تاریخ پایان وارد نکنید."
          : "Leave end date empty for a current role.";
    }
    if (resource === "contact-methods") {
      if (!String(form.type || "").trim())
        next.type = messages[fa ? "fa" : "en"].required;
      if (!String(form.value || "").trim())
        next.value = messages[fa ? "fa" : "en"].required;
      optionalLocalized("label");
      if (String(form.url || "").trim() && !isHttpUrl(String(form.url)))
        next.url = messages[fa ? "fa" : "en"].url;
      if (
        String(form.type).trim().toLowerCase() === "email" &&
        String(form.value).trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(form.value).trim())
      )
        next.value = messages[fa ? "fa" : "en"].email;
    }
    if (
      resource === "technologies" &&
      form.proficiency !== undefined &&
      form.proficiency !== "" &&
      (Number(form.proficiency) < 0 ||
        Number(form.proficiency) > 100 ||
        !Number.isFinite(Number(form.proficiency)))
    )
      next.proficiency = fa
        ? "درصد باید بین صفر و صد باشد."
        : "Enter a number from 0 to 100.";
    if (
      form.order !== undefined &&
      form.order !== "" &&
      (Number(form.order) < 0 || !Number.isFinite(Number(form.order)))
    )
      next.order = fa ? "عدد معتبر وارد کنید." : "Enter a valid number.";
    if (resource === "projects")
      for (const image of form.images || [])
        if (!image.alt?.fa?.trim() || !image.alt?.en?.trim())
          next.images = messages[fa ? "fa" : "en"].localized;
    if (Object.keys(next).length) {
      setErrors(next);
      notify(messages[fa ? "fa" : "en"].validation, true);
      return;
    }
    setErrors({});
    submitInProgress.current = true;
    setBusy(true);
    let technologyLogoAction = false;
    let serviceImageAction = false;
    try {
      const resourceId =
        resource === "projects"
          ? projectId
          : resource === "technologies"
          ? technologyId
          : resource === "services"
            ? serviceId
            : initial._id;
      const result = await api(
        `/api/admin/${resource}${resourceId ? `/${resourceId}` : ""}`,
        {
          method: resourceId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      let saved = result.data;
      if (resource === "projects" && saved._id) {
        setProjectId(saved._id);
        setForm(saved);
      } else if (resource === "technologies") {
        setTechnologyId(saved._id);
        setForm(saved);
      } else if (resource === "services") {
        setServiceId(saved._id);
        setForm(saved);
      }
      if (resource === "projects" && saved._id) {
        const before = (initial.images || []) as Item[];
        for (const image of form.images || []) {
          const old = before.find((item) => item.key === image.key);
          if (
            old &&
            JSON.stringify(old.alt || {}) !== JSON.stringify(image.alt || {})
          ) {
            await api(
              `/api/admin/projects/${saved._id}/images/${encodeURIComponent(image.key)}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ alt: image.alt || emptyLocalized() }),
              },
            );
            saved = {
              ...saved,
              images: (saved.images || []).map((savedImage: MediaItem) =>
                savedImage.key === image.key ? { ...savedImage, alt: image.alt } : savedImage,
              ),
            };
            setForm(saved);
          }
        }
        for (const [key, file] of Object.entries(replacements)) {
          const data = new FormData();
          data.append("file", file);
          data.append(
            "alt",
            JSON.stringify(
              form.images.find((image: MediaItem) => image.key === key)?.alt ||
                emptyLocalized(),
            ),
          );
          const upload = await api(
            `/api/admin/projects/${saved._id}/images/${encodeURIComponent(key)}`,
            { method: "PUT", body: data },
          );
          saved = {
            ...saved,
            images: (saved.images || []).map((image: MediaItem) =>
              image.key === key ? upload.data : image,
            ),
          };
          setForm(saved);
          setReplacements((current) => {
            const next = { ...current };
            delete next[key];
            return next;
          });
        }
        for (const file of files) {
          const data = new FormData();
          data.append("file", file);
          const key = `${file.name}-${file.lastModified}-${file.size}`;
          data.append("alt", JSON.stringify(newAlts[key] || emptyLocalized()));
          const upload = await api(`/api/admin/projects/${saved._id}/images`, {
            method: "POST",
            body: data,
          });
          saved = { ...saved, images: [...(saved.images || []), upload.data] };
          setForm(saved);
          setFiles((current) => current.filter((pending) => pending !== file));
          setNewAlts((current) => {
            const next = { ...current };
            delete next[key];
            return next;
          });
        }
      }
      if (resource === "technologies" && saved._id) {
        if (technologyLogoFile) {
          technologyLogoAction = true;
          setTechnologyLogoBusy(true);
          setTechnologyLogoStatus(
            fa ? "در حال بارگذاری لوگو..." : "Uploading logo...",
          );
          const data = new FormData();
          data.append("file", technologyLogoFile);
          const upload = await api(
            `/api/admin/technologies/${encodeURIComponent(saved._id)}/icon-media`,
            {
              method: saved.iconMedia?.url ? "PUT" : "POST",
              body: data,
            },
          );
          saved = { ...saved, iconMedia: upload.data };
          setForm(saved);
          setTechnologyLogoFile(null);
          setTechnologyLogoRemovalPending(false);
          setTechnologyLogoError("");
          setTechnologyLogoStatus("");
        } else if (technologyLogoRemovalPending && saved.iconMedia?.url) {
          technologyLogoAction = true;
          setTechnologyLogoBusy(true);
          setTechnologyLogoStatus(
            fa ? "در حال حذف لوگو..." : "Removing logo...",
          );
          await api(
            `/api/admin/technologies/${encodeURIComponent(saved._id)}/icon-media`,
            { method: "DELETE" },
          );
          saved = { ...saved, iconMedia: null };
          setForm(saved);
          setTechnologyLogoRemovalPending(false);
          setTechnologyLogoError("");
          setTechnologyLogoStatus("");
        }
      }
      if (resource === "services" && saved._id) {
        if (serviceImageFile) {
          serviceImageAction = true;
          setServiceImageBusy(true);
          setServiceImageStatus(
            fa ? "در حال بارگذاری تصویر..." : "Uploading image...",
          );
          const data = new FormData();
          data.append("file", serviceImageFile);
          const upload = await api(
            `/api/admin/services/${encodeURIComponent(saved._id)}/image`,
            {
              method: saved.image?.url ? "PUT" : "POST",
              body: data,
            },
          );
          saved = { ...saved, image: upload.data };
          setForm(saved);
          setServiceImageFile(null);
          setServiceImageRemovalPending(false);
          setServiceImageError("");
          setServiceImageStatus("");
        } else if (serviceImageRemovalPending && saved.image?.url) {
          serviceImageAction = true;
          setServiceImageBusy(true);
          setServiceImageStatus(
            fa ? "در حال حذف تصویر..." : "Removing image...",
          );
          await api(
            `/api/admin/services/${encodeURIComponent(saved._id)}/image`,
            { method: "DELETE" },
          );
          saved = { ...saved, image: null };
          setForm(saved);
          setServiceImageRemovalPending(false);
          setServiceImageError("");
          setServiceImageStatus("");
        }
      }
      onSaved(saved);
      notify(messages[fa ? "fa" : "en"].saved);
      if (resource === "projects") setProjectId(undefined);
      onClose();
    } catch (e) {
      setErrors(localizedServerErrors(e, locale));
      if (resource === "technologies" && technologyLogoAction)
        setTechnologyLogoError(localizedError(e, locale, true));
      if (resource === "services" && serviceImageAction)
        setServiceImageError(localizedError(e, locale, true));
      notify(localizedError(e, locale), true);
    } finally {
      setTechnologyLogoBusy(false);
      setTechnologyLogoStatus("");
      setServiceImageBusy(false);
      setServiceImageStatus("");
      setBusy(false);
      submitInProgress.current = false;
    }
  }
  return (
    <>
      <Modal
        title={`${title} ${labels[resource][fa ? "fa" : "en"]}`}
        onClose={requestClose}
        closeLabel={fa ? "بستن فرم" : "Close form"}
        wide
      >
        <form onSubmit={submit} className="space-y-5">
          {fields()}
          {common}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
            <button
              type="button"
              onClick={requestClose}
              disabled={busy}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              {fa ? "انصراف" : "Cancel"}
            </button>
            <button
              disabled={busy}
              className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-bold text-slate-950 disabled:opacity-50"
            >
              {busy
                ? fa
                  ? "در حال ذخیره..."
                  : "Saving..."
                : fa
                  ? "ذخیره تغییرات"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>
      {confirmation && (
        <ConfirmDialog
          title={
            confirmation.type === "discard"
              ? fa
                ? "خروج از فرم"
                : "Discard changes"
              : fa
                ? "حذف تصویر"
                : "Delete image"
          }
          message={
            confirmation.type === "discard"
              ? fa
                ? "تغییرات ذخیره‌نشده از بین می‌روند. ادامه می‌دهید؟"
                : "Your unsaved changes will be lost. Continue?"
              : fa
                ? "آیا از حذف این تصویر مطمئن هستید؟"
                : "Are you sure you want to delete this image?"
          }
          cancelLabel={fa ? "انصراف" : "Cancel"}
          confirmLabel={
            confirmation.type === "discard"
              ? fa
                ? "خروج"
                : "Discard"
              : fa
                ? "تأیید حذف"
                : "Confirm delete"
          }
          busy={busy}
          onCancel={() => setConfirmation(null)}
          onConfirm={() =>
            confirmation.type === "discard"
              ? onClose()
              : confirmImageRemoval(confirmation.key)
          }
        />
      )}
    </>
  );
}

function ResourceView({
  resource,
  locale,
  notify,
}: {
  resource: ResourceKey;
  locale: string;
  notify: (message: string, error?: boolean) => void;
}) {
  const fa = locale === "fa";
  const [items, setItems] = useState<Item[]>([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const result = await api(
          `/api/admin/${resource}?page=${page}&limit=10${search ? `&search=${encodeURIComponent(search)}` : ""}`,
        );
        setItems(result.data);
        setMeta(result.meta);
      } catch (e) {
        notify(localizedError(e, locale), true);
      } finally {
        setLoading(false);
      }
    },
    [resource, search, locale, notify],
  );

  useEffect(() => {
    void load();
  }, [load]);
  const title = labels[resource][fa ? "fa" : "en"];
  async function remove(item: Item) {
    setDeleteTarget(item);
  }
  async function confirmRemoval() {
    if (!deleteTarget?._id || deleting) return;
    setDeleting(true);
    try {
      await api(`/api/admin/${resource}/${deleteTarget._id}`, {
        method: "DELETE",
      });
      setItems((current) => current.filter((x) => x._id !== deleteTarget._id));
      notify(fa ? "حذف شد" : "Deleted");
    } catch (e) {
      notify(localizedError(e, locale), true);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }
  const display = (item: Item) =>
    text(
      item.title ||
        item.name ||
        item.role ||
        item.label ||
        item.company ||
        item.type,
      locale,
    );
  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-500">
            {fa ? "مدیریت محتوا" : "Content management"}
          </p>
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {meta.total} {fa ? "رکورد" : "records"}
          </p>
        </div>
        <button
          onClick={() => setEditor(defaultFor(resource))}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          <Plus size={17} />
          {fa ? "افزودن مورد" : "Add item"}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="absolute start-3 top-3.5 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder={
              fa ? "جستجو و فشردن Enter..." : "Search and press Enter..."
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white ps-10 pe-3 text-sm outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/[0.04]"
          />
        </div>
        <button
          onClick={() => load()}
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold dark:border-white/10"
        >
          {fa ? "فیلتر" : "Refresh"}
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        <div className="hidden grid-cols-[1fr_150px_100px_100px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-white/10 md:grid">
          <span>{fa ? "عنوان" : "Name"}</span>
          <span>{fa ? "آخرین تغییر" : "Updated"}</span>
          <span>{fa ? "وضعیت" : "Status"}</span>
          <span />
        </div>
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.06]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            {fa ? "موردی پیدا نشد" : "No records found"}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-white/[0.06] md:grid-cols-[1fr_150px_100px_100px] md:items-center"
            >
              <div>
                <p className="font-semibold">{display(item) || "—"}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {item.slug ||
                    item.category ||
                    item.value ||
                    item.company ||
                    ""}
                </p>

                {item.images?.[0]?.url && (
                  <img
                    src={item.images[0].url}
                    alt={
                      item.images[0].alt?.[locale as "fa" | "en"] || "Project"
                    }
                    className="h-24 w-24 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
              <span className="text-xs text-slate-400">
                {item.updatedAt
                  ? new Date(item.updatedAt).toLocaleDateString(locale)
                  : "—"}
              </span>

              <span
                className={`w-fit rounded-full px-2 py-1 text-[11px] font-bold ${item.isVisible === false ? "bg-slate-100 text-slate-500 dark:bg-white/10" : "bg-emerald-400/10 text-emerald-600"}`}
              >
                {item.isVisible === false
                  ? fa
                    ? "مخفی"
                    : "Hidden"
                  : fa
                    ? "نمایش"
                    : "Visible"}
              </span>
              <div className="flex gap-1 md:justify-end">
                <button
                  onClick={() => setEditor(item)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-emerald-400/10 hover:text-emerald-500"
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(item)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-400/10 hover:text-red-500"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {meta.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            {meta.page} / {meta.pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => load(meta.page - 1)}
              className="rounded-lg border p-2 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={meta.page >= meta.pages}
              onClick={() => load(meta.page + 1)}
              className="rounded-lg border p-2 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      {editor && (
        <ResourceEditor
          resource={resource}
          initial={editor}
          locale={locale}
          onClose={() => setEditor(null)}
          onSaved={(saved) =>
            setItems((current) =>
              editor._id
                ? current.map((x) => (x._id === saved._id ? saved : x))
                : [saved, ...current],
            )
          }
          notify={notify}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title={fa ? "حذف مورد" : "Delete item"}
          message={
            fa
              ? "آیا از حذف این مورد مطمئن هستید؟"
              : "Are you sure you want to delete this item?"
          }
          cancelLabel={fa ? "انصراف" : "Cancel"}
          confirmLabel={fa ? "تأیید حذف" : "Confirm delete"}
          busy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmRemoval}
        />
      )}
    </section>
  );
}

type SiteSettingsMediaField =
  | "logo"
  | "openGraphImage"
  | "favicon"
  | "fallbackImage";

const siteSettingsMediaFields: {
  key: SiteSettingsMediaField;
  en: string;
  fa: string;
}[] = [
  { key: "logo", en: "Logo", fa: "لوگو" },
  { key: "openGraphImage", en: "Open Graph image", fa: "تصویر شبکه‌های اجتماعی" },
  { key: "favicon", en: "Favicon", fa: "فاوآیکون" },
  { key: "fallbackImage", en: "Fallback image", fa: "تصویر جایگزین" },
];

function SiteSettingsView({
  locale,
  notify,
}: {
  locale: string;
  notify: (message: string, error?: boolean) => void;
}) {
  const fa = locale === "fa";
  const [settings, setSettings] = useState<Item>({});
  const [draft, setDraft] = useState({ title: emptyLocalized(), description: emptyLocalized() });
  const [changed, setChanged] = useState<Record<string, Set<"fa" | "en">>>({});
  const [files, setFiles] = useState<Partial<Record<SiteSettingsMediaField, File>>>({});
  const [removePending, setRemovePending] = useState<Partial<Record<SiteSettingsMediaField, boolean>>>({});
  const [mediaErrors, setMediaErrors] = useState<Partial<Record<SiteSettingsMediaField, string>>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mediaBusy, setMediaBusy] = useState<SiteSettingsMediaField | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    void api("/api/admin/site-settings")
      .then((result) => {
        if (!active) return;
        const data = result.data || {};
        setSettings(data);
        setDraft({ title: localized(data.title), description: localized(data.description) });
      })
      .catch((error) => notify(localizedError(error, locale), true))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locale, notify]);

  const updateLocalized = (field: "title" | "description", next: Localized) => {
    setDraft((current) => ({ ...current, [field]: next }));
    setChanged((current) => {
      const locales = new Set(current[field] || []);
      if (next.fa !== draft[field].fa) locales.add("fa");
      if (next.en !== draft[field].en) locales.add("en");
      return { ...current, [field]: locales };
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    const nextErrors: Record<string, string> = {};
    const patch: Record<string, unknown> = {};
    for (const field of ["title", "description"] as const) {
      const locales = changed[field];
      if (!locales?.size) continue;
      const value: Partial<Localized> = {};
      for (const language of locales) {
        if (!draft[field][language].trim())
          nextErrors[field] = fa ? "مقدار واردشده نمی‌تواند خالی باشد." : "Changed values cannot be empty.";
        else value[language] = draft[field][language];
      }
      patch[field] = value;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      notify(fa ? "لطفاً خطاهای فرم را برطرف کنید." : "Please correct the form errors.", true);
      return;
    }

    setSaving(true);
    let currentMedia: SiteSettingsMediaField | null = null;
    try {
      if (Object.keys(patch).length) {
        const result = await api("/api/admin/site-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const next = result.data || {};
        setSettings(next);
        setDraft({ title: localized(next.title), description: localized(next.description) });
        setChanged({});
      }

      for (const { key } of siteSettingsMediaFields) {
        const selected = files[key];
        const shouldRemove = removePending[key] && Boolean(settings[key]);
        if (!selected && !shouldRemove) continue;
        currentMedia = key;
        setMediaBusy(key);
        setMediaErrors((current) => ({ ...current, [key]: "" }));
        if (selected) {
          const form = new FormData();
          form.append("file", selected);
          const result = await api(`/api/admin/site-settings/${key}`, {
            method: settings[key] ? "PUT" : "POST",
            body: form,
          });
          setSettings((current) => ({ ...current, [key]: result.data }));
          setFiles((current) => ({ ...current, [key]: undefined }));
          setRemovePending((current) => ({ ...current, [key]: false }));
        } else if (shouldRemove) {
          const result = await api(`/api/admin/site-settings/${key}`, { method: "DELETE" });
          setSettings(result.data || {});
          setRemovePending((current) => ({ ...current, [key]: false }));
        }
      }
      notify(messages[fa ? "fa" : "en"].saved);
    } catch (error) {
      const message = localizedError(error, locale, true);
      if (currentMedia) setMediaErrors((current) => ({ ...current, [currentMedia!]: message }));
      else setErrors(localizedServerErrors(error, locale));
      notify(localizedError(error, locale), true);
    } finally {
      setMediaBusy(null);
      setSaving(false);
    }
  }

  if (loading)
    return <div className="h-72 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />;

  return (
    <form onSubmit={save} className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#101820] sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-black">{fa ? "تنظیمات وب‌سایت" : "Website settings"}</h2>
          <p className="mt-1 text-sm text-slate-500">{fa ? "عنوان و توضیحات سایت را به هر دو زبان مدیریت کنید." : "Manage the website title and description in both languages."}</p>
        </div>
        <div className="space-y-5">
          <LocalizedField label={fa ? "عنوان سایت" : "Site title"} name="site-title" value={draft.title} onChange={(value) => updateLocalized("title", value)} error={errors.title} />
          <LocalizedField label={fa ? "توضیحات سایت" : "Site description"} name="site-description" value={draft.description} onChange={(value) => updateLocalized("description", value)} multiline error={errors.description} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#101820] sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-black">{fa ? "رسانه‌های سایت" : "Site media"}</h2>
          <p className="mt-1 text-sm text-slate-500">{fa ? "تصاویر در ImageKit ذخیره و از همین بخش مدیریت می‌شوند." : "Images are stored in ImageKit and managed here."}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {siteSettingsMediaFields.map(({ key, en, fa: faLabel }) => {
            const mediaItem = settings[key] as MediaItem | null | undefined;
            const selected = files[key];
            const removing = Boolean(removePending[key]);
            return (
              <div key={key} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">{fa ? faLabel : en}</h3>
                  {mediaBusy === key && <span role="status" className="text-xs text-emerald-600">{fa ? "در حال ذخیره…" : "Saving…"}</span>}
                </div>
                <div className="mb-4 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-white/[0.04]">
                  {selected ? (
                    <LocalImagePreview file={selected} alt={fa ? faLabel : en} className="max-h-full max-w-full object-contain" />
                  ) : !removing && mediaItem?.url ? (
                    <img src={mediaItem.url} alt={text(mediaItem.alt, locale) || (fa ? faLabel : en)} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400">{fa ? "تصویری انتخاب نشده" : "No image selected"}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-white/10">
                    {mediaItem?.url || selected ? (fa ? "جایگزینی تصویر" : "Choose or replace") : (fa ? "انتخاب تصویر" : "Choose image")}
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={saving}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        if (!file) return;
                        if (!imageTypes.includes(file.type) || file.size <= 0 || file.size > maxImageSize) {
                          setMediaErrors((current) => ({ ...current, [key]: fa ? "فرمت یا حجم تصویر معتبر نیست. حداکثر حجم ۴ مگابایت است." : "Use JPEG, PNG, WebP, or AVIF images up to 4 MB." }));
                          return;
                        }
                        setMediaErrors((current) => ({ ...current, [key]: "" }));
                        setFiles((current) => ({ ...current, [key]: file }));
                        setRemovePending((current) => ({ ...current, [key]: false }));
                      }}
                    />
                  </label>
                  {(mediaItem?.url || selected) && !removing && (
                    <button type="button" disabled={saving} onClick={() => {
                      setFiles((current) => ({ ...current, [key]: undefined }));
                      if (mediaItem?.url) setRemovePending((current) => ({ ...current, [key]: true }));
                    }} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 disabled:opacity-50 dark:border-red-400/30">
                      {fa ? "حذف تصویر" : "Remove image"}
                    </button>
                  )}
                  {removing && (
                    <button type="button" disabled={saving} onClick={() => setRemovePending((current) => ({ ...current, [key]: false }))} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 disabled:opacity-50">
                      {fa ? "لغو حذف" : "Undo removal"}
                    </button>
                  )}
                </div>
                {removing && <p role="status" className="mt-3 text-xs text-slate-500">{fa ? "تصویر پس از ذخیره حذف می‌شود." : "The image will be removed when you save."}</p>}
                {mediaErrors[key] && <p role="alert" className="mt-3 text-xs text-red-500">{mediaErrors[key]}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60">
          {saving ? (fa ? "در حال ذخیره…" : "Saving…") : (fa ? "ذخیره تنظیمات" : "Save settings")}
        </button>
      </div>
    </form>
  );
}

function SingletonView({
  type,
  locale,
  notify,
  onHeroImageUpdated,
}: {
  type: "hero" | "profile" | "resume";
  locale: string;
  notify: (message: string, error?: boolean) => void;
  onHeroImageUpdated?: () => void;
}) {
  const fa = locale === "fa";
  const [data, setData] = useState<Item>({});
  const [busy, setBusy] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [mediaConfirmation, setMediaConfirmation] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState(false);
  const load = useCallback(async () => {
    try {
      const result = await api(`/api/admin/${type}`);
      setData(result.data || {});
    } catch (e) {
      notify(localizedError(e, locale), true);
    } finally {
      setBusy(false);
    }
  }, [type, locale, notify]);
  useEffect(() => {
    void load();
  }, [load]);
  const set = (key: string, value: unknown) => {
    setData((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };
  async function save(e: FormEvent) {
    e.preventDefault();
    const lang = messages[fa ? "fa" : "en"];
    const invalidLocalized = (value: unknown) => {
      const localizedValue = localized(value);
      return !localizedValue.fa.trim() || !localizedValue.en.trim();
    };
    const invalidOptionalLocalized = (value: unknown) => {
      const localizedValue = localized(value);
      return (
        Boolean(localizedValue.fa.trim() || localizedValue.en.trim()) &&
        invalidLocalized(value)
      );
    };
    const invalid =
      (type === "hero" &&
        (invalidLocalized(data.jobTitle) ||
          invalidLocalized(data.headline) ||
          invalidOptionalLocalized(data.description) ||
          invalidOptionalLocalized(data.primaryCta))) ||
      (type === "profile" &&
        (invalidLocalized(data.name) ||
          invalidLocalized(data.bio) ||
          invalidOptionalLocalized(data.location) ||
          invalidOptionalLocalized(data.availability))) ||
      (type === "resume" && data.title && invalidLocalized(data.title)) ||
      (type === "profile" &&
        data.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email).trim())) ||
      (type === "hero" &&
        String(data.primaryCtaUrl || "").trim() &&
        !isHttpUrl(String(data.primaryCtaUrl)));
    if (invalid) {
      const next: Record<string, string> = {};
      if (type === "hero") {
        if (invalidLocalized(data.jobTitle)) next.jobTitle = lang.localized;
        if (invalidLocalized(data.headline)) next.headline = lang.localized;
        if (invalidOptionalLocalized(data.description))
          next.description = lang.localized;
        if (invalidOptionalLocalized(data.primaryCta))
          next.primaryCta = lang.localized;
        if (
          String(data.primaryCtaUrl || "").trim() &&
          !isHttpUrl(String(data.primaryCtaUrl))
        )
          next.primaryCtaUrl = lang.url;
      }
      if (type === "profile") {
        if (invalidLocalized(data.name)) next.name = lang.localized;
        if (invalidLocalized(data.bio)) next.bio = lang.localized;
        if (invalidOptionalLocalized(data.location))
          next.location = lang.localized;
        if (invalidOptionalLocalized(data.availability))
          next.availability = lang.localized;
        if (
          data.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email).trim())
        )
          next.email = lang.email;
      }
      if (type === "resume" && data.title && invalidLocalized(data.title))
        next.title = lang.localized;
      setFormErrors(next);
      notify(lang.validation, true);
      return;
    }
    setFormErrors({});
    setBusy(true);
    try {
      const result = await api(`/api/admin/${type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setData(result.data);
      notify(messages[fa ? "fa" : "en"].saved);
    } catch (e) {
      setFormErrors(localizedServerErrors(e, locale));
      notify(localizedError(e, locale), true);
    } finally {
      setBusy(false);
    }
  }
  async function upload() {
    if (!file) return;
    const allowed =
      type === "resume"
        ? file.type === "application/pdf"
        : imageTypes.includes(file.type);
    if (!allowed || file.size <= 0 || file.size > maxImageSize) {
      notify(
        type === "resume"
          ? messages[fa ? "fa" : "en"].pdf
          : messages[fa ? "fa" : "en"].image,
        true,
      );
      return;
    }
    const form = new FormData();
    form.append("file", file);
    if (type === "resume")
      form.append("title", JSON.stringify(data.title || emptyLocalized()));
    try {
      const result = await api(
        `/api/admin/${type}/${type === "resume" ? "file" : "image"}`,
        { method: "POST", body: form },
      );
      if (type === "resume") setData(result.data);
      else
        set(
          type === "hero" || type === "profile" ? "image" : "file",
          result.data,
        );
      if (type === "hero") onHeroImageUpdated?.();
      setFile(null);
      notify(messages[fa ? "fa" : "en"].uploaded);
    } catch (e) {
      notify(localizedError(e, locale), true);
    }
  }
  async function removeMediaFile() {
    if (!image?.key) return;
    setMediaConfirmation(true);
  }
  async function confirmMediaRemoval() {
    if (!image?.key || deletingMedia) return;
    setDeletingMedia(true);
    try {
      await api(`/api/admin/${type}/${type === "resume" ? "file" : "image"}`, {
        method: "DELETE",
      });
      setData((current) => ({
        ...current,
        [type === "resume" ? "file" : "image"]: null,
      }));
      if (type === "hero") onHeroImageUpdated?.();
      notify(fa ? "فایل حذف شد" : "File deleted");
    } catch (e) {
      notify(localizedError(e, locale), true);
    } finally {
      setDeletingMedia(false);
      setMediaConfirmation(false);
    }
  }
  if (busy && !Object.keys(data).length)
    return (
      <div className="h-80 animate-pulse rounded-3xl bg-slate-100 dark:bg-white/[0.04]" />
    );
  const image = data.image || data.file;
  return (
    <section className="max-w-4xl space-y-5">
      <div>
        <p className="mb-2 text-sm font-semibold text-emerald-500">
          {fa ? "محتوای اصلی" : "Core content"}
        </p>
        <h1 className="text-3xl font-black">
          {labels[type][fa ? "fa" : "en"]}
        </h1>
      </div>
      <form
        onSubmit={save}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-7"
      >
        {type === "hero" && (
          <>
            <LocalizedField
              label={fa ? "عنوان شغلی" : "Job title"}
              value={localized(data.jobTitle)}
              onChange={(v) => set("jobTitle", v)}
              name="jobTitle"
              error={formErrors.jobTitle}
            />
            <LocalizedField
              label={fa ? "تیتر اصلی" : "Headline"}
              value={localized(data.headline)}
              onChange={(v) => set("headline", v)}
              name="headline"
              error={formErrors.headline}
            />
            <LocalizedField
              label={fa ? "توضیحات" : "Description"}
              value={localized(data.description)}
              onChange={(v) => set("description", v)}
              multiline
              name="description"
              error={formErrors.description}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <LocalizedField
                label={fa ? "متن CTA" : "CTA label"}
                value={localized(data.primaryCta)}
                onChange={(v) => set("primaryCta", v)}
                name="primaryCta"
                error={formErrors.primaryCta}
              />
              <Field
                label={fa ? "لینک CTA" : "CTA URL"}
                value={data.primaryCtaUrl}
                onChange={(v) => set("primaryCtaUrl", v)}
                name="primaryCtaUrl"
                placeholder={
                  fa
                    ? "اختیاری — در صورت نبود رزومه"
                    : "Optional — used only when no resume is uploaded"
                }
                error={formErrors.primaryCtaUrl}
              />
            </div>
            <Toggle
              label={fa ? "نمایش بخش" : "Visible"}
              value={data.isVisible !== false}
              onChange={(v) => set("isVisible", v)}
            />
          </>
        )}
        {type === "profile" && (
          <>
            <LocalizedField
              label={fa ? "نام" : "Name"}
              value={localized(data.name)}
              onChange={(v) => set("name", v)}
              name="name"
              error={formErrors.name}
            />
            <LocalizedField
              label={fa ? "بیوگرافی" : "Bio"}
              value={localized(data.bio)}
              onChange={(v) => set("bio", v)}
              multiline
              name="bio"
              error={formErrors.bio}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <LocalizedField
                label={fa ? "موقعیت" : "Location"}
                value={localized(data.location)}
                onChange={(v) => set("location", v)}
                name="location"
                error={formErrors.location}
              />
              <LocalizedField
                label={fa ? "وضعیت همکاری" : "Availability"}
                value={localized(data.availability)}
                onChange={(v) => set("availability", v)}
                name="availability"
                error={formErrors.availability}
              />
              <Field
                label="Email"
                value={data.email}
                onChange={(v) => set("email", v)}
                name="email"
                error={formErrors.email}
              />
            </div>
          </>
        )}
        {type === "resume" && (
          <>
            <LocalizedField
              label={fa ? "عنوان رزومه" : "Resume title"}
              value={localized(data.title)}
              onChange={(v) => set("title", v)}
              name="title"
              error={formErrors.title}
            />
          </>
        )}
        <button
          disabled={busy}
          className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50"
        >
          {fa ? "ذخیره محتوا" : "Save content"}
        </button>
      </form>
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 dark:border-white/15 dark:bg-white/[0.03] sm:p-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold">{fa ? "رسانه" : "Media"}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {type === "resume" ? "PDF" : "PNG, JPG, WEBP"} ·{" "}
              {fa ? "حداکثر ۴ مگابایت" : "up to 4MB"}
            </p>
          </div>
          {image?.url && (
            <a
              href={image.url}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-500"
            >
              <ExternalLink size={17} />
            </a>
          )}
        </div>
        {image?.url && type !== "resume" && (
          <img
            src={image.url}
            alt={text(image.alt, locale)}
            className="mb-4 h-36 w-full rounded-2xl object-cover"
          />
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="file"
            accept={
              type === "resume"
                ? "application/pdf"
                : "image/png,image/jpeg,image/webp,image/avif"
            }
            onChange={(e) => {
              const next = e.target.files?.[0] || null;
              if (!next) return setFile(null);
              const valid =
                (type === "resume"
                  ? next.type === "application/pdf"
                  : imageTypes.includes(next.type)) &&
                next.size > 0 &&
                next.size <= maxImageSize;
              if (!valid) {
                notify(
                  type === "resume"
                    ? messages[fa ? "fa" : "en"].pdf
                    : messages[fa ? "fa" : "en"].image,
                  true,
                );
                e.currentTarget.value = "";
                return;
              }
              setFile(next);
            }}
            className="block flex-1 text-sm"
          />
          <button
            type="button"
            disabled={!file}
            onClick={upload}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-40 dark:bg-white dark:text-slate-950"
          >
            <Upload size={16} />
            {fa ? "بارگذاری" : "Upload"}
          </button>
          {image?.key && (
            <button
              type="button"
              onClick={removeMediaFile}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-500 dark:border-red-400/30"
            >
              {fa ? "حذف" : "Remove"}
            </button>
          )}
        </div>
      </div>
      {mediaConfirmation && (
        <ConfirmDialog
          title={fa ? "حذف فایل" : "Delete file"}
          message={
            fa
              ? "آیا از حذف این فایل مطمئن هستید؟"
              : "Are you sure you want to delete this file?"
          }
          cancelLabel={fa ? "انصراف" : "Cancel"}
          confirmLabel={fa ? "تأیید حذف" : "Confirm delete"}
          busy={deletingMedia}
          onCancel={() => setMediaConfirmation(false)}
          onConfirm={confirmMediaRemoval}
        />
      )}
    </section>
  );
}

function MessagesView({
  locale,
  notify,
}: {
  locale: string;
  notify: (message: string, error?: boolean) => void;
}) {
  const fa = locale === "fa";
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [status, setStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => {
    try {
      const result = await api(
        `/api/admin/contact-messages${status ? `?status=${status}` : ""}`,
      );
      setItems(result.data);
    } catch (e) {
      notify(localizedError(e, locale), true);
    }
  }, [status, locale, notify]);
  useEffect(() => {
    void load();
  }, [load]);
  async function change(item: Item, next: string) {
    try {
      const result = await api(`/api/admin/contact-messages/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      setItems((current) =>
        current.map((x) => (x._id === item._id ? result.data : x)),
      );
      setSelected(result.data);
      notify(fa ? "وضعیت به‌روزرسانی شد" : "Status updated");
    } catch (e) {
      notify(localizedError(e, locale), true);
    }
  }
  async function remove(item: Item) {
    setDeleteTarget(item);
  }
  async function confirmRemoval() {
    if (!deleteTarget?._id || deleting) return;
    setDeleting(true);
    try {
      await api(`/api/admin/contact-messages/${deleteTarget._id}`, {
        method: "DELETE",
      });
      setItems((current) => current.filter((x) => x._id !== deleteTarget._id));
      setSelected(null);
    } catch (e) {
      notify(localizedError(e, locale), true);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }
  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-500">
            {fa ? "ارتباط با مخاطب" : "Audience"}
          </p>
          <h1 className="text-3xl font-black">
            {fa ? "صندوق پیام‌ها" : "Message inbox"}
          </h1>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/[0.04]"
        >
          <option value="">{fa ? "همه وضعیت‌ها" : "All statuses"}</option>
          <option value="new">{fa ? "جدید" : "New"}</option>
          <option value="read">{fa ? "خوانده‌شده" : "Read"}</option>
          <option value="replied">{fa ? "پاسخ داده‌شده" : "Replied"}</option>
          <option value="archived">{fa ? "بایگانی" : "Archived"}</option>
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
          {items.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              {fa ? "پیامی وجود ندارد" : "No messages"}
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item._id}
                onClick={() => setSelected(item)}
                className={`block w-full border-b border-slate-100 p-4 text-start transition last:border-0 hover:bg-emerald-400/[0.06] dark:border-white/[0.06] ${selected?._id === item._id ? "bg-emerald-400/[0.08]" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{item.name}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === "new" ? "bg-emerald-400/15 text-emerald-600" : "bg-slate-100 text-slate-500 dark:bg-white/10"}`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {item.subject || item.message}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {item.email} ·{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString(locale)
                    : ""}
                </p>
              </button>
            ))
          )}
        </div>
        <div className="min-h-80 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          {selected ? (
            <>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{selected.name}</h2>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sm text-emerald-500"
                  >
                    {selected.email}
                  </a>
                </div>
                <button
                  onClick={() => remove(selected)}
                  className="rounded-lg p-2 text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                {selected.message}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["new", "read", "replied", "archived"].map((value) => (
                  <button
                    key={value}
                    onClick={() => change(selected, value)}
                    className={`rounded-lg px-3 py-2 text-xs font-bold ${selected.status === value ? "bg-emerald-400 text-slate-950" : "bg-slate-100 dark:bg-white/10"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-sm text-slate-400">
              <Mail size={28} className="mb-3 opacity-50" />
              {fa
                ? "یک پیام را برای مشاهده انتخاب کنید"
                : "Select a message to view it"}
            </div>
          )}
        </div>
      </div>
      {deleteTarget && (
        <ConfirmDialog
          title={fa ? "حذف پیام" : "Delete message"}
          message={
            fa
              ? "آیا از حذف این پیام مطمئن هستید؟"
              : "Are you sure you want to delete this message?"
          }
          cancelLabel={fa ? "انصراف" : "Cancel"}
          confirmLabel={fa ? "تأیید حذف" : "Confirm delete"}
          busy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmRemoval}
        />
      )}
    </section>
  );
}

export default function AdminApp({ initialAdmin }: { initialAdmin?: Item }) {
  const locale = useLocale();
  const fa = locale === "fa";
  const router = useRouter();
  const [active, setActive] = useState<Section>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [admin, setAdmin] = useState<Item | null>(initialAdmin ?? null);
  const [checking, setChecking] = useState(!initialAdmin);
  const [loggingOut, setLoggingOut] = useState(false);
  const notify = useCallback((message: string, error?: boolean) => {
    if (error) toast.error(message, { id: "admin-error" });
    else toast.success(message, { id: "admin-success" });
  }, []);
  useEffect(() => {
    const expired = () => router.replace("/admin/login");
    window.addEventListener("admin:expired", expired);
    // نشست در Server Component بررسی شده است؛ از درخواست تکراری /auth/me صرف‌نظر می‌کنیم.
    if (initialAdmin)
      return () => window.removeEventListener("admin:expired", expired);
    api("/api/auth/me")
      .then((result) => setAdmin(result.admin))
      .catch((error) => {
        if (error?.code === 401 || error?.message === "AUTH_REQUIRED")
          router.replace("/admin/login");
        else notify(localizedError(error, locale), true);
      })
      .finally(() => setChecking(false));
    return () => window.removeEventListener("admin:expired", expired);
  }, [initialAdmin, locale, notify, router]);
  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch (error) {
      notify(localizedError(error, locale), true);
    } finally {
      router.replace("/admin/login");
    }
  }
  if (checking)
    return (
      <main className="min-h-[78vh] bg-[#f7faf9] p-6 dark:bg-[#0b1118] over">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="h-12 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />
        </div>
      </main>
    );
  if (!admin) return null;
  const title = labels[active][fa ? "fa" : "en"];
  const nav = (section: Section) => (
    <button
      key={section}
      onClick={() => {
        setActive(section);
        setMobileOpen(false);
      }}
      aria-current={active === section ? "page" : undefined}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 motion-reduce:transition-none ${active === section ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"}`}
    >
      <span className="shrink-0">
        {(() => {
          const Icon = labels[section].icon;
          return <Icon size={17} />;
        })()}
      </span>
      <span>{labels[section][fa ? "fa" : "en"]}</span>
    </button>
  );
  return (
    <main
      dir={fa ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f7faf9] text-slate-900 dark:bg-[#0b1118] dark:text-white"
    >
      <Toaster
        position={fa ? "bottom-left" : "bottom-right"}
        toastOptions={{
          duration: 3800,
          className:
            "!rounded-2xl !border !border-slate-200 !bg-white !text-slate-900 dark:!border-white/10 dark:!bg-[#101820] dark:!text-white",
        }}
      />
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          className={`fixed inset-y-0 z-40 flex w-72 flex-col border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-300 motion-reduce:transition-none dark:border-white/10 dark:bg-[#101820] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:border-e lg:shadow-none ${mobileOpen ? "translate-x-0" : fa ? "translate-x-full" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="font-black">Hamidreza Babazamani CMS</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  Workspace
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label={fa ? "بستن منو" : "Close menu"}
              className="rounded-lg p-2 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
          <nav
            aria-label={fa ? "ناوبری مدیریت" : "Admin navigation"}
            className="mt-8 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pb-5 pe-1"
          >
            <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[.2em] text-slate-400">
              {fa ? "نمای کلی" : "Workspace"}
            </p>
            {nav("overview")}
            {nav("messages")}
            <p className="px-3 pb-2 pt-7 text-[10px] font-black uppercase tracking-[.2em] text-slate-400">
              {fa ? "محتوا" : "Content"}
            </p>
            {resourceKeys.map(nav)}
            <p className="px-3 pb-2 pt-7 text-[10px] font-black uppercase tracking-[.2em] text-slate-400">
              {fa ? "تنظیمات سایت" : "Site settings"}
            </p>
            {["hero", "profile", "resume", "site-settings"].map(nav)}
          </nav>
          <div className="mt-3 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-500">
                <UserRound size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{admin.email}</p>
                <p className="text-[10px] text-slate-400">{admin.role}</p>
              </div>
              <button
                onClick={logout}
                aria-label="Logout"
                disabled={loggingOut}
                className="text-slate-400 transition hover:text-red-400 disabled:cursor-wait disabled:opacity-50"
              >
                <LogOut
                  size={16}
                  className={loggingOut ? "animate-pulse" : undefined}
                />
              </button>
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header
            className="
    sticky top-0 z-30
    w-full min-w-0
    border-b border-slate-200/80
    bg-[#f7faf9]/90 backdrop-blur-xl
    dark:border-white/10
    dark:bg-[#0b1118]/90
  "
          >
            <div
              className="
      flex min-h-16 items-center
      justify-between gap-2
      px-3 sm:min-h-20 sm:px-6
    "
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  aria-label={fa ? "باز کردن منو" : "Open menu"}
                  aria-expanded={mobileOpen}
                  className="
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-xl border border-slate-200
          bg-white shadow-sm
          dark:border-white/10 dark:bg-white/5
          lg:hidden
        "
                >
                  <Menu size={19} />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="hidden text-xs text-slate-400 sm:block">
                    {fa ? "داشبورد مدیریت" : "Admin dashboard"}
                  </p>

                  <h1 className="truncate text-sm font-bold sm:text-xl">
                    {title}
                  </h1>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <LanguageSwitcher />
                <ThemeToggle />

                <a
                  href={`/${locale}`}
                  className="
           items-center gap-2
          rounded-xl border border-slate-200
          px-3 py-2 text-xs font-semibold
          text-slate-500 transition-colors
          hover:border-emerald-400
          hover:text-emerald-500
          dark:border-white/10
        "
                >
                  <ExternalLink className="hidden lg:flex" size={14} />
                  {fa ? "مشاهده سایت" : "View site"}
                </a>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-8">
            {active === "overview" ? (
              <Overview
                locale={locale}
                onNavigate={setActive}
                notify={notify}
              />
            ) : active === "messages" ? (
              <MessagesView locale={locale} notify={notify} />
            ) : active === "site-settings" ? (
              <SiteSettingsView locale={locale} notify={notify} />
            ) : ["hero", "profile", "resume"].includes(active) ? (
              <SingletonView
                type={active as "hero" | "profile" | "resume"}
                locale={locale}
                notify={notify}
              />
            ) : (
              <ResourceView
                resource={active as ResourceKey}
                locale={locale}
                notify={notify}
              />
            )}
          </div>
        </div>
      </div>
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}
    </main>
  );
}

function Overview({
  locale,
  onNavigate,
  notify,
}: {
  locale: string;
  onNavigate: (section: Section) => void;
  notify: (message: string, error?: boolean) => void;
}) {
  const fa = locale === "fa";
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      ...resourceKeys.map(
        async (key) =>
          [
            key,
            (await api(`/api/admin/${key}?limit=1`)).meta?.total || 0,
          ] as const,
      ),
      api("/api/admin/contact-messages").then(
        (r) => ["messages", r.data?.length || 0] as const,
      ),
    ])
      .then((entries) => setStats(Object.fromEntries(entries)))
      .catch((e) => notify(localizedError(e, locale), true))
      .finally(() => setLoading(false));
  }, [locale, notify]);
  const cards = [
    {
      key: "projects",
      icon: BriefcaseBusiness,
      tone: "from-emerald-400 to-teal-500",
    },
    { key: "technologies", icon: Zap, tone: "from-cyan-400 to-blue-500" },
    {
      key: "experiences",
      icon: ClipboardList,
      tone: "from-violet-400 to-fuchsia-500",
    },
    { key: "messages", icon: Mail, tone: "from-amber-400 to-orange-500" },
  ];
  return (
    <section className="space-y-7">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-9">
        <div className="absolute -end-16 -top-28 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-emerald-300">
            <Sparkles size={17} />
            <span className="text-xs font-bold uppercase tracking-[.2em]">
              {fa ? "فضای کاری شما" : "Your workspace"}
            </span>
          </div>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            {fa
              ? "محتوای خوب، مدیریت ساده‌تر."
              : "Great content, beautifully managed."}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            {fa
              ? "از همین‌جا تمام بخش‌های سایت شخصی خود را کنترل و به‌روزرسانی کنید."
              : "Control and update every part of your personal portfolio from one focused workspace."}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, icon: Icon, tone }) => (
          <button
            key={key}
            onClick={() => onNavigate(key as Section)}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-start transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div
              className={`mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-lg`}
            >
              <Icon size={20} />
            </div>
            <p className="text-sm text-slate-500">
              {labels[key][fa ? "fa" : "en"]}
            </p>
            <p className="mt-1 text-3xl font-black">
              {loading ? "—" : (stats[key] ?? 0)}
            </p>
            <span className="absolute end-5 top-5 text-slate-300 transition group-hover:text-emerald-400">
              {fa ? "←" : "→"}
            </span>
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold">
                {fa ? "دسترسی سریع" : "Quick actions"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {fa ? "پرکاربردترین بخش‌ها" : "Jump into the most used areas"}
              </p>
            </div>
            <Zap size={18} className="text-emerald-500" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["projects", "experiences", "messages"] as Section[]).map(
              (key) => (
                <button
                  key={key}
                  onClick={() => onNavigate(key)}
                  className="rounded-xl bg-slate-50 p-4 text-start transition hover:bg-emerald-400/10 dark:bg-white/[0.04]"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-500">
                    {key === "projects" ? (
                      <BriefcaseBusiness size={16} />
                    ) : key === "messages" ? (
                      <Mail size={16} />
                    ) : (
                      <ClipboardList size={16} />
                    )}
                  </div>
                  <p className="text-sm font-bold">
                    {labels[key][fa ? "fa" : "en"]}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {fa ? "مدیریت محتوا" : "Manage content"}
                  </p>
                </button>
              ),
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-400/15 to-cyan-400/10 p-5 dark:border-white/10">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-500">
            <Settings2 size={19} />
          </div>
          <h2 className="font-bold">
            {fa ? "راهنمای کوچک" : "A small reminder"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {fa
              ? "اطلاعات دو زبان را جداگانه وارد کنید تا تجربه بازدیدکنندگان فارسی و انگلیسی کامل بماند."
              : "Keep Persian and English content filled independently for a complete bilingual experience."}
          </p>
        </div>
      </div>
    </section>
  );
}
