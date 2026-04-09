import { notFound } from "next/navigation";
import NoteScrollRestorer from "../../../components/NoteScrollRestorer";
import PageFrame from "../../../components/PageFrame";
import ProjectEditor from "../../../components/ProjectEditor";
import { getProject } from "../../../lib/projects";

type EditProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <PageFrame>
      <NoteScrollRestorer storageKey={`work-scroll:${project.slug}`} />
      <ProjectEditor project={project} />
    </PageFrame>
  );
}
