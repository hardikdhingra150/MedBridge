import {
    useEffect,
    useRef,
  } from "react";

  function MouseGlow() {
    const glowRef = useRef(null);

    useEffect(() => {
      const move = (event) => {
        if (!glowRef.current) return;

        glowRef.current.animate(
          {
            left: `${event.clientX}px`,
            top: `${event.clientY}px`,
          },
          {
            duration: 700,
            fill: "forwards",
          }
        );
      };

      window.addEventListener("mousemove", move);

      return () => {
        window.removeEventListener("mousemove", move);
      };
    }, []);

    return (
      <div
        ref={glowRef}
        className="mouse-glow"
      />
    );
  }

  export default MouseGlow;