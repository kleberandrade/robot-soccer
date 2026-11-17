import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import DocumentLayout from "../../components/DocumentLayout";
import MarkdownContent from "../../components/MarkdownContent";
export const metadata: Metadata = {
  title: "VSSS rules and scope | ROBOTSOCCER",
  description:
    "The selected organizer-linked VSSS reference, dimensions, referee behavior and explicit simulator limitations.",
};
export default async function Rules() {
  const text = await readFile(
    path.resolve(process.cwd(), "../../docs/RULES.md"),
    "utf8",
  );
  return (
    <DocumentLayout active="/rules" label="RULES REFERENCE">
      <div className="document-banner">
        <span>SELECTED SOURCE</span>
        <p>Official LARC 2026 organizer link · PDF cover: Série A 2023</p>
      </div>
      <article className="article-body">
        <MarkdownContent>{text}</MarkdownContent>
      </article>
    </DocumentLayout>
  );
}
