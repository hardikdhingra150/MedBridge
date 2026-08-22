import { useState } from "react";

import {
  ArrowLeft,
  BadgeCheck,
  BrainCircuit,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  generateCandidates,
  reviewCandidate,
} from "../../services/api";
import { useAuth } from "../../context/auth";

import "./ReviewQueue.css";

function ReviewQueue() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [namasteCode, setNamasteCode] =
    useState("DEMO-NAM-001");

  const [candidates, setCandidates] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [reviewingId, setReviewingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [comment, setComment] =
    useState("");

  const rankedCandidates = [...candidates].sort(
    (left, right) =>
      right.retrievalScore - left.retrievalScore
  );

  const hasApprovedCandidate = rankedCandidates.some(
    (candidate) => candidate.status === "APPROVED"
  );
  const pendingCandidates = rankedCandidates.filter(
    (candidate) => candidate.status === "PENDING"
  );
  const bestCandidate = hasApprovedCandidate
    ? null
    : pendingCandidates[0] || null;
  const runnerUpCandidate = hasApprovedCandidate
    ? null
    : pendingCandidates[1] || null;
  const scoreLead = bestCandidate && runnerUpCandidate
    ? Math.max(
        0,
        bestCandidate.retrievalScore -
          runnerUpCandidate.retrievalScore
      )
    : 0;

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data =
        await generateCandidates(
          namasteCode
        );

      setCandidates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    candidateId,
    action
  ) => {
    try {
      setReviewingId(candidateId);
      setError("");
      setSuccess("");

      const result =
        await reviewCandidate(
          candidateId,
          action,
          comment
        );

      setCandidates((current) =>
        current.map((candidate) =>
          candidate.candidateId ===
          candidateId
            ? {
                ...candidate,
                status:
                  result.status,
              }
            : candidate
        )
      );

      setSuccess(
        result.message
      );

      setComment("");
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="review-page">

      <header className="review-topbar">
        <button
          className="review-back"
          onClick={() =>
            navigate("/platform")
          }
        >
          <ArrowLeft size={17} />
          Platform
        </button>

        <div className="review-brand">
          <div className="review-logo">
            M
          </div>

          <div>
            <strong>
              MEDBRIDGE
            </strong>

            <span>
              EXPERT REVIEW CONSOLE
            </span>
          </div>
        </div>

        <div className="review-role">
          <ShieldCheck size={16} />
          {user.name} · {user.role}
        </div>
      </header>

      <main className="review-container">

        <section className="review-intro">

          <div>
            <span className="review-eyebrow">
              MAPPING GOVERNANCE
            </span>

            <h1>
              Expert Mapping
              <em> Review Queue</em>
            </h1>

            <p>
              Review machine-retrieved ICD-11
              TM2 candidates before they can
              become verified mappings.
            </p>
          </div>

          <div className="review-count">
            <span>
              PENDING
            </span>

            <strong>
              {
                candidates.filter(
                  (item) =>
                    item.status ===
                    "PENDING"
                ).length
              }
            </strong>
          </div>

        </section>

        <section className="candidate-generator">

          <div>
            <span>
              NAMASTE SOURCE CODE
            </span>

            <strong>
              Generate mapping candidates
            </strong>
          </div>

          <div className="candidate-generator-controls">

            <input
              value={namasteCode}
              onChange={(event) =>
                setNamasteCode(
                  event.target.value
                )
              }
              placeholder="DEMO-NAM-001"
            />

            <button
              onClick={loadCandidates}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle
                    className="review-spinner"
                    size={17}
                  />
                  Generating
                </>
              ) : (
                <>
                  <BrainCircuit
                    size={17}
                  />
                  Generate Candidates
                </>
              )}
            </button>

          </div>

        </section>

        {error && (
          <div className="review-message review-error">
            {error}
          </div>
        )}

        {success && (
          <div className="review-message review-success">
            {success}
          </div>
        )}

        {bestCandidate && (
          <section className="best-candidate-summary">
            <div className="best-candidate-icon">
              <BadgeCheck size={24} />
            </div>

            <div>
              <span>
                MOST LIKELY MATCH · REVIEW FIRST
              </span>

              <strong>
                {bestCandidate.target.display}
              </strong>

              <p>
                Highest algorithm match at{" "}
                {Math.round(
                  bestCandidate.retrievalScore
                )}%
                {runnerUpCandidate && scoreLead > 0
                  ? ` · ${Math.round(scoreLead)} points above the next candidate`
                  : ""}
                . This is a recommendation, not an automatic verification.
              </p>
            </div>
          </section>
        )}

        {!loading &&
          candidates.length === 0 && (

            <section className="review-empty">

              <BrainCircuit
                size={32}
              />

              <h2>
                No candidates loaded
              </h2>

              <p>
                Enter a NAMASTE code and
                generate candidates for expert
                review.
              </p>

            </section>

          )}

        <AnimatePresence>

          <div className="candidate-list">

            {rankedCandidates.map(
              (candidate, index) => (

                <motion.article
                  key={
                    candidate.candidateId
                  }
                  className={`candidate-card ${
                    candidate.candidateId ===
                    bestCandidate?.candidateId
                      ? "candidate-card-best"
                      : ""
                  }`}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.08,
                  }}
                >

                  <div className="candidate-card-top">

                    <div>
                      <span>
                        MAPPING CANDIDATE
                      </span>

                      <strong>
                        Candidate{" "}
                        {index + 1}
                      </strong>
                    </div>

                    <div className="candidate-card-badges">

                      {candidate.candidateId ===
                        bestCandidate?.candidateId && (
                        <div className="candidate-best-match">
                          <BadgeCheck size={13} />
                          MOST LIKELY MATCH
                        </div>
                      )}

                      <div
                        className={`candidate-status candidate-status-${candidate.status.toLowerCase()}`}
                      >
                        {candidate.status}
                      </div>

                    </div>

                  </div>

                  <div className="candidate-map">

                    <div className="candidate-source">

                      <span>
                        NAMASTE SOURCE
                      </span>

                      <h3>
                        {
                          candidate.source
                            .display
                        }
                      </h3>

                      <code>
                        {
                          candidate.source
                            .code
                        }
                      </code>

                      <small>
                        Release {candidate.source.version}
                      </small>

                    </div>

                    <div className="candidate-arrow">

                      <span />

                      <BrainCircuit
                        size={25}
                      />

                      <span />

                    </div>

                    <div className="candidate-target">

                      <span>
                        ICD-11 TM2 TARGET
                      </span>

                      <h3>
                        {
                          candidate.target
                            .display
                        }
                      </h3>

                      <code>
                        {
                          candidate.target
                            .code
                        }
                      </code>

                      <small>
                        Release {candidate.target.version}
                      </small>

                    </div>

                  </div>

                  <div className="candidate-scores">

                    <div className="main-score">

                      <span>
                        RETRIEVAL SCORE
                      </span>

                      <strong>
                        {Math.round(
                          candidate.retrievalScore
                        )}
                        %
                      </strong>

                      <div className="review-score-bar">
                        <span
                          style={{
                            width:
                              `${Math.min(
                                candidate.retrievalScore,
                                100
                              )}%`,
                          }}
                        />
                      </div>

                    </div>

                    <div className="score-detail">

                      <span>
                        Lexical
                      </span>

                      <strong>
                        {Math.round(
                          candidate.lexicalScore
                        )}
                        %
                      </strong>

                    </div>

                    <div className="score-detail">

                      <span>
                        Definition
                      </span>

                      <strong>
                        {Math.round(
                          candidate.definitionScore
                        )}
                        %
                      </strong>

                    </div>

                  </div>

                  <div className="candidate-explanation">

                    <BrainCircuit
                      size={17}
                    />

                    <div>
                      <span>
                        MACHINE EXPLANATION
                      </span>

                      <p>
                        {
                          candidate.explanation
                        }
                      </p>

                      <small>
                        Algorithm {candidate.algorithmVersion}
                      </small>
                    </div>

                  </div>

                  {candidate.status ===
                    "PENDING" && (

                    <div className="candidate-review">

                      <div className="reviewer-inputs">

                        <div>
                          <label>
                            Review note
                          </label>

                          <textarea
                            value={comment}
                            onChange={(
                              event
                            ) =>
                              setComment(
                                event.target
                                  .value
                              )
                            }
                            placeholder="Add clinical terminology reasoning..."
                          />
                        </div>

                      </div>

                      <div className="review-actions">

                        <button
                          className="reject-candidate"
                          disabled={
                            reviewingId ===
                            candidate.candidateId
                          }
                          onClick={() =>
                            handleReview(
                              candidate.candidateId,
                              "REJECT"
                            )
                          }
                        >
                          <X size={17} />
                          Reject
                        </button>

                        <button
                          className="approve-candidate"
                          disabled={
                            reviewingId ===
                            candidate.candidateId
                          }
                          onClick={() =>
                            handleReview(
                              candidate.candidateId,
                              "APPROVE"
                            )
                          }
                        >

                          {reviewingId ===
                          candidate.candidateId ? (
                            <LoaderCircle
                              className="review-spinner"
                              size={17}
                            />
                          ) : (
                            <BadgeCheck
                              size={17}
                            />
                          )}

                          Verify Mapping

                        </button>

                      </div>

                    </div>

                  )}

                  {candidate.status ===
                    "APPROVED" && (

                    <div className="candidate-reviewed approved-review">

                      <BadgeCheck
                        size={20}
                      />

                      Candidate approved and
                      promoted to a VERIFIED
                      mapping.

                    </div>

                  )}

                  {candidate.status ===
                    "REJECTED" && (

                    <div className="candidate-reviewed rejected-review">

                      <X size={20} />

                      Candidate rejected by
                      terminology expert.

                    </div>

                  )}

                </motion.article>

              )
            )}

          </div>

        </AnimatePresence>

      </main>
    </div>
  );
}

export default ReviewQueue;
