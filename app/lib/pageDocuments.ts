import fs from "fs";
import path from "path";
import matter from "gray-matter";

const pageDocumentsDir = path.join(process.cwd(), "content/pages");

export const PAGE_DOCUMENTS = {
  readme: {
    key: "readme",
    label: "readme",
    route: "/readme",
    editRoute: "/readme/edit",
    fileName: "readme.mdx",
  },
  now: {
    key: "now",
    label: "now",
    route: "/now",
    editRoute: "/now/edit",
    fileName: "now.mdx",
  },
} as const;

export type PageDocumentKey = keyof typeof PAGE_DOCUMENTS;

export type PageDocument = {
  key: PageDocumentKey;
  title: string;
  description: string;
  content: string;
};

export type PageDocumentInput = Omit<PageDocument, "key">;

export class PageDocumentSaveError extends Error {}

type PageDocumentCacheEntry = {
  mtimeMs: number;
  value: PageDocument;
};

const pageDocumentCache = new Map<PageDocumentKey, PageDocumentCacheEntry>();

function ensurePageDocumentsDir() {
  fs.mkdirSync(pageDocumentsDir, { recursive: true });
}

function getPageDocumentFilePath(key: PageDocumentKey) {
  return path.join(pageDocumentsDir, PAGE_DOCUMENTS[key].fileName);
}

function invalidatePageDocumentCache(key: PageDocumentKey) {
  pageDocumentCache.delete(key);
}

function serializePageDocument(input: PageDocumentInput) {
  const frontmatter = {
    title: input.title.trim(),
    description: input.description.trim(),
  };
  const normalizedContent = input.content.replace(/\r\n/g, "\n").trimEnd();

  return matter.stringify(
    normalizedContent ? `${normalizedContent}\n` : "",
    frontmatter
  );
}

function formatFieldList(fields: string[]) {
  if (fields.length <= 1) {
    return fields[0] ?? "";
  }

  if (fields.length === 2) {
    return `${fields[0]} and ${fields[1]}`;
  }

  return `${fields.slice(0, -1).join(", ")}, and ${fields.at(-1)}`;
}

function getMissingRequiredPageFields(
  input: Pick<PageDocumentInput, "title" | "description">
) {
  return [
    !input.title.trim() && "title",
    !input.description.trim() && "description",
  ].filter(Boolean) as string[];
}

export function isPageDocumentKey(value: string): value is PageDocumentKey {
  return value in PAGE_DOCUMENTS;
}

export function getPageDocumentConfig(key: PageDocumentKey) {
  return PAGE_DOCUMENTS[key];
}

export function getPageDocumentDisplayTitle(page: Pick<PageDocument, "key" | "title">) {
  const trimmedTitle = page.title.trim();

  if (trimmedTitle) {
    return trimmedTitle;
  }

  return PAGE_DOCUMENTS[page.key].label;
}

export function getPageDocument(key: PageDocumentKey): PageDocument | null {
  const filePath = getPageDocumentFilePath(key);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const { mtimeMs } = fs.statSync(filePath);
  const cached = pageDocumentCache.get(key);

  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.value;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const value = {
    key,
    title: typeof data.title === "string" ? data.title : "",
    description: typeof data.description === "string" ? data.description : "",
    content,
  };

  pageDocumentCache.set(key, { mtimeMs, value });

  return value;
}

export function savePageDocument(
  key: PageDocumentKey,
  input: PageDocumentInput
): PageDocument {
  const missingFields = getMissingRequiredPageFields(input);

  if (missingFields.length > 0) {
    throw new PageDocumentSaveError(
      `Add ${formatFieldList(missingFields)} before saving this page.`
    );
  }

  ensurePageDocumentsDir();
  fs.writeFileSync(getPageDocumentFilePath(key), serializePageDocument(input), "utf8");
  invalidatePageDocumentCache(key);

  const nextPage = getPageDocument(key);

  if (!nextPage) {
    throw new PageDocumentSaveError("Unable to read the saved page.");
  }

  return nextPage;
}
