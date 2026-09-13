import type { ComponentProps } from "react";

interface ChargingSessionFieldProps extends ComponentProps<"input"> {
  label: string;
  prefix?: string;
  unit?: string;
  errors?: string[];
}

export function ChargingSessionField({
  id,
  label,
  prefix,
  unit,
  errors,
  className,
  ...inputProps
}: ChargingSessionFieldProps) {
  const errorId = `${id}-error`;
  const hasError = Boolean(errors?.length);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-500">
            {prefix}
          </span>
        )}
        <input
          {...inputProps}
          id={id}
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
          className={`h-14 w-full rounded-2xl border bg-white/[0.045] px-4 text-base text-white outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-lime-300 focus:ring-4 focus:ring-lime-300/10 ${
            prefix ? "pl-12" : ""
          } ${unit ? "pr-24" : ""} ${
            hasError ? "border-red-400/80" : "border-white/10"
          } ${className ?? ""}`}
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-slate-500">
            {unit}
          </span>
        )}
      </div>
      {hasError && (
        <p id={errorId} className="mt-2 text-sm text-red-300">
          {errors?.[0]}
        </p>
      )}
    </div>
  );
}
