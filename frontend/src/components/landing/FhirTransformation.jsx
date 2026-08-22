import {
    motion,
    useInView,
  } from "framer-motion";

  import { useRef } from "react";

  const lines = [
    `{`,
    `  "resourceType": "Condition",`,
    `  "code": {`,
    `    "coding": [`,
    `      {`,
    `        "system": "NAMASTE",`,
    `        "code": "DEMO-NAM-001"`,
    `      },`,
    `      {`,
    `        "system": "ICD-11-TM2",`,
    `        "code": "DEMO-TM2-001"`,
    `      }`,
    `    ]`,
    `  }`,
    `}`,
  ];

  function FhirTransformation() {
    const ref = useRef(null);

    const visible = useInView(ref, {
      once: true,
      amount: 0.35,
    });

    return (
      <div
        ref={ref}
        className="fhir-animation-terminal"
      >
        <div className="fhir-terminal-head">
          <span>
            FHIR R4 TRANSFORMATION
          </span>

          <div>
            <i />
            <i />
            <i />
          </div>
        </div>

        <pre>
          <code>
            {lines.map((line, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  x: -8,
                }}
                animate={
                  visible
                    ? {
                        opacity: 1,
                        x: 0,
                      }
                    : {
                        opacity: 0,
                        x: -8,
                      }
                }
                transition={{
                  delay: index * 0.08,
                  duration: 0.28,
                  ease: "easeOut",
                }}
              >
                <span className="line-number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </span>

                <span className="fhir-code-line">
                  {line}
                </span>
              </motion.div>
            ))}
          </code>
        </pre>

        <motion.div
          className="fhir-validation"
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={
            visible
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  y: 10,
                }
          }
          transition={{
            delay: 1.45,
            duration: 0.4,
          }}
          aria-live="polite"
        >
          <span className="validation-dot" />

          FHIR R4 RESOURCE GENERATED
        </motion.div>
      </div>
    );
  }

  export default FhirTransformation;