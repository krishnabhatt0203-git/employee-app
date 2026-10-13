const path = require('path');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

// MySQL Pool Configuration
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Apna MySQL Password dalein
    database: 'employee_db', // Apna DB Name dalein
    waitForConnections: true,
    connectionLimit: 10
});

// Fetch Employees Route
app.get('/api/employees', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM employees ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('MySQL Error Details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch employees' });
    }
});

// Add Employee Route
app.post('/api/employees', async (req, res) => {
    const { name, email, phone, gender, department, designation, date_of_joining, salary, address } = req.body;

    if (!name || !email || !phone || !gender || !department || !designation || !date_of_joining || salary === undefined) {
        return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    try {
        const sql = `
            INSERT INTO employees (name, email, phone, gender, department, designation, date_of_joining, salary, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [name, email, phone, gender, department, designation, date_of_joining, salary, address || null];

        const [result] = await pool.execute(sql, values);

        res.status(201).json({
            success: true,
            message: 'Employee added successfully!',
            employeeId: result.insertId
        });
    } catch (error) {
        console.error('MySQL Insert Error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Yeh Email ID pehle se registered hai.' });
        }
        
        res.status(500).json({ 
            success: false, 
            message: `DB Error [${error.code}]: ${error.sqlMessage || error.message}` 
        });
    }
});

// Delete Employee Route
app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
        res.json({ success: true, message: 'Employee deleted successfully.' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete employee.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});