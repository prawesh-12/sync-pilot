"use client";

import Image from "next/image";
import { PendingLink } from "@/components/pending-link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo.png";

type BrandLogoProps = {
  href?: string;
  showWordmark?: boolean;
  size?: "sm" | "md";
  className?: string;
};

const logoSizes = {
  sm: { className: "h-7 w-7", width: 28, height: 28 },
  md: { className: "h-8 w-8", width: 32, height: 32 },
} as const;

export function BrandLogo({
  href = "/",
  showWordmark = true,
  size = "md",
  className,
}: BrandLogoProps) {
  const { className: logoClassName, width, height } = logoSizes[size];

  const content = (
    <>
      <Image
        src={LOGO_SRC}
        alt="SyncPilot"
        width={width}
        height={height}
        className={cn("shrink-0 object-contain", logoClassName)}
        priority={size === "md"}
      />
      {showWordmark ? (
        <span className="text-sm font-semibold uppercase tracking-[0.28em] text-white">
          SyncPilot
        </span>
      ) : null}
    </>
  );

  const wrapperClassName = cn(
    "inline-flex items-center gap-2.5",
    className,
  );

  if (href) {
    return (
      <PendingLink href={href} className={wrapperClassName}>
        {content}
      </PendingLink>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}
