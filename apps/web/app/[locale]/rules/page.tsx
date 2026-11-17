import { getTranslator } from "../../../i18n/server";
import { localizeDocument } from "../../../i18n/documents";

import { T } from "../../../i18n/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import DocumentLayout from "../../../components/DocumentLayout";
import MarkdownContent from "../../../components/MarkdownContent";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t("VSSS rules and scope | ROBOTSOCCER"),
    description: t(
      "The selected organizer-linked VSSS reference, dimensions, referee behavior and explicit simulator limitations.",
    ),
  };
}
export default async function Rules() {
  const text = await readFile(
    path.resolve(process.cwd(), "../../docs/RULES.md"),
    "utf8",
  );
  return (
    <DocumentLayout active="/rules" label="RULES REFERENCE">
      <div className="document-banner">
        <span>
          <T>{"SELECTED SOURCE"}</T>
        </span>
        <p>
          <T>{"Official LARC 2026 organizer link · PDF cover: Série A 2023"}</T>
        </p>
      </div>
      <article className="article-body">
        <MarkdownContent>
          {await localizeDocument("rules", text)}
        </MarkdownContent>
      </article>
    </DocumentLayout>
  );
}
