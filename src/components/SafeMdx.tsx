import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";

const options = { parseFrontmatter: true } as const;

/**
 * Escape MDX-significant characters in prose while leaving fenced/inline code
 * untouched. Admin-uploaded content is markdown, not JSX — stray `{ }` (e.g.
 * "¥{1000}") and lone `<` otherwise make acorn fail to parse expressions.
 */
function escapeProse(src: string): string {
  // Capturing split keeps code segments at odd indices.
  const parts = src.split(/(```[\s\S]*?```|`[^`]*`)/g);
  return parts
    .map((seg, i) =>
      i % 2 === 1
        ? seg
        : seg
            .replace(/\{/g, "\\{")
            .replace(/\}/g, "\\}")
            .replace(/<(?![A-Za-z/!])/g, "&lt;"),
    )
    .join("");
}

/**
 * Render MDX defensively: try as-authored, retry with prose escaped, and
 * finally fall back to plain text — never throw (which would 500 the page).
 */
export async function SafeMdx({ source }: { source: string }) {
  try {
    return await MDXRemote({ source, components: mdxComponents, options });
  } catch {
    try {
      return await MDXRemote({
        source: escapeProse(source),
        components: mdxComponents,
        options,
      });
    } catch {
      return (
        <pre className="whitespace-pre-wrap wrap-break-words font-sans text-sm leading-relaxed text-foreground/80">
          {source}
        </pre>
      );
    }
  }
}
