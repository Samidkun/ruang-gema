import type { ReactNode } from 'react';

type Tone = 'neutral' | 'ok' | 'warn' | 'danger';

/** Design-system Badge — status is ALWAYS colour + label, never colour alone. */
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  const cls = tone === 'neutral' ? 'badge-status' : `badge-status badge-${tone}`;
  return <span className={cls}>{children}</span>;
}
