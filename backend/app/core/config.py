from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "GitHub Intelligence Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"

    GITHUB_API_URL: str = "https://api.github.com"
    GITHUB_TOKEN: str = ""
    GITHUB_ORGANIZATION: str = ""

    DATABASE_URL: str = ""

    REDIS_URL: str = "redis://localhost:6379"

    QDRANT_URL: str = "http://localhost:6333"

    model_config = SettingsConfigDict(
        env_file="backend/.env",
        extra="ignore"
    )


settings = Settings()
