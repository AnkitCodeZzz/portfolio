import Link from "next/link";
import Divider from "../components/Divider";
import PageFrame from "../components/PageFrame";
import PinIcon from "../components/PinIcon";
import { getProjectColorCssValue } from "../lib/projectMeta";
import {
  getAllProjects,
  getProjectDisplayTitle,
} from "../lib/projects";
import editorial from "../styles/editorial.module.css";
import homeStyles from "../page.module.css";

export default function WorkPage() {
  const projects = getAllProjects();
  const editingEnabled = process.env.NODE_ENV === "development";

  return (
    <PageFrame>
      <section className={homeStyles.hero} data-ruler-track>
        <div className={editorial.introBlock}>
          <div className={editorial.introCopy}>
            <div className={`${editorial.detailTopBar} ${editorial.introTopBar}`}>
              <h1 className={editorial.pageTitle}>My Projects</h1>
              {editingEnabled ? (
                <div className={editorial.utilityRow}>
                  <Link href="/work/new/edit" className={editorial.utilityLink}>
                    New project
                  </Link>
                </div>
              ) : null}
            </div>
            <p className={editorial.pageTagline}>
              Case studies, craft details, and experiments from the projects I&apos;ve been shaping recently.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <section className={homeStyles.section} data-ruler-track>
        {projects.length === 0 ? (
          <p className={editorial.emptyState}>No projects published yet.</p>
        ) : (
          <div className={homeStyles.projectList}>
            {projects.map((project) => (
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
    </PageFrame>
  );
}
