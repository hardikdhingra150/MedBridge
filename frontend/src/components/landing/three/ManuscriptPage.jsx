import { Float, Text } from "@react-three/drei";

function ManuscriptPage({
  position,
  rotation = [0, 0, 0],
  title,
  subtitle,
}) {
  return (
    <Float
      speed={1.2}
      floatIntensity={0.22}
      rotationIntensity={0.08}
    >
      <group
        position={position}
        rotation={rotation}
      >
        {/* paper */}
        <mesh>
          <boxGeometry args={[1.45, 1.95, 0.045]} />

          <meshStandardMaterial
            color="#cfb98e"
            roughness={0.92}
            metalness={0.02}
          />
        </mesh>

        {/* inner border */}
        <mesh position={[0, 0, 0.026]}>
          <boxGeometry args={[1.31, 1.78, 0.01]} />

          <meshStandardMaterial
            color="#dfcca7"
            roughness={0.95}
          />
        </mesh>

        <Text
          position={[0, 0.45, 0.045]}
          fontSize={0.14}
          color="#3a2515"
          anchorX="center"
        >
          {title}
        </Text>

        <Text
          position={[0, 0.13, 0.045]}
          fontSize={0.095}
          color="#66492f"
          anchorX="center"
        >
          {subtitle}
        </Text>

        {/* fake manuscript lines */}

        {[-0.2, -0.38, -0.56].map((y) => (
          <mesh
            key={y}
            position={[0, y, 0.045]}
          >
            <boxGeometry args={[0.9, 0.008, 0.005]} />

            <meshStandardMaterial
              color="#6a5038"
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default ManuscriptPage;