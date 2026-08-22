import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import SectionHeading from "../ui/SectionHeading";
import BotanicalMark from "./three/BotanicalMark";

function ProblemSection() {
  return (
    <section
      className="section problem-section"
      id="problem"
    >
      <div className="section-container">
        <SectionHeading
          number="01"
          label="THE GAP"
          title="Medicine speaks more than"
          accent="one language."
        />

        <div className="problem-grid">
          {/* =====================================
              TRADITIONAL KNOWLEDGE
          ====================================== */}

          <motion.article
            className="knowledge-record traditional-record paper-texture"
            initial={{
              opacity: 0,
              x: -60,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            {/* Decorative botanical illustration */}
            <BotanicalMark className="record-botanical" />

            <div className="record-head">
              <span>
                TRADITIONAL KNOWLEDGE
              </span>

              <span>
                NAMASTE
              </span>
            </div>

            <div className="record-body">
              <span className="record-index">
                01-A
              </span>

              <div className="engraved-symbol">
                ⚕
              </div>

              <h3>
                अम्लपित्त
              </h3>

              <h4>
                Amlapitta
              </h4>

              <p>
                Traditional terminology retains its own
                clinical context, spelling, language,
                provenance and terminology version.
              </p>

              <div className="record-meta">
                <div>
                  <span>
                    SYSTEM
                  </span>

                  <strong>
                    NAMASTE
                  </strong>
                </div>

                <div>
                  <span>
                    VERSION
                  </span>

                  <strong>
                    2026-DEMO
                  </strong>
                </div>
              </div>

              <div className="record-code">
                DEMO-NAM-001
              </div>
            </div>
          </motion.article>

          {/* =====================================
              THE TERMINOLOGY GAP
          ====================================== */}

          <motion.div
            className="problem-middle"
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 0.6,
              delay: 0.15,
            }}
          >
            <div className="broken-connection">
              <span />

              <div>
                ?
              </div>

              <span />
            </div>

            <span className="problem-middle-label">
              TERMINOLOGY GAP
            </span>

            <p>
              Similar words do not automatically mean
              equivalent medical concepts.
            </p>

            <small>
              Mapping requires terminology provenance,
              versioning and human verification.
            </small>
          </motion.div>

          {/* =====================================
              INTERNATIONAL STANDARD
          ====================================== */}

          <motion.article
            className="knowledge-record modern-record"
            initial={{
              opacity: 0,
              x: 60,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            <div className="modern-grid-decoration" />

            <div className="record-head">
              <span>
                GLOBAL STANDARD
              </span>

              <span>
                ICD-11 TM2
              </span>
            </div>

            <div className="record-body">
              <span className="record-index">
                01-B
              </span>

              <div className="modern-standard-symbol">
                TM2
              </div>

              <h3>
                ICD-11
              </h3>

              <h4>
                Traditional Medicine Module 2
              </h4>

              <p>
                International healthcare systems require
                structured, versioned and interoperable
                terminology.
              </p>

              <div className="record-meta modern-record-meta">
                <div>
                  <span>
                    FORMAT
                  </span>

                  <strong>
                    STRUCTURED
                  </strong>
                </div>

                <div>
                  <span>
                    EXCHANGE
                  </span>

                  <strong>
                    FHIR R4
                  </strong>
                </div>
              </div>

              <div className="record-code">
                TM2 / STANDARDIZED
              </div>
            </div>
          </motion.article>
        </div>

        {/* =====================================
            MEDBRIDGE SOLUTION
        ====================================== */}

        <motion.div
          className="bridge-answer"
          initial={{
            opacity: 0,
            y: 35,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.5,
          }}
          transition={{
            duration: 0.7,
            delay: 0.15,
          }}
        >
          <span>
            NAMASTE
          </span>

          <div className="answer-line">
            <ArrowRight />

            <strong>
              MEDBRIDGE
            </strong>

            <ArrowRight />
          </div>

          <span>
            ICD-11 TM2
          </span>
        </motion.div>

        <motion.p
          className="bridge-answer-description"
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.35,
          }}
        >
          Preserve the traditional diagnosis while connecting
          it to a reviewed international terminology mapping.
        </motion.p>
      </div>
    </section>
  );
}

export default ProblemSection;