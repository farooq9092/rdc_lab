from flask import Flask, request, jsonify, render_template, send_from_directory, send_file, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
import sqlite3
import os
from functools import wraps

app = Flask(__name__, static_folder='.', static_url_path='')
app.secret_key = 'super-secret-al-rasheed-key' # Production Key!
CORS(app)

UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

DATABASE = 'database.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Security decorator for Admin Access
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({'error': 'Unauthorized Access. Please login.'}), 401
        return f(*args, **kwargs)
    return decorated_function

# ===============================
# PUBLIC ENDPOINTS
# ===============================
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/reports/<case_id>', methods=['GET'])
def get_report(case_id):
    cnic = request.args.get('cnic')
    conn = get_db_connection()
    report = conn.execute('SELECT * FROM reports WHERE case_id = ?', (case_id,)).fetchone()
    conn.close()
    
    if not report:
        return jsonify({'error': 'Report not found', 'type': 'WRONG_ID'}), 404
        
    if report['cnic'] != cnic:
        return jsonify({'error': 'Incorrect CNIC provided', 'type': 'WRONG_CNIC'}), 403
        
    return jsonify(dict(report))

@app.route('/api/reports/download/<case_id>')
def download_report(case_id):
    cnic = request.args.get('cnic')
    conn = get_db_connection()
    report = conn.execute('SELECT * FROM reports WHERE case_id = ? AND cnic = ?', (case_id, cnic)).fetchone()
    conn.close()
    
    if report and report['file_path'] and os.path.exists(report['file_path']):
        ext = os.path.splitext(report['file_path'])[1]
        download_n = f"Report_{case_id}{ext}"
        return send_file(report['file_path'], as_attachment=True, download_name=download_n)
    return "Report file not found or Unauthorized", 404

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.json
    conn = get_db_connection()
    conn.execute('INSERT INTO bookings (patient_name, phone, package, address) VALUES (?, ?, ?, ?)',
                 (data['name'], data['phone'], data['package'], data['address']))
    conn.commit()
    conn.close()
    print(f"[WHATSAPP] Message sent to {data['phone']}")
    return jsonify({'message': 'Booking received successfully!'}), 201

# ===============================
# SECURE ADMIN ENDPOINTS
# ===============================
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ? AND password = ?', (data['username'], data['password'])).fetchone()
    conn.close()
    if user: 
        session['admin_logged_in'] = True
        return jsonify({'status': 'success'})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_logged_in', None)
    return jsonify({'status': 'logged out'})

@app.route('/api/admin/bookings')
@login_required
def get_bookings():
    conn = get_db_connection()
    bookings = conn.execute('SELECT * FROM bookings ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(b) for b in bookings])

@app.route('/api/admin/reports_list')
@login_required
def get_reports_list():
    date_filter = request.args.get('date', '')
    month_filter = request.args.get('month', '')
    
    query = 'SELECT * FROM reports WHERE 1=1'
    params = []
    
    if date_filter:
        query += ' AND date(created_at) = ?'
        params.append(date_filter)
    elif month_filter:
        query += ' AND strftime("%Y-%m", created_at) = ?'
        params.append(month_filter)
        
    query += ' ORDER BY created_at DESC'
    
    conn = get_db_connection()
    reports = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(r) for r in reports])

@app.route('/api/admin/reports/<case_id>/status', methods=['PUT'])
@login_required
def update_report_status(case_id):
    data = request.json
    conn = get_db_connection()
    conn.execute('UPDATE reports SET status = ? WHERE case_id = ?', (data['status'], case_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Status updated'})

@app.route('/api/admin/reports/<case_id>', methods=['DELETE'])
@login_required
def delete_report(case_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM reports WHERE case_id = ?', (case_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Report deleted'})

@app.route('/api/admin/reports/all', methods=['DELETE'])
@login_required
def delete_all_reports():
    conn = get_db_connection()
    conn.execute('DELETE FROM reports')
    conn.commit()
    conn.close()
    return jsonify({'message': 'All reports deleted'})

@app.route('/api/admin/reports', methods=['POST'])
@login_required
def add_report():
    conn = get_db_connection()
    try:
        data = request.form
        file = request.files.get('file')
        
        if not file or not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: PDF, JPG, PNG, DOCX'}), 400
            
        filename = secure_filename(f"{data['case_id']}_{file.filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        conn.execute('INSERT INTO reports (case_id, cnic, patient_name, patient_phone, patient_age, patient_gender, test_name, result, status, file_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                     (data['case_id'], data['cnic'], data['patient_name'], data.get('patient_phone', ''), data.get('patient_age', 'N/A'), data.get('patient_gender', 'Not Specified'), 'Uploaded File', 'See Attached PDF/Doc', data['status'], file_path))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Duplicate Case ID: A report with this Case ID already exists.'}), 400
    except Exception as e:
        conn.close()
        return jsonify({'error': "Server Error processing request"}), 500
    conn.close()
    
    phone = data.get('patient_phone', '03000000000')
    return jsonify({'message': 'Success', 'notified': phone})

@app.route('/api/admin/bookings/<int:bid>/status', methods=['PUT'])
@login_required
def update_booking_status(bid):
    data = request.json
    conn = get_db_connection()
    conn.execute('UPDATE bookings SET status = ? WHERE id = ?', (data['status'], bid))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Booking status updated'})

@app.route('/api/admin/bookings/<int:bid>', methods=['DELETE'])
@login_required
def delete_booking(bid):
    conn = get_db_connection()
    conn.execute('DELETE FROM bookings WHERE id = ?', (bid,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Booking deleted'})

@app.route('/api/admin/bookings/all', methods=['DELETE'])
@login_required
def delete_all_bookings():
    conn = get_db_connection()
    conn.execute('DELETE FROM bookings')
    conn.commit()
    conn.close()
    return jsonify({'message': 'All bookings deleted'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
