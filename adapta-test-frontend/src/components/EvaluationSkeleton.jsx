import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EvaluationSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-1/4 mb-2" />
          <Skeleton className="h-7 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}