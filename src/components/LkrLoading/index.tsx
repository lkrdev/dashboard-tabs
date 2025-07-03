import React, { useEffect, useRef, useState } from "react";
import { useBoolean } from "usehooks-ts";
import letterPaths from "./letter_paths";

interface LkrLoadingProps {
  size?: number;
  color?: string;
  duration?: number;
  className?: string;
  onFirstAnimationEnd?: () => void;
}

const LkrLoading: React.FC<LkrLoadingProps> = ({
  size = 191,
  color = "#000000",
  duration = 2000,
  className = "",
  onFirstAnimationEnd,
}) => {
  const [animationPhase, setAnimationPhase] = useState<
    "drawing" | "filling" | "exiting" | "idle"
  >("drawing");
  const [progress, setProgress] = useState(0);
  const has_first_animation_completed = useBoolean(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Main animation loop
  useEffect(() => {
    let animationId: number;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;

      const elapsed = currentTime - startTime;
      const totalDuration = duration * 3; // Total time for all phases

      if (elapsed < duration) {
        // Drawing phase
        setAnimationPhase("drawing");
        setProgress(elapsed / duration);
      } else if (elapsed < duration * 2) {
        // Filling phase
        setAnimationPhase("filling");
        setProgress((elapsed - duration) / duration);
      } else if (elapsed < totalDuration) {
        // Exiting phase
        setAnimationPhase("exiting");
        setProgress((elapsed - duration * 2) / duration);
      } else {
        // Reset animation
        setAnimationPhase("drawing");
        setProgress(0);

        // Call onFirstAnimationEnd if this is the first completion
        if (!has_first_animation_completed.value && onFirstAnimationEnd) {
          has_first_animation_completed.setTrue();
          onFirstAnimationEnd();
        }

        startTime = currentTime;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [duration]);

  const renderLetter = (letter: "L" | "K" | "R", index: number) => {
    const path = letterPaths[letter];
    const letterProgress = Math.max(
      0,
      Math.min(1, (progress - index * 0.2) * 3)
    );

    let strokeDasharray = "";
    let strokeDashoffset = "";
    let fillOpacity = 0;
    let strokeWidth = "1.5";
    let strokeOpacity = 1;
    let filter = `drop-shadow(0 0 ${2 + letterProgress * 3}px ${color})`;
    let fill = color;
    let stroke = color;

    // Neon animation style
    if (animationPhase === "drawing") {
      strokeDasharray = "1000";
      strokeDashoffset = `${1000 - letterProgress * 1000}`;
      fillOpacity = 0;
      strokeOpacity = letterProgress;
    } else if (animationPhase === "filling") {
      strokeDasharray = "1000";
      strokeDashoffset = "0";
      fillOpacity = letterProgress;
      strokeOpacity = 1;
    } else {
      strokeDasharray = "1000";
      strokeDashoffset = `${letterProgress * 1000}`;
      fillOpacity = 1 - letterProgress;
      strokeOpacity = 1 - letterProgress;
    }

    return (
      <g key={letter}>
        <path
          d={path}
          fill={fill}
          fillOpacity={fillOpacity}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeOpacity={strokeOpacity}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter,
            transition: "all 0.1s ease-out",
          }}
        />
      </g>
    );
  };

  const padding = 20; // Padding in viewBox units
  const originalWidth = 191;
  const originalHeight = 62;
  const paddedWidth = originalWidth + padding * 2;
  const paddedHeight = originalHeight + padding * 2;

  const scale = size / paddedWidth; // Scale based on padded width
  const height = paddedHeight * scale;

  return (
    <div
      className={`lkr-loading ${className}`}
      style={{
        display: "inline-block",
        width: size,
        height: height,
        position: "relative",
      }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={height}
        viewBox={`-${padding} -${padding} ${paddedWidth} ${paddedHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {renderLetter("L", 0)}
        {renderLetter("K", 1)}
        {renderLetter("R", 2)}
      </svg>
    </div>
  );
};

export default LkrLoading;
