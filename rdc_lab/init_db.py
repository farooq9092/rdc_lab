import sqlite3
import os

def init_db():
    db_path = 'database.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Drop old tables to migrate
    cursor.execute('DROP TABLE IF EXISTS reports')
    cursor.execute('DROP TABLE IF EXISTS bookings')

    # Create Reports Table (With CNIC and Phone)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id TEXT UNIQUE NOT NULL,
        cnic TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_phone TEXT,
        patient_age TEXT,
        patient_gender TEXT,
        test_name TEXT NOT NULL,
        result TEXT NOT NULL,
        status TEXT DEFAULT 'Final',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Create Bookings Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        package TEXT NOT NULL,
        address TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Create Admin Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    ''')

    # Add Dummy Admin (password: admin123)
    cursor.execute("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)", ('admin', 'admin123'))

    # Add Dummy Report
    cursor.execute("INSERT OR IGNORE INTO reports (case_id, cnic, patient_name, patient_phone, patient_age, patient_gender, test_name, result, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                   ('12345', '31202-0000000-0', 'Muhammad Ali', '03136811565', '35', 'Male', 'Complete Blood Count (CBC)', 'Hemoglobin: 14.5 g/dL (Normal: 13-17)', 'Final'))

    conn.commit()
    conn.close()
    print("Database with Patient Phone migrated successfully!")

if __name__ == '__main__':
    init_db()
