from fastapi import status


class AppException(Exception):
    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class FieldNotFoundException(AppException):
    status_code = status.HTTP_404_NOT_FOUND

    def __init__(self, field: str, value: str):
        self.field = field
        super().__init__(f"{field} '{value}' not found")


class DuplicateEntryException(AppException):
    status_code = status.HTTP_409_CONFLICT

    def __init__(self, field: str, value: str):
        self.field = field
        super().__init__(f"{field} '{value}' already exists")


class CredentialsException(AppException):
    status_code = status.HTTP_401_UNAUTHORIZED


class BadRequestException(AppException):
    status_code = status.HTTP_400_BAD_REQUEST


class ForbiddenException(AppException):
    status_code = status.HTTP_403_FORBIDDEN
