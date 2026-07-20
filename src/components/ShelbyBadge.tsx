export function ShelbyBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 ${className}`}
    >
      <span aria-hidden>⚡</span> Served via Shelby
    </span>
  );
}
