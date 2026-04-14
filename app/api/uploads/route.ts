import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const VALID_BUCKETS = new Set(["notes", "work", "pages"]);
const IDENTIFIER_PATTERN = /^[a-z0-9_-]+$/i;
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

function forbiddenResponse() {
  return NextResponse.json(
    { error: "Local uploads are only enabled while developing locally." },
    { status: 403 }
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

function toAltText(value: string) {
  const words = sanitizeBaseName(value)
    .split(/[-_]+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "Alt text";
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
    return forbiddenResponse();
  }

  const formData = await request.formData();
  const bucket = formData.get("bucket");
  const identifier = formData.get("identifier");
  const file = formData.get("file");

  if (
    typeof bucket !== "string" ||
    !VALID_BUCKETS.has(bucket) ||
    typeof identifier !== "string" ||
    !IDENTIFIER_PATTERN.test(identifier) ||
    !(file instanceof File)
  ) {
    return NextResponse.json(
      { error: "Invalid upload payload." },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Choose an image file." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: "Choose an image file." },
      { status: 400 }
    );
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

  const uploadsDirectory = path.join(process.cwd(), "public", bucket);
  fs.mkdirSync(uploadsDirectory, { recursive: true });

  const originalBaseName = path.basename(file.name, path.extname(file.name));
  const fileName = getAvailableFileName(
    uploadsDirectory,
    identifier,
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

  const publicPath = `/${bucket}/${fileName}`;
  const altText = toAltText(originalBaseName);

  return NextResponse.json({
    fileName,
    path: publicPath,
    markdown: `![${altText}](${publicPath})`,
  });
}

export async function DELETE(request: Request) {
  if (!isLocalEditingEnabled(request)) {
    return forbiddenResponse();
  }

  const body = (await request.json().catch(() => null)) as
    | {
        path?: unknown;
      }
    | null;
  const publicPath = typeof body?.path === "string" ? body.path : "";
  const match = /^\/(notes|work|pages)\/([a-z0-9][a-z0-9._-]*)$/i.exec(publicPath);

  if (!match) {
    return NextResponse.json({ error: "Invalid image path." }, { status: 400 });
  }

  const bucket = match[1];
  const fileName = match[2];
  const uploadsDirectory = path.join(process.cwd(), "public", bucket);
  const filePath = path.normalize(path.join(uploadsDirectory, fileName));

  if (!filePath.startsWith(uploadsDirectory)) {
    return NextResponse.json({ error: "Invalid image path." }, { status: 400 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "That image file could not be found." },
      { status: 404 }
    );
  }

  fs.unlinkSync(filePath);

  return NextResponse.json({ path: publicPath, deleted: true });
}
