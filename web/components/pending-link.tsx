"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Suspense,
  useState,
  type ComponentProps,
  type MouseEvent,
} from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type PendingLinkProps = ComponentProps<typeof Link>;

function PendingLinkInner({
  href,
  className,
  onClick,
  prefetch = true,
  children,
  ...props
}: PendingLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [isPending, setIsPending] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [prevSearch, setPrevSearch] = useState(search);

  if (pathname !== prevPathname || search !== prevSearch) {
    setPrevPathname(pathname);
    setPrevSearch(search);
    setIsPending(false);
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isModifiedClick(event)) {
      return;
    }

    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    setIsPending(true);
  }

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={handleClick}
      aria-busy={isPending}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        className,
        isPending && "pointer-events-none",
      )}
      {...props}
    >
      {isPending ? <Spinner className="size-4 shrink-0" /> : children}
    </Link>
  );
}

export function PendingLink(props: PendingLinkProps) {
  return (
    <Suspense
      fallback={
        <Link {...props} className={cn("inline-flex items-center justify-center", props.className)}>
          {props.children}
        </Link>
      }
    >
      <PendingLinkInner {...props} />
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
