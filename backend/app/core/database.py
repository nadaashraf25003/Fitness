from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Handle SQLite vs PostgreSQL arguments
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def sync_db_schema():
    """Ensure missing columns in SQLite tables are automatically added if models evolve."""
    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    with engine.begin() as conn:
        for table_name, table in Base.metadata.tables.items():
            if not inspector.has_table(table_name):
                continue
            existing_columns = {col["name"] for col in inspector.get_columns(table_name)}
            for col in table.columns:
                if col.name not in existing_columns:
                    col_type = col.type.compile(engine.dialect)
                    conn.execute(
                        text(f"ALTER TABLE {table_name} ADD COLUMN {col.name} {col_type}")
                    )


def get_db():
    """Dependency that yields a database session for each request and closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

