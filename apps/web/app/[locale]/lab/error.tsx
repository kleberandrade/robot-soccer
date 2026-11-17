"use client";

import { T } from "../../../i18n/client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-loading">
      <h1>
        <T>{"This page could not load"}</T>
      </h1>
      <button onClick={reset}>
        <T>{"Try again"}</T>
      </button>
    </div>
  );
}
