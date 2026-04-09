import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  getPageDocumentConfig,
  isPageDocumentKey,
  PageDocumentSaveError,
  savePageDocument,
} from "../../../lib/pageDocuments";

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
    { error: "Local page editing is only enabled while developing locally." },
    { status: 403 }
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!isLocalEditingEnabled(request)) {
    return forbiddenResponse();
  }

  const { key } = await params;

  if (!isPageDocumentKey(key)) {
    return NextResponse.json({ error: "Unknown page." }, { status: 404 });
  }

  const payload = (await request.json()) as Partial<{
    title: string;
    description: string;
    content: string;
  }>;

  if (
    typeof payload.title !== "string" ||
    typeof payload.description !== "string" ||
    typeof payload.content !== "string"
  ) {
    return NextResponse.json({ error: "Invalid page payload." }, { status: 400 });
  }

  try {
    const page = savePageDocument(key, {
      title: payload.title.trim(),
      description: payload.description.trim(),
      content: payload.content,
    });
    const config = getPageDocumentConfig(key);

    revalidatePath(config.route);
    revalidatePath(config.editRoute);
    revalidatePath("/");

    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof PageDocumentSaveError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
