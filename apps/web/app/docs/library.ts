export const articles = [
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
] as const;
