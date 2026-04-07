import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Divider from "../../components/Divider";
import PageFrame from "../../components/PageFrame";
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

  return (
    <PageFrame>
      <section className={editorial.detailHeader} data-ruler-track>
        <div className={editorial.detailBlock}>
          <span className={editorial.eyebrow}>/notes</span>
          <div className={editorial.detailCopy}>
            <div className={editorial.detailMeta}>
              <span className={editorial.date}>{note.date}</span>
              {note.tags.length > 0 ? (
                <div className={editorial.tagRow}>
                  {note.tags.map((tag, tagIndex) => (
                    <span key={`${note.slug}-${tag}`}>
                      <span className={`${editorial.tag} ${tagClasses[tagIndex % tagClasses.length]}`}>{tag}</span>
                      {tagIndex < note.tags.length - 1 ? <span className={homeStyles.dot}>•</span> : null}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <h1 className={editorial.detailTitle}>{note.title}</h1>
            {note.description ? <p className={editorial.detailDescription}>{note.description}</p> : null}
          </div>
        </div>
      </section>

      <Divider />

      <section className={editorial.contentSection} data-ruler-track>
        <div className={editorial.proseWrap}>
          <div className="prose">
            <MDXRemote source={note.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
