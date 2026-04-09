import { notFound } from "next/navigation";
import PageFrame from "../../../components/PageFrame";
import ProjectEditor from "../../../components/ProjectEditor";
import { getNewProjectDraft } from "../../../lib/projects";

export default function NewProjectEditPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <PageFrame>
      <ProjectEditor project={getNewProjectDraft()} mode="create" />
    </PageFrame>
  );
}
