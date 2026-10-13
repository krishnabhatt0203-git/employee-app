const employeeForm = document.getElementById('employee-form');
const employeeTableBody = document.getElementById('employee-table-body');
const alertBox = document.getElementById('alert-box');

// Show success or error message
function showAlert(message, type = 'success') {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;

    setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 4000);
}

// Load employees from the backend
async function loadEmployees() {
    try {
        const response = await fetch('/api/employees');
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Could not load employees');
        }

        employeeTableBody.innerHTML = '';

        if (result.data.length === 0) {
            employeeTableBody.innerHTML = `
                <tr>
                    <td colspan="8">No employees found.</td>
                </tr>
            `;
            return;
        }

        result.data.forEach(employee => {
            const row = document.createElement('tr');

            const values = [
                employee.id,
                employee.name,
                employee.email,
                employee.phone,
                employee.department,
                employee.designation,
                `₹${Number(employee.salary).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`
            ];

            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value ?? '';
                row.appendChild(cell);
            });

            const actionCell = document.createElement('td');
            const deleteButton = document.createElement('button');

            deleteButton.textContent = 'Delete';
            deleteButton.type = 'button';
            deleteButton.className = 'btn-delete';

            deleteButton.addEventListener('click', () => {
                deleteEmployee(employee.id);
            });

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            employeeTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Load Employees Error:', error);
        showAlert('Unable to load employees. Check the server and database.', 'error');
    }
}

// Add a new employee
employeeForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const selectedGender = document.querySelector(
        'input[name="gender"]:checked'
    );

    const employee = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        gender: selectedGender ? selectedGender.value : '',
        department: document.getElementById('department').value,
        designation: document.getElementById('designation').value.trim(),
        date_of_joining: document.getElementById('date_of_joining').value,
        salary: document.getElementById('salary').value,
        address: document.getElementById('address').value.trim()
    };

    if (
        !employee.name ||
        !employee.email ||
        !employee.phone ||
        !employee.gender ||
        !employee.department ||
        !employee.designation ||
        !employee.date_of_joining ||
        employee.salary === '' ||
        Number(employee.salary) <= 0
    ) {
        showAlert('Please fill in all required fields correctly.', 'error');
        return;
    }

    const submitButton = employeeForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employee)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Unable to add employee');
        }

        showAlert(result.message || 'Employee added successfully!', 'success');

        employeeForm.reset();

        await loadEmployees();

    } catch (error) {
        console.error('Add Employee Error:', error);
        showAlert(error.message || 'Error adding employee.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Details';
    }
});

// Delete employee
async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) {
        return;
    }

    try {
        const response = await fetch(`/api/employees/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Unable to delete employee');
        }

        showAlert(result.message || 'Employee deleted successfully!', 'success');

        await loadEmployees();

    } catch (error) {
        console.error('Delete Employee Error:', error);
        showAlert(error.message || 'Error deleting employee.', 'error');
    }
}

// Load existing records when the page opens
document.addEventListener('DOMContentLoaded', loadEmployees);
