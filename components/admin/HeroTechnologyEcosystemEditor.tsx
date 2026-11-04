"use client";

import { useEffect, useMemo, useState } from "react";
import { requestAdmin } from "@/lib/api/requests/admin";
import type {
  HeroTechnologyBreakpoint,
  HeroTechnologyEcosystemConfig,
  HeroTechnologyItemConfig,
  HeroTechnologyPosition,
} from "@/lib/server/hero-technology-config";

type TechnologyOption = {
  _id: string;
  name: { fa?: string; en?: string };
  iconMedia?: { url?: string; alt?: { fa?: string; en?: string } };
  isVisible?: boolean;
};

type TechnologyListResponse = {
  success: true;
  data: TechnologyOption[];
  meta: { pages: number };
};

const localizedName = (technology: TechnologyOption, locale: string) =>
  (locale === "fa" ? technology.name?.fa : technology.name?.en) ||
  technology.name?.en ||
  technology.name?.fa ||
  technology._id;

const defaultPosition = (index: number, count: number): HeroTechnologyPosition => {
  const angle = (Math.PI * 2 * index) / Math.max(count, 1) - Math.PI / 2;
  const x = 50 + 48 * Math.cos(angle);
  const y = 50 + 48 * Math.sin(angle);
  return {
    horizontalAnchor: x <= 50 ? "left" : "right",
    horizontalOffsetPercent: Number((x <= 50 ? x : 100 - x).toFixed(2)),
    verticalAnchor: y <= 50 ? "top" : "bottom",
    verticalOffsetPercent: Number((y <= 50 ? y : 100 - y).toFixed(2)),
  };
};

const createItem = (technologyId: string, index: number): HeroTechnologyItemConfig => {
  const position = defaultPosition(index, Math.max(index + 1, 4));
  const responsive = {
    desktop: { isVisible: true, position },
    tablet: { isVisible: true, position },
    mobile: { isVisible: true, position },
  };
  return {
    technologyId,
    isVisible: true,
    order: index,
    color: { light: "#10b981", dark: "#6ee7b7" },
    iconSize: 20,
    responsive,
    animation: { isEnabled: true, durationMs: 6000, delayMs: 0 },
  };
};

export default function HeroTechnologyEcosystemEditor({
  value,
  locale,
  onChange,
}: {
  value: HeroTechnologyEcosystemConfig;
  locale: string;
  onChange: (value: HeroTechnologyEcosystemConfig) => void;
}) {
  const fa = locale === "fa";
  const [technologies, setTechnologies] = useState<TechnologyOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    const loadTechnologies = async () => {
      try {
        const first = await requestAdmin<TechnologyListResponse>(
          "/api/admin/technologies?page=1&limit=100",
        );
        const results = [...first.data];
        for (let page = 2; page <= first.meta.pages; page += 1) {
          const next = await requestAdmin<TechnologyListResponse>(
            `/api/admin/technologies?page=${page}&limit=100`,
          );
          results.push(...next.data);
        }
        if (active) setTechnologies(results);
      } catch {
        if (active)
          setLoadError(
            fa
              ? "بارگذاری فهرست فناوری‌ها انجام نشد."
              : "Could not load the Technology records.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadTechnologies();
    return () => {
      active = false;
    };
  }, [fa]);

  const items = useMemo(
    () => [...(value.items || [])].sort((a, b) => a.order - b.order),
    [value.items],
  );
  const configuredIds = useMemo(
    () => new Set(items.map((item) => item.technologyId)),
    [items],
  );
  const available = technologies.filter(
    (technology) => !configuredIds.has(technology._id),
  );
  const text = (en: string, persian: string) => (fa ? persian : en);

  const replaceItems = (next: HeroTechnologyItemConfig[]) =>
    onChange({
      ...value,
      items: next.map((item, index) => ({ ...item, order: index })),
    });

  const updateItem = (
    technologyId: string,
    update: Partial<HeroTechnologyItemConfig>,
  ) =>
    onChange({
      ...value,
      items: value.items.map((item) =>
        item.technologyId === technologyId ? { ...item, ...update } : item,
      ),
    });

  const updateResponsive = (
    technologyId: string,
    breakpoint: HeroTechnologyBreakpoint,
    update: Partial<HeroTechnologyItemConfig["responsive"][HeroTechnologyBreakpoint]>,
  ) => {
    const item = value.items.find((entry) => entry.technologyId === technologyId);
    if (!item) return;
    updateItem(technologyId, {
      responsive: {
        ...item.responsive,
        [breakpoint]: { ...item.responsive[breakpoint], ...update },
      },
    });
  };

  const addTechnology = () => {
    if (!selectedId || configuredIds.has(selectedId)) return;
    replaceItems([...items, createItem(selectedId, items.length)]);
    setSelectedId("");
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    replaceItems(next);
  };

  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">
            {text("Floating Hero technologies", "فناوری‌های شناور Hero")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {text(
              "Choose existing Technology records. Removing one here does not delete that record.",
              "فناوری‌های موجود را انتخاب کنید. حذف از این فهرست، رکورد فناوری را پاک نمی‌کند.",
            )}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={value.isVisible}
            onChange={(event) => onChange({ ...value, isVisible: event.target.checked })}
            className="size-4 accent-emerald-500"
          />
          {text("Show ecosystem", "نمایش مجموعه")}
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          disabled={loading || available.length === 0}
          aria-label={text("Technology to add", "فناوری برای افزودن")}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#101820]"
        >
          <option value="">
            {loading
              ? text("Loading technologies…", "در حال بارگذاری فناوری‌ها…")
              : available.length
                ? text("Select a Technology", "یک فناوری انتخاب کنید")
                : text("No unselected technologies", "فناوری انتخاب‌نشده‌ای وجود ندارد")}
          </option>
          {available.map((technology) => (
            <option key={technology._id} value={technology._id}>
              {localizedName(technology, locale)}
              {technology.isVisible === false ? text(" (hidden globally)", " (مخفی در سایت)") : ""}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selectedId || loading}
          onClick={addTechnology}
          className="min-h-11 rounded-xl bg-emerald-400 px-4 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {text("Add technology", "افزودن فناوری")}
        </button>
      </div>
      {loadError && <p role="alert" className="text-sm text-red-500">{loadError}</p>}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-white/15">
          {text("No Hero technologies configured.", "هنوز فناوری‌ای برای Hero انتخاب نشده است.")}
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const technology = technologies.find((record) => record._id === item.technologyId);
            const name = technology ? localizedName(technology, locale) : item.technologyId;
            return (
              <article
                key={item.technologyId}
                className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-white/10"
              >
                <div className="flex flex-wrap items-center gap-3">
                  {technology?.iconMedia?.url ? (
                    <img
                      src={technology.iconMedia.url}
                      alt={technology.iconMedia.alt?.[locale === "fa" ? "fa" : "en"] || name}
                      className="size-10 rounded-lg object-contain"
                    />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                      {name.slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{name}</p>
                    {technology?.isVisible === false && (
                      <p className="text-xs text-amber-600">
                        {text("Hidden by global Technology setting", "نمایش این فناوری در تنظیمات کلی خاموش است")}
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.isVisible}
                      onChange={(event) => updateItem(item.technologyId, { isVisible: event.target.checked })}
                      className="size-4 accent-emerald-500"
                    />
                    {text("Enabled", "فعال")}
                  </label>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                    aria-label={text("Move up", "انتقال به بالا")}
                    className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40 dark:border-white/10"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 1)}
                    aria-label={text("Move down", "انتقال به پایین")}
                    className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40 dark:border-white/10"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => replaceItems(items.filter((entry) => entry.technologyId !== item.technologyId))}
                    className="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-500 dark:border-red-400/30"
                  >
                    {text("Remove", "حذف")}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="text-xs font-semibold text-slate-500">
                    {text("Display order", "ترتیب نمایش")}
                    <input
                      type="number"
                      min={0}
                      max={10_000}
                      value={item.order}
                      onChange={(event) => {
                        const order = Number(event.target.value);
                        if (!Number.isFinite(order) || order < 0) return;
                        const next = [...items];
                        next[index] = { ...item, order };
                        replaceItems([...next].sort((a, b) => a.order - b.order));
                      }}
                      className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 dark:border-white/10 dark:bg-[#101820] dark:text-white"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-500">
                    {text("Icon size (px)", "اندازه آیکون (پیکسل)")}
                    <input
                      type="number"
                      min={12}
                      max={64}
                      value={item.iconSize}
                      onChange={(event) => updateItem(item.technologyId, { iconSize: Number(event.target.value) })}
                      className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 dark:border-white/10 dark:bg-[#101820] dark:text-white"
                    />
                  </label>
                  <div className="flex gap-3">
                    {(["light", "dark"] as const).map((theme) => (
                      <label key={theme} className="text-xs font-semibold text-slate-500">
                        {theme === "light" ? text("Light color", "رنگ روشن") : text("Dark color", "رنگ تیره")}
                        <input
                          type="color"
                          value={item.color[theme]}
                          onChange={(event) => updateItem(item.technologyId, {
                            color: { ...item.color, [theme]: event.target.value },
                          })}
                          className="mt-1 block h-10 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-[#101820]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  {(["desktop", "tablet", "mobile"] as const).map((breakpoint) => {
                    const config = item.responsive[breakpoint];
                    const position = config.position;
                    const breakpointName = text(
                      breakpoint[0].toUpperCase() + breakpoint.slice(1),
                      breakpoint === "desktop" ? "رومیزی" : breakpoint === "tablet" ? "تبلت" : "موبایل",
                    );
                    return (
                      <fieldset key={breakpoint} className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-white/10">
                        <legend className="px-1 text-sm font-semibold">{breakpointName}</legend>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={config.isVisible}
                            onChange={(event) => updateResponsive(item.technologyId, breakpoint, { isVisible: event.target.checked })}
                            className="size-4 accent-emerald-500"
                          />
                          {text("Visible", "قابل نمایش")}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="text-xs text-slate-500">
                            {text("Horizontal anchor", "محور افقی")}
                            <select
                              value={position.horizontalAnchor}
                              onChange={(event) => updateResponsive(item.technologyId, breakpoint, {
                                position: { ...position, horizontalAnchor: event.target.value as HeroTechnologyPosition["horizontalAnchor"] },
                              })}
                              className="mt-1 min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-slate-900 dark:border-white/10 dark:bg-[#101820] dark:text-white"
                            >
                              <option value="left">{text("Left", "چپ")}</option>
                              <option value="right">{text("Right", "راست")}</option>
                            </select>
                          </label>
                          <label className="text-xs text-slate-500">
                            {text("Offset %", "فاصله ٪")}
                            <input
                              type="number"
                              min={-25}
                              max={125}
                              step="0.1"
                              value={position.horizontalOffsetPercent}
                              onChange={(event) => updateResponsive(item.technologyId, breakpoint, {
                                position: { ...position, horizontalOffsetPercent: Number(event.target.value) },
                              })}
                              className="mt-1 min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-slate-900 dark:border-white/10 dark:bg-[#101820] dark:text-white"
                            />
                          </label>
                          <label className="text-xs text-slate-500">
                            {text("Vertical anchor", "محور عمودی")}
                            <select
                              value={position.verticalAnchor}
                              onChange={(event) => updateResponsive(item.technologyId, breakpoint, {
                                position: { ...position, verticalAnchor: event.target.value as HeroTechnologyPosition["verticalAnchor"] },
                              })}
                              className="mt-1 min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-slate-900 dark:border-white/10 dark:bg-[#101820] dark:text-white"
                            >
                              <option value="top">{text("Top", "بالا")}</option>
                              <option value="bottom">{text("Bottom", "پایین")}</option>
                            </select>
                          </label>
                          <label className="text-xs text-slate-500">
                            {text("Offset %", "فاصله ٪")}
                            <input
                              type="number"
                              min={-25}
                              max={125}
                              step="0.1"
                              value={position.verticalOffsetPercent}
                              onChange={(event) => updateResponsive(item.technologyId, breakpoint, {
                                position: { ...position, verticalOffsetPercent: Number(event.target.value) },
                              })}
                              className="mt-1 min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-slate-900 dark:border-white/10 dark:bg-[#101820] dark:text-white"
                            />
                          </label>
                        </div>
                      </fieldset>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.animation.isEnabled}
                      onChange={(event) => updateItem(item.technologyId, {
                        animation: { ...item.animation, isEnabled: event.target.checked },
                      })}
                      className="size-4 accent-emerald-500"
                    />
                    {text("Float animation", "حرکت شناور")}
                  </label>
                  <label className="text-xs font-semibold text-slate-500">
                    {text("Duration (ms)", "مدت انیمیشن (میلی‌ثانیه)")}
                    <input
                      type="number"
                      min={250}
                      max={60_000}
                      value={item.animation.durationMs}
                      onChange={(event) => updateItem(item.technologyId, {
                        animation: { ...item.animation, durationMs: Number(event.target.value) },
                      })}
                      className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 dark:border-white/10 dark:bg-[#101820] dark:text-white"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-500">
                    {text("Delay (ms)", "تأخیر (میلی‌ثانیه)")}
                    <input
                      type="number"
                      min={-60_000}
                      max={60_000}
                      value={item.animation.delayMs}
                      onChange={(event) => updateItem(item.technologyId, {
                        animation: { ...item.animation, delayMs: Number(event.target.value) },
                      })}
                      className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 dark:border-white/10 dark:bg-[#101820] dark:text-white"
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500">
                  {technology?.iconMedia?.url
                    ? text("Icon image is managed in the Technology editor.", "تصویر آیکون از بخش مدیریت فناوری‌ها تغییر می‌کند.")
                    : text("Upload an icon image in the Technology editor to show it here.", "برای نمایش تصویر، آن را از بخش مدیریت فناوری‌ها بارگذاری کنید.")}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
