import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  SettingsPanel,
  type SettingsSearchParams,
} from "@/features/settings/components/settings-panel";

type SettingsPageProps = {
  searchParams: Promise<SettingsSearchParams>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;

  return (
    <SettingsPanel userId={userId} searchParams={params} variant="page" />
  );
}
