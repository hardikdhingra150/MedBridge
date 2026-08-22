import { Float, Text, Line, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

import DataParticle from "./three/DataParticle";

const nodes = [
  {
    title: "NAMASTE",
    subtitle: "AYUSH",
    position: [-2.25, 1.42, 0],
  },
  {
    title: "ICD-11",
    subtitle: "TM2",
    position: [2.25, 1.42, 0],
  },
  {
    title: "FHIR",
    subtitle: "R4",
    position: [2.25, -1.42, 0],
  },
  {
    title: "EMR",
    subtitle: "Clinical System",
    position: [-2.25, -1.42, 0],
  },
];

function KnowledgeNode({
  title,
  subtitle,
  position,
}) {
  return (
    <Float
      speed={1.6}
      rotationIntensity={0.12}
      floatIntensity={0.28}
    >
      <group position={position}>
        {/* Outer plate */}
        <mesh>
          <boxGeometry
            args={[1.55, 0.9, 0.14]}
          />

          <meshStandardMaterial
            color="#c8b081"
            roughness={0.68}
            metalness={0.1}
          />
        </mesh>

        {/* Inner parchment plate */}
        <mesh
          position={[0, 0, 0.076]}
        >
          <boxGeometry
            args={[1.42, 0.77, 0.01]}
          />

          <meshStandardMaterial
            color="#e2d1aa"
            roughness={0.9}
          />
        </mesh>

        <Text
          position={[0, 0.13, 0.1]}
          fontSize={0.17}
          color="#26180e"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>

        <Text
          position={[0, -0.15, 0.1]}
          fontSize={0.085}
          color="#6c5136"
          anchorX="center"
          anchorY="middle"
        >
          {subtitle}
        </Text>
      </group>
    </Float>
  );
}

function HeroScene() {
  const group = useRef();
  const ring = useRef();

  const scrollProgress = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollProgress.current = Math.min(
        window.scrollY /
          window.innerHeight,
        1
      );
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  useFrame((state) => {
    if (
      !group.current ||
      !ring.current
    ) {
      return;
    }

    const mouseX =
      state.pointer.x;

    const mouseY =
      state.pointer.y;

    const scroll =
      scrollProgress.current;

    /*
      Mouse parallax
    */
    const targetRotationY =
      mouseX * 0.14;

    const targetRotationX =
      -mouseY * 0.08;

    group.current.rotation.y +=
      (
        targetRotationY -
        group.current.rotation.y
      ) * 0.025;

    group.current.rotation.x +=
      (
        targetRotationX -
        group.current.rotation.x
      ) * 0.025;

    /*
      Scroll driven movement
    */
    group.current.rotation.z =
      scroll * 0.16;

    group.current.position.y =
      scroll * 0.28;

    const scale =
      1 - scroll * 0.07;

    group.current.scale.setScalar(
      scale
    );

    /*
      Central brass ring
    */
    ring.current.rotation.z +=
      0.0015;
  });

  return (
    <group ref={group}>
      {/* Ambient particles */}
      <Sparkles
        count={55}
        scale={8}
        size={1.2}
        speed={0.15}
        opacity={0.28}
      />

      {/* =========================
          CONNECTION LINES
      ========================== */}

      <Line
        points={[
          [-2, 1.15, 0],
          [-0.8, 0.4, 0],
        ]}
        color="#ad8243"
        lineWidth={0.8}
        transparent
        opacity={0.45}
      />

      <Line
        points={[
          [0.8, 0.4, 0],
          [2, 1.15, 0],
        ]}
        color="#ad8243"
        lineWidth={0.8}
        transparent
        opacity={0.45}
      />

      <Line
        points={[
          [0.8, -0.4, 0],
          [2, -1.15, 0],
        ]}
        color="#80aaa4"
        lineWidth={0.8}
        transparent
        opacity={0.45}
      />

      <Line
        points={[
          [-0.8, -0.4, 0],
          [-2, -1.15, 0],
        ]}
        color="#80aaa4"
        lineWidth={0.8}
        transparent
        opacity={0.45}
      />

      {/* =========================
          NAMASTE → MEDBRIDGE
      ========================== */}

      <DataParticle
        start={[
          -2.1,
          1.1,
          0.04,
        ]}
        end={[
          -0.65,
          0.38,
          0.04,
        ]}
        speed={0.24}
        delay={0}
        color="#d7ae62"
      />

      <DataParticle
        start={[
          -2.1,
          1.1,
          0.04,
        ]}
        end={[
          -0.65,
          0.38,
          0.04,
        ]}
        speed={0.24}
        delay={0.33}
        color="#d7ae62"
      />

      <DataParticle
        start={[
          -2.1,
          1.1,
          0.04,
        ]}
        end={[
          -0.65,
          0.38,
          0.04,
        ]}
        speed={0.24}
        delay={0.66}
        color="#d7ae62"
      />

      {/* =========================
          MEDBRIDGE → ICD-11
      ========================== */}

      <DataParticle
        start={[
          0.65,
          0.38,
          0.04,
        ]}
        end={[
          2.1,
          1.1,
          0.04,
        ]}
        speed={0.22}
        delay={0.1}
        color="#8fbab4"
      />

      <DataParticle
        start={[
          0.65,
          0.38,
          0.04,
        ]}
        end={[
          2.1,
          1.1,
          0.04,
        ]}
        speed={0.22}
        delay={0.43}
        color="#8fbab4"
      />

      <DataParticle
        start={[
          0.65,
          0.38,
          0.04,
        ]}
        end={[
          2.1,
          1.1,
          0.04,
        ]}
        speed={0.22}
        delay={0.76}
        color="#8fbab4"
      />

      {/* =========================
          MEDBRIDGE → FHIR
      ========================== */}

      <DataParticle
        start={[
          0.65,
          -0.38,
          0.04,
        ]}
        end={[
          2.1,
          -1.1,
          0.04,
        ]}
        speed={0.2}
        delay={0}
        color="#8fbab4"
      />

      <DataParticle
        start={[
          0.65,
          -0.38,
          0.04,
        ]}
        end={[
          2.1,
          -1.1,
          0.04,
        ]}
        speed={0.2}
        delay={0.5}
        color="#8fbab4"
      />

      {/* =========================
          MEDBRIDGE CORE
      ========================== */}

      <Float
        speed={1.3}
        rotationIntensity={0.08}
        floatIntensity={0.25}
      >
        <group>
          {/* Main outer brass ring */}
          <mesh ref={ring}>
            <torusGeometry
              args={[
                1.3,
                0.035,
                24,
                120,
              ]}
            />

            <meshStandardMaterial
              color="#b98b42"
              metalness={0.95}
              roughness={0.25}
            />
          </mesh>

          {/* Tilted inner ring */}
          <mesh
            rotation={[
              Math.PI / 2.8,
              0,
              0,
            ]}
          >
            <torusGeometry
              args={[
                1.05,
                0.018,
                20,
                100,
              ]}
            />

            <meshStandardMaterial
              color="#76552d"
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>

          {/* Vertical orbital ring */}
          <mesh
            rotation={[
              0,
              Math.PI / 2,
              0,
            ]}
          >
            <torusGeometry
              args={[
                0.92,
                0.012,
                20,
                100,
              ]}
            />

            <meshStandardMaterial
              color="#8d6938"
              metalness={0.9}
              roughness={0.3}
              transparent
              opacity={0.65}
            />
          </mesh>

          {/* Central core */}
          <mesh>
            <sphereGeometry
              args={[
                0.72,
                64,
                64,
              ]}
            />

            <meshStandardMaterial
              color="#17110c"
              roughness={0.2}
              metalness={0.85}
            />
          </mesh>

          {/* Wireframe aura */}
          <mesh scale={1.08}>
            <sphereGeometry
              args={[
                0.72,
                64,
                64,
              ]}
            />

            <meshStandardMaterial
              color="#b98b42"
              transparent
              opacity={0.07}
              wireframe
            />
          </mesh>

          {/* Inner glowing core */}
          <mesh scale={0.7}>
            <sphereGeometry
              args={[
                0.72,
                48,
                48,
              ]}
            />

            <meshStandardMaterial
              color="#8f6836"
              emissive="#b98b42"
              emissiveIntensity={0.35}
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>

          <Text
            position={[
              0,
              0.12,
              0.74,
            ]}
            fontSize={0.21}
            color="#e1bd77"
            anchorX="center"
            anchorY="middle"
          >
            MEDBRIDGE
          </Text>

          <Text
            position={[
              0,
              -0.15,
              0.74,
            ]}
            fontSize={0.075}
            color="#bda77c"
            anchorX="center"
            anchorY="middle"
          >
            TERMINOLOGY GATEWAY
          </Text>
        </group>
      </Float>

      {/* =========================
          KNOWLEDGE NODES
      ========================== */}

      {nodes.map((node) => (
        <KnowledgeNode
          key={node.title}
          title={node.title}
          subtitle={node.subtitle}
          position={node.position}
        />
      ))}
    </group>
  );
}

export default HeroScene;
