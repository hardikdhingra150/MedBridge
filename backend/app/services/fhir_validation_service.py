CONDITION_PROFILE = "http://hl7.org/fhir/StructureDefinition/Condition"


def validate_condition(resource: dict) -> dict:
    """Run deterministic structural checks for the generated FHIR R4 resource.

    This is a local MedBridge validation summary, not a replacement for an
    official HL7 profile validator or terminology server.
    """
    errors: list[str] = []

    if resource.get("resourceType") != "Condition":
        errors.append("resourceType must be Condition")
    if not resource.get("id"):
        errors.append("id is required")
    if CONDITION_PROFILE not in resource.get("meta", {}).get("profile", []):
        errors.append("FHIR R4 Condition profile is missing")

    subject_reference = resource.get("subject", {}).get("reference")
    if not subject_reference or not subject_reference.startswith("Patient/"):
        errors.append("subject.reference must identify a Patient")

    clinical_codes = [
        coding.get("code")
        for coding in resource.get("clinicalStatus", {}).get("coding", [])
    ]
    if "active" not in clinical_codes:
        errors.append("clinicalStatus must contain active")

    verification_codes = [
        coding.get("code")
        for coding in resource.get("verificationStatus", {}).get("coding", [])
    ]
    if "confirmed" not in verification_codes:
        errors.append("verificationStatus must contain confirmed")

    codings = resource.get("code", {}).get("coding", [])
    if len(codings) < 2:
        errors.append("dual coding requires NAMASTE and ICD-11 TM2 codings")
    for index, coding in enumerate(codings, start=1):
        for field in ("system", "version", "code", "display"):
            if not coding.get(field):
                errors.append(f"coding {index} is missing {field}")

    systems = sorted(
        {coding.get("system") for coding in codings if coding.get("system")}
    )
    valid = not errors
    return {
        "valid": valid,
        "status": "VALID" if valid else "INVALID",
        "fhirVersion": "R4",
        "validator": "MedBridge structural checks",
        "errors": errors,
        "summary": {
            "resourceType": resource.get("resourceType"),
            "patient": subject_reference,
            "codingCount": len(codings),
            "codingSystems": systems,
            "clinicalStatus": clinical_codes[0] if clinical_codes else None,
        },
    }
