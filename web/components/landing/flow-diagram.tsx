import Image from "next/image";
import { FLOW_STOPS } from "@/components/landing/landing-content";

const FLOW_WIDTH = 1613;
const FLOW_HEIGHT = 446;
const FLOW_TILE_CENTERS = ["13.7%", "50.6%", "87.7%"];

export function FlowDiagram({ isPriority = false }: { isPriority?: boolean }) {
  return (
    <figure>
      <Image
        src="/landing/flow.webp"
        alt="An email moves from Gmail, through SyncPilot, to Signal"
        width={FLOW_WIDTH}
        height={FLOW_HEIGHT}
        priority={isPriority}
        sizes="(min-width: 1120px) 1072px, 100vw"
        className="h-auto w-full"
      />
      <figcaption className="relative -mt-[3%] h-14 sm:h-16">
        {FLOW_STOPS.map((stop, index) => (
          <span
            key={stop.name}
            style={{ left: FLOW_TILE_CENTERS[index] }}
            className="absolute top-0 flex w-1/4 -translate-x-1/2 flex-col items-center gap-1 text-center"
          >
            <span className="q-medium text-sm text-q-fg sm:text-[15px]">{stop.name}</span>
            <span className="text-xs text-q-fg-3 sm:text-[13px]">{stop.detail}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
