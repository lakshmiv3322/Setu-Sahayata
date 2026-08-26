'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SchemeCardSkeleton() {
  return (
    <Card className="border-trust-100 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl bg-trust-100" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 bg-trust-100" />
            <Skeleton className="h-3 w-28 bg-trust-100" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full bg-trust-100" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg bg-trust-50" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-24 bg-trust-100" />
        <Skeleton className="h-9 w-28 rounded-xl bg-trust-100" />
      </div>
    </Card>
  );
}
