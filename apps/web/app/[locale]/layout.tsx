import { notFound } from "next/navigation";
import { isLocale, locales } from "../../i18n/config";
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function LocaleLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  if (!isLocale((await params).locale)) notFound();
  return children;
}
