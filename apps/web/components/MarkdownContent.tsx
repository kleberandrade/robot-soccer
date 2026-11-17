import Image from "next/image";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
export function contentUrl(url: string) {
  const mapped: Record<string, string> = {
    "wiring.svg": "/hardware/wiring.svg",
    "electronics.svg": "/hardware/electronics.svg",
    "connections.csv": "/hardware/connections.csv",
    "case/README.md": "/hardware/case",
    "case/dimensions.svg": "/hardware/case/dimensions.svg",
    "case/dimensions.json": "/hardware/case/dimensions.json",
    "bom.csv": "/hardware/bom.csv",
    "pinmap.csv": "/hardware/pinmap.csv",
    "../docs/PROTOCOL.md": "/docs/protocol",
    "docs/PROTOCOL.md": "/docs/protocol",
    "docs/REMOTE_COMPETITION.md": "/docs/remote-competition",
    "docs/adr/0002-private-remote-rooms.md": "/docs/private-room-design",
    "docs/RULES.md": "/rules",
    "docs/SECURITY.md": "/docs/security",
    "docs/WORK_LOG.md": "/docs/verification",
    "hardware/README.md": "/hardware",
    "docs/assets/match-lab-v2.jpg": "/learning/laboratory.jpg",
    "articles/first-match.md": "/docs/first-match",
    "articles/referee-and-restarts.md": "/docs/referee-and-restarts",
    "docs/articles/first-match.md": "/docs/first-match",
    "docs/articles/differential-drive.md": "/docs/differential-drive",
    "docs/articles/referee-and-restarts.md": "/docs/referee-and-restarts",
    "docs/articles/camera-and-markers.md": "/docs/camera-and-markers",
    "docs/adr/0001-server-batches.md": "/docs/architecture",
    "docs/legacy/README.md":
      "https://github.com/kleberandrade/robot-soccer/blob/master/docs/legacy/README.md",
    LICENSE:
      "https://github.com/kleberandrade/robot-soccer/blob/master/LICENSE",
  };
  if (mapped[url]) return mapped[url];
  if (!url.startsWith("/") && !url.startsWith("#") && !/^[a-z]+:/i.test(url))
    return "https://github.com/kleberandrade/robot-soccer/blob/master/" + url;
  return defaultUrlTransform(url);
}
export default function MarkdownContent({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      urlTransform={contentUrl}
      components={{
        img: ({ src, alt }) =>
          typeof src === "string" ? (
            <Image
              src={src}
              alt={alt ?? ""}
              width={src.endsWith(".jpg") ? 1905 : 800}
              height={src.endsWith(".jpg") ? 866 : 380}
              unoptimized={src.endsWith(".svg") || src.startsWith("https:")}
            />
          ) : null,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
