"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/landing/layout-primitives";

const WELL_SIZE = 40;
/** 20px well radius plus 8px of clear space, so the track never touches a node. */
const NODE_GAP = 28;
// Matches the 350ms a segment takes to fill, so the packet and the line it
// rides arrive together.
const TRAVEL_MS = 350;
const DOT_SIZE = 8;

export type RailNode = {
  key: string;
  label: string;
  mark: React.ReactNode;
  done?: boolean;
};

/**
 * Where the packet is. Absorbed on arrival, relabelled while invisible, and
 * re-emitted on the far side, so it never passes over or under a node well.
 */
export type PacketState =
  | { kind: "hidden" }
  | { kind: "emit"; node: number }
  | { kind: "travel"; leg: number }
  | { kind: "absorb"; node: number };

type NodeRailProps = {
  nodes: RailNode[];
  /** Which nodes have been reached. */
  nodeOn: boolean[];
  /** Which segments have filled. Segment i joins node i to node i + 1. */
  segmentFilled: boolean[];
  packet: PacketState;
  /** Omit for a plain dot. A labelled chip needs room the small rails lack. */
  packetLabel?: string;
  showNodeLabels?: boolean;
};

export function NodeRail({
  nodes,
  nodeOn,
  segmentFilled,
  packet,
  packetLabel,
  showNodeLabels = true,
}: NodeRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLSpanElement>(null);
  const [railWidth, setRailWidth] = useState(0);
  const [packetWidth, setPacketWidth] = useState(DOT_SIZE);

  // Node centres are a percentage of the rail, but the 28px gaps are not, so
  // the packet's stops have to be worked out in real pixels.
  useEffect(() => {
    const node = railRef.current;

    if (!node || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      setRailWidth(entries[0].contentRect.width);
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // Re-measured on label change, which only happens while the packet is hidden.
  useEffect(() => {
    if (packetRef.current) {
      setPacketWidth(packetRef.current.offsetWidth || DOT_SIZE);
    }
  }, [packetLabel]);

  const count = nodes.length;
  const centreAt = (index: number) => (railWidth * (index + 0.5)) / count;
  const stepPercent = 100 / count;

  const isTravelling = packet.kind === "travel";
  const isVisible = packet.kind === "emit" || isTravelling;

  function packetX() {
    switch (packet.kind) {
      case "emit":
        return centreAt(packet.node) + NODE_GAP;
      case "travel":
        // Stops short of the next node by the same gap.
        return centreAt(packet.leg + 1) - NODE_GAP - packetWidth;
      case "absorb":
        // Fades out exactly where it arrived.
        return centreAt(packet.node) - NODE_GAP - packetWidth;
      default:
        return centreAt(0) + NODE_GAP;
    }
  }

  return (
    <div ref={railRef} className="relative">
      {/* Layer 1: one segment per pair of neighbours. */}
      {nodes.slice(0, -1).map((node, index) => (
        <svg
          key={`segment-${node.key}`}
          aria-hidden="true"
          style={{
            left: `calc(${stepPercent * (index + 0.5)}% + ${NODE_GAP}px)`,
            width: `calc(${stepPercent}% - ${NODE_GAP * 2}px)`,
            top: WELL_SIZE / 2 - 1,
          }}
          className="absolute z-[1] h-0.5 overflow-visible"
        >
          {/* Not yet taken: dotted, so an unfilled leg reads as pending. */}
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="#6c4de6"
            strokeOpacity="0.2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="1 7"
          />

          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            pathLength={100}
            stroke="#6c4de6"
            strokeWidth="2"
            strokeDasharray="100"
            strokeDashoffset={segmentFilled[index] ? 0 : 100}
            strokeLinecap="round"
            className="sp-segment-fill"
          />

          {/* Live traffic, so a filled segment reads as a working connection
              rather than a drawn line. */}
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            data-on={segmentFilled[index] ? "true" : "false"}
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="1.5 10"
            className="sp-segment-flow"
          />
        </svg>
      ))}

      {/* Layer 2: the packet. Opaque ground, so the segment it crosses never
          shows through. */}
      <span
        ref={packetRef}
        data-on={isVisible ? "true" : "false"}
        style={{
          top: WELL_SIZE / 2,
          transform: `translate(${packetX()}px, -50%) scale(${isVisible ? 1 : 0.85})`,
          transitionDuration: isTravelling ? `${TRAVEL_MS}ms, 150ms, 150ms` : "0ms, 150ms, 150ms",
        }}
        className={
          packetLabel
            ? "sp-packet sp-packet-chip sp-code absolute left-0 z-[2] block w-max rounded-full border border-sp-cobalt/35 px-3 py-1 whitespace-nowrap text-sp-text"
            : "sp-packet absolute left-0 z-[2] block size-2 rounded-full bg-sp-cobalt shadow-[0_0_12px_rgba(108,77,230,0.8)]"
        }
      >
        {packetLabel}
      </span>

      {/* Layer 3: the nodes, opaque and always on top. */}
      <ol className="relative z-[3] flex">
        {nodes.map((node, index) => (
          <li key={node.key} className="flex flex-1 justify-center">
            <span className="flex flex-col items-center gap-2">
              <span
                data-on={nodeOn[index] ? "true" : "false"}
                data-done={node.done ? "true" : "false"}
                style={{ width: WELL_SIZE, height: WELL_SIZE }}
                className="sp-node relative flex shrink-0 items-center justify-center rounded-full border border-white/7 bg-sp-base"
              >
                {/* Only the mark dims; the well stays opaque. */}
                <span
                  data-on={nodeOn[index] ? "true" : "false"}
                  className="sp-node-content flex items-center justify-center"
                >
                  {node.mark}
                </span>
                <span
                  key={nodeOn[index] ? "lit" : "dark"}
                  aria-hidden="true"
                  data-on={nodeOn[index] ? "true" : "false"}
                  className={`sp-node-ring pointer-events-none absolute inset-0 rounded-full border ${
                    node.done ? "border-sp-sage" : "border-sp-cobalt"
                  }`}
                />
              </span>
              {showNodeLabels ? (
                <Label className="hidden text-[0.6875rem] sm:block">
                  {node.label}
                </Label>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
