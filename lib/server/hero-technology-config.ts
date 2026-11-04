export const HERO_TECHNOLOGY_BREAKPOINTS = [
  "desktop",
  "tablet",
  "mobile",
] as const;

export type HeroTechnologyBreakpoint =
  (typeof HERO_TECHNOLOGY_BREAKPOINTS)[number];
export type HeroTechnologyHorizontalAnchor = "left" | "right";
export type HeroTechnologyVerticalAnchor = "top" | "bottom";

export type HeroTechnologyPosition = {
  horizontalAnchor: HeroTechnologyHorizontalAnchor;
  horizontalOffsetPercent: number;
  verticalAnchor: HeroTechnologyVerticalAnchor;
  verticalOffsetPercent: number;
};

export type HeroTechnologyResponsiveConfig = {
  isVisible: boolean;
  position: HeroTechnologyPosition;
};

export type HeroTechnologyItemConfig = {
  technologyId: string;
  isVisible: boolean;
  order: number;
  color: { light: string; dark: string };
  iconSize: number;
  responsive: Record<HeroTechnologyBreakpoint, HeroTechnologyResponsiveConfig>;
  animation: {
    isEnabled: boolean;
    durationMs: number;
    delayMs: number;
  };
};

export type HeroTechnologyEcosystemConfig = {
  isVisible: boolean;
  items: HeroTechnologyItemConfig[];
};

export const HERO_TECHNOLOGY_ECOSYSTEM_DEFAULT: HeroTechnologyEcosystemConfig = {
  isVisible: true,
  items: [],
};
export const HERO_TECHNOLOGY_HEX_COLOR_PATTERN = /^#[\da-f]{6}$/i;

export const HERO_TECHNOLOGY_LIMITS = {
  maxItems: 30,
  maxOrder: 10_000,
  minIconSize: 12,
  maxIconSize: 64,
  minPositionOffsetPercent: -25,
  maxPositionOffsetPercent: 125,
  minAnimationDurationMs: 250,
  maxAnimationDurationMs: 60_000,
  minAnimationDelayMs: -60_000,
  maxAnimationDelayMs: 60_000,
} as const;

const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const exactKeys = (
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  errors: Record<string, string>,
) => {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors[`${path}.${key}`] = "Field is not permitted";
  }
};

const booleanField = (
  value: Record<string, unknown>,
  key: string,
  path: string,
  errors: Record<string, string>,
) => {
  if (typeof value[key] !== "boolean") errors[`${path}.${key}`] = "Must be a boolean";
};

const numberField = (
  value: Record<string, unknown>,
  key: string,
  min: number,
  max: number,
  path: string,
  errors: Record<string, string>,
) => {
  const candidate = value[key];
  if (
    typeof candidate !== "number" ||
    !Number.isFinite(candidate) ||
    candidate < min ||
    candidate > max
  ) {
    errors[`${path}.${key}`] = `Must be a number from ${min} to ${max}`;
  }
};

const validatePosition = (
  value: unknown,
  path: string,
  errors: Record<string, string>,
) => {
  if (!object(value)) {
    errors[path] = "Must be a position object";
    return;
  }

  exactKeys(
    value,
    [
      "horizontalAnchor",
      "horizontalOffsetPercent",
      "verticalAnchor",
      "verticalOffsetPercent",
    ],
    path,
    errors,
  );
  if (value.horizontalAnchor !== "left" && value.horizontalAnchor !== "right")
    errors[`${path}.horizontalAnchor`] = "Must be left or right";
  if (value.verticalAnchor !== "top" && value.verticalAnchor !== "bottom")
    errors[`${path}.verticalAnchor`] = "Must be top or bottom";
  numberField(
    value,
    "horizontalOffsetPercent",
    HERO_TECHNOLOGY_LIMITS.minPositionOffsetPercent,
    HERO_TECHNOLOGY_LIMITS.maxPositionOffsetPercent,
    path,
    errors,
  );
  numberField(
    value,
    "verticalOffsetPercent",
    HERO_TECHNOLOGY_LIMITS.minPositionOffsetPercent,
    HERO_TECHNOLOGY_LIMITS.maxPositionOffsetPercent,
    path,
    errors,
  );
};

/** Validate the complete Admin-supplied Hero ecosystem object. */
export function validateHeroTechnologyEcosystem(value: unknown) {
  const errors: Record<string, string> = {};
  if (!object(value)) {
    return { technologyEcosystem: "Must be an ecosystem configuration object" };
  }

  exactKeys(value, ["isVisible", "items"], "technologyEcosystem", errors);
  booleanField(value, "isVisible", "technologyEcosystem", errors);
  if (!Array.isArray(value.items)) {
    errors["technologyEcosystem.items"] = "Must be an array";
    return errors;
  }
  if (value.items.length > HERO_TECHNOLOGY_LIMITS.maxItems) {
    errors["technologyEcosystem.items"] = `Cannot contain more than ${HERO_TECHNOLOGY_LIMITS.maxItems} items`;
  }

  const technologyIds = new Set<string>();
  value.items.forEach((item, index) => {
    const path = `technologyEcosystem.items.${index}`;
    if (!object(item)) {
      errors[path] = "Must be an item object";
      return;
    }
    exactKeys(
      item,
      ["technologyId", "isVisible", "order", "color", "iconSize", "responsive", "animation"],
      path,
      errors,
    );

    if (typeof item.technologyId !== "string" || !/^[a-f\d]{24}$/i.test(item.technologyId)) {
      errors[`${path}.technologyId`] = "Must be a valid Technology ObjectId";
    } else {
      const id = item.technologyId.toLowerCase();
      if (technologyIds.has(id)) errors[`${path}.technologyId`] = "Technology is already configured";
      technologyIds.add(id);
    }

    booleanField(item, "isVisible", path, errors);
    numberField(item, "order", 0, HERO_TECHNOLOGY_LIMITS.maxOrder, path, errors);
    numberField(
      item,
      "iconSize",
      HERO_TECHNOLOGY_LIMITS.minIconSize,
      HERO_TECHNOLOGY_LIMITS.maxIconSize,
      path,
      errors,
    );

    if (!object(item.color)) {
      errors[`${path}.color`] = "Must contain light and dark hex colors";
    } else {
      exactKeys(item.color, ["light", "dark"], `${path}.color`, errors);
      for (const theme of ["light", "dark"] as const) {
        if (
          typeof item.color[theme] !== "string" ||
          !HERO_TECHNOLOGY_HEX_COLOR_PATTERN.test(item.color[theme] as string)
        ) {
          errors[`${path}.color.${theme}`] = "Must be a six-digit hex color";
        }
      }
    }

    if (!object(item.responsive)) {
      errors[`${path}.responsive`] = "Must contain desktop, tablet, and mobile settings";
    } else {
      exactKeys(item.responsive, HERO_TECHNOLOGY_BREAKPOINTS, `${path}.responsive`, errors);
      for (const breakpoint of HERO_TECHNOLOGY_BREAKPOINTS) {
        const breakpointPath = `${path}.responsive.${breakpoint}`;
        const config = item.responsive[breakpoint];
        if (!object(config)) {
          errors[breakpointPath] = "Must be a responsive configuration object";
          continue;
        }
        exactKeys(config, ["isVisible", "position"], breakpointPath, errors);
        booleanField(config, "isVisible", breakpointPath, errors);
        validatePosition(config.position, `${breakpointPath}.position`, errors);
      }
    }

    if (!object(item.animation)) {
      errors[`${path}.animation`] = "Must be an animation configuration object";
    } else {
      exactKeys(item.animation, ["isEnabled", "durationMs", "delayMs"], `${path}.animation`, errors);
      booleanField(item.animation, "isEnabled", `${path}.animation`, errors);
      numberField(
        item.animation,
        "durationMs",
        HERO_TECHNOLOGY_LIMITS.minAnimationDurationMs,
        HERO_TECHNOLOGY_LIMITS.maxAnimationDurationMs,
        `${path}.animation`,
        errors,
      );
      numberField(
        item.animation,
        "delayMs",
        HERO_TECHNOLOGY_LIMITS.minAnimationDelayMs,
        HERO_TECHNOLOGY_LIMITS.maxAnimationDelayMs,
        `${path}.animation`,
        errors,
      );
    }
  });

  return errors;
}
