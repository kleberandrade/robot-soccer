"use client";
import { useId } from "react";
import type { Locale } from "./config";
export default function LanguageFlag({ locale }: { locale: Locale }) {
  const id = useId();
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" className="language-flag">
      <defs>
        <clipPath id={id}>
          <circle cx="18" cy="18" r="17" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {locale === "pt-BR" ? (
          <>
            <path fill="#169b62" d="M0 0h36v36H0z" />
            <path fill="#ffdf35" d="m18 5 17 13-17 13L1 18Z" />
            <circle cx="18" cy="18" r="8" fill="#1846a1" />
            <path
              d="M10.5 16q9-3 15 4"
              fill="none"
              stroke="white"
              strokeWidth="1.6"
            />
            <circle cx="20" cy="23" r=".7" fill="white" />
          </>
        ) : locale === "es" ? (
          <>
            <path fill="#b51d2c" d="M0 0h36v36H0z" />
            <path fill="#ffcf35" d="M0 9h36v18H0z" />
          </>
        ) : (
          <>
            <path fill="#214278" d="M0 0h36v36H0z" />
            <path d="m0 0 36 36m0-36L0 36" stroke="white" strokeWidth="8" />
            <path d="m0 0 36 36m0-36L0 36" stroke="#c42d43" strokeWidth="3" />
            <path d="M18 0v36M0 18h36" stroke="white" strokeWidth="12" />
            <path d="M18 0v36M0 18h36" stroke="#c42d43" strokeWidth="7" />
          </>
        )}
      </g>
      <circle
        cx="18"
        cy="18"
        r="17"
        fill="none"
        stroke="white"
        strokeOpacity=".25"
      />
    </svg>
  );
}
