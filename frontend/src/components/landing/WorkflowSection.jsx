import { motion } from "framer-motion";
import {
  Search,
  GitMerge,
  BadgeCheck,
  Waypoints,
} from "lucide-react";

import SectionHeading from "../ui/SectionHeading";

const steps = [
  {
    number: "01",
    title: "Search",
    text: "Find NAMASTE terminology despite spelling or transliteration differences.",
    icon: Search,
  },
  {
    number: "02",
    title: "Map",
    text: "Retrieve reviewed ICD-11 TM2 mapping candidates with provenance.",
    icon: GitMerge,
  },
  {
    number: "03",
    title: "Confirm",
    text: "A clinician verifies the dual-coded diagnosis before storage.",
    icon: BadgeCheck,
  },
  {
    number: "04",
    title: "Exchange",
    text: "Generate an interoperable FHIR R4 Condition for external EMRs.",
    icon: Waypoints,
  },
];

function WorkflowSection() {
  return (
    <section className="section workflow-section" id="workflow">
      <div className="section-container">
        <SectionHeading
          number="02"
          label="THE BRIDGE"
          title="From diagnosis to"
          accent="interoperability."
        />

        <div className="workflow-track">
          <motion.div
            className="workflow-progress"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.5 }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                className="workflow-step"
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.12,
                  duration: 0.6,
                }}
              >
                <div className="workflow-node">
                  <Icon size={22} />
                </div>

                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WorkflowSection;