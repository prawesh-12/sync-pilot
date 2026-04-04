import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SettingsPopupSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
      {/* Email Integration Card */}
      <section className="space-y-2">
        <Card className="border-emerald-500/20 bg-emerald-500/3">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <Skeleton width="160px" height="24px" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton width="100px" height="24px" rounded="rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton width="200px" height="40px" />
          </CardContent>
        </Card>
      </section>

      {/* Signal Integration Card */}
      <section className="space-y-2">
        <Card className="border-[#A089E6]/30 bg-[#A089E6]/3">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton width="180px" height="24px" />
              <Skeleton width="220px" height="16px" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton width="120px" height="24px" rounded="rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton width="120px" height="16px" />
                  <Skeleton width="100%" height="40px" />
                </div>
                <div className="space-y-2">
                  <Skeleton width="130px" height="16px" />
                  <Skeleton width="100%" height="40px" />
                </div>
              </div>
              <Skeleton width="180px" height="40px" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
