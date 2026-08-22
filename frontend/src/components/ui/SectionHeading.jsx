import { motion } from "framer-motion";

function SectionHeading({ number, label, title, accent }) {
  return (
    <motion.div
      className="section-heading"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7 }}
    >
      <div className="section-kicker">
        <span>{number}</span>
        <span className="kicker-line" />
        <span>{label}</span>
      </div>

      <h2>
        {title}
        {accent && <em> {accent}</em>}
      </h2>
    </motion.div>
  );
}

export default SectionHeading;