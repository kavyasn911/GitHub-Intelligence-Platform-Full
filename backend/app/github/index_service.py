from backend.app.github.indexer import RepositoryIndexer


class RepositoryIndexService:

    def __init__(self):
        self.indexer = RepositoryIndexer()

    def build_index(self):

        repositories = self.indexer.index_repositories()

        return {
            "status": "success",
            "repositories_indexed": len(repositories),
            "repositories": repositories,
        }
