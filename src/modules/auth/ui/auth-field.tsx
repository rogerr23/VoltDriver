import type { ComponentProps } from "react";

interface AuthFieldProps extends ComponentProps<"input"> {
  label: string;
  errors?: string[];
}

export function AuthField({
  id,
  label,
  errors,
  className,
  ...inputProps
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  const hasError = Boolean(errors?.length);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <input
        {...inputProps}
        id={id}
        aria-describedby={hasError ? errorId : undefined}
        aria-invalid={hasError}
        className={`h-14 w-full rounded-2xl border bg-white/[0.055] px-4 text-base text-white outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-lime-300 focus:ring-4 focus:ring-lime-300/10 ${
          hasError ? "border-red-400/80" : "border-white/10"
        } ${className ?? ""}`}
      />
      {hasError && (
        <p id={errorId} className="mt-2 text-sm text-red-300">
          {errors?.[0]}
        </p>
      )}
    </div>
  );
}
