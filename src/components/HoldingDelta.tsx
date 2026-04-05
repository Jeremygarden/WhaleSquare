import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

export function HoldingDelta({ value }: { value: number | null | undefined }) {
  if (value == null || Number.isNaN(value)) {
    return (
      <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>—</span>
    );
  }

  const magnitude = Math.abs(value);
  const animatedValue = useMotionValue(0);
  const formattedValue = useTransform(animatedValue, (latest) =>
    Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    const controls = animate(animatedValue, magnitude, {
      duration: 0.4,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [animatedValue, magnitude]);

  if (value === 0) {
    return (
      <motion.span
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ color: "var(--color-text-muted)", fontWeight: 600 }}
      >
        —
      </motion.span>
    );
  }

  const color = value > 0 ? "var(--color-green)" : "var(--color-red)";
  const arrow = value > 0 ? "▲" : "▼";

  return (
    <motion.span
      initial={{ y: 6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ color, fontWeight: 600, display: "inline-flex", gap: 6 }}
    >
      <span>{arrow}</span>
      <motion.span>{formattedValue}</motion.span>
    </motion.span>
  );
}
