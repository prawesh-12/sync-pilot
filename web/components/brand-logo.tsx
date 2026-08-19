import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo.png";

type BrandLogoProps = {
  href?: string;
  showWordmark?: boolean;
  size?: "sm" | "md";
  className?: string;
};

const logoSizes = {
  sm: { className: "size-6", width: 24, height: 24 },
  md: { className: "size-7", width: 28, height: 28 },
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
        <span
          className={cn(
            "font-display font-semibold tracking-tight whitespace-nowrap text-sp-text",
            size === "md" ? "text-lg" : "text-base",
          )}
        >
          SyncPilot
        </span>
      ) : null}
    </>
  );

  const wrapperClassName = cn(
    "inline-flex shrink-0 items-center gap-2.5",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          wrapperClassName,
          "rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-sp-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sp-base",
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}
