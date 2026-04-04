import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
  circle?: boolean;
}

export function Skeleton({
  className,
  width = "100%",
  height = "1rem",
  rounded = "rounded-md",
  circle = false,
}: SkeletonProps) {
  const finalRounded = circle ? "rounded-full" : rounded;
  const finalStyle = circle && width ? { width, height: width } : { width, height };

  return (
    <span
      role="status"
      aria-busy="true"
      aria-label="Loading..."
      style={finalStyle}
      className={cn(`skeleton block`, finalRounded, className)}
    />
  );
}
