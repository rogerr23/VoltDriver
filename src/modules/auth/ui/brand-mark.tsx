interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lime-400 text-slate-950 shadow-[0_12px_32px_rgba(163,230,53,0.22)]"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        >
          <path d="M13 2 5.5 13H11l-1 9 8.5-12H13V2Z" />
        </svg>
      </span>
      <span>
        <span className="block text-lg font-bold tracking-[-0.03em] text-white">
          VoltDriver
        </span>
        {!compact && (
          <span className="block text-xs font-medium text-slate-400">
            Seu trabalho elétrico
          </span>
        )}
      </span>
    </div>
  );
}
