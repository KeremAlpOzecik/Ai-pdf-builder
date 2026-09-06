export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path
        d="M10.2 9.2h9.4a1.8 1.8 0 0 1 1.8 1.8V23H12a1.8 1.8 0 0 1-1.8-1.8V9.2Z"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path
        d="M13.4 9.2V7.6A1.4 1.4 0 0 1 14.8 6.2h8.2A1.6 1.6 0 0 1 24.6 7.8V20.4"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="1.45"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M13.1 14.2h6.6M13.1 17.4h4.4"
        stroke="var(--primary-foreground)"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
    </svg>
  );
}
