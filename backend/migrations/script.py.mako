"""
Alembic configuration for database migrations.
"""

import sys
import os

# Ensure backend root is in the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from alembic.config import Config
from app.core.database import Base, engine
from app.models import user, note, flashcard, vocabulary, sync_log  # noqa: F401

target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = engine.url
    context_config = Config("alembic.ini")
    context_config.set_main_option("sqlalchemy.url", str(url))

    with context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    ) as context:
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    from sqlalchemy import engine_from_config
    from sqlalchemy import pool

    configuration = Config("alembic.ini")
    sql_url = configuration.get_main_option("sqlalchemy.url")
    connectable = engine_from_config(
        configuration.get_section(configuration.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.env_version:
    run_migrations_online()
else:
    run_migrations_offline()
