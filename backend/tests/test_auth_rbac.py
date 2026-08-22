import secrets


def test_authentication_and_role_boundaries(client, seeded, auth_headers):
    doctor = auth_headers["DOCTOR"]
    expert = auth_headers["EXPERT"]

    assert client.get("/api/v1/patients", headers=doctor).status_code == 200
    assert client.get("/api/v1/patients", headers=expert).status_code == 403
    assert (
        client.post(
            "/api/v1/candidates/generate/TEST-NAM-008",
            headers=doctor,
        ).status_code
        == 403
    )
    assert client.get("/api/v1/patients").status_code == 401
    assert (
        client.post(
            "/api/v1/auth/login",
            json={
                "email": "doctor@example.com",
                "password": secrets.token_urlsafe(18),
            },
        ).status_code
        == 401
    )
    assert (
        client.post("/api/v1/auth/logout", headers=doctor).status_code
        == 200
    )

    expert_stats = client.get(
        "/api/v1/dashboard/stats", headers=expert
    ).json()
    assert "pendingCandidates" in expert_stats
    assert "patients" not in expert_stats
    assert "confirmedDiagnoses" not in expert_stats


def test_non_admin_audit_is_scoped_to_actor(client, seeded, auth_headers):
    doctor_events = client.get(
        "/api/v1/audit", headers=auth_headers["DOCTOR"]
    ).json()["events"]
    assert doctor_events
    assert {event["actor"] for event in doctor_events} == {
        "doctor@example.com"
    }

    admin_events = client.get(
        "/api/v1/audit", headers=auth_headers["ADMIN"]
    ).json()["events"]
    assert {event["actor"] for event in admin_events} >= {
        "doctor@example.com",
        "expert@example.com",
        "admin@example.com",
    }


def test_personal_account_registration_and_login(client, seeded):
    registration_password = "A1" + secrets.token_urlsafe(18)
    payload = {
        "name": "Personal User",
        "email": "personal.user@example.com",
        "password": registration_password,
    }
    registered = client.post("/api/v1/auth/register", json=payload)
    assert registered.status_code == 201, registered.text
    assert registered.json()["user"]["role"] == "DOCTOR"
    assert registered.json()["user"]["email"] == payload["email"]

    token = registered.json()["access_token"]
    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me.status_code == 200
    assert me.json()["name"] == payload["name"]

    duplicate = client.post("/api/v1/auth/register", json=payload)
    assert duplicate.status_code == 409

    login = client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    assert login.status_code == 200

    weak_password = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Weak Password",
            "email": "weak@example.com",
            "password": "a" * 12,
        },
    )
    assert weak_password.status_code == 422
