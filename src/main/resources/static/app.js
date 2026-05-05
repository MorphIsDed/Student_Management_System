const API_URL = '/api/v1/students';

// Fetch and display all students
async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        const tbody = document.getElementById('studentTableBody');
        tbody.innerHTML = ''; // Clear existing rows

        students.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.id}</td>
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
                <td>${student.age}</td>
                <td>${student.gpa}</td>
                <td>${student.dateOfBirth}</td>
                <td>${student.isInternational ? 'Yes' : 'No'}</td>
                <td>$${student.tuitionFee}</td>
                <td>${student.gender}</td>
                <td>
                    <button class="btn-delete" onclick="deleteStudent(${student.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// Handle form submission to create a new student
document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
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
            loadStudents(); // Reload the table
        } else {
            alert('Failed to add student');
        }
    } catch (error) {
        console.error('Error adding student:', error);
    }
});

// Delete a student
async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadStudents(); // Reload the table
            } else {
                alert('Failed to delete student');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }
}

// Initial load
loadStudents();
