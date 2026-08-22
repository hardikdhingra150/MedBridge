const API = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");
const TOKEN_KEY = "medbridge_access_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
}

async function handleResponse(response, fallbackMessage) {
  if (!response.ok) {
    let errorMessage = fallbackMessage;
    try {
      const error = await response.json();
      if (Array.isArray(error.detail)) {
        errorMessage = error.detail
          .map((item) => item.msg)
          .join(". ");
      } else {
        errorMessage = error.detail || fallbackMessage;
      }
    } catch {
      // Keep the endpoint-specific fallback for non-JSON failures.
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

async function apiRequest(
  path,
  options = {},
  fallbackMessage = "Request failed"
) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...(options.body && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the MedBridge API. " +
        "Check the backend and try again."
    );
  }

  if (response.status === 401 && token) {
    logoutUser();
    window.dispatchEvent(
      new Event("medbridge-auth-expired")
    );
  }

  return handleResponse(response, fallbackMessage);
}

export async function loginUser(email, password) {
  let response;
  try {
    response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(
      "Unable to connect to the MedBridge API. " +
        "Check the backend and try again."
    );
  }
  const data = await handleResponse(
    response,
    "Unable to sign in"
  );
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

export async function registerUser(name, email, password) {
  let response;
  try {
    response = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  } catch {
    throw new Error(
      "Unable to connect to the MedBridge API. " +
        "Check the backend and try again."
    );
  }
  const data = await handleResponse(
    response,
    "Unable to create your account"
  );
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

export async function logoutSession() {
  try {
    if (getToken()) {
      await apiRequest("/auth/logout", { method: "POST" });
    }
  } finally {
    logoutUser();
  }
}

export function getCurrentUser() {
  return apiRequest(
    "/auth/me",
    {},
    "Unable to restore your session"
  );
}

export function searchTerminology(query) {
  return apiRequest(
    `/terminology/search?q=${encodeURIComponent(query)}`,
    {},
    "Terminology search failed"
  );
}

export function getFhirCondition(diagnosisId) {
  return apiRequest(
    `/fhir/condition/${encodeURIComponent(diagnosisId)}/validated`,
    {},
    "FHIR Condition generation failed"
  );
}

export function getDashboardStats() {
  return apiRequest(
    "/dashboard/stats",
    {},
    "Unable to load dashboard metrics"
  );
}

export function getAuditEvents({ action = "", actor = "" } = {}) {
  const params = new URLSearchParams({ limit: "100" });
  if (action) params.set("action", action);
  if (actor) params.set("actor", actor);
  return apiRequest(
    `/audit?${params.toString()}`,
    {},
    "Unable to load the audit trail"
  );
}

export function getMapping(code) {
  return apiRequest(
    `/mappings/${encodeURIComponent(code)}`,
    {},
    "Mapping retrieval failed"
  );
}

export function getPatients() {
  return apiRequest(
    "/patients",
    {},
    "Patient request failed"
  );
}

export function createDiagnosis(patientId, namasteCode) {
  return apiRequest(
    "/diagnoses",
    {
      method: "POST",
      body: JSON.stringify({
        patient_id: patientId,
        namaste_code: namasteCode,
      }),
    },
    "Diagnosis creation failed"
  );
}

export function generateCandidates(namasteCode) {
  return apiRequest(
    `/candidates/generate/${encodeURIComponent(namasteCode)}`,
    { method: "POST" },
    "Candidate generation failed"
  );
}

export function reviewCandidate(
  candidateId,
  action,
  comment = ""
) {
  return apiRequest(
    `/reviews/${encodeURIComponent(candidateId)}`,
    {
      method: "POST",
      body: JSON.stringify({ action, comment }),
    },
    "Candidate review failed"
  );
}

export function getTerminologyReleases() {
  return apiRequest(
    "/admin/terminology/releases",
    {},
    "Unable to load terminology releases"
  );
}

export function getTerminologyReleaseTerms(releaseId) {
  return apiRequest(
    `/admin/terminology/releases/${encodeURIComponent(
      releaseId
    )}/terms`,
    {},
    "Unable to load release terms"
  );
}

export function activateTerminologyRelease(releaseId) {
  return apiRequest(
    `/admin/terminology/releases/${encodeURIComponent(
      releaseId
    )}/activate`,
    { method: "POST" },
    "Unable to activate terminology release"
  );
}

export function getTerminologyCoverage() {
  return apiRequest(
    "/admin/terminology/coverage",
    {},
    "Unable to load terminology coverage"
  );
}

export function getTerminologyImportJobs() {
  return apiRequest(
    "/admin/terminology/imports",
    {},
    "Unable to load import reports"
  );
}

export function importTerminologyRelease({
  system,
  version,
  sourceName,
  file,
}) {
  const body = new FormData();
  body.append("system", system);
  body.append("version", version);
  body.append("source_name", sourceName);
  body.append("file", file);

  return apiRequest(
    "/admin/terminology/import",
    { method: "POST", body },
    "Unable to import terminology release"
  );
}
