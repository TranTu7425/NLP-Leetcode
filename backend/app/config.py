from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    secret_key: str = "dev-secret-please-override-with-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    database_url: str = "sqlite:////app/data/nlp.db"

    cors_origins: list[str] = [
        "http://localhost",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
    ]

    exec_timeout_s: int = 10
    exec_mem_mb: int = 512
    exec_user: str = "sandbox"


settings = Settings()
