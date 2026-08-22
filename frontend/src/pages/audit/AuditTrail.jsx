import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ScrollText } from "lucide-react";

import Sidebar from "../../components/platform/Sidebar";
import { useAuth } from "../../context/auth";
import { getAuditEvents } from "../../services/api";
import "./AuditTrail.css";


const ACTIONS = [
  "",
  "LOGIN",
  "ACCOUNT_REGISTERED",
  "LOGIN_FAILED",
  "LOGOUT",
  "TERMINOLOGY_SEARCH",
  "MAPPING_VIEWED",
  "CANDIDATES_GENERATED",
  "MAPPING_APPROVED",
  "MAPPING_REJECTED",
  "DIAGNOSIS_CONFIRMED",
  "FHIR_GENERATED",
  "TERMINOLOGY_RELEASE_ACTIVATED",
];


function AuditTrail() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAuditEvents({ action, actor });
      setEvents(data.events);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [action, actor]);

  useEffect(() => {
    const timer = window.setTimeout(loadEvents, 0);
    return () => window.clearTimeout(timer);
  }, [loadEvents]);

  return (
    <div className="platform-page">
      <Sidebar />
      <main className="audit-page platform-content">
        <header className="audit-header">
          <div>
            <span>AUDITABILITY</span>
            <h1>Audit Trail</h1>
            <p>
              {user.role === "ADMIN"
                ? "System-wide security and clinical workflow events."
                : "Security and workflow events performed by your account."}
            </p>
          </div>
          <button onClick={loadEvents} disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        <section className="audit-filters">
          <label>
            Action
            <select value={action} onChange={(event) => setAction(event.target.value)}>
              {ACTIONS.map((value) => (
                <option key={value || "all"} value={value}>
                  {value || "All actions"}
                </option>
              ))}
            </select>
          </label>
          {user.role === "ADMIN" && (
            <label>
              Actor email
              <input
                value={actor}
                onChange={(event) => setActor(event.target.value)}
                placeholder="Filter by actor"
              />
            </label>
          )}
          <strong>{total} EVENT{total === 1 ? "" : "S"}</strong>
        </section>

        {error && <div className="audit-error">{error}</div>}
        <section className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {!loading && events.length === 0 && (
                <tr><td colSpan="5" className="audit-empty">No matching events.</td></tr>
              )}
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.createdAt ? new Date(event.createdAt).toLocaleString() : "—"}</td>
                  <td><span className="audit-action"><ScrollText size={13} />{event.action}</span></td>
                  <td>{event.actor}</td>
                  <td>{event.entityType}<small>{event.entityId}</small></td>
                  <td>{event.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="audit-loading">Loading audit events…</div>}
        </section>
      </main>
    </div>
  );
}

export default AuditTrail;
