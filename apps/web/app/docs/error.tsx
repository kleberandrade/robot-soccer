"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="docs-shell">
      <h1>The article could not load</h1>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
