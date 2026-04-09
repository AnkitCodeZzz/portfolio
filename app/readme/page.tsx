import { notFound } from "next/navigation";
import PageDocumentView from "../components/PageDocumentView";
import { getPageDocument } from "../lib/pageDocuments";

export default function ReadmePage() {
  const page = getPageDocument("readme");

  if (!page) {
    notFound();
  }

  return <PageDocumentView page={page} />;
}
