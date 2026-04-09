export const PROJECT_TYPES = [
  { key: "case-study", label: "Case study" },
  { key: "craft", label: "Craft" },
] as const;

export const PROJECT_COLOR_OPTIONS = [
  { key: "olive", label: "Olive" },
  { key: "violet", label: "Violet" },
  { key: "purple", label: "Purple" },
  { key: "blue", label: "Blue" },
  { key: "brown", label: "Brown" },
  { key: "rose", label: "Rose" },
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number]["key"];
export type ProjectColor = (typeof PROJECT_COLOR_OPTIONS)[number]["key"];

export function getProjectColorCssValue(color: string) {
  return `var(--site-tag-${color}, var(--site-tag-olive))`;
}
