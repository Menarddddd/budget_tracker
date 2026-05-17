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

    REFRESH_SECRET_KEY: SecretStr
    REFRESH_DAYS_EXPIRE: int

    ALGORITHM: str

    EMAIL_HOST: str
    EMAIL_USERNAME: str
    EMAIL_PASSWORD: SecretStr
    EMAIL_PORT: int


settings = Settings()  # type: ignore
