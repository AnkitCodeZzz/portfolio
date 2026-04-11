import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createProject, getAvailableProjectSlug, ProjectSaveError } from "../../../../app/lib/projects";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 12 * 1024 * 1024;
const mimeExtensions: Record<string, string> = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
};

function isLocalEditingEnabled(request: Request) {
  const { hostname } = new URL(request.url);

  return (
    process.env.NODE_ENV === "development" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
}

function sanitizeBaseName(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "") || "image"
  );
}

function toReadableLabel(value: string) {
  const words = sanitizeBaseName(value)
    .split(/[-_]+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "Untitled craft";
  }

  return words
    .map((word, index) =>
      index === 0 ? word[0]?.toUpperCase() + word.slice(1) : word
    )
    .join(" ");
}

function getImageExtension(file: File) {
  const fileExtension = path.extname(file.name).toLowerCase();

  if (fileExtension && /^[a-z0-9.]+$/.test(fileExtension)) {
    return fileExtension;
  }

  return mimeExtensions[file.type] ?? "";
}

function getAvailableFileName(
  directory: string,
  identifier: string,
  baseName: string,
  extension: string
) {
  const prefix = sanitizeBaseName(identifier);
  const safeBaseName = sanitizeBaseName(baseName);
  let fileName = `${prefix}-${safeBaseName}${extension}`;
  let index = 2;

  while (fs.existsSync(path.join(directory, fileName))) {
    fileName = `${prefix}-${safeBaseName}-${index}${extension}`;
    index += 1;
  }

  return fileName;
}

export async function POST(request: Request) {
  if (!isLocalEditingEnabled(request)) {
    return NextResponse.json(
      { error: "Local craft uploads are only enabled while developing locally." },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }

  if (!file.type.startsWith("image/") || file.size === 0) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Use an image smaller than 12 MB." },
      { status: 400 }
    );
  }

  const extension = getImageExtension(file);

  if (!extension) {
    return NextResponse.json(
      { error: "Use a PNG, JPG, WEBP, GIF, AVIF, or SVG image." },
      { status: 400 }
    );
  }

  const originalBaseName = path.basename(file.name, path.extname(file.name));
  const slug = getAvailableProjectSlug(originalBaseName);
  const uploadsDirectory = path.join(process.cwd(), "public", "work");
  fs.mkdirSync(uploadsDirectory, { recursive: true });

  const fileName = getAvailableFileName(
    uploadsDirectory,
    slug,
    originalBaseName,
    extension
  );
  const filePath = path.normalize(path.join(uploadsDirectory, fileName));

  if (!filePath.startsWith(uploadsDirectory)) {
    return NextResponse.json(
      { error: "Invalid upload destination." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const publicPath = `/work/${fileName}`;
  const label = toReadableLabel(originalBaseName);

  try {
    const project = createProject({
      slug,
      title: label,
      date: "",
      type: "craft",
      category: "",
      color: "brown",
      description: "",
      pinned: false,
      content: `![${label}](${publicPath})\n`,
    });

    revalidatePath("/");
    revalidatePath("/work");
    revalidatePath(`/work/${project.slug}`);
    revalidatePath(`/work/${project.slug}/edit`);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof ProjectSaveError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
