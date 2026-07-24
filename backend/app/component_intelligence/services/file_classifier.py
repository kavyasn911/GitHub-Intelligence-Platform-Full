from pathlib import Path


class FileClassifier:

    CATEGORIES = {
        "react_component": {
            ".jsx",
            ".tsx",
        },
        "javascript": {
            ".js",
            ".ts",
        },
        "python": {
            ".py",
        },
        "java": {
            ".java",
        },
        "configuration": {
            ".json",
            ".yaml",
            ".yml",
            ".toml",
            ".xml",
            ".ini",
        },
        "documentation": {
            ".md",
            ".txt",
        },
        "styles": {
            ".css",
            ".scss",
            ".sass",
        },
    }

    def classify(self, repository_tree: dict):

        results = []

        for item in repository_tree["tree"]:

            if item["type"] != "file":
                continue

            extension = item["extension"]

            category = "other"

            for name, extensions in self.CATEGORIES.items():
                if extension in extensions:
                    category = name
                    break

            results.append({
                **item,
                "category": category,
            })

        return {
            "repository": repository_tree["repository"],
            "files": results,
        }
