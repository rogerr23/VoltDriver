import type { InputHTMLAttributes } from "react";

interface MonthlyGoalFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  prefix?: string;
  unit?: string;
  errors?: string[];
}

export function MonthlyGoalField({
  id,
  label,
  prefix,
  unit,
  errors,
  className,
  ...inputProps
}: MonthlyGoalFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-semibold text-slate-400">
            {prefix}
          </span>
        )}
        <input
          id={id}
          aria-describedby={errors ? errorId : undefined}
          aria-invalid={Boolean(errors?.length)}
          className={`min-h-14 w-full rounded-2xl border bg-white/[0.04] px-4 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-lime-300 focus:ring-2 focus:ring-lime-300/20 ${
            prefix ? "pl-12" : ""
          } ${unit ? "pr-14" : ""} ${
            errors?.length ? "border-red-300/70" : "border-white/10"
          } ${className ?? ""}`}
          {...inputProps}
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-slate-400">
            {unit}
          </span>
        )}
      </div>
      {errors?.[0] && (
        <p id={errorId} className="mt-2 text-sm text-red-300">
          {errors[0]}
        </p>
      )}
    </div>
  );
}
