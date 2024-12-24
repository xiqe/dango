import React from "react";

interface ProgressRingProps {
  stage: number;
  size?: number;
  text?: string;
  onSpeak?: (text: string) => void;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  stage,
  size = 64, // 默认大小
}) => {
  const borderWidth = size * 0.5; // 圆环宽度为整体的10%
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (stage / 7) * circumference;
  const strokeDashoffset = circumference - progress;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        style={{
          width: "100%",
          height: "100%",
          transform: "rotate(-90deg)",
          overflow: "visible",
        }}
        viewBox="0 0 200 200"
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#ddd"
          strokeWidth={borderWidth}
          fill="none"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#4CAF50"
          strokeWidth={borderWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontSize: size * 0.25,
            fontFamily: "Arial",
            color: "#333",
          }}
        >
          {stage}
        </span>
      </div>
    </div>
  );
};

export default ProgressRing;
