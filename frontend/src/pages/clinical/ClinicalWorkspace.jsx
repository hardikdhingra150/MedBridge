import {
    useEffect,
    useState,
  } from "react";

  import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Check,
    ClipboardCheck,
    Copy,
    Database,
    Download,
    FileJson,
    LoaderCircle,
    Search,
    ShieldCheck,
    UserRound,
  } from "lucide-react";

  import { useNavigate } from "react-router-dom";

  import {
    createDiagnosis,
    getFhirCondition,
    getMapping,
    getPatients,
    searchTerminology,
  } from "../../services/api";

  import "./ClinicalWorkspace.css";


  function ClinicalWorkspace() {
    const navigate = useNavigate();

    const [patients, setPatients] =
      useState([]);

    const [selectedPatient, setSelectedPatient] =
      useState(null);

    const [query, setQuery] =
      useState("");

    const [results, setResults] =
      useState([]);

    const [selectedTerm, setSelectedTerm] =
      useState(null);

    const [mapping, setMapping] =
      useState(null);

    const [diagnosis, setDiagnosis] =
      useState(null);

    const [fhir, setFhir] =
      useState(null);

    const [fhirValidation, setFhirValidation] =
      useState(null);

    const [loadingPatients, setLoadingPatients] =
      useState(true);

    const [searching, setSearching] =
      useState(false);

    const [mappingLoading, setMappingLoading] =
      useState(false);

    const [confirming, setConfirming] =
      useState(false);

    const [confirmationNotice, setConfirmationNotice] =
      useState(null);

    const [error, setError] =
      useState("");

    const [copied, setCopied] =
      useState(false);


    /* ========================================
       LOAD PATIENTS
    ======================================== */

    useEffect(() => {
      async function loadPatients() {
        try {
          setLoadingPatients(true);

          const data =
            await getPatients();

          setPatients(data);

          if (data.length > 0) {
            setSelectedPatient(
              data.find(
                (patient) =>
                  patient.consentActive
              ) || data[0]
            );
          }

        } catch (err) {
          setError(err.message);

        } finally {
          setLoadingPatients(false);
        }
      }

      loadPatients();
    }, []);


    /* ========================================
       TERMINOLOGY SEARCH
    ======================================== */

    useEffect(() => {
      if (!query.trim()) {
        return;
      }

      const timer =
        setTimeout(
          async () => {
            try {
              setSearching(true);
              setError("");

              const data =
                await searchTerminology(
                  query
                );

              setResults(data);

            } catch (err) {
              setError(err.message);

            } finally {
              setSearching(false);
            }
          },
          300
        );

      return () =>
        clearTimeout(timer);

    }, [query]);


    /* ========================================
       SELECT TERMINOLOGY
    ======================================== */

    async function selectTerm(term) {
      try {
        setSelectedTerm(term);

        setMapping(null);
        setDiagnosis(null);
        setFhir(null);
        setFhirValidation(null);
        setConfirmationNotice(null);

        setMappingLoading(true);
        setError("");

        const data =
          await getMapping(
            term.code
          );

        setMapping(data);

      } catch (err) {
        setError(err.message);

      } finally {
        setMappingLoading(false);
      }
    }


    /* ========================================
       CONFIRM DIAGNOSIS
    ======================================== */

    async function confirmDiagnosis() {
      if (!selectedPatient) {
        setConfirmationNotice({
          type: "error",
          message: "Select a patient first.",
        });

        return;
      }

      if (!selectedPatient.consentActive) {
        setConfirmationNotice({
          type: "error",
          message: (
            "Diagnosis cannot be confirmed because " +
            "this patient's consent is inactive."
          ),
        });

        return;
      }

      if (!selectedTerm) {
        setConfirmationNotice({
          type: "error",
          message: "Select a terminology concept.",
        });

        return;
      }

      if (
        !mapping ||
        mapping.status !== "VERIFIED"
      ) {
        setConfirmationNotice({
          type: "error",
          message: "Only verified mappings can be confirmed.",
        });

        return;
      }

      try {
        setConfirming(true);
        setError("");
        setConfirmationNotice(null);

        /*
          1. Save diagnosis
        */

        const created =
          await createDiagnosis(
            selectedPatient.id,
            selectedTerm.code
          );

        setDiagnosis(created);

        setConfirmationNotice({
          type: "success",
          message: (
            "Dual-code diagnosis confirmed. " +
            "Generating its FHIR R4 Condition..."
          ),
        });

        /*
          2. Generate FHIR from
             saved diagnosis
        */

        try {
          const condition =
            await getFhirCondition(
              created.id
            );

          setFhir(condition.resource);
          setFhirValidation(condition.validation);

          setConfirmationNotice({
            type: "success",
            message: (
              "Diagnosis confirmed and FHIR R4 " +
              "Condition generated successfully."
            ),
          });

        } catch (err) {
          setConfirmationNotice({
            type: "warning",
            message: (
              "Diagnosis was confirmed, but FHIR " +
              `generation failed: ${err.message}`
            ),
          });
        }

      } catch (err) {
        setConfirmationNotice({
          type: "error",
          message: err.message,
        });

      } finally {
        setConfirming(false);
      }
    }


    /* ========================================
       COPY FHIR
    ======================================== */

    async function copyFhir() {
      if (!fhir) return;

      await navigator.clipboard.writeText(
        JSON.stringify(
          fhir,
          null,
          2
        )
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        1500
      );
    }


    /* ========================================
       DOWNLOAD FHIR
    ======================================== */

    function downloadFhir() {
      if (!fhir) return;

      const content =
        JSON.stringify(
          fhir,
          null,
          2
        );

      const blob =
        new Blob(
          [content],
          {
            type:
              "application/fhir+json",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href = url;

      anchor.download =
        `medbridge-condition-${diagnosis.id}.json`;

      anchor.click();

      URL.revokeObjectURL(
        url
      );
    }


    return (
      <div className="clinical-page">

        {/* HEADER */}

        <header className="clinical-header">

          <button
            className="clinical-back"
            onClick={() =>
              navigate("/platform")
            }
          >
            <ArrowLeft size={17} />
            Platform
          </button>


          <div className="clinical-brand">

            <div className="clinical-brand-mark">
              <span>M</span>
            </div>

            <div>
              <strong>
                MEDBRIDGE
              </strong>

              <span>
                CLINICAL WORKSPACE
              </span>
            </div>

          </div>


          <div className="clinical-secure">

            <ShieldCheck size={16} />

            CLINICAL SESSION

          </div>

        </header>


        <main className="clinical-container">

          {/* INTRO */}

          <section className="clinical-intro">

            <div>

              <span className="clinical-eyebrow">
                DUAL-CODE DIAGNOSIS
              </span>

              <h1>
                Record diagnosis.
                <em>
                  Preserve meaning.
                </em>
              </h1>

            </div>


            <div className="workflow-progress">

              <span className={
                selectedPatient
                  ? "complete"
                  : ""
              }>
                01 Patient
              </span>

              <i />

              <span className={
                selectedTerm
                  ? "complete"
                  : ""
              }>
                02 Terminology
              </span>

              <i />

              <span className={
                mapping
                  ? "complete"
                  : ""
              }>
                03 Mapping
              </span>

              <i />

              <span className={
                diagnosis
                  ? "complete"
                  : ""
              }>
                04 Confirm
              </span>

              <i />

              <span className={
                fhir
                  ? "complete"
                  : ""
              }>
                05 FHIR
              </span>

            </div>

          </section>


          {error && (
            <div className="clinical-error">
              {error}
            </div>
          )}


          {/* =================================
              STEP 1 PATIENT
          ================================= */}

          <section className="clinical-panel">

            <div className="clinical-panel-title">

              <div>
                <span>
                  STEP 01
                </span>

                <h2>
                  Select Patient
                </h2>
              </div>

              <UserRound size={21} />

            </div>


            {loadingPatients ? (

              <div className="clinical-loading">
                <LoaderCircle
                  className="clinical-spinner"
                />

                Loading patients...
              </div>

            ) : (

              <div className="patient-list">

                {patients.map(
                  (patient) => (

                    <button
                      key={patient.id}
                      className={
                        selectedPatient?.id ===
                        patient.id
                          ? "patient-option active"
                          : "patient-option"
                      }
                      type="button"
                      onClick={() => {
                        setSelectedPatient(
                          patient
                        );

                        setDiagnosis(null);
                        setFhir(null);
                        setFhirValidation(null);
                        setConfirmationNotice(null);
                        setError("");
                      }}
                    >

                      <div className="patient-avatar">
                        <UserRound
                          size={18}
                        />
                      </div>

                      <div>
                        <strong>
                          {patient.name}
                        </strong>

                        <span>
                          {
                            patient.patientIdentifier
                          }
                        </span>
                      </div>

                      <div className="patient-meta">
                        {patient.age} ·{" "}
                        {patient.gender}
                      </div>

                      {patient.consentActive ? (

                        <div className="consent-active">
                          <Check size={13} />
                          CONSENT
                        </div>

                      ) : (

                        <div className="consent-inactive">
                          NO CONSENT
                        </div>

                      )}

                    </button>

                  )
                )}

              </div>

            )}

          </section>


          {/* =================================
              STEP 2 SEARCH
          ================================= */}

          <section className="clinical-panel">

            <div className="clinical-panel-title">

              <div>
                <span>
                  STEP 02
                </span>

                <h2>
                  Search NAMASTE
                </h2>
              </div>

              <Database size={21} />

            </div>


            <div className="clinical-search">

              <Search size={20} />

              <input
                value={query}
                placeholder="Search diagnosis e.g. amlpit..."
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);

                  if (!value.trim()) {
                    setResults([]);
                  }

                  setSelectedTerm(null);
                  setMapping(null);
                  setDiagnosis(null);
                  setFhir(null);
                  setFhirValidation(null);
                  setConfirmationNotice(null);
                }}
              />

              {searching && (
                <LoaderCircle
                  className="clinical-spinner"
                  size={18}
                />
              )}

            </div>


            {results.length > 0 &&
              !selectedTerm && (

                <div className="clinical-results">

                  {results.map(
                    (term) => (

                      <button
                        key={term.code}
                        onClick={() =>
                          selectTerm(term)
                        }
                      >

                        <div>
                          <span>
                            {term.code}
                          </span>

                          <strong>
                            {term.display}
                          </strong>

                          <small>
                            {term.devanagari}
                          </small>

                          <small className="clinical-release-label">
                            Release {term.version} · {term.source}
                          </small>
                        </div>


                        <div className="clinical-match">

                          {Math.round(
                            term.score
                          )}
                          %

                        </div>


                        <ArrowRight
                          size={18}
                        />

                      </button>

                    )
                  )}

                </div>

              )}


            {selectedTerm && (

              <div className="selected-concept">

                <div>
                  <span>
                    SELECTED CONCEPT
                  </span>

                  <strong>
                    {
                      selectedTerm.display
                    }
                  </strong>

                  <small>
                    {
                      selectedTerm.devanagari
                    }
                  </small>

                  <small className="clinical-release-label">
                    Release {selectedTerm.version}
                  </small>
                </div>

                <code>
                  {selectedTerm.code}
                </code>

              </div>

            )}

          </section>


          {/* =================================
              STEP 3 MAPPING
          ================================= */}

          {selectedTerm && (

            <section className="clinical-panel">

              <div className="clinical-panel-title">

                <div>
                  <span>
                    STEP 03
                  </span>

                  <h2>
                    Verify Mapping
                  </h2>
                </div>

                <BadgeCheck
                  size={21}
                />

              </div>


              {mappingLoading ? (

                <div className="clinical-loading">

                  <LoaderCircle
                    className="clinical-spinner"
                  />

                  Retrieving verified mapping...

                </div>

              ) : mapping ? (
                <>
                <div className="clinical-mapping">

                  <div className="clinical-source">

                    <span>
                      NAMASTE
                    </span>

                    <strong>
                      {
                        mapping.source
                          .display
                      }
                    </strong>

                    <code>
                      {
                        mapping.source
                          .code
                      }
                    </code>

                    <small>
                      Version{" "}
                      {
                        mapping.source
                          .version
                      }
                    </small>

                  </div>


                  <div className="clinical-bridge">

                    <ArrowRight />

                    <div
                      className={
                        mapping.status ===
                        "VERIFIED"
                          ? "mapping-verified"
                          : "mapping-review"
                      }
                    >
                      <BadgeCheck
                        size={17}
                      />

                      {
                        mapping.status
                      }
                    </div>

                  </div>


                  <div className="clinical-target">

                    <span>
                      ICD-11 TM2
                    </span>

                    <strong>
                      {
                        mapping.target
                          .display
                      }
                    </strong>

                    <code>
                      {
                        mapping.target
                          .code
                      }
                    </code>

                    <small>
                      Version{" "}
                      {
                        mapping.target
                          .version
                      }
                    </small>

                  </div>

                </div>

                <div className="clinical-provenance">
                  <span>
                    Method
                    <strong>{mapping.provenance.method}</strong>
                  </span>
                  <span>
                    Reviewed by
                    <strong>
                      {mapping.provenance.reviewedBy || "Demo provenance"}
                    </strong>
                  </span>
                  <span>
                    Source release
                    <strong>{mapping.source.version}</strong>
                  </span>
                  <span>
                    Target release
                    <strong>{mapping.target.version}</strong>
                  </span>
                </div>
                </>

              ) : null}

            </section>

          )}


          {/* =================================
              STEP 4 CONFIRM
          ================================= */}

          {mapping && (

            <section className="clinical-panel confirm-panel">

              <div className="clinical-panel-title">

                <div>
                  <span>
                    STEP 04
                  </span>

                  <h2>
                    Confirm Diagnosis
                  </h2>
                </div>

                <ClipboardCheck
                  size={21}
                />

              </div>


              <div className="confirmation-summary">

                <div>
                  <span>
                    PATIENT
                  </span>

                  <strong>
                    {
                      selectedPatient?.name
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    NAMASTE
                  </span>

                  <strong>
                    {
                      mapping.source
                        .code
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    ICD-11 TM2
                  </span>

                  <strong>
                    {
                      mapping.target
                        .code
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    MAPPING
                  </span>

                  <strong className="summary-verified">
                    {
                      mapping.status
                    }
                  </strong>
                </div>

              </div>


              {!selectedPatient?.consentActive && (
                <div
                  className="confirmation-notice error"
                  role="alert"
                >
                  This patient has no active consent. Select a patient
                  marked CONSENT before confirming a diagnosis.
                </div>
              )}


              {confirmationNotice && (
                <div
                  className={`confirmation-notice ${confirmationNotice.type}`}
                  role={
                    confirmationNotice.type === "error"
                      ? "alert"
                      : "status"
                  }
                  aria-live="polite"
                >
                  {confirmationNotice.message}
                </div>
              )}


              {!diagnosis ? (

                <button
                  className="confirm-diagnosis"
                  type="button"
                  disabled={
                    confirming ||
                    !selectedPatient?.consentActive ||
                    mapping.status !==
                      "VERIFIED"
                  }
                  onClick={
                    confirmDiagnosis
                  }
                >

                  {!selectedPatient?.consentActive ? (

                    <>
                      <ShieldCheck
                        size={18}
                      />

                      Patient Consent Required
                    </>

                  ) : confirming ? (

                    <>
                      <LoaderCircle
                        className="clinical-spinner"
                        size={18}
                      />

                      Confirming...
                    </>

                  ) : (

                    <>
                      <BadgeCheck
                        size={18}
                      />

                      Confirm Dual-Code Diagnosis
                    </>

                  )}

                </button>

              ) : (

                <div className="diagnosis-confirmed">

                  <BadgeCheck
                    size={20}
                  />

                  <div>
                    <span>
                      DIAGNOSIS CONFIRMED
                    </span>

                    <strong>
                      {diagnosis.id}
                    </strong>
                  </div>

                </div>

              )}

            </section>

          )}


          {/* =================================
              STEP 5 FHIR
          ================================= */}

          {fhir && (

            <section className="clinical-panel fhir-panel">

              <div className="clinical-panel-title">

                <div>
                  <span>
                    STEP 05
                  </span>

                  <h2>
                    FHIR R4 Condition
                  </h2>
                </div>

                <FileJson
                  size={21}
                />

              </div>


              <div className="fhir-toolbar">

                <div>
                  <span className="fhir-ready-dot" />

                  RESOURCE GENERATED
                </div>


                <div>

                  <button
                    onClick={
                      copyFhir
                    }
                  >
                    {copied ? (
                      <Check
                        size={15}
                      />
                    ) : (
                      <Copy
                        size={15}
                      />
                    )}

                    {copied
                      ? "Copied"
                      : "Copy"}
                  </button>


                  <button
                    onClick={
                      downloadFhir
                    }
                  >
                    <Download
                      size={15}
                    />

                    Download JSON
                  </button>

                </div>

              </div>

              {fhirValidation && (
                <div className={`fhir-validation-summary ${fhirValidation.valid ? "is-valid" : "is-invalid"}`}>
                  <div>
                    <span>VALIDATION</span>
                    <strong>{fhirValidation.status}</strong>
                  </div>
                  <div>
                    <span>FHIR VERSION</span>
                    <strong>{fhirValidation.fhirVersion}</strong>
                  </div>
                  <div>
                    <span>CODINGS</span>
                    <strong>{fhirValidation.summary.codingCount}</strong>
                  </div>
                  <div>
                    <span>VALIDATOR</span>
                    <strong>{fhirValidation.validator}</strong>
                  </div>
                  {fhirValidation.errors.length > 0 && (
                    <ul>
                      {fhirValidation.errors.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}


              <pre className="clinical-fhir-json">
                {JSON.stringify(
                  fhir,
                  null,
                  2
                )}
              </pre>


              <div className="emr-ready">

                <ShieldCheck
                  size={18}
                />

                <div>
                  <span>
                    INTEROPERABILITY
                  </span>

                  <strong>
                    Condition resource ready
                    for EMR exchange
                  </strong>
                </div>

              </div>

            </section>

          )}

        </main>

      </div>
    );
  }

  export default ClinicalWorkspace;
