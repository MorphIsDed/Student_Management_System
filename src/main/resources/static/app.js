const API_URL = '/api/v1/students';

// Toast Notification Setup
const toastElement = document.getElementById('liveToast');
const toastMessage = document.getElementById('toastMessage');
const toast = new bootstrap.Toast(toastElement);

function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toastElement.className = `toast align-items-center text-white border-0 ${isError ? 'bg-danger' : 'bg-success'}`;
    toast.show();
}

// Format Currency
const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

// Fetch and display all students
async function loadStudents() {
    const tbody = document.getElementById('studentTableBody');
    
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        
        if (students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        No students enrolled yet. Add one from the panel!
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = ''; // Clear existing rows

        students.forEach(student => {
            const tr = document.createElement('tr');
            
            // Format Data
            const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
            const badgeClass = student.isInternational ? 'bg-info text-dark' : 'bg-secondary';
            const badgeText = student.isInternational ? 'Intl' : 'Domestic';
            
            tr.innerHTML = `
                <td class="ps-3">
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle me-3">${initials}</div>
                        <div>
                            <div class="fw-bold">${student.firstName} ${student.lastName}</div>
                            <div class="text-muted small">ID: #${student.id} | Gender: ${student.gender}</div>
                        </div>
                    </div>
                </td>
                <td>${student.age}</td>
                <td>${student.dateOfBirth}</td>
                <td>
                    <span class="badge ${student.gpa >= 3.5 ? 'bg-success' : (student.gpa >= 2.5 ? 'bg-warning text-dark' : 'bg-danger')}">
                        ${student.gpa.toFixed(2)}
                    </span>
                </td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td class="fw-medium">${currencyFormatter.format(student.tuitionFee)}</td>
                <td class="text-center pe-3">
                    <button class="btn btn-outline-danger btn-action shadow-sm" onclick="deleteStudent(${student.id})" title="Delete Student">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading students:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5 text-danger">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>Failed to load directory.
                </td>
            </tr>
        `;
    }
}

// Handle form submission
document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Bootstrap form validation check
    if (!e.target.checkValidity()) {
        e.stopPropagation();
        e.target.classList.add('was-validated');
        return;
    }

    // Grab submit button to show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
    submitBtn.disabled = true;

    const studentData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        age: parseInt(document.getElementById('age').value),
        gpa: parseFloat(document.getElementById('gpa').value),
        dateOfBirth: document.getElementById('dateOfBirth').value,
        isInternational: document.getElementById('isInternational').value === 'true',
        tuitionFee: parseFloat(document.getElementById('tuitionFee').value),
        gender: document.getElementById('gender').value.toUpperCase()
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            document.getElementById('studentForm').reset();
            document.getElementById('studentForm').classList.remove('was-validated');
            showToast('Student enrolled successfully!');
            await loadStudents(); // Reload the table
        } else {
            showToast('Failed to add student. Please check input.', true);
        }
    } catch (error) {
        console.error('Error adding student:', error);
        showToast('Network error occurred.', true);
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Delete a student
async function deleteStudent(id) {
    if (confirm('Are you sure you want to remove this student from the directory?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Student record deleted.');
                loadStudents(); // Reload the table
            } else {
                showToast('Failed to delete student.', true);
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            showToast('Network error occurred.', true);
        }
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', loadStudents);
