import base64

from github.GithubException import UnknownObjectException

from backend.app.github.client import GitHubClient


class ReadmeFetcher:

    def __init__(self):
        self.github = GitHubClient()

    def fetch_readme(self, full_name: str):

        try:

            repo = self.github.client.get_repo(full_name)

            readme = repo.get_readme()

            return base64.b64decode(
                readme.content
            ).decode("utf-8")

        except UnknownObjectException:

            return None

        except Exception:

            return None
