from datetime import datetime, timezone


NAMASTE_SYSTEM = (
    "https://medbridge.demo/terminology/namaste"
)

ICD_TM2_SYSTEM = (
    "https://medbridge.demo/terminology/icd11-tm2"
)


def generate_condition(
    diagnosis,
    patient,
):
    return {
        "resourceType": "Condition",

        "id": str(diagnosis.id),

        "meta": {
            "profile": [
                "http://hl7.org/fhir/StructureDefinition/Condition"
            ]
        },

        "clinicalStatus": {
            "coding": [
                {
                    "system": (
                        "http://terminology.hl7.org/"
                        "CodeSystem/condition-clinical"
                    ),
                    "code": "active",
                    "display": "Active",
                }
            ]
        },

        "verificationStatus": {
            "coding": [
                {
                    "system": (
                        "http://terminology.hl7.org/"
                        "CodeSystem/condition-ver-status"
                    ),
                    "code": "confirmed",
                    "display": "Confirmed",
                }
            ]
        },

        "category": [
            {
                "coding": [
                    {
                        "system": (
                            "http://terminology.hl7.org/"
                            "CodeSystem/condition-category"
                        ),
                        "code": "encounter-diagnosis",
                        "display": "Encounter Diagnosis",
                    }
                ]
            }
        ],

        "code": {
            "coding": [
                {
                    "system": NAMASTE_SYSTEM,
                    "version": diagnosis.namaste_version,
                    "code": diagnosis.namaste_code,
                    "display": diagnosis.namaste_display,
                },

                {
                    "system": ICD_TM2_SYSTEM,
                    "version": diagnosis.icd_version,
                    "code": diagnosis.icd_code,
                    "display": diagnosis.icd_display,
                },
            ],

            "text": diagnosis.namaste_display,
        },

        "subject": {
            "reference": (
                f"Patient/{patient.patient_identifier}"
            ),
            "display": patient.name,
        },

        "recordedDate": (
            datetime.now(timezone.utc).isoformat()
        ),
    }