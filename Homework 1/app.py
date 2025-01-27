from flask import Flask, jsonify, render_template, request
import random

app = Flask(__name__)
applications = {}  # Dictionary to store applications: {app_number: {'name': '', 'zipcode': '', 'status': ''}}

@app.route('/api/submit_application', methods=['POST'])
def submit_application():
    data = request.get_json()
    name = data.get('name')
    zipcode = data.get('zipcode')
    
    if not name or not zipcode:
        return jsonify({'error': 'Name and zipcode are required'}), 400
    
    # Generate a random application number (in real system, use more secure method)
    application_number = random.randint(1000, 9999)
    while application_number in applications:
        application_number = random.randint(1000, 9999)
    
    applications[application_number] = {
        'name': name,
        'zipcode': zipcode,
        'status': 'received'
    }
    
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
        if app_number in applications:
            return jsonify({
                'status': applications[app_number]['status']
            })
        return jsonify({'status': 'not found'})
    except ValueError:
        return jsonify({'error': 'Invalid application number'}), 400

@app.route('/api/update_status', methods=['POST'])
def update_status():
    data = request.get_json()
    app_number = data.get('application_number')
    new_status = data.get('status')
    
    valid_statuses = ['received', 'processing', 'accepted', 'rejected']
    
    if not app_number or not new_status:
        return jsonify({'error': 'Application number and status are required'}), 400
    
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    try:
        app_number = int(app_number)
        if app_number in applications:
            applications[app_number]['status'] = new_status
            return jsonify({'message': 'Status updated successfully'})
        return jsonify({'error': 'Application not found'}), 404
    except ValueError:
        return jsonify({'error': 'Invalid application number'}), 400

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
