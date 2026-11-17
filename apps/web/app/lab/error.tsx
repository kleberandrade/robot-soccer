"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-loading">
      <h1>This page could not load</h1>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
