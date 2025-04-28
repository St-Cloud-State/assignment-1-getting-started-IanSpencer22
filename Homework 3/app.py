from flask import Flask, jsonify, render_template, request
import random
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client['acme_financial']
applications = db.applications

# Valid processing phases and their tasks
PROCESSING_PHASES = {
    'personal_details': ['identity_verification', 'address_verification', 'employment_check'],
    'credit_checking': ['credit_score', 'debt_analysis', 'payment_history'],
    'certification': ['document_verification', 'compliance_check', 'risk_assessment']
}

@app.route('/api/submit_application', methods=['POST'])
def submit_application():
    data = request.get_json()
    name = data.get('name')
    address = data.get('address')
    
    if not name or not address:
        return jsonify({'error': 'Name and address are required'}), 400
    
    # Generate a random application number
    application_number = random.randint(1000, 9999)
    while applications.find_one({'application_number': application_number}):
        application_number = random.randint(1000, 9999)
    
    application = {
        'application_number': application_number,
        'name': name,
        'address': address,
        'status': 'received',
        'processing_phase': None,
        'current_task': None,
        'notes': [{
            'timestamp': datetime.utcnow(),
            'type': 'system',
            'content': 'Application received',
            'phase': None,
            'task': None
        }],
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    applications.insert_one(application)
    
    return jsonify({
        'message': 'Application submitted successfully',
        'application_number': application_number
    })

@app.route('/api/check_status', methods=['GET'])
def check_status():
    app_number = request.args.get('application_number')
    if not app_number:
        return jsonify({'error': 'Application number is required'}), 400
    
    try:
        app_number = int(app_number)
        application = applications.find_one({'application_number': app_number})
        if application:
            return jsonify({
                'status': application['status'],
                'processing_phase': application.get('processing_phase'),
                'current_task': application.get('current_task'),
                'notes': application['notes']
            })
        return jsonify({'status': 'not found'})
    except ValueError:
        return jsonify({'error': 'Invalid application number'}), 400

@app.route('/api/update_status', methods=['POST'])
def update_status():
    data = request.get_json()
    app_number = data.get('application_number')
    new_status = data.get('status')
    note = data.get('note', '')
    phase = data.get('phase')
    task = data.get('task')
    
    valid_statuses = ['received', 'processing', 'accepted', 'rejected']
    
    if not app_number or not new_status:
        return jsonify({'error': 'Application number and status are required'}), 400
    
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    if phase and phase not in PROCESSING_PHASES:
        return jsonify({'error': 'Invalid processing phase'}), 400
    
    if task and phase and task not in PROCESSING_PHASES[phase]:
        return jsonify({'error': 'Invalid task for the given phase'}), 400
    
    try:
        app_number = int(app_number)
        application = applications.find_one({'application_number': app_number})
        if application:
            # Add note about status change
            new_note = {
                'timestamp': datetime.utcnow(),
                'type': 'status_change',
                'content': f'Status changed to {new_status}',
                'phase': phase,
                'task': task
            }
            if note:
                new_note['details'] = note
            
            update_data = {
                'status': new_status,
                'updated_at': datetime.utcnow()
            }
            
            if phase:
                update_data['processing_phase'] = phase
            if task:
                update_data['current_task'] = task
            
            applications.update_one(
                {'application_number': app_number},
                {
                    '$set': update_data,
                    '$push': {'notes': new_note}
                }
            )
            return jsonify({'message': 'Status updated successfully'})
        return jsonify({'error': 'Application not found'}), 404
    except ValueError:
        return jsonify({'error': 'Invalid application number'}), 400

@app.route('/api/add_note', methods=['POST'])
def add_note():
    data = request.get_json()
    app_number = data.get('application_number')
    note_type = data.get('type')
    content = data.get('content')
    phase = data.get('phase')
    task = data.get('task')
    
    if not all([app_number, note_type, content]):
        return jsonify({'error': 'Application number, note type, and content are required'}), 400
    
    if phase and phase not in PROCESSING_PHASES:
        return jsonify({'error': 'Invalid processing phase'}), 400
    
    if task and phase and task not in PROCESSING_PHASES[phase]:
        return jsonify({'error': 'Invalid task for the given phase'}), 400
    
    try:
        app_number = int(app_number)
        application = applications.find_one({'application_number': app_number})
        if application:
            new_note = {
                'timestamp': datetime.utcnow(),
                'type': note_type,
                'content': content,
                'phase': phase,
                'task': task
            }
            
            applications.update_one(
                {'application_number': app_number},
                {
                    '$push': {'notes': new_note},
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )
            return jsonify({'message': 'Note added successfully'})
        return jsonify({'error': 'Application not found'}), 404
    except ValueError:
        return jsonify({'error': 'Invalid application number'}), 400

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
