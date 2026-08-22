import { motion } from "framer-motion";
import {
  BadgeCheck,
  Plus,
  FileCheck2,
} from "lucide-react";

import SectionHeading from "../ui/SectionHeading";

function DualCodeSection() {
  return (
    <section className="section dual-code-section">
      <div className="section-container">
        <SectionHeading
          number="04"
          label="CLINICAL SNAPSHOT"
          title="One diagnosis."
          accent="Two coding systems."
        />

        <motion.div
          className="clinical-record"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="clinical-record-header">
            <div>
              <span>MEDBRIDGE CLINICAL RECORD</span>
              <strong>DUAL-CODE CONFIRMATION</strong>
            </div>

            <FileCheck2 size={28} />
          </div>

          <div className="dual-record-grid">
            <div className="diagnosis-code-side">
              <span className="code-system">
                AYUSH / NAMASTE
              </span>

              <div className="clinical-script">
                अम्लपित्त
              </div>

              <h3>Amlapitta</h3>

              <code>DEMO-NAM-001</code>

              <dl>
                <div>
                  <dt>Version</dt>
                  <dd>2026-DEMO</dd>
                </div>

                <div>
                  <dt>Source</dt>
                  <dd>Demonstration terminology</dd>
                </div>
              </dl>
            </div>

            <div className="dual-plus">
              <Plus />
            </div>

            <div className="diagnosis-code-side">
              <span className="code-system">
                ICD-11 / TM2
              </span>

              <div className="clinical-script modern">
                TM2
              </div>

              <h3>Mapped international concept</h3>

              <code>DEMO-TM2-001</code>

              <dl>
                <div>
                  <dt>Relationship</dt>
                  <dd>RELATED</dd>
                </div>

                <div>
                  <dt>Status</dt>
                  <dd>VERIFIED</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="record-confirmation">
            <BadgeCheck />

            <div>
              <span>CLINICIAN CONFIRMATION</span>
              <strong>
                Dual-coded diagnosis ready for storage
              </strong>
            </div>

            <div className="record-status">
              CONFIRMED
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default DualCodeSection;