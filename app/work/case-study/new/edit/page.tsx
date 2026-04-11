import { notFound } from "next/navigation";
import PageFrame from "../../../../components/PageFrame";
import ProjectEditor from "../../../../components/ProjectEditor";
import { getNewProjectDraft } from "../../../../lib/projects";

export default function NewCaseStudyEditPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <PageFrame>
      <ProjectEditor
        project={{ ...getNewProjectDraft(), type: "case-study" }}
        mode="create"
        fixedType="case-study"
      />
    </PageFrame>
  );
}
