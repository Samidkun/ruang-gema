import type { ReactNode } from 'react';

/** State surfaces: empty/loading/error teach the next action (UX floor). */
export function StatePanel({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-panel" role="status">
      <h2 className="state-title">{title}</h2>
      <p className="state-desc">{desc}</p>
      {action}
    </div>
  );
}

export function Skeleton({ height = 16, width = '100%' }: { height?: number; width?: string }) {
  return <div className="skeleton-box" style={{ height, width }} aria-hidden="true" />;
}

export function RoomListSkeleton() {
  return (
    <div role="status" aria-label="Memuat daftar ruangan">
      {[0, 1, 2, 3].map((i) => (
        <div className="room-item-card" key={i} style={{ marginBottom: 12 }}>
          <Skeleton height={20} width="55%" />
          <Skeleton height={16} width="35%" />
          <Skeleton height={14} width="70%" />
        </div>
      ))}
    </div>
  );
}
