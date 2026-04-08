import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createNote, NoteSaveError } from "../../lib/notes";

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
    { error: "Local note editing is only enabled while developing locally." },
    { status: 403 }
  );
}

export async function POST(request: Request) {
  if (!isLocalEditingEnabled(request)) {
    return forbiddenResponse();
  }

  const payload = (await request.json()) as Partial<{
    slug: string;
    title: string;
    date: string;
    tags: string[];
    description: string;
    pinned: boolean;
    content: string;
  }>;

  if (
    typeof payload.slug !== "string" ||
    typeof payload.title !== "string" ||
    typeof payload.date !== "string" ||
    !Array.isArray(payload.tags) ||
    typeof payload.description !== "string" ||
    typeof payload.pinned !== "boolean" ||
    typeof payload.content !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid note payload." },
      { status: 400 }
    );
  }

  try {
    const note = createNote({
      slug: payload.slug.trim().toLowerCase(),
      title: payload.title.trim(),
      date: payload.date.trim(),
      tags: payload.tags.map((tag) => tag.trim()).filter(Boolean),
      description: payload.description.trim(),
      pinned: payload.pinned,
      content: payload.content,
    });

    revalidatePath("/");
    revalidatePath("/notes");
    revalidatePath(`/notes/${note.slug}`);
    revalidatePath(`/notes/${note.slug}/edit`);

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof NoteSaveError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
