import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  PROJECT_COLOR_OPTIONS,
  PROJECT_TYPES,
  type ProjectColor,
  type ProjectType,
} from "./projectMeta";

const projectsDir = path.join(process.cwd(), "content/work");
const PROJECT_SLUG_PATTERN = /^[a-z0-9_-]+$/i;

export type ProjectMetadata = {
  slug: string;
  title: string;
  date: string;
  type: ProjectType;
  category: string;
  color: ProjectColor;
  description: string;
  pinned: boolean;
};

export type Project = ProjectMetadata & {
  content: string;
};

export type ProjectInput = Project;

export class ProjectSaveError extends Error {}

type ProjectListCacheEntry = {
  signature: string;
  value: ProjectMetadata[];
};

type ProjectCacheEntry = {
  mtimeMs: number;
  value: Project;
};

let projectListCache: ProjectListCacheEntry | null = null;
const projectCache = new Map<string, ProjectCacheEntry>();

const validProjectTypeKeys = new Set<ProjectType>(
  PROJECT_TYPES.map((type) => type.key)
);
const validProjectColorKeys = new Set<ProjectColor>(
  PROJECT_COLOR_OPTIONS.map((color) => color.key)
);

function ensureProjectsDir() {
  fs.mkdirSync(projectsDir, { recursive: true });
}

function getProjectFilePath(slug: string) {
  if (!PROJECT_SLUG_PATTERN.test(slug)) {
    return null;
  }

  const filePath = path.normalize(path.join(projectsDir, `${slug}.mdx`));

  if (!filePath.startsWith(projectsDir)) {
    return null;
  }

  return filePath;
}

function invalidateProjectCache(slug?: string) {
  projectListCache = null;

  if (slug) {
    projectCache.delete(slug);
    return;
  }

  projectCache.clear();
}

function getProjectsListSignature() {
  const files = fs
    .readdirSync(projectsDir)
    .filter((file) => file.endsWith(".mdx"))
    .sort();

  const signature = files
    .map((file) => {
      const filePath = path.join(projectsDir, file);
      const { mtimeMs } = fs.statSync(filePath);
      return `${file}:${mtimeMs}`;
    })
    .join("|");

  return { files, signature };
}

function isProjectType(value: string): value is ProjectType {
  return validProjectTypeKeys.has(value as ProjectType);
}

function isProjectColor(value: string): value is ProjectColor {
  return validProjectColorKeys.has(value as ProjectColor);
}

function normalizeProjectType(value: string): ProjectType {
  return isProjectType(value) ? value : "case-study";
}

function normalizeProjectColor(value: string): ProjectColor {
  return isProjectColor(value) ? value : "olive";
}

function serializeProject(input: ProjectInput) {
  const frontmatter = {
    title: input.title.trim(),
    date: input.date.trim(),
    type: input.type,
    category: input.category.trim(),
    color: input.color,
    description: input.description.trim(),
    ...(input.pinned ? { pinned: true } : {}),
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

function getMissingRequiredProjectFields(
  input: Pick<ProjectInput, "slug" | "title" | "date" | "type" | "category" | "color" | "description">
) {
  const isCraftProject = input.type === "craft";

  return [
    !input.slug.trim() && "slug",
    !input.title.trim() && "title",
    !input.type.trim() && "type",
    !isCraftProject && !input.category.trim() && "category",
    !input.color.trim() && "color",
    !isCraftProject && !input.description.trim() && "description",
    !isCraftProject && !input.date.trim() && "date",
  ].filter(Boolean) as string[];
}

export function getProjectShowcaseImagePath(content: string) {
  const match = content.match(/!\[[^\]]*\]\((\/[^)\s]+)\)/);

  return match?.[1] ?? null;
}

export type ProjectShowcaseImage = {
  src: string;
  alt: string;
};

export function getProjectShowcaseImages(content: string): ProjectShowcaseImage[] {
  const matches = content.matchAll(/!\[([^\]]*)\]\((\/[^)\s]+)(?:\s+"[^"]*")?\)/g);

  return Array.from(matches, (match) => ({
    alt: match[1]?.trim() ?? "",
    src: match[2] ?? "",
  })).filter((image) => image.src.length > 0);
}

export function getProjectDisplayTitle(project: Pick<ProjectMetadata, "slug" | "title">) {
  const trimmedTitle = project.title.trim();

  if (trimmedTitle) {
    return trimmedTitle;
  }

  return project.slug.replace(/[-_]+/g, " ").trim() || "untitled project";
}

export function getAvailableProjectSlug(baseSlug = "untitled-project") {
  const sanitizedBaseSlug =
    baseSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project";
  let slug = sanitizedBaseSlug;
  let index = 2;

  while (true) {
    const filePath = getProjectFilePath(slug);

    if (filePath && !fs.existsSync(filePath)) {
      return slug;
    }

    slug = `${sanitizedBaseSlug}-${index}`;
    index += 1;
  }
}

export function getNewProjectDraft(): Project {
  return {
    slug: "",
    title: "",
    date: "",
    type: "case-study",
    category: "",
    color: "olive",
    description: "",
    pinned: false,
    content: "",
  };
}

export function getAllProjects(): ProjectMetadata[] {
  ensureProjectsDir();
  const { files, signature } = getProjectsListSignature();

  if (projectListCache?.signature === signature) {
    return projectListCache.value;
  }

  const value = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(projectsDir, file), "utf8");
      const { data } = matter(raw);

      return {
        slug,
        title: typeof data.title === "string" ? data.title : "",
        date: typeof data.date === "string" ? data.date : "",
        type: normalizeProjectType(typeof data.type === "string" ? data.type : ""),
        category: typeof data.category === "string" ? data.category : "",
        color: normalizeProjectColor(typeof data.color === "string" ? data.color : ""),
        description: typeof data.description === "string" ? data.description : "",
        pinned: Boolean(data.pinned),
      };
    })
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  projectListCache = { signature, value };

  return value;
}

export function getProject(slug: string): Project | null {
  const filePath = getProjectFilePath(slug);

  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  const { mtimeMs } = fs.statSync(filePath);
  const cached = projectCache.get(slug);

  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.value;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const value = {
    slug,
    title: typeof data.title === "string" ? data.title : "",
    date: typeof data.date === "string" ? data.date : "",
    type: normalizeProjectType(typeof data.type === "string" ? data.type : ""),
    category: typeof data.category === "string" ? data.category : "",
    color: normalizeProjectColor(typeof data.color === "string" ? data.color : ""),
    description: typeof data.description === "string" ? data.description : "",
    pinned: Boolean(data.pinned),
    content,
  };

  projectCache.set(slug, { mtimeMs, value });

  return value;
}

export function saveProject(slug: string, input: ProjectInput): Project | null {
  const currentFilePath = getProjectFilePath(slug);

  if (!currentFilePath || !fs.existsSync(currentFilePath)) {
    return null;
  }

  const nextSlug = input.slug.trim();
  const nextFilePath = getProjectFilePath(nextSlug);
  const missingFields = getMissingRequiredProjectFields({
    slug: nextSlug,
    title: input.title,
    date: input.date,
    type: input.type,
    category: input.category,
    color: input.color,
    description: input.description,
  });

  if (missingFields.length > 0) {
    throw new ProjectSaveError(
      `Add ${formatFieldList(missingFields)} before saving this project.`
    );
  }

  if (!isProjectType(input.type)) {
    throw new ProjectSaveError("Choose either case study or craft for the project type.");
  }

  if (!isProjectColor(input.color)) {
    throw new ProjectSaveError("Choose one of the available project colors.");
  }

  if (!nextFilePath) {
    throw new ProjectSaveError(
      "Use only lowercase letters, numbers, hyphens, or underscores for the slug."
    );
  }

  if (nextSlug !== slug && fs.existsSync(nextFilePath)) {
    throw new ProjectSaveError("Another project already uses this slug.");
  }

  if (nextSlug !== slug) {
    fs.renameSync(currentFilePath, nextFilePath);
  }

  fs.writeFileSync(nextFilePath, serializeProject(input), "utf8");
  invalidateProjectCache(slug);
  invalidateProjectCache(nextSlug);

  return getProject(nextSlug);
}

export function createProject(input: ProjectInput): Project {
  ensureProjectsDir();

  const nextSlug = input.slug.trim();
  const nextFilePath = getProjectFilePath(nextSlug);
  const missingFields = getMissingRequiredProjectFields({
    slug: nextSlug,
    title: input.title,
    date: input.date,
    type: input.type,
    category: input.category,
    color: input.color,
    description: input.description,
  });

  if (missingFields.length > 0) {
    throw new ProjectSaveError(
      `Add ${formatFieldList(missingFields)} before creating this project.`
    );
  }

  if (!isProjectType(input.type)) {
    throw new ProjectSaveError("Choose either case study or craft for the project type.");
  }

  if (!isProjectColor(input.color)) {
    throw new ProjectSaveError("Choose one of the available project colors.");
  }

  if (!nextFilePath) {
    throw new ProjectSaveError(
      "Use only lowercase letters, numbers, hyphens, or underscores for the slug."
    );
  }

  if (fs.existsSync(nextFilePath)) {
    throw new ProjectSaveError("Another project already uses this slug.");
  }

  fs.writeFileSync(nextFilePath, serializeProject(input), "utf8");
  invalidateProjectCache(nextSlug);

  const nextProject = getProject(nextSlug);

  if (!nextProject) {
    throw new ProjectSaveError("Unable to read the created project.");
  }

  return nextProject;
}

export function deleteProject(slug: string) {
  const filePath = getProjectFilePath(slug);

  if (!filePath || !fs.existsSync(filePath)) {
    return false;
  }

  fs.unlinkSync(filePath);
  invalidateProjectCache(slug);

  return true;
}
