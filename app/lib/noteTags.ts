export const NOTE_TAGS = [
  // Keep keys stable. Change only label/color for future tag edits.
  { key: "tag-1", label: "Design", color: "olive" },
  { key: "tag-2", label: "Experiments", color: "violet" },
  { key: "tag-3", label: "Noticing Life", color: "blue" },
  { key: "tag-4", label: "Thoughts", color: "brown" },
  { key: "tag-5", label: "AI", color: "purple" },
] as const;

export type NoteTagDefinition = (typeof NOTE_TAGS)[number];
export type NoteTagKey = NoteTagDefinition["key"];
export type NoteTagColorKey = NoteTagDefinition["color"];

const noteTagByKey = Object.fromEntries(
  NOTE_TAGS.map((tag) => [tag.key, tag])
) as Record<NoteTagKey, NoteTagDefinition>;

const noteTagOrder = new Map<NoteTagKey, number>(
  NOTE_TAGS.map((tag, index) => [tag.key, index])
);

function normalizeTagValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const tagLookup = new Map<string, NoteTagKey>();

for (const tag of NOTE_TAGS) {
  tagLookup.set(normalizeTagValue(tag.key), tag.key);
  tagLookup.set(normalizeTagValue(tag.label), tag.key);
}

export function getNoteTagDefinition(value: string) {
  const key = resolveNoteTagKey(value);

  return key ? noteTagByKey[key] : null;
}

export function resolveNoteTagKey(value: string): NoteTagKey | null {
  return tagLookup.get(normalizeTagValue(value)) ?? null;
}

export function getInvalidNoteTags(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => resolveNoteTagKey(value) === null);
}

export function sanitizeNoteTags(values: string[]) {
  const uniqueKeys = new Set<NoteTagKey>();

  for (const value of values) {
    const key = resolveNoteTagKey(value);

    if (key) {
      uniqueKeys.add(key);
    }
  }

  return Array.from(uniqueKeys).sort((a, b) => {
    return (noteTagOrder.get(a) ?? 0) - (noteTagOrder.get(b) ?? 0);
  });
}

export function getNoteTagLabel(value: string) {
  return getNoteTagDefinition(value)?.label ?? value;
}

export function getNoteTagColorKey(value: string): NoteTagColorKey {
  return getNoteTagDefinition(value)?.color ?? "olive";
}

export function getNoteTagColorCssValue(value: string) {
  return getNoteTagColorCssValueForColor(getNoteTagColorKey(value));
}

export function getNoteTagColorCssValueForColor(color: string) {
  return `var(--site-tag-${color}, var(--site-tag-olive))`;
}
