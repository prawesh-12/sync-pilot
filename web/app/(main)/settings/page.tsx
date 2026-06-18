import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  SettingsPanel,
  type SettingsSearchParams,
} from "@/components/settings/settings-panel";

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

  return <SettingsPanel userId={userId} searchParams={params} />;
}
