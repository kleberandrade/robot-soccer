"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>The laboratory could not load</h1>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
