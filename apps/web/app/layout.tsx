import { getTranslator, pageAlternates } from "../i18n/server";
import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "../i18n/client";
import { getLocale } from "../i18n/server";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    metadataBase: new URL("https://robot-soccer.vercel.app"),
    alternates: await pageAlternates(),
    title: t("ROBOT-SOCCER | Autonomous match lab"),
    description: t(
      "A deterministic 3×3 robot soccer laboratory with a live 3D arena, autonomous teams and ESP32 reference hardware.",
    ),
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
