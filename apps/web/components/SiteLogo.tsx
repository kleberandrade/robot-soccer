export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 3h18l12 12v18L33 45H15L3 33V15L15 3Z"
        fill="#12252b"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M15 34V14h12a7 7 0 0 1 0 14H15m11 0 8 7"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M8 19v10m32-10v10"
        stroke="currentColor"
        strokeWidth="2"
        opacity=".4"
      />
      <circle cx="35" cy="11" r="2.2" fill="currentColor" />
    </svg>
  );
}
export default function SiteLogo() {
  return (
    <span className="logo-lockup">
      <LogoMark className="logo-mark" />
      <span className="logo-wordmark">
        robot<span>soccer</span>
        <i aria-hidden="true">●</i>
      </span>
    </span>
  );
}
