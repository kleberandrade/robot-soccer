import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MarkdownContent from "../../../components/MarkdownContent";
import DocumentLayout from "../../../components/DocumentLayout";
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
  const markdown = article.source
    ? await article.source()
    : await readFile(
        path.resolve(
          process.cwd(),
          "../../docs/articles",
          `${article.slug}.md`,
        ),
        "utf8",
      );
  return (
    <DocumentLayout>
      <article className="article-body">
        <MarkdownContent>{markdown}</MarkdownContent>
      </article>
      <nav className="article-next" aria-label="Other articles">
        {articles
          .filter((a) => a.slug !== slug)
          .map((a) => (
            <Link key={a.slug} href={`/docs/${a.slug}`}>
              {a.title}
            </Link>
          ))}
      </nav>
    </DocumentLayout>
  );
}
