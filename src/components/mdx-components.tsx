import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import Image from "next/image";

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-foreground mt-8 mb-4 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold text-foreground mt-7 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-foreground/90 leading-relaxed mb-4">{children}</p>
  ),
  a: ({ href, children }) => {
    if (href?.startsWith("/")) {
      return (
        <Link href={href} className="text-[#223A70] underline underline-offset-2 hover:text-[#1a2d58]">
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#223A70] underline underline-offset-2 hover:text-[#1a2d58]">
        {children}
      </a>
    );
  },
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 mb-4 text-foreground/90">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 mb-4 text-foreground/90">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#C8A859] pl-4 italic text-muted-foreground my-4">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg bg-muted p-4 mb-4 text-sm font-mono">{children}</pre>
  ),
  hr: () => <hr className="my-8 border-border" />,
  img: ({ src, alt, width, height }) => {
    if (!src) return null;
    if (src.startsWith("http") || src.startsWith("/")) {
      return (
        <div className="my-4 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? ""}
            className="w-full h-auto object-cover"
          />
        </div>
      );
    }
    return null;
  },
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2 text-foreground/90">{children}</td>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
};
