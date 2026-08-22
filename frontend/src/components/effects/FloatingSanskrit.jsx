import { motion } from "framer-motion";

const fragments = [
  {
    text: "आयुष",
    className: "sanskrit-one",
  },
  {
    text: "चिकित्सा",
    className: "sanskrit-two",
  },
  {
    text: "अम्लपित्त",
    className: "sanskrit-three",
  },
  {
    text: "ज्वर",
    className: "sanskrit-four",
  },
  {
    text: "निदान",
    className: "sanskrit-five",
  },
];

function FloatingSanskrit() {
  return (
    <div className="floating-sanskrit">
      {fragments.map((fragment, index) => (
        <motion.span
          key={fragment.text}
          className={fragment.className}
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: [0.03, 0.09, 0.03],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 7 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.7,
          }}
        >
          {fragment.text}
        </motion.span>
      ))}
    </div>
  );
}

export default FloatingSanskrit;