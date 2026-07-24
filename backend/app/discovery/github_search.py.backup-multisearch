from github import Github
from github.GithubException import GithubException

from backend.app.core.config import settings


class GlobalGitHubSearchService:

    def __init__(self):

        self.client = Github(
            login_or_token=settings.GITHUB_TOKEN,
            base_url=settings.GITHUB_API_URL,
        )

    def search(
        self,
        queries,
        limit: int = 10,
    ) -> dict:

        if isinstance(queries, str):
            queries = [queries]

        repositories = {}

        errors = []

        for query in queries:

            try:

                results = self.client.search_repositories(
                    query=query,
                    sort="stars",
                    order="desc",
                )

                collected = 0

                for repo in results:

                    if collected >= limit:
                        break

                    try:

                        full_name = repo.full_name

                        if full_name not in repositories:

                            repositories[full_name] = {
                                "id": repo.id,
                                "name": repo.name,
                                "full_name": full_name,
                                "description": repo.description,
                                "language": repo.language,
                                "stars": repo.stargazers_count,
                                "forks": repo.forks_count,
                                "watchers": repo.watchers_count,
                                "open_issues": repo.open_issues_count,
                                "default_branch": repo.default_branch,
                                "updated_at": str(repo.updated_at),
                                "created_at": str(repo.created_at),
                                "html_url": repo.html_url,
                                "clone_url": repo.clone_url,
                                "topics": repo.get_topics(),
                                "archived": repo.archived,
                                "fork": repo.fork,
                                "matched_github_query": query,
                                "matched_github_queries": [],
                                "github_search_hits": 0,
                                "best_github_position": None,
                            }

                        repository = repositories[full_name]

                        matched_queries = repository[
                            "matched_github_queries"
                        ]

                        if query not in matched_queries:
                            matched_queries.append(query)

                        repository["github_search_hits"] += 1

                        current_position = collected + 1

                        best_position = repository.get(
                            "best_github_position"
                        )

                        if (
                            best_position is None
                            or current_position < best_position
                        ):
                            repository[
                                "best_github_position"
                            ] = current_position

                        collected += 1

                    except Exception as exc:

                        errors.append({
                            "repository": getattr(
                                repo,
                                "full_name",
                                "unknown",
                            ),
                            "error": str(exc),
                        })

            except GithubException as exc:

                errors.append({
                    "query": query,
                    "error": str(exc),
                })

            except Exception as exc:

                errors.append({
                    "query": query,
                    "error": str(exc),
                })

        return {
            "status": "success",
            "queries": queries,
            "count": len(repositories),
            "repositories": list(
                repositories.values()
            ),
            "errors": errors,
        }

