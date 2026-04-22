import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  SettingsPanel,
  type SettingsSearchParams,
} from "@/features/settings/components/settings-panel";

type SettingsPageProps = {
  searchParams: Promise<SettingsSearchParams>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;

  return (
    <SettingsPanel userId={userId} searchParams={params} variant="page" />
  );
}
