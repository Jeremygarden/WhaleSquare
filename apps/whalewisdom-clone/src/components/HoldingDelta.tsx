import { motion } from "framer-motion";

export function HoldingDelta({ value }: { value: number }) {
  const color = value >= 0 ? "#2f8f5b" : "#b04b3b";
  const sign = value >= 0 ? "+" : "";
  return (
    <motion.span
      initial={{ y: 6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ color, fontWeight: 600 }}
    >
      {sign}{value.toLocaleString()}
    </motion.span>
  );
}
