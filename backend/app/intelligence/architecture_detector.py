class ArchitectureDetector:

    def detect(self, repository: dict):

        technologies = repository.get(
            "analysis",
            {}
        ).get(
            "technologies",
            []
        )

        dependencies = repository.get(
            "dependency_analysis",
            {}
        ).get(
            "dependency_files",
            []
        )

        readme = (
            repository.get("readme")
            or ""
        ).lower()

        architecture = "Unknown"
        confidence = 0.50
        reasons = []

        if (
            "docker-compose.yml" in readme
            or "docker compose" in readme
        ):
            architecture = "Microservices"
            confidence = 0.92
            reasons.append("Docker Compose detected")

        elif (
            "kubernetes" in readme
            or "helm" in readme
        ):
            architecture = "Cloud Native"
            confidence = 0.95
            reasons.append("Kubernetes detected")

        elif (
            "React" in technologies
            and "FastAPI" in technologies
        ):
            architecture = "Full Stack"
            confidence = 0.90
            reasons.append("Frontend + Backend")

        elif (
            "FastAPI" in technologies
            or "Spring Boot" in technologies
        ):
            architecture = "Layered Backend"
            confidence = 0.80
            reasons.append("Backend framework detected")

        if "package.json" in dependencies:
            reasons.append("Node ecosystem")

        if "requirements.txt" in dependencies:
            reasons.append("Python ecosystem")

        return {
            "architecture": architecture,
            "confidence": confidence,
            "reasons": reasons,
        }
