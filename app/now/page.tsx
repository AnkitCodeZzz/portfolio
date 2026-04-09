import { notFound } from "next/navigation";
import PageDocumentView from "../components/PageDocumentView";
import { getPageDocument } from "../lib/pageDocuments";

export default function NowPage() {
  const page = getPageDocument("now");

  if (!page) {
    notFound();
  }

  return <PageDocumentView page={page} />;
}
