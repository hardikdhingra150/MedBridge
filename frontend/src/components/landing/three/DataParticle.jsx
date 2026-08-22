import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

function DataParticle({
  start,
  end,
  speed = 0.25,
  delay = 0,
  color = "#d6ae63",
}) {
  const mesh = useRef();

  useFrame((state) => {
    if (!mesh.current) return;

    const time =
      (state.clock.elapsedTime * speed + delay) % 1;

    mesh.current.position.x =
      start[0] + (end[0] - start[0]) * time;

    mesh.current.position.y =
      start[1] + (end[1] - start[1]) * time;

    mesh.current.position.z =
      start[2] + (end[2] - start[2]) * time;

    const pulse =
      0.7 +
      Math.sin(state.clock.elapsedTime * 6) * 0.2;

    mesh.current.scale.setScalar(pulse);
  });

  return (
    <mesh
      ref={mesh}
      position={start}
    >
      <sphereGeometry args={[0.045, 14, 14]} />

      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.2}
      />
    </mesh>
  );
}

export default DataParticle;