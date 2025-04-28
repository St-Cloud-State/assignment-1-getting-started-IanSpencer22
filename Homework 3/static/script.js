// Processing phases and their tasks
const PROCESSING_PHASES = {
    'personal_details': ['identity_verification', 'address_verification', 'employment_check'],
    'credit_checking': ['credit_score', 'debt_analysis', 'payment_history'],
    'certification': ['document_verification', 'compliance_check', 'risk_assessment']
};

// Function to update task dropdown based on selected phase
function updateTaskDropdown(phaseSelect, taskSelect) {
    const phase = phaseSelect.value;
    const taskSelectElement = document.getElementById(taskSelect);
    
    // Clear existing options
    taskSelectElement.innerHTML = '<option value="">Select Task (Optional)</option>';
    
    if (phase && PROCESSING_PHASES[phase]) {
        PROCESSING_PHASES[phase].forEach(task => {
            const option = document.createElement('option');
            option.value = task;
            option.textContent = task.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            taskSelectElement.appendChild(option);
        });
    }
}

// Initialize task dropdowns
document.addEventListener('DOMContentLoaded', function() {
    const processingPhase = document.getElementById('processingPhase');
    const notePhase = document.getElementById('notePhase');
    
    processingPhase.addEventListener('change', () => updateTaskDropdown(processingPhase, 'processingTask'));
    notePhase.addEventListener('change', () => updateTaskDropdown(notePhase, 'noteTask'));
});

// Function to format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Function to format notes for display
function formatNotes(notes) {
    return notes.map(note => {
        let phaseTask = '';
        if (note.phase || note.task) {
            phaseTask = `<div class="phase-task">${note.phase ? note.phase.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}${note.task ? ' - ' + note.task.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}</div>`;
        }
        return `
            <div class="note ${note.type}">
                <div class="timestamp">${formatTimestamp(note.timestamp)}</div>
                ${phaseTask}
                <div>${note.content}</div>
                ${note.details ? `<div>${note.details}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Function to submit a new application
function submitApplication() {
    const name = document.getElementById('applicantName').value;
    const address = document.getElementById('address').value;
    
    if (!name || !address) {
        alert('Please fill in all fields');
        return;
    }

    const applicationData = {
        name: name,
        address: address
    };

    fetch('/api/submit_application', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.getElementById('submissionResult');
        if (data.error) {
            resultDiv.innerHTML = `<p style="color: red">${data.error}</p>`;
        } else {
            resultDiv.innerHTML = `<p style="color: green">Application submitted successfully! Your application number is: ${data.application_number}</p>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('submissionResult').innerHTML = '<p style="color: red">An error occurred while submitting the application.</p>';
    });
}

// Function to check application status
function checkStatus() {
    const appNumber = document.getElementById('checkApplicationNumber').value;
    
    if (!appNumber) {
        alert('Please enter an application number');
        return;
    }

    fetch(`/api/check_status?application_number=${appNumber}`)
    .then(response => response.json())
    .then(data => {
        const statusDiv = document.getElementById('statusResult');
        const notesDiv = document.getElementById('notesResult');
        
        if (data.error) {
            statusDiv.innerHTML = `<p style="color: red">${data.error}</p>`;
            notesDiv.innerHTML = '';
        } else {
            let statusHtml = `<p>Application Status: <strong>${data.status}</strong></p>`;
            if (data.processing_phase) {
                statusHtml += `<p>Current Phase: <strong>${data.processing_phase.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong></p>`;
            }
            if (data.current_task) {
                statusHtml += `<p>Current Task: <strong>${data.current_task.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong></p>`;
            }
            statusDiv.innerHTML = statusHtml;
            notesDiv.innerHTML = formatNotes(data.notes);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('statusResult').innerHTML = '<p style="color: red">An error occurred while checking the status.</p>';
        document.getElementById('notesResult').innerHTML = '';
    });
}

// Function to update application status
function updateStatus() {
    const appNumber = document.getElementById('updateApplicationNumber').value;
    const newStatus = document.getElementById('newStatus').value;
    const phase = document.getElementById('processingPhase').value;
    const task = document.getElementById('processingTask').value;
    const note = document.getElementById('statusNote').value;
    
    if (!appNumber) {
        alert('Please enter an application number');
        return;
    }

    const updateData = {
        application_number: parseInt(appNumber),
        status: newStatus,
        note: note
    };

    if (phase) updateData.phase = phase;
    if (task) updateData.task = task;

    fetch('/api/update_status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.getElementById('updateResult');
        if (data.error) {
            resultDiv.innerHTML = `<p style="color: red">${data.error}</p>`;
        } else {
            resultDiv.innerHTML = `<p style="color: green">${data.message}</p>`;
            // Clear the note field
            document.getElementById('statusNote').value = '';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('updateResult').innerHTML = '<p style="color: red">An error occurred while updating the status.</p>';
    });
}

// Function to add a note to an application
function addNote() {
    const appNumber = document.getElementById('noteApplicationNumber').value;
    const noteType = document.getElementById('noteType').value;
    const phase = document.getElementById('notePhase').value;
    const task = document.getElementById('noteTask').value;
    const content = document.getElementById('noteContent').value;
    
    if (!appNumber || !content) {
        alert('Please enter an application number and note content');
        return;
    }

    const noteData = {
        application_number: parseInt(appNumber),
        type: noteType,
        content: content
    };

    if (phase) noteData.phase = phase;
    if (task) noteData.task = task;

    fetch('/api/add_note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.getElementById('noteResult');
        if (data.error) {
            resultDiv.innerHTML = `<p style="color: red">${data.error}</p>`;
        } else {
            resultDiv.innerHTML = `<p style="color: green">${data.message}</p>`;
            // Clear the note content field
            document.getElementById('noteContent').value = '';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('noteResult').innerHTML = '<p style="color: red">An error occurred while adding the note.</p>';
    });
}
