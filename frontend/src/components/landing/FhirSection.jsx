import { motion } from "framer-motion";
import {
  ArrowRight,
  Server,
  CheckCircle2,
} from "lucide-react";

import SectionHeading from "../ui/SectionHeading";
import FhirTransformation from "./FhirTransformation";

function FhirSection() {
  return (
    <section
      className="section fhir-section"
      id="fhir"
    >
      <div className="section-container">

        {/* ===============================
            SECTION HEADING
        =============================== */}

        <SectionHeading
          number="05"
          label="INTEROPERABILITY"
          title="Clinical meaning becomes"
          accent="machine-readable."
        />

        {/* ===============================
            DIAGNOSIS → FHIR
        =============================== */}

        <div className="fhir-transform">

          {/* CONFIRMED DIAGNOSIS */}

          <motion.div
            className="fhir-source-card paper-texture"
            initial={{
              opacity: 0,
              x: -50,
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
            <span>
              CONFIRMED DIAGNOSIS
            </span>

            {/* NAMASTE CODE */}

            <div>
              <small>
                NAMASTE
              </small>

              <strong>
                DEMO-NAM-001
              </strong>

              <p>
                Amlapitta
              </p>
            </div>

            {/* ICD-11 CODE */}

            <div>
              <small>
                ICD-11 TM2
              </small>

              <strong>
                DEMO-TM2-001
              </strong>

              <p>
                Reviewed demonstration mapping
              </p>
            </div>

            {/* CONFIRMATION STATUS */}

            <div className="fhir-source-status">
              <span className="status-dot" />

              DUAL-CODE CONFIRMED
            </div>
          </motion.div>

          {/* ===============================
              TRANSFORMATION ARROW
          =============================== */}

          <motion.div
            className="transform-arrow"
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
            }}
            transition={{
              duration: 0.6,
              delay: 0.25,
            }}
          >
            {/* Moving particles */}

            <div className="data-particle particle-one" />

            <div className="data-particle particle-two" />

            <div className="data-particle particle-three" />

            <ArrowRight size={28} />

            <span>
              FHIR R4
            </span>

            <small>
              TRANSFORM
            </small>
          </motion.div>

          {/* ===============================
              GENERATED FHIR JSON
          =============================== */}

          <motion.div
            className="fhir-terminal-wrapper"
            initial={{
              opacity: 0,
              x: 50,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
          >
            <FhirTransformation />
          </motion.div>
        </div>

        {/* =================================
            MEDBRIDGE → EXTERNAL EMR
        ================================= */}

        <motion.div
          className="emr-exchange"
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
            amount: 0.3,
          }}
          transition={{
            duration: 0.7,
          }}
        >

          {/* ===============================
              MEDBRIDGE BRAND
          =============================== */}

          <div className="exchange-brand">

            {/* Diamond Logo */}

            <div className="exchange-brand-mark">
              <span>M</span>
            </div>

            <div className="exchange-brand-text">
              <span>
                TERMINOLOGY GATEWAY
              </span>

              <strong>
                MEDBRIDGE
              </strong>
            </div>
          </div>

          {/* ===============================
              FHIR EXCHANGE PATH
          =============================== */}

          <div className="exchange-path">

            <div className="exchange-line" />

            {/* Animated packets */}

            <div className="exchange-dot" />

            <div className="exchange-dot exchange-dot-two" />

            <span>
              FHIR R4
            </span>
          </div>

          {/* ===============================
              EXTERNAL EMR
          =============================== */}

          <div className="hospital-system">

            <div className="hospital-icon">
              <Server size={22} />
            </div>

            <div>
              <span>
                EXTERNAL EMR
              </span>

              <strong>
                Condition received

                <CheckCircle2 size={16} />
              </strong>
            </div>
          </div>
        </motion.div>

        {/* =================================
            EXCHANGE DETAILS
        ================================= */}

        <motion.div
          className="exchange-metadata"
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
            delay: 0.2,
          }}
        >

          <div>
            <span>
              RESOURCE
            </span>

            <strong>
              Condition
            </strong>
          </div>

          <div>
            <span>
              STANDARD
            </span>

            <strong>
              FHIR R4
            </strong>
          </div>

          <div>
            <span>
              CODINGS
            </span>

            <strong>
              NAMASTE + ICD-11 TM2
            </strong>
          </div>

          <div>
            <span>
              STATUS
            </span>

            <strong className="exchange-success">
              VALIDATED
            </strong>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FhirSection;