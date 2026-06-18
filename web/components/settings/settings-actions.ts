"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  disconnectSignalIntegration,
  removeGmailAccount,
  setGmailAccountActive,
  upsertSignalIntegration,
  upsertUser,
} from "@/db/queries";
import { buildSignalDeviceName } from "@/features/signal/signal";

const PHONE_NUMBER_PATTERN = /^\+\d{8,15}$/;

function revalidateSettings() {
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}

export async function saveSignalIntegrationAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;

  if (!userId || !email) {
    redirect("/sign-in");
  }

  const senderNumber = normalizePhoneNumber(formData.get("senderNumber"));
  const recipientNumber = normalizePhoneNumber(formData.get("recipientNumber"));
  const validationError = validateNumbers(senderNumber, recipientNumber);

  if (validationError) {
    redirect(buildSignalSettingsUrl("failed", validationError));
  }

  await upsertUser({ id: userId, email });
  await upsertSignalIntegration(userId, {
    deviceName: buildSignalDeviceName(userId),
    senderNumber,
    recipientNumber,
  });

  revalidateSettings();
  redirect(buildSignalSettingsUrl("saved"));
}

export async function disconnectSignalAction() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  await disconnectSignalIntegration(userId);
  revalidateSettings();
  redirect(buildSignalSettingsUrl("disconnected"));
}

export async function toggleGmailAccountAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  const integrationId = String(formData.get("integrationId") ?? "");
  const nextActive = formData.get("nextActive") === "true";

  if (integrationId) {
    await setGmailAccountActive(integrationId, userId, nextActive);
    revalidateSettings();
  }

  redirect(settingsBasePath());
}

export async function removeGmailAccountAction(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  const integrationId = String(formData.get("integrationId") ?? "");

  if (integrationId) {
    await removeGmailAccount(integrationId, userId);
    revalidateSettings();
  }

  redirect(buildGmailSettingsUrl("disconnected"));
}

function normalizePhoneNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, "");
}

function validateNumbers(senderNumber: string, recipientNumber: string) {
  if (!PHONE_NUMBER_PATTERN.test(senderNumber)) {
    return "Sender number must be in E.164 format (example: +14155550123).";
  }

  if (!PHONE_NUMBER_PATTERN.test(recipientNumber)) {
    return "Recipient number must be in E.164 format (example: +14155550123).";
  }

  return "";
}

function settingsBasePath() {
  return "/settings";
}

function appendQuery(basePath: string, query: string) {
  const separator = basePath.includes("?") ? "&" : "?";

  return `${basePath}${separator}${query}`;
}

function buildSignalSettingsUrl(
  signalStatus: "saved" | "failed" | "disconnected",
  signalError?: string,
) {
  let url = appendQuery(settingsBasePath(), `signal=${signalStatus}`);

  if (signalError) {
    url += `&signalError=${encodeURIComponent(signalError)}`;
  }

  return url;
}

function buildGmailSettingsUrl(
  gmailStatus: "disconnected",
) {
  return appendQuery(settingsBasePath(), `gmail=${gmailStatus}`);
}
