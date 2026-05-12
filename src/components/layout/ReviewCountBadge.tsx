'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface ReviewCountBadgeProps {
  readonly initialCount: number;
}

export const REVIEW_COUNT_STALE_EVENT = 'review-count-stale';

export function dispatchReviewCountStale() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(REVIEW_COUNT_STALE_EVENT));
  }
}

export function ReviewCountBadge({ initialCount }: ReviewCountBadgeProps) {
  const [count, setCount] = useState(initialCount);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/review/count');
      if (!res.ok) return;
      const json = await res.json() as { count: number };
      setCount(json.count);
    } catch {
      // silent — badge stays at last known value
    }
  }, []);

  useEffect(() => {
    // Refresh once on mount to catch anything stale from SSR
    void refresh();

    // Re-fetch whenever another part of the app signals the count changed
    window.addEventListener(REVIEW_COUNT_STALE_EVENT, refresh);
    // Re-fetch when the user returns to the tab
    window.addEventListener('focus', refresh);

    return () => {
      window.removeEventListener(REVIEW_COUNT_STALE_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  if (count === 0) return null;

  return (
    <Link
      href="/review"
      className="bg-node-assumption-fg text-white text-xs px-2.5 py-0.5 rounded-full"
    >
      {count} awaiting review
    </Link>
  );
}
