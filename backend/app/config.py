from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+asyncpg://safebank:safebank_dev@localhost:5432/safebank_ai"

    @property
    def async_database_url(self) -> str:
        url = self.database_url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url
    jwt_secret: str = "safebank-ai-jwt-dev-secret"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 10080


settings = Settings()
