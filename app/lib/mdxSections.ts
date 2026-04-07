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

function serializeSection(children: RootContent[]) {
  return toMarkdown(
    { type: "root", children } as Root,
    {
      extensions: [gfmToMarkdown(), mdxToMarkdown()],
    }
  ).trim();
}

export function splitMdxIntoSections(source: string): MdxSection[] {
  const tree = unified().use(remarkParse).use(remarkMdx).use(remarkGfm).parse(source) as Root;
  const groups: RootContent[][] = [];
  let current: RootContent[] = [];

  const flush = () => {
    const sectionSource = serializeSection(current);

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
    return source.trim().length > 0 ? [{ key: "section-0", source: source.trim() }] : [];
  }

  return groups.map((children, index) => ({
    key: `section-${index}`,
    source: serializeSection(children),
  }));
}
