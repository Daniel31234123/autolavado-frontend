import React from "react";

export function Skeleton({
  width,
  height,
  borderRadius,
  className = "",
  style = {},
}) {
  const customStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...style,
  };

  return <span className={`skeleton ${className}`} style={customStyle} aria-hidden="true" />;
}

export function SkeletonText({ width = "100%", height = "14px", className = "" }) {
  return <Skeleton width={width} height={height} className={`skeleton--text ${className}`} />;
}

export function SkeletonAvatar({ size = "34px", className = "" }) {
  return <Skeleton width={size} height={size} borderRadius="50%" className={`skeleton--avatar ${className}`} />;
}

export function SkeletonBadge({ width = "64px", height = "22px", className = "" }) {
  return <Skeleton width={width} height={height} borderRadius="999px" className={`skeleton--badge ${className}`} />;
}

export function SkeletonButton({ width = "70px", height = "30px", className = "" }) {
  return <Skeleton width={width} height={height} borderRadius="6px" className={`skeleton--btn ${className}`} />;
}
