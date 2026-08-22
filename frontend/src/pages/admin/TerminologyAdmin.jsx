import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  DatabaseZap,
  FileUp,
  LoaderCircle,
  Power,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/platform/Sidebar";
import {
  activateTerminologyRelease,
  getTerminologyCoverage,
  getTerminologyImportJobs,
  getTerminologyReleases,
  getTerminologyReleaseTerms,
  importTerminologyRelease,
} from "../../services/api";

import "./TerminologyAdmin.css";


function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}


function TerminologyAdmin() {
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [releases, setReleases] = useState([]);
  const [coverage, setCoverage] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [termsByRelease, setTermsByRelease] = useState({});
  const [expandedRelease, setExpandedRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [system, setSystem] = useState("NAMASTE");
  const [version, setVersion] = useState("");
  const [sourceName, setSourceName] = useState(
    "MedBridge Demo CSV"
  );
  const [file, setFile] = useState(null);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [releaseData, coverageData, jobData] =
        await Promise.all([
          getTerminologyReleases(),
          getTerminologyCoverage(),
          getTerminologyImportJobs(),
        ]);
      setReleases(releaseData);
      setCoverage(coverageData);
      setJobs(jobData);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      getTerminologyReleases(),
      getTerminologyCoverage(),
      getTerminologyImportJobs(),
    ])
      .then(([releaseData, coverageData, jobData]) => {
        if (!active) return;
        setReleases(releaseData);
        setCoverage(coverageData);
        setJobs(jobData);
        setError("");
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleActivate(release) {
    try {
      setBusy(`activate-${release.id}`);
      setError("");
      setSuccess("");
      const result = await activateTerminologyRelease(release.id);
      setSuccess(result.message);
      await loadData(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function handleViewTerms(release) {
    if (expandedRelease === release.id) {
      setExpandedRelease(null);
      return;
    }

    try {
      setBusy(`terms-${release.id}`);
      setError("");
      if (!termsByRelease[release.id]) {
        const result = await getTerminologyReleaseTerms(
          release.id
        );
        setTermsByRelease((current) => ({
          ...current,
          [release.id]: result.terms,
        }));
      }
      setExpandedRelease(release.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  }

  async function handleImport(event) {
    event.preventDefault();
    if (!file) {
      setError("Select a CSV file to import.");
      return;
    }

    try {
      setBusy("import");
      setError("");
      setSuccess("");
      const result = await importTerminologyRelease({
        system,
        version,
        sourceName,
        file,
      });
      setSuccess(
        `${result.system} ${result.version}: ${result.imported} imported, ${result.rejected} rejected.`
      );
      setVersion("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await loadData(false);
    } catch (requestError) {
      setError(requestError.message);
      await loadData(false);
    } finally {
      setBusy("");
    }
  }

  const groups = ["NAMASTE", "ICD11-TM2"].map(
    (releaseSystem) => ({
      system: releaseSystem,
      releases: releases.filter(
        (release) => release.system === releaseSystem
      ),
    })
  );

  return (
    <div className="platform-page terminology-admin-page">
      <Sidebar />

      <main className="terminology-admin-content">
        <header className="terminology-admin-header">
          <div>
            <button
              className="terminology-admin-back"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft size={16} />
              Admin dashboard
            </button>
            <span>TERMINOLOGY GOVERNANCE</span>
            <h1>
              Release <em>administration</em>
            </h1>
            <p>
              Import immutable terminology releases, inspect validation
              reports, and control the active clinical search version.
            </p>
          </div>

          <div className="terminology-admin-security">
            <ShieldCheck size={18} />
            ADMIN ONLY
          </div>
        </header>

        {error && (
          <div className="terminology-admin-message error" role="alert">
            <TriangleAlert size={17} />
            {error}
          </div>
        )}
        {success && (
          <div className="terminology-admin-message success">
            <CheckCircle2 size={17} />
            {success}
          </div>
        )}

        {loading ? (
          <div className="terminology-admin-loading">
            <LoaderCircle className="admin-spinner" size={25} />
            Loading release governance…
          </div>
        ) : (
          <>
            {coverage && (
              <section className="coverage-grid">
                {[
                  ["NAMASTE terms", coverage.namasteTerms],
                  ["ICD-11 TM2 terms", coverage.icdTerms],
                  ["Verified mappings", coverage.verifiedMappings],
                  ["Pending candidates", coverage.pendingCandidates],
                  ["Unmapped terms", coverage.unmappedTerms],
                  ["Coverage", `${coverage.coveragePercent}%`],
                ].map(([label, value]) => (
                  <article key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </section>
            )}

            <section className="terminology-import-panel">
              <div className="terminology-section-heading">
                <div>
                  <span>CSV INGESTION</span>
                  <h2>Import a new release</h2>
                </div>
                <FileUp size={22} />
              </div>

              <form onSubmit={handleImport}>
                <label>
                  System
                  <select
                    value={system}
                    onChange={(event) => setSystem(event.target.value)}
                  >
                    <option value="NAMASTE">NAMASTE</option>
                    <option value="ICD11-TM2">ICD-11 TM2</option>
                  </select>
                </label>
                <label>
                  Version
                  <input
                    value={version}
                    onChange={(event) => setVersion(event.target.value)}
                    placeholder="2026-DEMO-v2"
                    required
                  />
                </label>
                <label>
                  Source
                  <input
                    value={sourceName}
                    onChange={(event) =>
                      setSourceName(event.target.value)
                    }
                    required
                  />
                </label>
                <label>
                  CSV file
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(event) =>
                      setFile(event.target.files?.[0] || null)
                    }
                    required
                  />
                </label>
                <button type="submit" disabled={busy === "import"}>
                  {busy === "import" ? (
                    <LoaderCircle className="admin-spinner" size={17} />
                  ) : (
                    <FileUp size={17} />
                  )}
                  Validate &amp; import
                </button>
              </form>
              <small>
                Imports remain inactive until explicitly activated. Existing
                releases and historical diagnosis snapshots are preserved.
              </small>
            </section>

            {groups.map((group) => (
              <section
                className="release-group"
                key={group.system}
              >
                <div className="terminology-section-heading">
                  <div>
                    <span>VERSIONED STORAGE</span>
                    <h2>
                      {group.system === "NAMASTE"
                        ? "NAMASTE releases"
                        : "ICD-11 TM2 releases"}
                    </h2>
                  </div>
                  <DatabaseZap size={22} />
                </div>

                <div className="release-list">
                  {group.releases.map((release) => (
                    <article className="release-card" key={release.id}>
                      <div className="release-card-main">
                        <div>
                          <span>{release.system}</span>
                          <h3>{release.version}</h3>
                          <p>
                            {release.sourceName} · {release.sourceType}
                          </p>
                        </div>
                        <div
                          className={
                            release.active
                              ? "release-status active"
                              : "release-status"
                          }
                        >
                          {release.active ? "ACTIVE" : "INACTIVE"}
                        </div>
                      </div>

                      <div className="release-metadata">
                        <span>
                          <strong>{release.termCount}</strong> terms
                        </span>
                        <span>Imported {formatDate(release.importedAt)}</span>
                        <span>By {release.importedBy || "Unknown"}</span>
                      </div>

                      <div className="release-actions">
                        <button
                          onClick={() => handleViewTerms(release)}
                          disabled={busy === `terms-${release.id}`}
                        >
                          <BookOpen size={16} />
                          {expandedRelease === release.id
                            ? "Hide terms"
                            : "Inspect terms"}
                        </button>
                        {!release.active && (
                          <button
                            className="activate-release"
                            onClick={() => handleActivate(release)}
                            disabled={busy === `activate-${release.id}`}
                          >
                            <Power size={16} />
                            Activate
                          </button>
                        )}
                      </div>

                      {expandedRelease === release.id && (
                        <div className="release-terms">
                          {(termsByRelease[release.id] || []).map(
                            (term) => (
                              <div key={term.id}>
                                <code>{term.code}</code>
                                <strong>{term.display}</strong>
                                <span>
                                  {term.category || term.synonyms || "—"}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}

            <section className="import-report-section">
              <div className="terminology-section-heading">
                <div>
                  <span>VALIDATION HISTORY</span>
                  <h2>Import reports</h2>
                </div>
                <BadgeCheck size={22} />
              </div>

              <div className="import-report-list">
                {jobs.length === 0 && <p>No import jobs recorded.</p>}
                {jobs.map((job) => (
                  <article key={job.id}>
                    <div>
                      <span>{job.system}</span>
                      <strong>{job.version}</strong>
                      <small>{formatDate(job.completedAt)}</small>
                    </div>
                    <div className={`job-status ${job.status.toLowerCase()}`}>
                      {job.status}
                    </div>
                    <div className="job-counts">
                      <span>Total <strong>{job.total}</strong></span>
                      <span>Imported <strong>{job.imported}</strong></span>
                      <span>Rejected <strong>{job.rejected}</strong></span>
                    </div>
                    {job.errors.length > 0 && (
                      <ul>
                        {job.errors.slice(0, 5).map((item, index) => (
                          <li key={`${job.id}-${index}`}>
                            {item.row ? `Row ${item.row}: ` : ""}
                            {item.reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default TerminologyAdmin;
