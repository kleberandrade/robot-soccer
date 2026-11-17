import { readFile } from "node:fs/promises";
import path from "node:path";
export type ArticleEntry = {
  slug: string;
  title: string;
  summary: string;
  source?: () => Promise<string>;
};
export const articles: ArticleEntry[] = [
  {
    slug: "first-match",
    title: "1. Your first match and two example teams",
    summary:
      "Run Koativa against Circuit, read their code, change one decision, and compare the result.",
  },
  {
    slug: "differential-drive",
    title: "2. Differential drive: from two wheels to a moving robot",
    summary:
      "Understand meters, axle track, acceleration, heading, wheel angles, and what the model leaves out.",
  },
  {
    slug: "referee-and-restarts",
    title: "3. Fouls, penalties, and the referee whistle",
    summary:
      "Reproduce a penalty, understand automatic versus official decisions, and read the event history.",
  },
  {
    slug: "camera-and-markers",
    title: "4. Camera, markers, and scale",
    summary:
      "Connect the overhead projection to the 3D scene and reason about height, tilt, FOV, and colored tags.",
  },
  {
    slug: "getting-started",
    title: "Project setup and overview",
    summary: "Install the monorepo, run a preview and configure persistence.",
    source: () =>
      readFile(path.resolve(process.cwd(), "../../README.md"), "utf8"),
  },
  {
    slug: "protocol",
    title: "API and radio protocol",
    summary:
      "Coordinates, commands, checkpoints and authenticated radio packets.",
    source: () =>
      readFile(path.resolve(process.cwd(), "../../docs/PROTOCOL.md"), "utf8"),
  },
  {
    slug: "remote-competition",
    title: "Connect your code to a private competition",
    summary: "Join a team and compete remotely with your own local program.",
    source: () =>
      readFile(
        path.resolve(process.cwd(), "../../docs/REMOTE_COMPETITION.md"),
        "utf8",
      ),
  },
  {
    slug: "architecture",
    title: "How the simulation server works",
    summary:
      "Bounded server batches, authoritative checkpoints and revision checks.",
    source: () =>
      readFile(
        path.resolve(process.cwd(), "../../docs/adr/0001-server-batches.md"),
        "utf8",
      ),
  },
  {
    slug: "private-room-design",
    title: "How private rooms keep teams synchronized",
    summary:
      "The design, failure handling and trade-offs of remote lockstep play.",
    source: () =>
      readFile(
        path.resolve(
          process.cwd(),
          "../../docs/adr/0002-private-remote-rooms.md",
        ),
        "utf8",
      ),
  },
  {
    slug: "security",
    title: "Security and operating scope",
    summary: "Credentials, execution boundaries, radio assumptions and limits.",
    source: () =>
      readFile(path.resolve(process.cwd(), "../../docs/SECURITY.md"), "utf8"),
  },
  {
    slug: "verification",
    title: "Implementation and verification log",
    summary:
      "Checks performed, publication records and remaining physical validation.",
    source: () =>
      readFile(path.resolve(process.cwd(), "../../docs/WORK_LOG.md"), "utf8"),
  },
];
