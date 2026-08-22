import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";

import Lenis from "lenis";

import Landing from "./pages/Landing";
import Platform from "./pages/Platform";
import ReviewQueue from "./pages/review/ReviewQueue";
import ClinicalWorkspace from "./pages/clinical/ClinicalWorkspace";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TerminologyAdmin from "./pages/admin/TerminologyAdmin";
import AuditTrail from "./pages/audit/AuditTrail";
import TerminologyExplorer from "./pages/terminology/TerminologyExplorer";

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
    });

    let frame;

    function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/platform"
          element={
            <ProtectedRoute
              allowedRoles={["DOCTOR", "EXPERT", "ADMIN"]}
            >
              <Platform />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clinical"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR", "ADMIN"]}>
              <ClinicalWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute allowedRoles={["EXPERT", "ADMIN"]}>
              <ReviewQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terminology"
          element={
            <ProtectedRoute
              allowedRoles={["DOCTOR", "EXPERT", "ADMIN"]}
            >
              <TerminologyExplorer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute
              allowedRoles={["DOCTOR", "EXPERT", "ADMIN"]}
            >
              <AuditTrail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Platform />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/terminology"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <TerminologyAdmin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
