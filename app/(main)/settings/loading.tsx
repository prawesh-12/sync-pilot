import { Skeleton } from "@/components/ui/Skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton width="180px" height="36px" />
          <Skeleton width="240px" height="20px" />
        </div>
        <Skeleton width="160px" height="36px" />
      </section>

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
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton width="200px" height="40px" />
            </div>
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
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton width="180px" height="40px" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
