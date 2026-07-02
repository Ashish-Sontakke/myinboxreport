export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="6"
        y="6"
        width="20"
        height="20"
        rx="6"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <circle cx="22" cy="10" r="3" fill="currentColor" />
    </svg>
  )
}
