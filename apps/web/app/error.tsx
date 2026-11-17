"use client";

import { T } from "../i18n/client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>
        <T>{"The laboratory could not load"}</T>
      </h1>
      <button onClick={reset}>
        <T>{"Try again"}</T>
      </button>
    </main>
  );
}
