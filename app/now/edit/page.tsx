import { notFound } from "next/navigation";
import PageDocumentEditor from "../../components/PageDocumentEditor";
import PageFrame from "../../components/PageFrame";
import { getPageDocument } from "../../lib/pageDocuments";

export default function EditNowPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const page = getPageDocument("now");

  if (!page) {
    notFound();
  }

  return (
    <PageFrame>
      <PageDocumentEditor page={page} />
    </PageFrame>
  );
}
