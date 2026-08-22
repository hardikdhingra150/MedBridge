import { motion } from "framer-motion";
import {
  BrainCircuit,
  UserCheck,
  Check,
  X,
} from "lucide-react";

import SectionHeading from "../ui/SectionHeading";

function SafetySection() {
  return (
    <section className="section safety-section" id="safety">
      <div className="section-container">
        <SectionHeading
          number="06"
          label="CLINICAL GOVERNANCE"
          title="AI retrieves."
          accent="Experts decide."
        />

        <div className="safety-layout">
          <motion.div
            className="ai-review-card"
            initial={{ opacity: 0, x: -45 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="review-card-header">
              <BrainCircuit />

              <div>
                <span>AI MAPPING CANDIDATE</span>
                <strong>REVIEW REQUIRED</strong>
              </div>
            </div>

            <div className="candidate-code">
              DEMO-TM2-009
            </div>

            <div className="confidence-row">
              <span>Lexical evidence</span>
              <strong>84%</strong>
            </div>

            <div className="confidence-row">
              <span>Synonym evidence</span>
              <strong>77%</strong>
            </div>

            <div className="confidence-row">
              <span>Semantic similarity</span>
              <strong>91%</strong>
            </div>

            <div className="confidence-row">
              <span>Rule evidence</span>
              <strong>68%</strong>
            </div>

            <div className="ai-notice">
              Similarity is retrieval evidence — not proof of
              clinical equivalence.
            </div>

            <div className="review-buttons">
              <button className="reject-button">
                <X size={17} />
                Reject
              </button>

              <button className="review-button">
                Review candidate
              </button>
            </div>
          </motion.div>

          <div className="governance-flow">
            <div className="governance-step">
              <BrainCircuit />

              <div>
                <span>STEP 01</span>
                <strong>AI retrieves candidates</strong>
              </div>
            </div>

            <div className="governance-line" />

            <div className="governance-step">
              <UserCheck />

              <div>
                <span>STEP 02</span>
                <strong>
                  Terminology expert reviews evidence
                </strong>
              </div>
            </div>

            <div className="governance-line" />

            <div className="governance-step verified-step">
              <Check />

              <div>
                <span>STEP 03</span>
                <strong>Mapping becomes VERIFIED</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SafetySection;