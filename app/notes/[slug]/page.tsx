import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Breadcrumbs from "../../components/Breadcrumbs";
import PageFrame from "../../components/PageFrame";
import { splitMdxIntoSections } from "../../lib/mdxSections";
import { getAllNotes, getNote } from "../../lib/notes";
import editorial from "../../styles/editorial.module.css";
import homeStyles from "../../page.module.css";

const tagClasses = [
  homeStyles.tagOlive,
  homeStyles.tagViolet,
  homeStyles.tagBlue,
  homeStyles.tagBrown,
  homeStyles.tagRose,
];

export function generateStaticParams() {
  return getAllNotes().map((note) => ({ slug: note.slug }));
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(slug);

  if (!note) {
    notFound();
  }

  const contentSections = splitMdxIntoSections(note.content);

  return (
    <PageFrame>
      <section className={editorial.detailHeader} data-ruler-track>
        <div className={editorial.detailBlock}>
          <Breadcrumbs
            items={[
              { label: "notes", href: "/notes" },
              { label: note.title },
            ]}
          />
          <div className={editorial.detailCopy}>
            <h1 className={editorial.detailTitle}>{note.title}</h1>
            {note.description ? <p className={editorial.detailDescription}>{note.description}</p> : null}
          </div>
        </div>
      </section>

      <div className={editorial.readingSections}>
        {contentSections.map((section) => (
          <section
            key={section.key}
            className={`${editorial.contentSection} ${editorial.readingSection}`}
            data-ruler-track
          >
            <div className={editorial.proseWrap}>
              <div className="prose">
                <MDXRemote source={section.source} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
              </div>
            </div>
          </section>
        ))}
      </div>

      {note.tags.length > 0 ? (
        <section className={`${editorial.contentSection} ${editorial.detailFooterMeta}`}>
          <div className={editorial.tagRow}>
            {note.tags.map((tag, tagIndex) => (
              <span key={`${note.slug}-footer-${tag}`}>
                <span
                  data-ruler-tag
                  className={`${editorial.tag} ${tagClasses[tagIndex % tagClasses.length]}`}
                >
                  {tag}
                </span>
                {tagIndex < note.tags.length - 1 ? <span className={homeStyles.dot}>•</span> : null}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </PageFrame>
  );
}
