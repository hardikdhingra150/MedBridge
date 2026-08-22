from rapidfuzz import fuzz


def calculate_candidate_score(
    namaste_term,
    icd_term,
):
    source_name = (
        namaste_term.display
        or ""
    ).lower()

    target_name = (
        icd_term.display
        or ""
    ).lower()

    source_definition = (
        namaste_term.definition
        or ""
    ).lower()

    target_definition = (
        icd_term.definition
        or ""
    ).lower()

    # ---------------------------------
    # NAME SIMILARITY
    # ---------------------------------

    name_score = fuzz.token_set_ratio(
        source_name,
        target_name,
    )

    # ---------------------------------
    # DEFINITION SIMILARITY
    # ---------------------------------

    definition_score = (
        fuzz.token_set_ratio(
            source_definition,
            target_definition,
        )
        if source_definition
        and target_definition
        else 0
    )

    # ---------------------------------
    # WEIGHTED SCORE
    # ---------------------------------

    final_score = (
        name_score * 0.70
        + definition_score * 0.30
    )

    return {
        "score": round(final_score, 2),
        "name_score": round(
            name_score,
            2,
        ),
        "definition_score": round(
            definition_score,
            2,
        ),
    }

def generate_candidates(
    namaste_term,
    icd_terms,
    limit=5,
):
    candidates = []

    for icd_term in icd_terms:

        scores = calculate_candidate_score(
            namaste_term,
            icd_term,
        )

        candidates.append({
            "icd_term": icd_term,
            **scores,
        })

    candidates.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return candidates[:limit]