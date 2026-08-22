import { motion } from "framer-motion";
import {
  Stethoscope,
  Database,
  GitMerge,
  FileJson2,
  Server,
} from "lucide-react";

import SectionHeading from "../ui/SectionHeading";

const architecture = [
  {
    icon: Stethoscope,
    label: "CLINICIAN / EMR",
  },
  {
    icon: Database,
    label: "NAMASTE SEARCH",
  },
  {
    icon: GitMerge,
    label: "MEDBRIDGE",
    highlight: true,
  },
  {
    icon: FileJson2,
    label: "FHIR R4",
  },
  {
    icon: Server,
    label: "EXTERNAL EMR",
  },
];

function ArchitectureSection() {
  return (
    <section className="section architecture-section">
      <div className="section-container">
        <SectionHeading
          number="07"
          label="SYSTEM ARCHITECTURE"
          title="A bridge, not another"
          accent="hospital system."
        />

        <p className="architecture-intro">
          MedBridge sits between existing clinical
          workflows and international terminology
          infrastructure.
        </p>

        <div className="architecture-flow">
          <motion.div
            className="architecture-path"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4 }}
          />

          {architecture.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                className={`architecture-node ${
                  item.highlight ? "architecture-highlight" : ""
                }`}
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div>
                  <Icon />
                </div>

                <span>{item.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ArchitectureSection;