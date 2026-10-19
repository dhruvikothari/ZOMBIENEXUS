// Shared fade-up entrance (SPEC 5.1 slow = 360 ms, ease-out-expo). MotionConfig handles reduced motion.
export const EASE = [0.16, 1, 0.3, 1] as const;

export function rise(i = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.36, delay: Math.min(i, 8) * 0.07, ease: EASE },
  };
}
