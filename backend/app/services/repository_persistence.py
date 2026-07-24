from datetime import datetime, timezone

from sqlalchemy import select

from backend.app.database.models import IndexingJob, RepositoryRecord
from backend.app.database.session import SessionLocal


class RepositoryPersistenceService:

    def get_repository(
        self,
        github_id: int,
    ):

        with SessionLocal() as session:

            statement = select(
                RepositoryRecord
            ).where(
                RepositoryRecord.github_id == github_id
            )

            return session.scalar(statement)

    def is_unchanged(
        self,
        github_id: int,
        content_hash: str,
    ) -> bool:

        repository = self.get_repository(github_id)

        if repository is None:
            return False

        return repository.content_hash == content_hash

    def save_repository(
        self,
        repository: dict,
        content_hash: str,
    ):

        with SessionLocal() as session:

            statement = select(
                RepositoryRecord
            ).where(
                RepositoryRecord.github_id == repository["id"]
            )

            record = session.scalar(statement)

            now = datetime.now(timezone.utc)

            if record is None:

                record = RepositoryRecord(
                    github_id=repository["id"],
                    name=repository["name"],
                    full_name=repository["full_name"],
                    description=repository.get("description"),
                    language=repository.get("language"),
                    default_branch=repository.get("default_branch"),
                    content_hash=content_hash,
                    indexed_at=now,
                    updated_at=now,
                )

                session.add(record)

            else:

                record.name = repository["name"]
                record.full_name = repository["full_name"]
                record.description = repository.get("description")
                record.language = repository.get("language")
                record.default_branch = repository.get("default_branch")
                record.content_hash = content_hash
                record.indexed_at = now
                record.updated_at = now

            session.commit()

    def create_job(self):

        with SessionLocal() as session:

            job = IndexingJob(
                status="running"
            )

            session.add(job)
            session.commit()
            session.refresh(job)

            return job.id

    def complete_job(
        self,
        job_id: int,
        total: int,
        indexed: int,
        skipped: int,
        failed: int,
        error_message: str | None = None,
    ):

        with SessionLocal() as session:

            job = session.get(
                IndexingJob,
                job_id,
            )

            if job is None:
                return

            job.status = (
                "failed"
                if error_message
                else "completed"
            )

            job.total_repositories = total
            job.indexed_repositories = indexed
            job.skipped_repositories = skipped
            job.failed_repositories = failed
            job.error_message = error_message
            job.completed_at = datetime.now(timezone.utc)

            session.commit()

    def get_jobs(self):

        with SessionLocal() as session:

            statement = (
                select(IndexingJob)
                .order_by(IndexingJob.id.desc())
                .limit(20)
            )

            jobs = session.scalars(statement).all()

            return [
                {
                    "id": job.id,
                    "status": job.status,
                    "total_repositories": job.total_repositories,
                    "indexed_repositories": job.indexed_repositories,
                    "skipped_repositories": job.skipped_repositories,
                    "failed_repositories": job.failed_repositories,
                    "error_message": job.error_message,
                    "started_at": job.started_at,
                    "completed_at": job.completed_at,
                }
                for job in jobs
            ]
