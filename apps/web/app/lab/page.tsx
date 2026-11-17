import type { Metadata } from "next";
import MatchLab from "../../components/MatchLab";
export const metadata: Metadata = {
  title: "Laboratory | ROBOTSOCCER",
  description:
    "Inspect synchronized 3D and camera views, test autonomous teams and manage a VSSS match.",
};
export default function Page() {
  return <MatchLab />;
}
