from pathlib import Path


class RepositoryTreeService:

    IGNORED = {
        ".git",
        ".github",
        "__pycache__",
        "node_modules",
        ".venv",
        "venv",
        "dist",
        "build",
        ".idea",
        ".vscode",
    }

    def analyze(self, repository_path: str):

        root = Path(repository_path)

        tree = []

        for path in root.rglob("*"):

            relative = path.relative_to(root)

            if any(part in self.IGNORED for part in relative.parts):
                continue

            tree.append(
                {
                    "path": str(relative),
                    "name": path.name,
                    "type": "directory" if path.is_dir() else "file",
                    "extension": path.suffix.lower(),
                    "size": path.stat().st_size if path.is_file() else 0,
                }
            )

        return {
            "repository": root.name,
            "total_items": len(tree),
            "tree": tree,
        }
