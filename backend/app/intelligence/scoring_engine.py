class RepositoryScoringEngine:

    def score(self, repository: dict):

        analysis = repository.get("analysis") or {}
        dependency_analysis = repository.get("dependency_analysis") or {}
        intelligence = repository.get("intelligence") or {}

        readme = repository.get("readme") or ""
        description = repository.get("description") or ""
        technologies = analysis.get("technologies") or []
        dependency_files = dependency_analysis.get("dependency_files") or []
        dependencies = dependency_analysis.get("dependencies") or {}

        architecture_data = intelligence.get("architecture") or {}
        architecture = architecture_data.get("architecture", "Unknown")

        documentation_score = self._documentation_score(
            readme,
            description,
        )

        technology_score = self._technology_score(
            technologies
        )

        dependency_score = self._dependency_score(
            dependency_files,
            dependencies,
        )

        architecture_score = self._architecture_score(
            architecture
        )

        deployment_score = self._deployment_score(
            readme,
            technologies,
            dependency_files,
        )

        maintainability_score = self._maintainability_score(
            technologies,
            dependency_files,
            readme,
        )

        overall_score = round(
            (
                documentation_score * 0.20
                + technology_score * 0.15
                + dependency_score * 0.15
                + architecture_score * 0.20
                + deployment_score * 0.15
                + maintainability_score * 0.15
            ),
            1,
        )

        grade = self._grade(overall_score)

        return {
            "overall_score": overall_score,
            "grade": grade,
            "dimensions": {
                "documentation": documentation_score,
                "technology_depth": technology_score,
                "dependency_management": dependency_score,
                "architecture": architecture_score,
                "deployment_readiness": deployment_score,
                "maintainability": maintainability_score,
            },
        }

    def _documentation_score(self, readme, description):

        score = 20

        if description:
            score += 15

        if readme:
            score += 25

        readme_length = len(readme)

        if readme_length > 500:
            score += 10

        if readme_length > 1500:
            score += 10

        lower_readme = readme.lower()

        documentation_signals = [
            "installation",
            "usage",
            "architecture",
            "setup",
            "requirements",
            "deployment",
        ]

        score += min(
            sum(
                5
                for signal in documentation_signals
                if signal in lower_readme
            ),
            20,
        )

        return min(score, 100)

    def _technology_score(self, technologies):

        count = len(set(technologies))

        if count == 0:
            return 20

        if count <= 2:
            return 40

        if count <= 5:
            return 65

        if count <= 8:
            return 80

        return 95

    def _dependency_score(
        self,
        dependency_files,
        dependencies,
    ):

        score = 25

        if dependency_files:
            score += 35

        dependency_count = 0

        for value in dependencies.values():

            if isinstance(value, list):
                dependency_count += len(value)

            elif isinstance(value, dict):

                for nested_value in value.values():

                    if isinstance(nested_value, dict):
                        dependency_count += len(nested_value)

                    elif isinstance(nested_value, list):
                        dependency_count += len(nested_value)

        if dependency_count > 0:
            score += 15

        if dependency_count > 5:
            score += 10

        if dependency_count > 15:
            score += 10

        return min(score, 100)

    def _architecture_score(self, architecture):

        scores = {
            "Unknown": 30,
            "Layered Backend": 70,
            "Full Stack": 80,
            "Microservices": 90,
            "Cloud Native": 95,
        }

        return scores.get(
            architecture,
            50,
        )

    def _deployment_score(
        self,
        readme,
        technologies,
        dependency_files,
    ):

        score = 20

        lower_readme = readme.lower()

        deployment_signals = [
            "docker",
            "docker compose",
            "kubernetes",
            "deployment",
            "production",
            "vercel",
            "aws",
            "azure",
            "gcp",
        ]

        score += min(
            sum(
                10
                for signal in deployment_signals
                if signal in lower_readme
            ),
            50,
        )

        deployment_technologies = {
            "Docker",
            "Docker Compose",
            "Kubernetes",
        }

        if deployment_technologies.intersection(
            set(technologies)
        ):
            score += 20

        if (
            "requirements.txt" in dependency_files
            or "package.json" in dependency_files
        ):
            score += 10

        return min(score, 100)

    def _maintainability_score(
        self,
        technologies,
        dependency_files,
        readme,
    ):

        score = 30

        if technologies:
            score += 20

        if dependency_files:
            score += 20

        if len(readme) > 500:
            score += 15

        lower_readme = readme.lower()

        maintainability_signals = [
            "test",
            "pytest",
            "coverage",
            "lint",
            "black",
            "flake8",
            "ci/cd",
            "github actions",
        ]

        score += min(
            sum(
                5
                for signal in maintainability_signals
                if signal in lower_readme
            ),
            15,
        )

        return min(score, 100)

    def _grade(self, score):

        if score >= 90:
            return "A+"

        if score >= 80:
            return "A"

        if score >= 70:
            return "B"

        if score >= 60:
            return "C"

        if score >= 50:
            return "D"

        return "F"
