"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

interface FlightPathsProps {
  scrollYProgress: MotionValue<number>;
}

// 1000x1000 coordinate system
const ORIGIN = { x: 500, y: 550, name: "Bangalore" };

const ROUTES = [
  // 0-20% is Bangalore origin highlight, so actual routes start at 0.2
  {
    destination: { x: 700, y: 650, name: "Singapore" },
    controlPoint: { x: 650, y: 500 },
    range: [0.2, 0.35],
  },
  {
    destination: { x: 300, y: 450, name: "Dubai" },
    controlPoint: { x: 400, y: 400 },
    range: [0.35, 0.5],
  },
  {
    destination: { x: 200, y: 250, name: "London" },
    controlPoint: { x: 400, y: 250 },
    range: [0.5, 0.65],
  },
  {
    destination: { x: 100, y: 350, name: "New York" },
    controlPoint: { x: 250, y: 150 },
    range: [0.65, 0.8],
  },
  {
    destination: { x: 800, y: 350, name: "Tokyo" },
    controlPoint: { x: 700, y: 350 },
    range: [0.8, 1.0],
  },
];

// Helper to calculate position on Quadratic Bezier
function getBezierPoint(t: number, p0: number, p1: number, p2: number) {
  return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;
}

// Helper to calculate derivative (tangent) of Quadratic Bezier
function getBezierDerivative(t: number, p0: number, p1: number, p2: number) {
  return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
}

const AirplaneRoute = ({
  scrollYProgress,
  route,
}: {
  scrollYProgress: MotionValue<number>;
  route: typeof ROUTES[0];
}) => {
  // Map scroll range to 0-1 for this specific route
  const progress = useTransform(scrollYProgress, route.range, [0, 1]);

  // Clamp progress for path length so it draws exactly when active and stays drawn
  const pathLength = useTransform(scrollYProgress, route.range, [0, 1], { clamp: true });
  
  // Opacity of the airplane and label (only visible during the active range and slightly after)
  const activeOpacity = useTransform(
    scrollYProgress,
    [route.range[0], route.range[0] + 0.05, route.range[1], route.range[1] + 0.05],
    [0, 1, 1, 0]
  );
  
  // The path remains slightly visible after completion
  const pathOpacity = useTransform(
    scrollYProgress,
    [route.range[0], route.range[0] + 0.05, route.range[1], 1],
    [0, 1, 0.6, 0.2]
  );

  // Destination point glow (appears when reached)
  const destGlowOpacity = useTransform(
    scrollYProgress,
    [route.range[1] - 0.05, route.range[1], route.range[1] + 0.05],
    [0, 1, 0.4]
  );

  const x = useTransform(progress, (t) => {
    // Clamp t between 0 and 1
    const clampedT = Math.max(0, Math.min(1, t));
    return getBezierPoint(clampedT, ORIGIN.x, route.controlPoint.x, route.destination.x);
  });

  const y = useTransform(progress, (t) => {
    const clampedT = Math.max(0, Math.min(1, t));
    return getBezierPoint(clampedT, ORIGIN.y, route.controlPoint.y, route.destination.y);
  });

  const rotate = useTransform(progress, (t) => {
    const clampedT = Math.max(0, Math.min(1, t));
    const dx = getBezierDerivative(clampedT, ORIGIN.x, route.controlPoint.x, route.destination.x);
    const dy = getBezierDerivative(clampedT, ORIGIN.y, route.controlPoint.y, route.destination.y);
    // Add 45 or 90 degrees depending on the SVG airplane orientation. Let's assume the SVG points right (0 deg).
    // If it points up (standard paper plane), we add 90 deg. Let's assume it points up, so angle + 90.
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return angle + 90; 
  });

  const pathD = `M ${ORIGIN.x},${ORIGIN.y} Q ${route.controlPoint.x},${route.controlPoint.y} ${route.destination.x},${route.destination.y}`;

  return (
    <>
      {/* The flight path */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#68d32f"
        strokeWidth="1.5"
        style={{ pathLength, opacity: pathOpacity }}
        className="drop-shadow-[0_0_8px_rgba(104,211,47,0.5)]"
      />

      {/* Destination Node */}
      <motion.circle
        cx={route.destination.x}
        cy={route.destination.y}
        r="4"
        fill="#fff"
        style={{ opacity: destGlowOpacity }}
        className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
      />

      {/* Destination Label */}
      <motion.text
        x={route.destination.x + 12}
        y={route.destination.y + 4}
        fill="#fff"
        fontSize="12"
        fontWeight="500"
        letterSpacing="0.1em"
        style={{ opacity: destGlowOpacity }}
        className="font-mono uppercase mix-blend-overlay"
      >
        {route.destination.name}
      </motion.text>

      {/* Airplane */}
      <motion.g style={{ x, y, rotate, opacity: activeOpacity }}>
        {/* Minimal airplane silhouette (points UP by default) */}
        <path
          d="M0 -6 L4 6 L0 4 L-4 6 Z"
          fill="#fff"
          className="drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]"
        />
      </motion.g>
    </>
  );
};

export default function FlightPaths({ scrollYProgress }: FlightPathsProps) {
  // Origin glow based on 0-20%
  const originGlow = useTransform(scrollYProgress, [0, 0.1, 0.2], [0, 1, 0.6]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none w-full h-full opacity-60 mix-blend-screen">
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        {/* Origin Node (Bangalore) */}
        <motion.circle
          cx={ORIGIN.x}
          cy={ORIGIN.y}
          r="4"
          fill="#68d32f"
          style={{ opacity: originGlow }}
          className="drop-shadow-[0_0_12px_rgba(104,211,47,0.8)]"
        />
        <motion.text
          x={ORIGIN.x + 12}
          y={ORIGIN.y + 4}
          fill="#68d32f"
          fontSize="12"
          fontWeight="500"
          letterSpacing="0.1em"
          style={{ opacity: originGlow }}
          className="font-mono uppercase drop-shadow-md"
        >
          {ORIGIN.name}
        </motion.text>

        {/* Render each route */}
        {ROUTES.map((route, i) => (
          <AirplaneRoute
            key={i}
            scrollYProgress={scrollYProgress}
            route={route}
          />
        ))}
      </svg>
    </div>
  );
}
