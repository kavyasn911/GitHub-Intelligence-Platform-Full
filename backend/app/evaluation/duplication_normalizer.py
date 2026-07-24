class DuplicationScoreNormalizer:

    def calculate(
        self,
        shared_count: int,
        source_entity_count: int,
        candidate_entity_count: int,
    ) -> dict:

        denominator = max(
            min(
                source_entity_count,
                candidate_entity_count,
            ),
            1,
        )

        confidence = min(
            shared_count / denominator,
            1.0,
        )

        confidence = round(
            confidence,
            4,
        )

        if confidence >= 0.70:
            risk = "high"

        elif confidence >= 0.40:
            risk = "medium"

        else:
            risk = "low"

        return {
            "confidence": confidence,
            "percentage": round(
                confidence * 100,
                2,
            ),
            "risk": risk,
        }
