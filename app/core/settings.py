from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="UTF-8")

    DATABASE_URL: SecretStr
    DATABASE_USERNAME: SecretStr
    DATABASE_PASSWORD: SecretStr
    DATABASE_NAME: str

    ACCESS_SECRET_KEY: SecretStr
    ACCESS_MINUTES_EXPIRE: int
    ALGORITHM: str


settings = Settings()  # type: ignore
