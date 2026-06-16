"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { SettingsPopupSkeleton } from "@/components/dashboard/settings-popup-skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ctaButtonTheme } from "@/components/cta-button-class";
import { cn } from "@/lib/utils";

const OPEN_SETTINGS_HREF = "/dashboard?settings=open";
const CLOSED_SETTINGS_HREF = "/dashboard";

type DashboardSettingsModalProps = {
  isOpen: boolean;
  children?: ReactNode;
};

type PendingAction = "open" | "close" | null;

function DashboardSettingsModalInner({
  isOpen,
  children,
}: DashboardSettingsModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const closeLinkRef = useRef<HTMLAnchorElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [optimisticOpen, setOptimisticOpen] = useState(isOpen);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [prevSearch, setPrevSearch] = useState(search);
  const shouldShowModal = optimisticOpen;

  if (pathname !== prevPathname || search !== prevSearch) {
    setPrevPathname(pathname);
    setPrevSearch(search);
    setPendingAction(null);
  }

  const isOpening = pendingAction === "open";
  const isClosing = pendingAction === "close";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setOptimisticOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    router.prefetch(OPEN_SETTINGS_HREF);
  }, [router]);

  useEffect(() => {
    if (!shouldShowModal) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOptimisticOpen(false);
        setPendingAction("close");
        closeLinkRef.current?.click();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shouldShowModal]);

  function handleOpenClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isModifiedClick(event)) {
      return;
    }

    setOptimisticOpen(true);
    setPendingAction("open");
  }

  function handleCloseClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isModifiedClick(event)) {
      return;
    }

    setOptimisticOpen(false);
    setPendingAction("close");
  }

  const modal = shouldShowModal ? (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-0 sm:p-4"
    >
      <div className="relative h-full w-full overflow-y-hidden rounded-none border border-[#A089E6]/20 bg-[#07070f] shadow-2xl sm:h-auto sm:max-h-[85vh] sm:max-w-5xl sm:overflow-y-auto sm:rounded-2xl">
        <Link
          ref={closeLinkRef}
          href={CLOSED_SETTINGS_HREF}
          onClick={handleCloseClick}
          aria-busy={isClosing}
          className={cn(
            ctaButtonTheme,
            "absolute right-4 top-4 z-10 inline-flex min-w-[4.5rem] items-center justify-center px-4 py-1.5 text-xs",
            isClosing && "pointer-events-none",
          )}
        >
          {isClosing ? <Spinner className="size-3" /> : "Close"}
        </Link>
        {isOpen ? children : <SettingsPopupSkeleton />}
      </div>
    </div>
  ) : null;

  return (
    <>
      <Link
        href={OPEN_SETTINGS_HREF}
        onClick={handleOpenClick}
        aria-busy={isOpening}
        className={cn(
          ctaButtonTheme,
          "inline-flex w-full shrink-0 items-center justify-center px-4 py-1.5 text-center text-sm sm:w-auto sm:min-w-[10rem]",
          isOpening && "pointer-events-none",
        )}
      >
        {isOpening ? (
          <Spinner className="size-4 text-[#f0eeff]" />
        ) : (
          "Connection Setting"
        )}
      </Link>

      {isMounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}

export function DashboardSettingsModal(props: DashboardSettingsModalProps) {
  return (
    <Suspense
      fallback={
        <span className={cn(ctaButtonTheme, "inline-flex w-full shrink-0 items-center justify-center px-4 py-1.5 text-center text-sm sm:w-auto sm:min-w-[10rem]")}>
          Connection Setting
        </span>
      }
    >
      <DashboardSettingsModalInner {...props} />
    </Suspense>
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
