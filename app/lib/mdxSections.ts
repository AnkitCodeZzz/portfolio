import type { Root, RootContent } from "mdast";
import { gfmToMarkdown } from "mdast-util-gfm";
import { mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown } from "mdast-util-to-markdown";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

export type MdxSection = {
  key: string;
  source: string;
};

function normalizeMdxBooleanProps(source: string) {
  return source
    .replace(/\bdefaultOpen=\{true\}/g, 'defaultOpen="true"')
    .replace(/\bdefaultOpen=\{false\}/g, 'defaultOpen="false"');
}

function serializeSectionFromSource(source: string, children: RootContent[]) {
  if (children.length === 0) {
    return "";
  }

  const first = children[0];
  const last = children[children.length - 1];
  const start = first.position?.start.offset;
  const end = last.position?.end.offset;

  if (typeof start !== "number" || typeof end !== "number") {
    return toMarkdown(
      { type: "root", children } as Root,
      {
        extensions: [gfmToMarkdown(), mdxToMarkdown()],
      }
    ).trim();
  }

  return source.slice(start, end).trim();
}

export function splitMdxIntoSections(source: string): MdxSection[] {
  const normalizedSource = normalizeMdxBooleanProps(source);
  const tree = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkGfm)
    .parse(normalizedSource) as Root;
  const groups: RootContent[][] = [];
  let current: RootContent[] = [];

  const flush = () => {
    const sectionSource = serializeSectionFromSource(normalizedSource, current);

    if (sectionSource.length > 0) {
      groups.push([...current]);
    }

    current = [];
  };

  for (const node of tree.children) {
    if (node.type === "heading" && node.depth === 2 && current.length > 0) {
      flush();
    }

    current.push(node);
  }

  flush();

  if (groups.length === 0) {
    return normalizedSource.trim().length > 0
      ? [{ key: "section-0", source: normalizedSource.trim() }]
      : [];
  }

  return groups.map((children, index) => ({
    key: `section-${index}`,
    source: serializeSectionFromSource(normalizedSource, children),
  }));
}
