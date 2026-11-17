import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "../../../i18n/config";
import { translate } from "../../../i18n/catalog";
import { policies, policySlugs, type PolicySlug } from "../../../i18n/policies";
import DocumentLayout from "../../../components/DocumentLayout";
import MarkdownContent from "../../../components/MarkdownContent";
const titles = {
  privacy: "Privacy policy",
  terms: "Terms of use",
  contributing: "Contribute",
};
export const dynamicParams = false;
export function generateStaticParams() {
  return policySlugs.map((info) => ({ info }));
}
type Props = { params: Promise<{ locale: string; info: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, info } = await params;
  return {
    title: `${isLocale(locale) ? translate(locale, titles[info as PolicySlug] ?? "Project") : "Project"} | ROBOTSOCCER`,
  };
}
export default async function InfoPage({ params }: Props) {
  const { locale, info } = await params;
  if (!isLocale(locale) || !policySlugs.includes(info as PolicySlug))
    notFound();
  return (
    <DocumentLayout active={`/${info}`} label="PROJECT & COMMUNITY">
      <article className="article-body">
        <MarkdownContent>
          {policies[locale][info as PolicySlug]}
        </MarkdownContent>
      </article>
    </DocumentLayout>
  );
}
