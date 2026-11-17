import { getTranslator } from "../../../i18n/server";
import type { Metadata } from "next";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import Competition from "../../../components/Competition";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t("Private competitions | ROBOTSOCCER"),
    description: t(
      "Create a private robot soccer room, connect your local team code and compete remotely with separate team credentials.",
    ),
  };
}
export default function Page() {
  return (
    <div className="public-site">
      <SiteHeader active="/compete" />
      <main className="competition-shell">
        <Competition />
      </main>
      <SiteFooter />
    </div>
  );
}
