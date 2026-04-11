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
  title: string;
  anchorId: string;
};

type HeadingLikeNode = {
  type?: string;
  value?: string;
  alt?: string;
  children?: HeadingLikeNode[];
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

function extractTextContent(node: HeadingLikeNode | undefined): string {
  if (!node) {
    return "";
  }

  if (
    node.type === "text" ||
    node.type === "inlineCode" ||
    node.type === "code" ||
    node.type === "html"
  ) {
    return typeof node.value === "string" ? node.value : "";
  }

  if (node.type === "image") {
    return typeof node.alt === "string" ? node.alt : "";
  }

  if (!Array.isArray(node.children) || node.children.length === 0) {
    return "";
  }

  return node.children.map((child) => extractTextContent(child)).join("");
}

function normalizeSectionTitle(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function slugifySectionTitle(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "section";
}

function resolveSectionTitle(children: RootContent[], index: number) {
  const heading = children.find(
    (node) => node.type === "heading" && node.depth === 2
  );

  if (heading) {
    const headingText = normalizeSectionTitle(
      extractTextContent(heading as HeadingLikeNode)
    );

    if (headingText) {
      return headingText;
    }
  }

  if (index === 0) {
    return "Overview";
  }

  return `Section ${index + 1}`;
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
      ? [
          {
            key: "section-0",
            source: normalizedSource.trim(),
            title: "Overview",
            anchorId: "overview",
          },
        ]
      : [];
  }

  const anchorCounts = new Map<string, number>();

  return groups.map((children, index) => {
    const title = resolveSectionTitle(children, index);
    const anchorBase = slugifySectionTitle(title);
    const anchorCount = anchorCounts.get(anchorBase) ?? 0;
    const anchorId =
      anchorCount === 0 ? anchorBase : `${anchorBase}-${anchorCount + 1}`;

    anchorCounts.set(anchorBase, anchorCount + 1);

    return {
      key: `section-${index}`,
      source: serializeSectionFromSource(normalizedSource, children),
      title,
      anchorId,
    };
  });
}
