import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

/** Design-system Button — classes come from components.css (mockup-derived). */
export function Button({ variant = 'primary', children, className = '', ...rest }: Props) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'ghost',
  href,
  children,
}: {
  variant?: Variant;
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className={`btn btn-${variant}`}>
      {children}
    </a>
  );
}
