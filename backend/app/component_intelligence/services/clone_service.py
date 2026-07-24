from pathlib import Path
import shutil

from git import Repo

from backend.app.github.client import GitHubClient


class RepositoryCloneService:

    CACHE_DIR = Path("cache/repositories")

    def __init__(self):
        self.github = GitHubClient()
        self.CACHE_DIR.mkdir(parents=True, exist_ok=True)

    def clone(self, full_name: str):

        repo = self.github.client.get_repo(full_name)

        clone_url = repo.clone_url

        destination = self.CACHE_DIR / full_name.replace("/", "_")

        if destination.exists():
            return {
                "status": "cached",
                "path": str(destination),
            }

        Repo.clone_from(clone_url, destination)

        return {
            "status": "cloned",
            "path": str(destination),
        }

    def delete(self, full_name: str):

        destination = self.CACHE_DIR / full_name.replace("/", "_")

        if destination.exists():
            shutil.rmtree(destination)

    def clear(self):

        if self.CACHE_DIR.exists():
            shutil.rmtree(self.CACHE_DIR)

        self.CACHE_DIR.mkdir(parents=True, exist_ok=True)
