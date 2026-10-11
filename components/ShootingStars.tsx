
import type { CSSProperties } from "react";

const stars = [
  { x: 8, y: 15, size: 2, delay: 0.2, duration: 7 },
  { x: 18, y: 45, size: 2, delay: 1.5, duration: 9 },
  { x: 29, y: 12, size: 3, delay: 2.3, duration: 8 },
  { x: 38, y: 72, size: 2, delay: 0.8, duration: 10 },
  { x: 47, y: 28, size: 2, delay: 3.2, duration: 7 },
  { x: 58, y: 62, size: 3, delay: 1.1, duration: 9 },
  { x: 69, y: 18, size: 2, delay: 2.8, duration: 8 },
  { x: 77, y: 48, size: 2, delay: 0.5, duration: 10 },
  { x: 88, y: 24, size: 3, delay: 1.9, duration: 7 },
  { x: 94, y: 78, size: 2, delay: 3.5, duration: 9 },
  { x: 13, y: 83, size: 2, delay: 2.1, duration: 8 },
  { x: 54, y: 8, size: 2, delay: 0.9, duration: 10 },
];

const meteors = [
  { x: 12, y: 5, delay: -1, duration: 6 },
  { x: 55, y: 2, delay: -3, duration: 7 },
  { x: 88, y: 12, delay: -5, duration: 8 },
  { x: 35, y: 28, delay: -2, duration: 9 },
  { x: 75, y: 42, delay: -6, duration: 7 },
];

export default function ShootingStars() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {stars.map((star, index) => (
        <span
          key={`star-${index}`}
          className="shooting-star-dot absolute rounded-full"
          style={
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            } satisfies CSSProperties
          }
        />
      ))}

      {meteors.map((meteor, index) => (
        <span
          key={`meteor-${index}`}
          className="shooting-meteor absolute"
          style={
            {
              left: `${meteor.x}%`,
              top: `${meteor.y}%`,
              animationDelay: `${meteor.delay}s`,
              animationDuration: `${meteor.duration}s`,
            } satisfies CSSProperties
          }
        />
      ))}
    </div>
  );
}
