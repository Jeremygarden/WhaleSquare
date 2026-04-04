import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AppRoutes } from "./routes";
import { Layout } from "./components/Layout";
import { pageVariants } from "./utils/transitions";

export default function App() {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25 }}
        >
          <AppRoutes />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
