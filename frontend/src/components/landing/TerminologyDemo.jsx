import {
    useEffect,
    useState,
  } from "react";

  import {
    Search,
    BadgeCheck,
    ArrowRight,
    Database,
    LoaderCircle,
  } from "lucide-react";

  import {
    motion,
    AnimatePresence,
  } from "framer-motion";

  import SectionHeading from "../ui/SectionHeading";

  import {
    searchTerminology,
    getMapping,
  } from "../../services/api";


  function TerminologyDemo() {
    const [query, setQuery] =
      useState("");

    const [results, setResults] =
      useState([]);

    const [selected, setSelected] =
      useState(null);

    const [mapping, setMapping] =
      useState(null);

    const [loading, setLoading] =
      useState(false);

    const [mappingLoading, setMappingLoading] =
      useState(false);

    const [error, setError] =
      useState("");


    /* =========================================
       TERMINOLOGY SEARCH
    ========================================= */

    useEffect(() => {
      if (!query.trim()) {
        return;
      }

      /*
        Debounce search.

        We don't want to call FastAPI after
        every single keystroke immediately.
      */

      const timer = setTimeout(
        async () => {
          try {
            setLoading(true);
            setError("");

            const data =
              await searchTerminology(
                query
              );

            setResults(data);
          } catch (error) {
            console.error(error);

            setResults([]);

            setError(
              "Unable to search terminology."
            );
          } finally {
            setLoading(false);
          }
        },
        300
      );

      return () =>
        clearTimeout(timer);
    }, [query]);


    /* =========================================
       EXAMPLE SEARCH
    ========================================= */

    const selectExample = (value) => {
      setQuery(value);

      setSelected(null);
      setMapping(null);
      setError("");
    };


    /* =========================================
       SELECT TERMINOLOGY
    ========================================= */

    const selectTerm = async (term) => {
      try {
        setSelected(term);

        setMapping(null);

        setMappingLoading(true);

        setError("");

        /*
          Ask backend for the reviewed mapping.

          GET:
          /api/v1/mappings/{NAMASTE_CODE}
        */

        const mappingData =
          await getMapping(term.code);

        setMapping(mappingData);
      } catch (error) {
        console.error(error);

        setError(
          "No mapping is currently available for this terminology."
        );
      } finally {
        setMappingLoading(false);
      }
    };


    /* =========================================
       BACK
    ========================================= */

    const backToResults = () => {
      setSelected(null);
      setMapping(null);
      setError("");
    };


    return (
      <section
        className="section terminology-section"
        id="terminology"
      >
        <div className="section-container">

          <SectionHeading
            number="03"
            label="TERMINOLOGY ENGINE"
            title="Search knowledge"
            accent="naturally."
          />


          <div className="terminology-console">

            {/* =================================
                CONSOLE HEADER
            ================================= */}

            <div className="console-top">

              <div className="console-title">

                <Database size={17} />

                <div>
                  <strong>
                    NAMASTE Explorer
                  </strong>

                  <span>
                    MEDBRIDGE TERMINOLOGY SERVICE
                  </span>
                </div>

              </div>


              <div className="console-status">

                <span />

                API CONNECTED

              </div>

            </div>


            {/* =================================
                SEARCH
            ================================= */}

            <div className="search-shell">

              <Search size={22} />

              <input
                value={query}
                placeholder="Search NAMASTE terminology..."
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);

                  if (!value.trim()) {
                    setResults([]);
                  }

                  setSelected(null);
                  setMapping(null);
                  setError("");
                }}
              />


              {loading ? (
                <LoaderCircle
                  className="search-loader"
                  size={18}
                />
              ) : (
                <kbd>
                  ⌘ K
                </kbd>
              )}

            </div>


            {/* =================================
                EXAMPLE QUERIES
            ================================= */}

            <div className="example-row">

              <span>
                TRY
              </span>

              <button
                onClick={() =>
                  selectExample("amlpit")
                }
              >
                amlpit
              </button>

              <button
                onClick={() =>
                  selectExample("jwar")
                }
              >
                jwar
              </button>

              <button
                onClick={() =>
                  selectExample("ama")
                }
              >
                ama
              </button>

            </div>


            {/* =================================
                RESULTS AREA
            ================================= */}

            <div className="console-content">

              {!query && (
                <div className="empty-search">

                  <div className="archive-symbol">
                    ⌕
                  </div>

                  <p>
                    Start typing to search the
                    NAMASTE terminology service.
                  </p>

                </div>
              )}


              {/* LOADING */}

              {query &&
                loading &&
                !selected && (

                  <div className="empty-search">

                    <LoaderCircle
                      className="search-loader"
                      size={24}
                    />

                    <p>
                      Searching terminology...
                    </p>

                  </div>

                )}


              <AnimatePresence mode="wait">

                {/* =============================
                    NO RESULTS
                ============================= */}

                {query &&
                  !loading &&
                  results.length === 0 &&
                  !selected &&
                  !error && (

                    <motion.div
                      className="empty-search"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                    >

                      No terminology found.

                    </motion.div>

                  )}


                {/* =============================
                    SEARCH RESULTS
                ============================= */}

                {query &&
                  !loading &&
                  results.length > 0 &&
                  !selected && (

                    <motion.div
                      className="results-list"
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                    >

                      <div className="results-meta">

                        {results.length}

                        {" "}

                        candidate

                        {results.length > 1
                          ? "s"
                          : ""}

                        {" "}

                        found

                      </div>


                      {results.map(
                        (term) => (

                          <button
                            className="term-result"
                            key={term.code}
                            onClick={() =>
                              selectTerm(term)
                            }
                          >

                            {/* NAMASTE */}

                            <div className="term-language">

                              <span className="term-code">
                                {term.code}
                              </span>

                              <h3>
                                {term.display}
                              </h3>

                              <p>
                                {term.devanagari}
                              </p>

                              <small>
                                Release {term.version} · {term.source}
                              </small>

                            </div>


                            {/* CATEGORY */}

                            <div className="term-category">

                              <span>
                                CATEGORY
                              </span>

                              <strong>
                                {term.category ||
                                  "Uncategorized"}
                              </strong>

                            </div>


                            {/* SCORE */}

                            <div className="match-score">

                              <span>
                                MATCH
                              </span>

                              <div>

                                <strong>
                                  {Math.round(
                                    term.score
                                  )}
                                  %
                                </strong>


                                <div className="score-bar">

                                  <span
                                    style={{
                                      width:
                                        `${Math.round(
                                          term.score
                                        )}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            </div>


                            <ArrowRight
                              size={20}
                            />

                          </button>

                        )
                      )}

                    </motion.div>

                  )}


                {/* =============================
                    SELECTED TERMINOLOGY
                ============================= */}

                {selected && (

                  <motion.div
                    className="mapping-reveal"
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                  >

                    <button
                      className="back-result"
                      onClick={
                        backToResults
                      }
                    >
                      ← Back to candidates
                    </button>


                    {/* =========================
                        MAPPING LOADING
                    ========================= */}

                    {mappingLoading && (

                      <div className="empty-search">

                        <LoaderCircle
                          className="search-loader"
                          size={24}
                        />

                        <p>
                          Retrieving verified
                          mapping...
                        </p>

                      </div>

                    )}


                    {/* =========================
                        MAPPING RESULT
                    ========================= */}

                    {!mappingLoading &&
                      mapping && (
                        <>
                        <div className="mapping-grid">

                          {/* NAMASTE SOURCE */}

                          <div className="mapping-card source-map">

                            <span>
                              NAMASTE SOURCE
                            </span>

                            <div className="mapping-devanagari">

                              {
                                selected.devanagari
                              }

                            </div>

                            <h3>
                              {
                                mapping.source
                                  .display
                              }
                            </h3>

                            <code>
                              {
                                mapping.source
                                  .code
                              }
                            </code>

                            <small>

                              Release{" "}

                              {
                                mapping.source
                                  .version
                              }

                            </small>

                          </div>


                          {/* MAPPING STATUS */}

                          <div className="mapping-connector">

                            <div className="moving-dot" />


                            {mapping.status ===
                            "VERIFIED" ? (

                              <div className="verification-seal">

                                <BadgeCheck
                                  size={25}
                                />

                                <span>
                                  HUMAN
                                </span>

                                <strong>
                                  VERIFIED
                                </strong>

                              </div>

                            ) : (

                              <div className="review-seal">

                                <span>
                                  REVIEW
                                </span>

                                <strong>
                                  REQUIRED
                                </strong>

                              </div>

                            )}

                          </div>


                          {/* ICD TARGET */}

                          <div className="mapping-card target-map">

                            <span>
                              ICD-11 TM2 TARGET
                            </span>

                            <div className="tm2-symbol">
                              TM2
                            </div>

                            <h3>
                              {
                                mapping.target
                                  .display
                              }
                            </h3>

                            <code>
                              {
                                mapping.target
                                  .code
                              }
                            </code>

                            <small>
                              {
                                mapping.relationship
                              }

                              {" · Release "}

                              {
                                mapping.target
                                  .version
                              }
                            </small>

                          </div>

                        </div>

                        <div className="mapping-provenance-note">
                          Method {mapping.provenance.method}
                          {mapping.provenance.reviewedBy
                            ? ` · Reviewed by ${mapping.provenance.reviewedBy}`
                            : ""}
                        </div>
                        </>

                      )}


                    {/* ERROR */}

                    {!mappingLoading &&
                      error && (

                        <div className="mapping-warning">
                          {error}
                        </div>

                      )}


                    {/* WARNING */}

                    {mapping && (

                      <div className="mapping-warning">

                        Demonstration terminology only.
                        Production mappings require
                        official releases and qualified
                        expert verification.

                      </div>

                    )}

                  </motion.div>

                )}

              </AnimatePresence>

            </div>

          </div>

        </div>
      </section>
    );
  }

  export default TerminologyDemo;
