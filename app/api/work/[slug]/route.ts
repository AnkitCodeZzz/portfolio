import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { ProjectColor, ProjectType } from "../../../lib/projectMeta";
import {
  deleteProject,
  getProject,
  ProjectSaveError,
  saveProject,
} from "../../../lib/projects";

export const runtime = "nodejs";

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
    { error: "Local project editing is only enabled while developing locally." },
    { status: 403 }
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isLocalEditingEnabled(request)) {
    return forbiddenResponse();
  }

  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isLocalEditingEnabled(request)) {
    return forbiddenResponse();
  }

  const { slug } = await params;
  const payload = (await request.json()) as Partial<{
    slug: string;
    title: string;
    date: string;
    type: string;
    category: string;
    color: string;
    description: string;
    pinned: boolean;
    content: string;
  }>;

  if (
    typeof payload.slug !== "string" ||
    typeof payload.title !== "string" ||
    typeof payload.date !== "string" ||
    typeof payload.type !== "string" ||
    typeof payload.category !== "string" ||
    typeof payload.color !== "string" ||
    typeof payload.description !== "string" ||
    typeof payload.pinned !== "boolean" ||
    typeof payload.content !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid project payload." },
      { status: 400 }
    );
  }

  let project;

  try {
    project = saveProject(slug, {
      slug: payload.slug.trim().toLowerCase(),
      title: payload.title.trim(),
      date: payload.date.trim(),
      type: payload.type.trim() as ProjectType,
      category: payload.category.trim(),
      color: payload.color.trim() as ProjectColor,
      description: payload.description.trim(),
      pinned: payload.pinned,
      content: payload.content,
    });
  } catch (error) {
    if (error instanceof ProjectSaveError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath(`/work/${slug}`);
  revalidatePath(`/work/${slug}/edit`);
  revalidatePath(`/work/${project.slug}`);
  revalidatePath(`/work/${project.slug}/edit`);

  return NextResponse.json({ project });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isLocalEditingEnabled(request)) {
    return forbiddenResponse();
  }

  const { slug } = await params;
  const deleted = deleteProject(slug);

  if (!deleted) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath(`/work/${slug}`);
  revalidatePath(`/work/${slug}/edit`);

  return NextResponse.json({ ok: true });
}
