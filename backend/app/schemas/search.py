from pydantic import BaseModel, Field


class SemanticSearchRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=1,
        description="Natural language repository search query",
    )

    limit: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of results",
    )
