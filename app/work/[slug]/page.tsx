import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Breadcrumbs from "../../components/Breadcrumbs";
import DeleteProjectButton from "../../components/DeleteProjectButton";
import Divider from "../../components/Divider";
import { sharedMdxComponents } from "../../components/MdxContentBlocks";
import NoteScrollRestorer from "../../components/NoteScrollRestorer";
import PageFrame from "../../components/PageFrame";
import PinIcon from "../../components/PinIcon";
import { splitMdxIntoSections } from "../../lib/mdxSections";
import { getProjectColorCssValue } from "../../lib/projectMeta";
import {
  getAllProjects,
  getProject,
  getProjectDisplayTitle,
} from "../../lib/projects";
import editorial from "../../styles/editorial.module.css";

function formatSlugLabel(slug: string) {
  return slug.replace(/[-_]+/g, " ").trim().toLowerCase();
}

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export default async function WorkProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const editingEnabled = process.env.NODE_ENV === "development";
  const contentSections = splitMdxIntoSections(project.content);
  const hasMeta = Boolean(project.category) || project.pinned;

  return (
    <PageFrame className={editorial.detailPage}>
      <NoteScrollRestorer storageKey={`work-scroll:${project.slug}`} />
      <section className={editorial.detailHeader} data-ruler-track>
        <div className={editorial.detailBlock}>
          <div className={editorial.detailLead}>
            <div className={editorial.detailTopBar}>
              <Breadcrumbs
                items={[
                  { label: "work", href: "/work" },
                  { label: formatSlugLabel(project.slug) },
                ]}
              />
              {editingEnabled ? (
                <div className={editorial.utilityRow}>
                  <Link href={`/work/${project.slug}/edit`} className={editorial.utilityLink}>
                    Edit
                  </Link>
                  <DeleteProjectButton
                    slug={project.slug}
                    className={`${editorial.utilityLink} ${editorial.utilityButton} ${editorial.utilityLinkDanger}`}
                  />
                </div>
              ) : null}
            </div>

            <div className={editorial.detailHero}>
              <h1 className={`${editorial.detailTitle} ${editorial.detailHeroTitle}`}>
                {getProjectDisplayTitle(project)}
              </h1>
              {hasMeta ? (
                <div className={editorial.detailMetaRow}>
                  {project.category ? (
                    <div className={editorial.tagRow}>
                      <span
                        data-ruler-tag
                        className={editorial.tag}
                        style={{ color: getProjectColorCssValue(project.color) }}
                      >
                        {project.category}
                      </span>
                    </div>
                  ) : null}
                  {project.pinned ? <PinIcon className={editorial.detailPin} /> : null}
                </div>
              ) : null}
              {project.description ? (
                <p className={`${editorial.detailDescription} ${editorial.detailHeroDescription}`}>
                  {project.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className={editorial.readingSections}>
        {contentSections.length > 0 ? (
          <Divider className={editorial.detailContentDivider} />
        ) : null}
        {contentSections.map((section) => (
          <section
            key={section.key}
            className={`${editorial.contentSection} ${editorial.readingSection}`}
            data-ruler-track
          >
            <div className={editorial.proseWrap}>
              <div className="prose">
                <MDXRemote
                  source={section.source}
                  components={sharedMdxComponents}
                  options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </PageFrame>
  );
}
