import sqlite3

def upgrade_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Check if file_path column exists
    cursor.execute("PRAGMA table_info(reports)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'file_path' not in columns:
        print("Adding file_path column to reports table...")
        cursor.execute("ALTER TABLE reports ADD COLUMN file_path TEXT")
        conn.commit()
    else:
        print("file_path column already exists.")
        
    conn.close()
    print("Database upgrade complete.")

if __name__ == '__main__':
    upgrade_db()
