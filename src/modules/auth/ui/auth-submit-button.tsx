interface AuthSubmitButtonProps {
  pending: boolean;
  idleLabel: string;
  pendingLabel: string;
}

export function AuthSubmitButton({
  pending,
  idleLabel,
  pendingLabel,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-5 text-base font-bold text-slate-950 shadow-[0_14px_40px_rgba(163,230,53,0.16)] transition hover:bg-lime-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300 disabled:cursor-wait disabled:opacity-65"
    >
      {pending && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5 animate-spin"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            className="opacity-25"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
      )}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
