import json

from github.GithubException import GithubException

from backend.app.github.client import GitHubClient


class DependencyDetector:

    DEPENDENCY_FILE_NAMES = {
        "requirements.txt",
        "package.json",
        "pom.xml",
        "build.gradle",
        "pyproject.toml",
        "go.mod",
        "Cargo.toml",
    }

    def __init__(self):
        self.github = GitHubClient()

    def detect(self, full_name: str):

        repo = self.github.client.get_repo(full_name)

        detected_files = []
        dependencies = {}

        try:
            tree = repo.get_git_tree(
                sha=repo.default_branch,
                recursive=True,
            )

            for item in tree.tree:

                if item.type != "blob":
                    continue

                file_name = item.path.split("/")[-1]

                if file_name not in self.DEPENDENCY_FILE_NAMES:
                    continue

                try:
                    file_content = repo.get_contents(item.path)

                    content = file_content.decoded_content.decode(
                        "utf-8",
                        errors="ignore",
                    )

                    detected_files.append(item.path)

                    if file_name == "requirements.txt":

                        dependencies[item.path] = (
                            self._parse_requirements(content)
                        )

                    elif file_name == "package.json":

                        dependencies[item.path] = (
                            self._parse_package_json(content)
                        )

                    else:

                        dependencies[item.path] = {
                            "detected": True
                        }

                except GithubException:
                    continue

        except GithubException as exc:

            return {
                "dependency_files": [],
                "dependencies": {},
                "error": str(exc),
            }

        return {
            "dependency_files": detected_files,
            "dependencies": dependencies,
        }

    def _parse_requirements(self, content: str):

        packages = []

        for line in content.splitlines():

            line = line.strip()

            if line and not line.startswith("#"):
                packages.append(line)

        return packages

    def _parse_package_json(self, content: str):

        try:

            data = json.loads(content)

            return {
                "dependencies": data.get(
                    "dependencies",
                    {},
                ),
                "dev_dependencies": data.get(
                    "devDependencies",
                    {},
                ),
            }

        except json.JSONDecodeError:

            return {
                "dependencies": {},
                "dev_dependencies": {},
            }
