import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand marks as inline SVG so they can sit in animated nodes and inherit the
 * colour of the text beside them where we want them quiet.
 *
 * These say what SyncPilot connects to; they do not imply endorsement (the
 * Signal disclaimer lives in the footer). Full colour marks are never
 * recoloured — `mono` renders a flat currentColor silhouette instead.
 */

const DEFAULT_SIZE = 28;

type MarkProps = {
  size?: number;
  mono?: boolean;
  className?: string;
};

export function GmailMark({
  size = DEFAULT_SIZE,
  mono = false,
  className,
}: MarkProps) {
  return (
    <svg
      role="img"
      aria-label="Gmail"
      viewBox="0 0 52 40"
      width={size}
      height={(size * 40) / 52}
      className={cn("shrink-0", className)}
    >
      {mono ? (
        <path
          fill="currentColor"
          d="M3.64 40h8.18V20.18L0 11v25.45C0 38.4 1.58 40 3.64 40Zm36.54 0h8.18c2.07 0 3.64-1.6 3.64-3.55V11l-11.82 9.18V40Zm0-36.36v16.54L52 11V5.45c0-5.05-5.77-7.94-9.82-4.91l-2 1.5ZM11.82 20.18V3.64L26 14.27 40.18 3.64v16.54L26 30.82 11.82 20.18ZM0 5.45V11l11.82 9.18V3.64l-2-1.5C5.77-2.49 0 .4 0 5.45Z"
        />
      ) : (
        <>
          <path fill="#4285F4" d="M3.64 40h8.18V20.18L0 11v25.45C0 38.4 1.58 40 3.64 40Z" />
          <path
            fill="#34A853"
            d="M40.18 40h8.18c2.07 0 3.64-1.6 3.64-3.55V11l-11.82 9.18V40Z"
          />
          <path
            fill="#FBBC04"
            d="M40.18 3.64v16.54L52 11V5.45c0-5.05-5.77-7.94-9.82-4.91l-2 1.5Z"
          />
          <path
            fill="#EA4335"
            d="M11.82 20.18V3.64L26 14.27 40.18 3.64v16.54L26 30.82 11.82 20.18Z"
          />
          <path fill="#C5221F" d="M0 5.45V11l11.82 9.18V3.64l-2-1.5C5.77-2.49 0 .4 0 5.45Z" />
        </>
      )}
    </svg>
  );
}

// From Signal's 2024 brand assets. #3b45fd is Signal's ultramarine: never
// re-tint it, and never substitute an icon-set speech bubble.
const SIGNAL_ULTRAMARINE = "#3b45fd";

const SIGNAL_PATHS = [
  "m80 0c4.1505 0 8.2271.31607 12.2072.925452l-1.1444 7.413248c-3.6069-.55226-7.3014-.8387-11.0628-.8387-3.7612 0-7.4555.28641-11.0623.83862l-1.1444-7.413245c3.9799-.609332 8.0564-.925375 12.2067-.925375z",
  "m98.9849 2.26619-1.7798 7.28755c7.3099 1.77896 14.1849 4.66606 20.4389 8.47306l3.895-6.411c-6.901-4.20091-14.488-7.38658-22.5541-9.34961z",
  "m127.279 15.4591-4.432 6.0507c5.977 4.3861 11.257 9.6664 15.643 15.6437l6.051-4.4324c-4.84-6.5957-10.666-12.4222-17.262-17.262z",
  "m148.384 38.4618-6.411 3.8942c3.807 6.2541 6.694 13.1299 8.473 20.4395l7.288-1.7798c-1.963-8.0657-5.149-15.6528-9.35-22.5539z",
  "m159.075 67.7934-7.414 1.1444c.553 3.6067.839 7.301.839 11.0622 0 3.7614-.286 7.4559-.839 11.0628l7.414 1.1444c.609-3.9801.925-8.0567.925-12.2072 0-4.1503-.316-8.2267-.925-12.2066z",
  "m141.973 117.645c3.807-6.255 6.694-13.13 8.473-20.44l7.288 1.7798c-1.963 8.0662-5.149 15.6532-9.35 22.5542z",
  "m138.49 122.847 6.051 4.432c-4.84 6.596-10.666 12.422-17.262 17.262l-4.433-6.051c5.978-4.386 11.258-9.666 15.644-15.643z",
  "m117.644 141.973 3.894 6.411c-6.901 4.201-14.488 7.387-22.5537 9.35l-1.7798-7.288c7.3095-1.779 14.1855-4.666 20.4395-8.473z",
  "m91.0622 151.661 1.1445 7.414c-3.9799.609-8.0564.925-12.2067.925-4.1505 0-8.2272-.316-12.2073-.925l1.1442-7.413c3.6054.552 7.2997.838 11.0631.838 3.7612 0 7.4555-.286 11.0622-.839z",
  "m62.7945 150.448-1.7794 7.286c-6.0589-1.475-11.8477-3.639-17.2785-6.406l-7.5927 1.772-1.7042-7.304 10.2604-2.394 2.4408 1.243c4.9187 2.506 10.1623 4.467 15.6536 5.803z",
  "m28.1097 147.273 1.7042 7.304-13.0145 3.036c-8.66079 2.021-16.433718-5.752-14.41286-14.412l3.03673-13.015 7.30383 1.704-3.03675 13.015c-.75782 3.248 2.15705 6.162 5.40485 5.405z",
  "m14.2041 125.56-7.30383-1.704 1.77163-7.593c-2.76664-5.431-4.93123-11.22-6.40585-17.2787l7.28586-1.7794c1.33599 5.4911 3.29709 10.7351 5.80279 15.6541l1.2435 2.441z",
  "m8.33759 91.0624-7.412228 1.1442c-.609324-3.9799-.925362-8.0563-.925362-12.2066 0-4.1505.316067-8.2271.925446-12.2072l7.413244 1.1444c-.55225 3.607-.83869 7.3014-.83869 11.0628 0 3.7631.28613 7.4572.83759 11.0624z",
  "m9.55373 62.795-7.28755-1.7798c1.96302-8.0657 5.1487-15.6528 9.34962-22.5539l6.411 3.8942c-3.807 6.2541-6.6941 13.1299-8.47307 20.4395z",
  "m21.5098 37.1531-6.0507-4.4324c4.8398-6.5957 10.6663-12.4221 17.262-17.2619l4.4324 6.0507c-5.9773 4.3861-11.2576 9.6663-15.6437 15.6436z",
  "m42.356 18.0266-3.8943-6.4111c6.9011-4.20082 14.4882-7.38645 22.554-9.34944l1.7798 7.28755c-7.3096 1.77899-14.1854 4.66589-20.4395 8.47299z",
  "m145 80c0 35.899-29.101 65-65 65-11.3866 0-22.0893-2.928-31.3965-8.072-.8961-.495-1.9417-.658-2.9389-.426l-28.9134 6.747 6.7465-28.914c.2326-.997.0692-2.043-.426-2.939-5.1439-9.307-8.0717-20.0095-8.0717-31.396 0-35.8985 29.1015-65 65-65 35.899 0 65 29.1015 65 65z",
];

export function SignalMark({
  size = DEFAULT_SIZE,
  mono = false,
  className,
}: MarkProps) {
  return (
    <svg
      role="img"
      aria-label="Signal"
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      <g fill={mono ? "currentColor" : SIGNAL_ULTRAMARINE}>
        {SIGNAL_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** The product's own mark: a raster asset, so it renders through next/image. */
export function SyncPilotMark({
  size = DEFAULT_SIZE,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt="SyncPilot"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

const WELL_SIZE_PX = 40;

/** The 40px circular well every node mark sits in. */
export function MarkWell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{ width: WELL_SIZE_PX, height: WELL_SIZE_PX }}
      className={cn(
        "sp-surface-1 flex shrink-0 items-center justify-center rounded-full",
        className,
      )}
    >
      {children}
    </span>
  );
}
