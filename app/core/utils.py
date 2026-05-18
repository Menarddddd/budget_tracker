import base64
import calendar
from datetime import date, datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import json
import smtplib
from uuid import UUID

from app.core.settings import settings


def get_cycle_start_for_today(preferred_day: int, today: date) -> date:
    """
    Returns the start date of the cycle that should currently be active.
    """

    # Start day for current month
    current_month_last_day = calendar.monthrange(today.year, today.month)[1]
    current_month_start_day = min(preferred_day, current_month_last_day)

    # If today is on/after this month's cycle start, current cycle started this month
    if today.day >= current_month_start_day:
        return date(today.year, today.month, current_month_start_day)

    # Otherwise current cycle started last month
    if today.month == 1:
        prev_year = today.year - 1
        prev_month = 12
    else:
        prev_year = today.year
        prev_month = today.month - 1

    prev_month_last_day = calendar.monthrange(prev_year, prev_month)[1]
    prev_month_start_day = min(preferred_day, prev_month_last_day)

    return date(prev_year, prev_month, prev_month_start_day)


def calculate_end_date(start_date: date) -> date:
    """
    Calculate cycle end date as the day before the next cycle start.

    Examples:
      2026-05-01 -> 2026-05-31
      2026-05-16 -> 2026-06-15
      2026-01-31 -> 2026-02-27 (if Feb has 28 days)
    """

    # Get next month/year
    if start_date.month == 12:
        next_year = start_date.year + 1
        next_month = 1
    else:
        next_year = start_date.year
        next_month = start_date.month + 1

    # Clamp day if next month has fewer days
    last_day_next_month = calendar.monthrange(next_year, next_month)[1]
    next_start_day = min(start_date.day, last_day_next_month)

    next_cycle_start = date(next_year, next_month, next_start_day)

    return next_cycle_start - timedelta(days=1)


def clean_user_info(user_data: dict) -> dict:
    cleaned = {}
    for key, val in user_data.items():
        if not isinstance(val, str):
            cleaned[key] = val
            continue
        if key in ["username", "email"]:
            cleaned[key] = val.strip().lower()
        elif key in ["first_name", "last_name"]:
            cleaned[key] = val.strip().title()
        else:
            cleaned[key] = val
    return cleaned


def send_email(to_email: str, subject: str, body: str):
    message = MIMEMultipart()
    message["From"] = settings.EMAIL_USERNAME
    message["To"] = to_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.login(
                settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD.get_secret_value()
            )
            server.sendmail(settings.EMAIL_USERNAME, to_email, message.as_string())
        return True

    except smtplib.SMTPAuthenticationError:
        print("Authentication failed. Check your email and app password.")
        return False

    except smtplib.SMTPException as e:
        print(f"Failed to send email: {e}")
        return False


def encode_cursor(created_at: datetime, id: UUID) -> str:
    """
    Encodes created_at + id into a base64 string.
    """
    data = {
        "created_at": created_at.isoformat(),
        "id": str(id),
    }
    return base64.b64encode(json.dumps(data).encode()).decode()


def decode_cursor(cursor: str) -> tuple[datetime, UUID]:
    """
    Decodes a cursor string back into created_at + id.
    """
    data = json.loads(base64.b64decode(cursor.encode()).decode())
    return (
        datetime.fromisoformat(data["created_at"]),
        UUID(data["id"]),
    )
