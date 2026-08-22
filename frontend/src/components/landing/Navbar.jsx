import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <button className="brand" onClick={() => scrollTo("home")}>
        <div className="brand-mark">
          <span>M</span>
        </div>

        <div>
          <strong>MEDBRIDGE</strong>
          <small>Terminology Gateway</small>
        </div>
      </button>

      <div className="nav-links">
        <button onClick={() => scrollTo("problem")}>Problem</button>
        <button onClick={() => scrollTo("workflow")}>Workflow</button>
        <button onClick={() => scrollTo("terminology")}>
          Terminology
        </button>
        <button onClick={() => scrollTo("fhir")}>FHIR</button>
        <button onClick={() => scrollTo("safety")}>Safety</button>
      </div>

      <button
        className="nav-platform-button"
        onClick={() => navigate("/platform")}
      >
        Open Platform
        <ArrowUpRight size={16} />
      </button>
    </nav>
  );
}

export default Navbar;