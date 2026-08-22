import { useEffect, useState } from "react";
import { ArrowRight, BookOpenCheck, GitMerge, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/platform/Sidebar";
import { useAuth } from "../../context/auth";
import { getMapping, searchTerminology } from "../../services/api";
import "./TerminologyExplorer.css";

function TerminologyExplorer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mapping, setMapping] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setMessage("");
        setResults(await searchTerminology(query));
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  function updateQuery(event) {
    const value = event.target.value;
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setSelected(null);
      setMapping(null);
      setMessage("");
    }
  }

  async function inspectTerm(term) {
    setSelected(term);
    setMapping(null);
    setMessage("");
    try {
      setMapping(await getMapping(term.code));
    } catch (error) {
      if (error.message === "Mapping not found") {
        setMessage("No verified mapping exists yet. This term is ready for expert review.");
      } else {
        setMessage(error.message);
      }
    }
  }

  return (
    <div className="platform-page">
      <Sidebar />
      <main className="terminology-page platform-content">
        <header className="terminology-header">
          <div><span>ACTIVE TERMINOLOGY</span><h1>Terminology Explorer</h1><p>Search the active NAMASTE release and inspect verified ICD-11 TM2 mappings.</p></div>
          <BookOpenCheck size={28} />
        </header>

        <section className="terminology-search-box">
          <Search size={21} />
          <input autoFocus value={query} onChange={updateQuery} placeholder="Try Amlapitta, Atisara, Jwara…" />
          <span>{loading ? "SEARCHING" : `${results.length} RESULTS`}</span>
        </section>

        <div className="terminology-explorer-grid">
          <section className="terminology-results">
            {results.map((term) => (
              <button key={term.id} className={selected?.id === term.id ? "term-active" : ""} onClick={() => inspectTerm(term)}>
                <div><small>{term.code}</small><strong>{term.display}</strong><span>{term.devanagari || term.category}</span></div>
                <ArrowRight size={17} />
              </button>
            ))}
            {!query && <div className="terminology-empty">Begin typing to search the active terminology release.</div>}
          </section>

          <aside className="terminology-inspector">
            {!selected ? <div className="terminology-empty">Select a concept to inspect its mapping and provenance.</div> : (
              <>
                <span>NAMASTE CONCEPT</span>
                <h2>{selected.display}</h2>
                <code>{selected.code} · {selected.version}</code>
                {mapping && <div className="mapping-inspection">
                  <small>VERIFIED ICD-11 TM2 TARGET</small>
                  <strong>{mapping.target.display}</strong>
                  <code>{mapping.target.code} · {mapping.target.version}</code>
                  <p>{mapping.relationship} · {mapping.provenance.method}</p>
                </div>}
                {message && <p className="terminology-message">{message}</p>}
                {user.role === "EXPERT" && !mapping && <button className="terminology-action" onClick={() => navigate("/review")}><GitMerge size={16} /> Open expert review</button>}
                {["DOCTOR", "ADMIN"].includes(user.role) && mapping && <button className="terminology-action" onClick={() => navigate("/clinical")}><BookOpenCheck size={16} /> Use in clinical workspace</button>}
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default TerminologyExplorer;
