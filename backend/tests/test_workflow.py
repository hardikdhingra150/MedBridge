def test_complete_expert_to_clinical_fhir_workflow(
    client,
    seeded,
    auth_headers,
):
    doctor = auth_headers["DOCTOR"]
    expert = auth_headers["EXPERT"]

    unmapped = client.post(
        "/api/v1/diagnoses",
        headers=doctor,
        json={
            "patient_id": seeded["activePatientId"],
            "namaste_code": "TEST-NAM-009",
        },
    )
    assert unmapped.status_code == 400

    generated = client.post(
        "/api/v1/candidates/generate/TEST-NAM-008",
        headers=expert,
    )
    assert generated.status_code == 200, generated.text
    candidates = generated.json()
    assert len(candidates) == 5

    repeated = client.post(
        "/api/v1/candidates/generate/TEST-NAM-008",
        headers=expert,
    )
    assert repeated.status_code == 200
    assert {item["candidateId"] for item in repeated.json()} == {
        item["candidateId"] for item in candidates
    }

    candidate_id = candidates[0]["candidateId"]
    approved = client.post(
        f"/api/v1/reviews/{candidate_id}",
        headers=expert,
        json={"action": "APPROVE", "comment": "Test verification"},
    )
    assert approved.status_code == 200, approved.text
    assert approved.json()["status"] == "APPROVED"
    assert (
        client.post(
            f"/api/v1/reviews/{candidate_id}",
            headers=expert,
            json={"action": "APPROVE"},
        ).status_code
        == 400
    )

    diagnosis = client.post(
        "/api/v1/diagnoses",
        headers=doctor,
        json={
            "patient_id": seeded["activePatientId"],
            "namaste_code": "TEST-NAM-008",
        },
    )
    assert diagnosis.status_code == 200, diagnosis.text

    fhir = client.get(
        f"/api/v1/fhir/condition/{diagnosis.json()['id']}/validated",
        headers=doctor,
    )
    assert fhir.status_code == 200, fhir.text
    assert fhir.json()["validation"]["status"] == "VALID"
    assert fhir.json()["validation"]["summary"]["codingCount"] == 2
    assert len(fhir.json()["resource"]["code"]["coding"]) == 2

    stats = client.get(
        "/api/v1/dashboard/stats", headers=doctor
    )
    assert stats.status_code == 200
    assert stats.json()["verifiedMappings"] == 2
    assert stats.json()["confirmedDiagnoses"] == 1
    assert stats.json()["fhirExchanges"] == 1

    doctor_actions = {
        event["action"]
        for event in client.get(
            "/api/v1/audit", headers=doctor
        ).json()["events"]
    }
    assert {"DIAGNOSIS_CONFIRMED", "FHIR_GENERATED"} <= doctor_actions

    expert_actions = {
        event["action"]
        for event in client.get(
            "/api/v1/audit", headers=expert
        ).json()["events"]
    }
    assert {"CANDIDATES_GENERATED", "MAPPING_APPROVED"} <= expert_actions


def test_consent_and_fhir_rbac(client, seeded, auth_headers):
    patients = client.get(
        "/api/v1/patients",
        headers=auth_headers["DOCTOR"],
    )
    assert patients.status_code == 200
    assert patients.json()[0]["consentActive"] is True

    blocked = client.post(
        "/api/v1/diagnoses",
        headers=auth_headers["DOCTOR"],
        json={
            "patient_id": seeded["inactivePatientId"],
            "namaste_code": "TEST-NAM-001",
        },
    )
    assert blocked.status_code == 403

    assert (
        client.get(
            "/api/v1/fhir/condition/not-a-diagnosis/validated",
            headers=auth_headers["EXPERT"],
        ).status_code
        == 403
    )


def test_fhir_validator_reports_structural_errors():
    from app.services.fhir_validation_service import validate_condition

    result = validate_condition({"resourceType": "Observation"})
    assert result["status"] == "INVALID"
    assert result["errors"]
