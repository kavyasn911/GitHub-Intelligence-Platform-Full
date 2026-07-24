from backend.app.github.client import GitHubClient


class RepositoryIndexer:

    def __init__(self):
        self.github = GitHubClient()

    def index_repositories(self):

        repositories = []

        for repo in self.github.get_repositories():

            repositories.append(
                {
                    "id": repo.id,
                    "name": repo.name,
                    "full_name": repo.full_name,
                    "description": repo.description,
                    "language": repo.language,
                    "default_branch": repo.default_branch,
                    "private": repo.private,
                    "stars": repo.stargazers_count,
                    "updated_at": str(repo.updated_at),
                    "clone_url": repo.clone_url,
                }
            )

        return repositories
