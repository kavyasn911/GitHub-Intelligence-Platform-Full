import json
import traceback

from backend.app.github.indexer import RepositoryIndexer
from backend.app.graph.graph_store import RepositoryGraphStore
from backend.app.indexing.embedding_generator import EmbeddingGenerator
from backend.app.indexing.metadata_extractor import MetadataExtractor
from backend.app.indexing.repository_hasher import RepositoryHasher
from backend.app.indexing.vector_store import RepositoryVectorStore
from backend.app.services.repository_persistence import RepositoryPersistenceService


class RepositoryIntelligenceIndexer:

    def __init__(self):
        self.github = RepositoryIndexer()
        self.extractor = MetadataExtractor()
        self.embedding_generator = EmbeddingGenerator()
        self.vector_store = RepositoryVectorStore()
        self.hasher = RepositoryHasher()
        self.persistence = RepositoryPersistenceService()
        self.graph_store = RepositoryGraphStore()

    def build(self, force: bool = False):

        self.vector_store.create_collection()

        repositories = self.github.index_repositories()

        job_id = self.persistence.create_job()

        intelligence = []

        indexed = 0
        skipped = 0
        failed = 0

        try:

            for repository in repositories:

                print(f"\nProcessing: {repository['full_name']}")

                try:

                    enriched_repository = self.extractor.extract(
                        repository
                    )

                    content_hash = self.hasher.generate(
                        enriched_repository
                    )

                    if (
                        not force
                        and self.persistence.is_unchanged(
                            repository["id"],
                            content_hash,
                        )
                    ):
                        print("  -> Skipped (unchanged)")
                        skipped += 1
                        continue

                    searchable_text = self._build_searchable_text(
                        enriched_repository
                    )

                    embedding = self.embedding_generator.generate(
                        searchable_text
                    )

                    self.vector_store.store_repository(
                        enriched_repository,
                        embedding,
                    )

                    self.persistence.save_repository(
                        enriched_repository,
                        content_hash,
                    )

                    self.graph_store.store_repository(
                        enriched_repository
                    )

                    intelligence.append(
                        enriched_repository
                    )

                    indexed += 1

                    print("  -> Indexed successfully")

                except Exception as exc:

                    failed += 1

                    print("=" * 100)
                    print(f"FAILED: {repository['full_name']}")
                    print(f"Exception Type : {type(exc).__name__}")
                    print(f"Exception      : {exc}")
                    print("\nFull Traceback:\n")
                    traceback.print_exc()
                    print("=" * 100)

            self.persistence.complete_job(
                job_id=job_id,
                total=len(repositories),
                indexed=indexed,
                skipped=skipped,
                failed=failed,
            )

            print("\n" + "=" * 100)
            print("INDEXING SUMMARY")
            print("=" * 100)
            print(f"Total    : {len(repositories)}")
            print(f"Indexed  : {indexed}")
            print(f"Skipped  : {skipped}")
            print(f"Failed   : {failed}")
            print("=" * 100)

            return {
                "status": "success",
                "job_id": job_id,
                "total_repositories": len(repositories),
                "indexed_repositories": indexed,
                "skipped_repositories": skipped,
                "failed_repositories": failed,
                "repositories": intelligence,
            }

        except Exception as exc:

            self.persistence.complete_job(
                job_id=job_id,
                total=len(repositories),
                indexed=indexed,
                skipped=skipped,
                failed=failed,
                error_message=str(exc),
            )

            raise

    def _build_searchable_text(
        self,
        repository,
    ):

        analysis = repository.get(
            "analysis",
            {},
        )

        dependency_analysis = repository.get(
            "dependency_analysis",
            {},
        )

        parts = [
            repository.get("name", ""),
            repository.get("full_name", ""),
            repository.get("description") or "",
            repository.get("language") or "",
            analysis.get("summary", ""),
            " ".join(
                analysis.get(
                    "technologies",
                    [],
                )
            ),
            json.dumps(
                dependency_analysis.get(
                    "dependencies",
                    {},
                ),
                default=str,
            ),
        ]

        return "\n".join(
            part
            for part in parts
            if part
        )
