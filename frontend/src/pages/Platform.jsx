import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  GitMerge,
  DatabaseZap,
} from "lucide-react";

import Sidebar from "../components/platform/Sidebar";
import Dashboard from "../components/platform/Dashboard";
import { useAuth } from "../context/auth";

function Platform() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canUseClinical = ["DOCTOR", "ADMIN"].includes(
    user.role
  );
  const canReview = ["EXPERT", "ADMIN"].includes(
    user.role
  );

  return (
    <div className="platform-page">
      <Sidebar />

      <div className="platform-content">
        <div className="platform-action-bar">
          {canUseClinical && (
            <button
              className="platform-action clinical-action"
              onClick={() => navigate("/clinical")}
            >
              <Stethoscope size={17} />
              Record Diagnosis
            </button>
          )}

          {canReview && (
            <button
              className="platform-action review-action"
              onClick={() => navigate("/review")}
            >
              <GitMerge size={17} />
              Expert Review
            </button>
          )}

          {user.role === "ADMIN" && (
            <button
              className="platform-action review-action"
              onClick={() => navigate("/admin/terminology")}
            >
              <DatabaseZap size={17} />
              Terminology Releases
            </button>
          )}
        </div>

        <Dashboard user={user} />
      </div>
    </div>
  );
}

export default Platform;
