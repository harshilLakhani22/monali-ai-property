'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function PendingJobPoller({ hasPendingJobs }: { hasPendingJobs: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasPendingJobs) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [hasPendingJobs, router]);

  return null;
}
