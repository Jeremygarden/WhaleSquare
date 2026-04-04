import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Institution from "./pages/Institution";
import Filing from "./pages/Filing";
import NotFound from "./pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/institution/:cik" element={<Institution />} />
      <Route path="/filing/:accession" element={<Filing />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
