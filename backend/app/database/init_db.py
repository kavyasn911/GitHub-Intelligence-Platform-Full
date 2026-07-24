from backend.app.database.base import Base
from backend.app.database.models import IndexingJob, RepositoryRecord
from backend.app.database.session import engine


def create_database_tables():
    Base.metadata.create_all(bind=engine)
