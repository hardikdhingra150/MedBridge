import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="final-cta">
      <div className="cta-decoration cta-decoration-left">
        अ
      </div>

      <div className="cta-decoration cta-decoration-right">
        FHIR
      </div>

      <motion.div
        className="final-cta-content"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span>THE TERMINOLOGY BRIDGE</span>

        <h2>
          Two medical vocabularies.
          <em> One clinical record.</em>
        </h2>

        <p>
          Preserve the original traditional diagnosis while
          making it interoperable with global clinical systems.
        </p>

        <button
          className="cta-button"
          onClick={() => navigate("/platform")}
        >
          Enter MedBridge
          <ArrowRight />
        </button>
      </motion.div>

      <footer>
        <strong>MEDBRIDGE</strong>

        <span>
          Demonstration system · Synthetic clinical data
        </span>

        <span>AYUSH × ICD-11 TM2 × FHIR R4</span>
      </footer>
    </section>
  );
}

export default FinalCTA;