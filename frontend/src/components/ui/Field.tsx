import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

/** Design-system Field — inline validation message (UX floor: errors give the fix). */
export function Field({ label, error, hint, id, ...rest }: Props) {
  const fieldId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        className="field-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-err` : undefined}
        {...rest}
      />
      {hint}
      {error && (
        <span className="field-error-msg" id={`${fieldId}-err`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
