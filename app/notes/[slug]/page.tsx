import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import Breadcrumbs from "../../components/Breadcrumbs";
import DeleteNoteButton from "../../components/DeleteNoteButton";
import Divider from "../../components/Divider";
import { sharedMdxComponents } from "../../components/MdxContentBlocks";
import NoteScrollRestorer from "../../components/NoteScrollRestorer";
import PageFrame from "../../components/PageFrame";
import PinIcon from "../../components/PinIcon";
import ScrollSectionNav from "../../components/ScrollSectionNav";
import { splitMdxIntoSections } from "../../lib/mdxSections";
import { getAllNotes, getNote, getNoteDisplayTitle } from "../../lib/notes";
import { getNoteTagColorCssValue, getNoteTagLabel } from "../../lib/noteTags";
import editorial from "../../styles/editorial.module.css";
import homeStyles from "../../page.module.css";

function formatSlugLabel(slug: string) {
  return slug.replace(/[-_]+/g, " ").trim().toLowerCase();
}

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

  const editingEnabled = process.env.NODE_ENV === "development";
  const contentSections = splitMdxIntoSections(note.content);
  const hasMeta = note.tags.length > 0 || note.pinned;
  const displayTitle = getNoteDisplayTitle(note);

  return (
    <PageFrame className={editorial.detailPage}>
      <NoteScrollRestorer storageKey={`note-scroll:${note.slug}`} />
      <section
        className={`${editorial.detailHeader} ${editorial.detailHeaderWithBreadcrumbs}`}
        data-ruler-track
        data-ruler-pad-bottom={220}
      >
        <div className={editorial.detailBlock}>
          <div className={`${editorial.detailLead} ${editorial.detailLeadWithBreadcrumbs}`}>
            <div className={`${editorial.detailTopBar} ${editorial.detailTopBarWithBreadcrumbs}`}>
              <Breadcrumbs
                items={[
                  { label: "notes", href: "/notes" },
                  { label: formatSlugLabel(note.slug) },
                ]}
              />
              {editingEnabled ? (
                <div className={editorial.utilityRow}>
                  <Link href={`/notes/${note.slug}/edit`} className={editorial.utilityLink}>
                    Edit
                  </Link>
                  <DeleteNoteButton
                    slug={note.slug}
                    className={`${editorial.utilityLink} ${editorial.utilityButton} ${editorial.utilityLinkDanger}`}
                  />
                </div>
              ) : null}
            </div>

            <div className={editorial.detailHero}>
              <h1 className={`${editorial.detailTitle} ${editorial.detailHeroTitle}`}>
                {displayTitle}
              </h1>
              {hasMeta ? (
                <div className={editorial.detailMetaRow}>
                  {note.tags.length > 0 ? (
                    <div className={editorial.tagRow}>
                      {note.tags.map((tag, tagIndex) => (
                        <span className={homeStyles.tagMetaItem} key={`${note.slug}-header-${tag}`}>
                          <span
                            data-ruler-tag
                            className={editorial.tag}
                            style={{ color: getNoteTagColorCssValue(tag) }}
                          >
                            {getNoteTagLabel(tag)}
                          </span>
                          {tagIndex < note.tags.length - 1 ? <span className={homeStyles.dot}>•</span> : null}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {note.pinned ? <PinIcon className={editorial.detailPin} /> : null}
                </div>
              ) : null}
              {note.description ? (
                <p className={`${editorial.detailDescription} ${editorial.detailHeroDescription}`}>
                  {note.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className={`${editorial.readingSections} ${editorial.readingSectionsFlush}`.trim()}>
        {contentSections.length > 0 ? <Divider className={editorial.detailContentDivider} /> : null}
        <div className={editorial.readingLayout}>
          <ScrollSectionNav
            items={contentSections.map((section) => ({
              anchorId: section.anchorId,
              title: section.title,
            }))}
          />
          <div className={editorial.readingContent}>
            {contentSections.map((section) => (
              <section
                key={section.key}
                id={section.anchorId}
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
        </div>
      </div>
    </PageFrame>
  );
}
