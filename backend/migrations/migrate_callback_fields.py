import os
import sys
from pathlib import Path
from sqlalchemy import text
from dotenv import load_dotenv

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

load_dotenv(BASE_DIR / ".env", override=True)

from app.database.connection import engine

def run_migration():
    print("Starting database migration for callback_requests...")
    with engine.begin() as connection:
        # Check existing columns
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'callback_requests';
        """)
        existing_columns = [row[0] for row in connection.execute(check_query).fetchall()]
        print(f"Existing columns in callback_requests: {existing_columns}")

        # Add updated_at if not exists
        if "updated_at" not in existing_columns:
            print("Adding column: updated_at (TIMESTAMPTZ)")
            connection.execute(text("ALTER TABLE callback_requests ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NULL;"))
        else:
            print("Column updated_at already exists.")

        # Add follow_up_notes if not exists
        if "follow_up_notes" not in existing_columns:
            print("Adding column: follow_up_notes (TEXT)")
            connection.execute(text("ALTER TABLE callback_requests ADD COLUMN follow_up_notes TEXT DEFAULT NULL;"))
        else:
            print("Column follow_up_notes already exists.")

        # Add updated_by if not exists
        if "updated_by" not in existing_columns:
            print("Adding column: updated_by (VARCHAR(100))")
            connection.execute(text("ALTER TABLE callback_requests ADD COLUMN updated_by VARCHAR(100) DEFAULT NULL;"))
        else:
            print("Column updated_by already exists.")

    print("Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
