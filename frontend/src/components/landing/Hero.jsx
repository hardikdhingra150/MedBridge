import { Canvas } from "@react-three/fiber";
import {
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import FloatingSanskrit from "../effects/FloatingSanskrit";
import MouseGlow from "../effects/MouseGlow";
import HeroScene from "./HeroScene";

function Hero() {
  const navigate = useNavigate();

  const explore = () => {
    document
      .getElementById("problem")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <section className="hero" id="home">
      {/* Ambient visual effects */}
      <MouseGlow />
      <FloatingSanskrit />

      <div className="hero-grid-pattern" />
      <div className="hero-noise" />

      {/* Large subtle background words */}
      <div className="hero-ancient-text hero-ancient-one">
        आयुष
      </div>

      <div className="hero-ancient-text hero-ancient-two">
        चिकित्सा
      </div>

      <div className="hero-layout">
        {/* LEFT SIDE */}
        <motion.div
          className="hero-copy"
          initial={{
            opacity: 0,
            y: 35,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.85,
          }}
        >
          <div className="hero-badge">
            <span className="pulse-dot" />
            AYUSH × ICD-11 × FHIR
          </div>

          <p className="hero-overline">
            A HUMAN-VERIFIED TERMINOLOGY GATEWAY
          </p>

          <h1>
            Ancient knowledge.
            <span>
              Globally understood.
            </span>
          </h1>

          <p className="hero-description">
            MedBridge connects AYUSH and NAMASTE
            terminology with reviewed ICD-11 TM2
            mappings and transforms confirmed
            diagnoses into interoperable FHIR R4
            clinical records.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={explore}
            >
              Explore the bridge
              <ArrowDown size={18} />
            </button>

            <button
              className="ghost-button"
              onClick={() =>
                navigate("/platform")
              }
            >
              Open platform
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="hero-trust">
            <ShieldCheck size={17} />

            <span>
              AI retrieves candidates. Qualified
              experts verify clinical mappings.
            </span>
          </div>
        </motion.div>

        {/* RIGHT SIDE / 3D */}
        <motion.div
          className="hero-visual"
          initial={{
            opacity: 0,
            scale: 0.92,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.2,
            delay: 0.15,
          }}
        >
          <div className="canvas-frame">
            {/* Decorative frame corners */}
            <div className="canvas-corner corner-tl" />
            <div className="canvas-corner corner-tr" />
            <div className="canvas-corner corner-bl" />
            <div className="canvas-corner corner-br" />

            <Canvas
              dpr={[1, 1.5]}
              gl={{
                antialias: true,
                powerPreference: "high-performance",
                alpha: true,
              }}
            >
              <PerspectiveCamera
                makeDefault
                position={[0, 0, 7]}
                fov={46}
              />

              <fog
                attach="fog"
                args={[
                  "#090806",
                  7,
                  13,
                ]}
              />

              <ambientLight
                intensity={1.1}
              />

              <directionalLight
                position={[4, 6, 5]}
                intensity={2.2}
              />

              <pointLight
                position={[-4, 2, 3]}
                intensity={15}
                color="#b98b42"
              />

              <pointLight
                position={[4, -2, 3]}
                intensity={8}
                color="#86b6b0"
              />

              <HeroScene />

              <Environment
                preset="warehouse"
              />
            </Canvas>

            <div className="hero-bridge-status" aria-label="Terminology exchange path">
              <div className="bridge-status-node source-node">
                <small>01 · SOURCE</small>
                <strong>NAMASTE</strong>
                <span>AYUSH terminology</span>
              </div>

              <div className="bridge-route">
                <span className="bridge-route-line"><i /></span>
                <strong>Human-verified mapping</strong>
                <small>NAMASTE → ICD-11 TM2 → FHIR R4</small>
              </div>

              <div className="bridge-status-node exchange-node">
                <small>03 · EXCHANGE</small>
                <strong>FHIR R4</strong>
                <span>Clinical interoperability</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hero footer */}
      <div className="hero-bottom-line">
        <span>Preserve</span>
        <i />
        <span>Translate</span>
        <i />
        <span>Verify</span>
        <i />
        <span>Exchange</span>
      </div>
    </section>
  );
}

export default Hero;
