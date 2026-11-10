"""Structured logging configuration for DaRI AI Picture Mirror.

Configures standard logging with structured formatting, context information,
and prevents accidental leakage of credentials or sensitive data into log streams.
"""

import logging
import sys
from typing import Optional


class SensitiveDataFilter(logging.Filter):
    """Filter that masks obvious sensitive keywords or patterns in log records."""

    SENSITIVE_KEYS = ("password", "secret", "token", "credential", "authorization", "aws_secret_access_key")

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            msg_lower = record.msg.lower()
            for key in self.SENSITIVE_KEYS:
                if f"{key}=" in msg_lower or f"{key}:" in msg_lower:
                    # Generic notice that a sensitive field was detected
                    # Real application logs should never format secrets directly
                    record.msg = f"[REDACTED LOG: contains {key} reference]"
                    break
        return True


def setup_logging(log_level: Optional[str] = None) -> logging.Logger:
    """Set up standardized structured logging for the application."""
    level_name = (log_level or "INFO").upper()
    numeric_level = getattr(logging, level_name, logging.INFO)

    # Format includes timestamp, level, module/logger name, and message
    log_format = "%(asctime)s | %(levelname)-7s | %(name)s:%(lineno)d | %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    # Remove existing handlers to avoid duplicate output in test or reload environments
    root_logger = logging.getLogger()
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    formatter = logging.Formatter(log_format, datefmt=date_format)
    console_handler.setFormatter(formatter)
    console_handler.addFilter(SensitiveDataFilter())

    root_logger.setLevel(numeric_level)
    root_logger.addHandler(console_handler)

    # Suppress verbose noise from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("botocore").setLevel(logging.WARNING)
    logging.getLogger("boto3").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)

    logger = logging.getLogger("dariai_picture_mirror")
    logger.info("Logging configured with level: %s", level_name)
    return logger
