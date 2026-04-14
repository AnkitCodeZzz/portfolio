import Link from "next/link";
import CraftShowcase from "../components/CraftShowcase";
import CraftShowcaseUploadButton from "../components/CraftShowcaseUploadButton";
import Divider from "../components/Divider";
import PageFrame from "../components/PageFrame";
import PinIcon from "../components/PinIcon";
import { getProjectColorCssValue } from "../lib/projectMeta";
import {
  getAllProjects,
  getProject,
  getProjectDisplayTitle,
  getProjectShowcaseImages,
} from "../lib/projects";
import editorial from "../styles/editorial.module.css";
import homeStyles from "../page.module.css";

export default function WorkPage() {
  const projects = getAllProjects();
  const caseStudies = projects.filter((project) => project.type === "case-study");
  const craftProjects = projects
    .filter((project) => project.type === "craft")
    .map((project) => {
      const fullProject = getProject(project.slug);
      const firstImage = fullProject
        ? getProjectShowcaseImages(fullProject.content)[0] ?? null
        : null;

      if (!firstImage) {
        return null;
      }

      return {
        alt: firstImage.alt || getProjectDisplayTitle(project),
        imageSrc: firstImage.src,
        slug: project.slug,
      };
    })
    .filter((project) => project !== null);
  const editingEnabled = process.env.NODE_ENV === "development";

  return (
    <PageFrame>
      <section
        className={homeStyles.hero}
        data-ruler-track
        data-ruler-pad-bottom={220}
      >
        <div className={editorial.introBlock}>
          <div className={editorial.introCopy}>
            <div className={`${editorial.detailTopBar} ${editorial.introTopBar}`}>
              <h1 className={editorial.pageTitle}>My Projects</h1>
            </div>
            <p className={editorial.pageTagline}>
              Case studies, craft details, and experiments from the projects I&apos;ve been shaping recently.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <section className={homeStyles.section} data-ruler-track>
        <div className={homeStyles.sectionHeader}>
          <h2 className={homeStyles.sectionTitle}>Case Studies</h2>
          {editingEnabled ? (
            <Link href="/work/case-study/new/edit" className={editorial.utilityLink}>
              New case study
            </Link>
          ) : null}
        </div>
        {caseStudies.length === 0 ? (
          <p className={editorial.emptyState}>No projects published yet.</p>
        ) : (
          <div className={homeStyles.projectList}>
            {caseStudies.map((project) => (
              <article key={project.slug} className={homeStyles.projectRow}>
                <div className={homeStyles.projectContent}>
                  {project.category ? (
                    <div className={homeStyles.entryMeta}>
                      <span
                        data-ruler-tag
                        className={homeStyles.entryLabel}
                        style={{ color: getProjectColorCssValue(project.color) }}
                      >
                        {project.category}
                      </span>
                    </div>
                  ) : null}
                  <Link href={`/work/${project.slug}`} className={homeStyles.noteTitleLink}>
                    <h2 className={homeStyles.projectTitle}>
                      {getProjectDisplayTitle(project)}
                    </h2>
                  </Link>
                  {project.description ? (
                    <p className={homeStyles.projectDescription}>{project.description}</p>
                  ) : null}
                </div>
                {project.pinned ? <PinIcon /> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <Divider />

      <section className={homeStyles.section} data-ruler-track>
        <div className={homeStyles.sectionHeader}>
          <h2 id="craft-showcase" className={homeStyles.sectionTitle}>Craft Showcase</h2>
          {editingEnabled ? (
            <CraftShowcaseUploadButton className={editorial.utilityLink} />
          ) : null}
        </div>
        {craftProjects.length === 0 ? (
          <p className={editorial.emptyState}>No craft images published yet.</p>
        ) : (
          <CraftShowcase items={craftProjects} editingEnabled={editingEnabled} />
        )}
      </section>
    </PageFrame>
  );
}
