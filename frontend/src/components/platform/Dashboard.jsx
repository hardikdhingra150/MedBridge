import { useEffect, useState } from "react";
import {
  Activity,
  BookOpenCheck,
  Clock3,
  FileJson2,
  GitMerge,
  Users,
} from "lucide-react";

import { getDashboardStats } from "../../services/api";

const workspaceCopy = {
  DOCTOR: {
    kicker: "CLINICIAN WORKSPACE",
    title: "Clinical Gateway",
    description: "Search terminology, record diagnoses and generate interoperable clinical data.",
  },
  EXPERT: {
    kicker: "TERMINOLOGY WORKSPACE",
    title: "Expert Review",
    description: "Assess mapping candidates and promote verified terminology relationships.",
  },
  ADMIN: {
    kicker: "ADMINISTRATOR WORKSPACE",
    title: "System Administration",
    description: "Manage MedBridge workflows with broader clinical and terminology access.",
  },
};

const actionLabels = {
  ACCOUNT_REGISTERED: "Personal account registered",
  LOGIN: "Signed in",
  LOGOUT: "Signed out",
  TERMINOLOGY_SEARCH: "Terminology search performed",
  MAPPING_VIEWED: "Verified mapping inspected",
  CANDIDATES_GENERATED: "Mapping candidates generated",
  MAPPING_APPROVED: "Mapping candidate approved",
  MAPPING_REJECTED: "Mapping candidate rejected",
  DIAGNOSIS_CONFIRMED: "Dual-code diagnosis confirmed",
  FHIR_GENERATED: "FHIR Condition generated",
};

function Dashboard({ user }) {
  const copy = workspaceCopy[user.role];
  const initials = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getDashboardStats();
        if (active) {
          setStats(data);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }
    load();
    const interval = window.setInterval(load, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const availableMetrics = [
    { title: "Patients", value: stats?.patients, icon: Users },
    { title: "Active NAMASTE Terms", value: stats?.namasteTerms, icon: BookOpenCheck },
    { title: "Active ICD Terms", value: stats?.icdTerms, icon: BookOpenCheck },
    { title: "Verified Mappings", value: stats?.verifiedMappings, icon: GitMerge },
    { title: "Pending Candidates", value: stats?.pendingCandidates, icon: Clock3 },
    { title: "Confirmed Diagnoses", value: stats?.confirmedDiagnoses, icon: Activity },
    { title: "FHIR Exchanges", value: stats?.fhirExchanges, icon: FileJson2 },
  ];
  const metrics = availableMetrics.filter(
    (metric) => metric.value !== undefined
  );

  return (
    <main className="platform-main">
      <header className="platform-header">
        <div><span>{copy.kicker}</span><h1>{copy.title}</h1><p>{copy.description}</p></div>
        <div className="doctor-chip"><div>{initials}</div><section><strong>{user.name}</strong><span>{user.role}</span></section></div>
      </header>

      {error && <div className="dashboard-live-error">{error}</div>}
      <div className="metrics-grid live-metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="metric-card" key={metric.title}>
              <div className="metric-icon"><Icon size={20} /></div>
              <span>{metric.title}</span><strong>{metric.value ?? "—"}</strong>
              <small>LIVE API DATA · REFRESHES EVERY 30S</small>
            </article>
          );
        })}
      </div>

      <div className="dashboard-grid dashboard-live-grid">
        <article className="dashboard-panel activity-panel">
          <div className="panel-heading"><div><span>AUDIT PREVIEW</span><h2>Recent activity</h2></div><Activity /></div>
          <div className="activity-list">
            {stats?.recentActivity?.length ? stats.recentActivity.map((event) => (
              <div key={event.id}><i /><section>
                <strong>{actionLabels[event.action] || event.action.replaceAll("_", " ")}</strong>
                <span>{event.actor} · {new Date(event.createdAt).toLocaleString()}</span>
              </section></div>
            )) : (
              <div><i /><section><strong>No activity recorded yet</strong><span>Complete a workflow to create an audit event.</span></section></div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

export default Dashboard;
