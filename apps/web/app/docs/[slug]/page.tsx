import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { articles } from "../library";
export const dynamicParams = false;
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  return {
    title: `${article?.title ?? "Article"} | ROBOT-SOCCER`,
    description: article?.summary,
  };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  const markdown = await readFile(
    path.resolve(process.cwd(), "../../docs/articles", `${article.slug}.md`),
    "utf8",
  );
  return (
    <main className="docs-shell">
      <header className="docs-nav">
        <Link href="/docs">← Learning library</Link>
        <Link href="/">Open match lab ↗</Link>
      </header>
      <article className="article-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
      <nav className="article-next" aria-label="Other articles">
        {articles
          .filter((a) => a.slug !== slug)
          .map((a) => (
            <Link key={a.slug} href={`/docs/${a.slug}`}>
              {a.title} →
            </Link>
          ))}
      </nav>
    </main>
  );
}
