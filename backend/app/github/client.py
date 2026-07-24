from github import Github

from backend.app.core.config import settings


class GitHubClient:
    def __init__(self):
        self.client = Github(
            login_or_token=settings.GITHUB_TOKEN,
            base_url=settings.GITHUB_API_URL,
        )

    def get_authenticated_user(self):
        return self.client.get_user()

    def get_repositories(self):
        return self.client.get_user().get_repos()
