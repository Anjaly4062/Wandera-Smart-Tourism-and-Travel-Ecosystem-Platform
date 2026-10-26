from .settings import *
import os

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.environ["AIVEN_DB_NAME"],
        "USER": os.environ["AIVEN_DB_USER"],
        "PASSWORD": os.environ["AIVEN_DB_PASSWORD"],
        "HOST": os.environ["AIVEN_DB_HOST"],
        "PORT": os.environ.get("AIVEN_DB_PORT", "3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
            "ssl": {"ca": os.environ["AIVEN_CA_CERT"]},
        },
    }
}