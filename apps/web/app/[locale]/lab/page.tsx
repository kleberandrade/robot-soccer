import { getTranslator } from "../../../i18n/server";
import type { Metadata } from "next";
import MatchLab from "../../../components/MatchLab";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: t("Laboratory | ROBOTSOCCER"),
    description: t(
      "Inspect synchronized 3D and camera views, test autonomous teams and manage a VSSS match.",
    ),
  };
}
export default function Page() {
  return <MatchLab />;
}
