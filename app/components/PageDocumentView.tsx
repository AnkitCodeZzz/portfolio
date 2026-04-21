import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Divider from "./Divider";
import { sharedMdxComponents } from "./MdxContentBlocks";
import PageFrame from "./PageFrame";
import { getPageDocumentDisplayTitle } from "../lib/pageDocuments";
import { splitMdxIntoSections } from "../lib/mdxSections";
import editorial from "../styles/editorial.module.css";

type PageDocumentViewPage = {
  key: "readme" | "now";
  title: string;
  description: string;
  content: string;
};

type PageDocumentViewProps = {
  page: PageDocumentViewPage;
};

export default function PageDocumentView({ page }: PageDocumentViewProps) {
  const contentSections = splitMdxIntoSections(page.content);
  const editingEnabled = process.env.NODE_ENV === "development";
  const route = `/${page.key}`;
  return (
    <PageFrame className={editorial.detailPage}>
      <section
        className={editorial.detailHeader}
        data-ruler-track
        data-ruler-pad-bottom={320}
      >
        <div className={editorial.introBlock}>
          <div className={editorial.introCopy}>
            <div className={`${editorial.detailTopBar} ${editorial.introTopBar}`}>
              <h1 className={editorial.pageTitle}>
                {getPageDocumentDisplayTitle(page)}
              </h1>
              {editingEnabled ? (
                <div className={editorial.utilityRow}>
                  <Link href={`${route}/edit`} className={editorial.utilityLink}>
                    Edit
                  </Link>
                </div>
              ) : null}
            </div>

            {page.description ? (
              <p className={editorial.pageTagline}>
                {page.description}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div
        className={`${editorial.readingSections} ${editorial.readingSectionsFlush}`.trim()}
      >
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
