import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ProblemSection from "../components/landing/ProblemSection";
import WorkflowSection from "../components/landing/WorkflowSection";
import TerminologyDemo from "../components/landing/TerminologyDemo";
import DualCodeSection from "../components/landing/DualCodeSection";
import FhirSection from "../components/landing/FhirSection";
import SafetySection from "../components/landing/SafetySection";
import ArchitectureSection from "../components/landing/ArchitectureSection";
import FinalCTA from "../components/landing/FinalCTA";

function Landing() {
  return (
    <div className="landing-page">
      <Navbar />

      <main>
        <Hero />
        <ProblemSection />
        <WorkflowSection />
        <TerminologyDemo />
        <DualCodeSection />
        <FhirSection />
        <SafetySection />
        <ArchitectureSection />
        <FinalCTA />
      </main>
    </div>
  );
}

export default Landing;