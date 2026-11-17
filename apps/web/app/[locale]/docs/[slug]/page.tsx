import { localizeDocument } from "../../../../i18n/documents";
import { getTranslator } from "../../../../i18n/server";

import { T } from "../../../../i18n/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { LocalLink as Link } from "../../../../i18n/client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MarkdownContent from "../../../../components/MarkdownContent";
import DocumentLayout from "../../../../components/DocumentLayout";
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
  const t = await getTranslator();
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  return {
    title: `${t(article?.title ?? "Article")} | ROBOT-SOCCER`,
    description: article ? t(article.summary) : undefined,
  };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslator();
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
        <MarkdownContent>
          {await localizeDocument(slug, markdown)}
        </MarkdownContent>
      </article>
      <nav className="article-next" aria-label={t("Other articles")}>
        {articles
          .filter((a) => a.slug !== slug)
          .map((a) => (
            <Link key={a.slug} href={`/docs/${a.slug}`}>
              <T>{a.title}</T>
            </Link>
          ))}
      </nav>
    </DocumentLayout>
  );
}
