import re


class RepositoryRequirementMatcher:

    def match(
        self,
        query: str,
        repository: dict,
        specification: dict | None = None,
    ) -> dict:

        specification = specification or {}

        requirements = self._build_requirements(
            query=query,
            specification=specification,
        )

        repository_text = self._build_repository_text(
            repository
        )

        repository_terms = self._terms(
            repository_text
        )

        def evaluate_requirements(items):

            matched = []
            missing = []
            scores = []
            evidence = []

            for item in items:

                score = self._requirement_match_score(
                    requirement=item,
                    repository_text=repository_text,
                    repository_terms=repository_terms,
                )

                scores.append(score)

                evidence.append({
                    "requirement": item,
                    "score": round(score, 4),
                    "matched": score >= 0.70,
                })

                if score >= 0.70:
                    matched.append(item)
                else:
                    missing.append(item)

            average_score = (
                sum(scores) / len(scores)
                if scores
                else 0.0
            )

            return (
                matched,
                missing,
                average_score,
                evidence,
            )

        (
            matched_capabilities,
            missing_capabilities,
            core_score,
            core_evidence,
        ) = evaluate_requirements(
            requirements["core_capabilities"]
        )

        (
            matched_optional,
            missing_optional,
            optional_score,
            optional_evidence,
        ) = evaluate_requirements(
            requirements["optional_capabilities"]
        )

        (
            matched_technologies,
            missing_technologies,
            technology_score,
            technology_evidence,
        ) = evaluate_requirements(
            requirements["technologies"]
        )

        (
            matched_architectures,
            missing_architectures,
            architecture_score,
            architecture_evidence,
        ) = evaluate_requirements(
            requirements["architecture_preferences"]
        )

        core_total = len(
            requirements["core_capabilities"]
        )

        technology_total = len(
            requirements["technologies"]
        )

        architecture_total = len(
            requirements[
                "architecture_preferences"
            ]
        )

        optional_total = len(
            requirements[
                "optional_capabilities"
            ]
        )

        active_weights = []
        weighted_scores = []

        if core_total:
            active_weights.append(0.55)
            weighted_scores.append(
                (core_score, 0.55)
            )

        if technology_total:
            active_weights.append(0.25)
            weighted_scores.append(
                (technology_score, 0.25)
            )

        if architecture_total:
            active_weights.append(0.15)
            weighted_scores.append(
                (architecture_score, 0.15)
            )

        if optional_total:
            active_weights.append(0.05)
            weighted_scores.append(
                (optional_score, 0.05)
            )

        if active_weights:
            requirement_score = (
                sum(
                    score * weight
                    for score, weight
                    in weighted_scores
                )
                / sum(active_weights)
            )
        else:
            requirement_score = 0.0

        all_matched = (
            matched_capabilities
            + matched_technologies
            + matched_architectures
            + matched_optional
        )

        all_missing = (
            missing_capabilities
            + missing_technologies
            + missing_architectures
            + missing_optional
        )

        analysis = repository.get(
            "analysis",
            {},
        )

        return {
            "strategy":
                "structured_capability_gap_matching",
            "requirement_score": round(
                requirement_score,
                4,
            ),
            "requirement_percentage": round(
                requirement_score * 100,
                2,
            ),
            "matched_requirements":
                all_matched,
            "missing_requirements":
                all_missing,
            "capability_gap": {
                "matched_core_capabilities":
                    matched_capabilities,
                "missing_core_capabilities":
                    missing_capabilities,
                "matched_optional_capabilities":
                    matched_optional,
                "missing_optional_capabilities":
                    missing_optional,
                "matched_technologies":
                    matched_technologies,
                "missing_technologies":
                    missing_technologies,
                "matched_architectures":
                    matched_architectures,
                "missing_architectures":
                    missing_architectures,
            },
            "coverage": {
                "core_capability_coverage":
                    round(core_score, 4),
                "technology_coverage":
                    round(technology_score, 4),
                "architecture_coverage":
                    round(architecture_score, 4),
                "optional_capability_coverage":
                    round(optional_score, 4),
            },
            "detected_technologies":
                analysis.get(
                    "technologies",
                    [],
                ),
        }

    def _build_requirements(
        self,
        query: str,
        specification: dict,
    ) -> dict:

        if specification:
            return {
                "core_capabilities":
                    self._clean_list(
                        specification.get(
                            "core_capabilities",
                            [],
                        )
                    ),
                "optional_capabilities":
                    self._clean_list(
                        specification.get(
                            "optional_capabilities",
                            [],
                        )
                    ),
                "technologies":
                    self._clean_list(
                        specification.get(
                            "technologies",
                            [],
                        )
                    ),
                "architecture_preferences":
                    self._clean_list(
                        specification.get(
                            "architecture_preferences",
                            [],
                        )
                    ),
            }

        return {
            "core_capabilities":
                sorted(self._terms(query)),
            "optional_capabilities": [],
            "technologies": [],
            "architecture_preferences": [],
        }

    def _build_repository_text(
        self,
        repository: dict,
    ) -> str:

        analysis = repository.get(
            "analysis",
            {},
        )

        architecture = repository.get(
            "architecture_intelligence",
            {},
        )

        parts = [
            repository.get("name") or "",
            repository.get("full_name") or "",
            repository.get("description") or "",
            repository.get("language") or "",
            " ".join(
                repository.get("topics") or []
            ),
            analysis.get("summary") or "",
            " ".join(
                analysis.get(
                    "technologies",
                    [],
                )
            ),
            " ".join(
                architecture.get(
                    "frameworks",
                    [],
                )
            ),
            " ".join(
                architecture.get(
                    "technologies",
                    [],
                )
            ),
            " ".join(
                architecture.get(
                    "architectures",
                    [],
                )
            ),
        ]

        return " ".join(
            str(part)
            for part in parts
            if part
        ).lower()

    def _requirement_matches(
        self,
        requirement: str,
        repository_text: str,
        repository_terms: set,
    ) -> bool:

        return (
            self._requirement_match_score(
                requirement=requirement,
                repository_text=repository_text,
                repository_terms=repository_terms,
            )
            >= 0.70
        )

    def _requirement_match_score(
        self,
        requirement: str,
        repository_text: str,
        repository_terms: set,
    ) -> float:

        normalized = " ".join(
            str(requirement)
            .strip()
            .lower()
            .split()
        )

        if not normalized:
            return 0.0

        requirement_terms = self._terms(
            normalized
        )

        if not requirement_terms:
            return 0.0

        # Exact phrase match is the strongest evidence.
        if normalized in repository_text:
            return 1.0

        overlap = (
            requirement_terms
            .intersection(repository_terms)
        )

        term_coverage = (
            len(overlap)
            / len(requirement_terms)
        )

        # Single-term requirements must match exactly.
        if len(requirement_terms) == 1:
            return 1.0 if term_coverage == 1.0 else 0.0

        # Multi-term requirements should not receive a full
        # match merely because one generic term is present.
        if term_coverage >= 1.0:
            return 0.90

        if term_coverage >= 0.75:
            return 0.75

        if term_coverage >= 0.50:
            return 0.45

        if term_coverage > 0.0:
            return 0.20

        return 0.0

    def _coverage(
        self,
        matched: int,
        total: int,
    ) -> float:

        if total == 0:
            return 0.0

        return matched / total

    def _clean_list(
        self,
        values,
    ) -> list:

        cleaned = []

        for value in values or []:

            item = str(value).strip()

            if (
                item
                and item.lower()
                not in {
                    existing.lower()
                    for existing in cleaned
                }
            ):
                cleaned.append(item)

        return cleaned

    def _terms(
        self,
        text,
    ) -> set:

        stop_words = {
            "a",
            "an",
            "the",
            "and",
            "or",
            "for",
            "to",
            "of",
            "with",
            "using",
            "build",
            "create",
            "make",
            "need",
            "want",
            "platform",
            "application",
            "system",
            "project",
            "software",
            "functionality",
        }

        words = re.findall(
            r"[A-Za-z0-9+#.-]+",
            str(text).lower(),
        )

        return {
            word.strip(".")
            for word in words
            if word.strip(".")
            not in stop_words
            and len(word.strip(".")) > 1
        }


