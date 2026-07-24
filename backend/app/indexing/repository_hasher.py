import hashlib
import json


class RepositoryHasher:

    def generate(self, repository: dict) -> str:

        hash_data = {
            "github_id": repository.get("id"),
            "name": repository.get("name"),
            "full_name": repository.get("full_name"),
            "description": repository.get("description"),
            "language": repository.get("language"),
            "default_branch": repository.get("default_branch"),
            "updated_at": str(repository.get("updated_at")),
            "readme": repository.get("readme", ""),
            "analysis": repository.get("analysis", {}),
            "dependency_analysis": repository.get(
                "dependency_analysis",
                {},
            ),
        }

        serialized = json.dumps(
            hash_data,
            sort_keys=True,
            default=str,
        )

        return hashlib.sha256(
            serialized.encode("utf-8")
        ).hexdigest()
