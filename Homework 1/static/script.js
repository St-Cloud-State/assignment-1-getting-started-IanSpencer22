// Function to submit a new application
function submitApplication() {
    const name = document.getElementById('applicantName').value;
    const zipcode = document.getElementById('zipcode').value;
    
    if (!name || !zipcode) {
        alert('Please fill in all fields');
        return;
    }

    const applicationData = {
        name: name,
        zipcode: zipcode
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
        const resultDiv = document.getElementById('statusResult');
        if (data.error) {
            resultDiv.innerHTML = `<p style="color: red">${data.error}</p>`;
        } else {
            resultDiv.innerHTML = `<p>Application Status: <strong>${data.status}</strong></p>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('statusResult').innerHTML = '<p style="color: red">An error occurred while checking the status.</p>';
    });
}

// Function to update application status
function updateStatus() {
    const appNumber = document.getElementById('updateApplicationNumber').value;
    const newStatus = document.getElementById('newStatus').value;
    
    if (!appNumber) {
        alert('Please enter an application number');
        return;
    }

    const updateData = {
        application_number: parseInt(appNumber),
        status: newStatus
    };

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
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('updateResult').innerHTML = '<p style="color: red">An error occurred while updating the status.</p>';
    });
}