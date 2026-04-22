"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type MouseEvent,
  type ReactNode,
} from "react";
import { SettingsPopupSkeleton } from "@/components/dashboard/settings-popup-skeleton";

const OPEN_SETTINGS_HREF = "/dashboard?settings=open";
const CLOSED_SETTINGS_HREF = "/dashboard";

type DashboardSettingsModalProps = {
  isOpen: boolean;
  children?: ReactNode;
};

export function DashboardSettingsModal({
  isOpen,
  children,
}: DashboardSettingsModalProps) {
  const router = useRouter();
  const [optimisticOpen, setOptimisticOpen] = useState(isOpen);
  const [, startTransition] = useTransition();
  const shouldShowModal = optimisticOpen || isOpen;

  useEffect(() => {
    setOptimisticOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    router.prefetch(OPEN_SETTINGS_HREF);
  }, [router]);

  const closeSettings = useCallback(() => {
    setOptimisticOpen(false);
    startTransition(() => {
      router.push(CLOSED_SETTINGS_HREF);
    });
  }, [router]);

  useEffect(() => {
    if (!shouldShowModal) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSettings();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSettings, shouldShowModal]);

  function handleOpenClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isModifiedClick(event)) {
      return;
    }

    event.preventDefault();
    setOptimisticOpen(true);
    startTransition(() => {
      router.push(OPEN_SETTINGS_HREF);
    });
  }

  function handleCloseClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isModifiedClick(event)) {
      return;
    }

    event.preventDefault();
    closeSettings();
  }

  return (
    <>
      <Link
        href={OPEN_SETTINGS_HREF}
        onClick={handleOpenClick}
        className="w-full shrink-0 rounded-full bg-white/90 px-4 py-1.5 text-center text-sm font-medium text-[#07070f] transition-colors hover:bg-white sm:w-auto"
      >
        Connection Setting
      </Link>

      {shouldShowModal ? (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-0 sm:p-4"
        >
          <div className="relative h-full w-full overflow-y-hidden rounded-none border border-[#A089E6]/20 bg-[#07070f] shadow-2xl sm:h-auto sm:max-h-[85vh] sm:max-w-5xl sm:overflow-y-auto sm:rounded-2xl">
            <Link
              href={CLOSED_SETTINGS_HREF}
              onClick={handleCloseClick}
              className="absolute right-4 top-4 z-10 rounded-full border border-[#A089E6]/30 bg-[#07070f]/90 px-4 py-1.5 text-xs text-[#A089E6] transition-colors hover:bg-[#A089E6]/10"
            >
              Close
            </Link>
            {isOpen ? children : <SettingsPopupSkeleton />}
          </div>
        </div>
      ) : null}
    </>
  );
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}
