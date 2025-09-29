const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;


// middleware
app.use(express.json());

// Database Configuration
// NOTE: 'db' is the service name from docker-compose, which Docker resolves to the container's IP.
// Database Configuration
const pool = new Pool({
  user: 'vulnapp',         // MUST match POSTGRES_USER
  host: 'db',             // MUST match the service name in docker-compose.yml
  database: 'vulnapp',    // MUST match POSTGRES_DB
  password: 'password',   // MUST match POSTGRES_PASSWORD
  port: 5432,
});

// Test DB Connection Route
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT username, role FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Database connection error');
    }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // VULNERABLE POINT: Input (email) is concatenated directly into the SQL string.
    const query = `
        SELECT username, role 
        FROM users 
        WHERE username = '${email}' AND password = '${password}'
    `;

    console.log(`Executing vulnerable query: ${query}`);

    try {
        const result = await pool.query(query);

        if (result.rows.length > 0) {
            // Success response
            const user = result.rows[0];
            res.json({
                message: 'Login successful (VULNERABLE)',
                user: user.username,
                role: user.role
            });
        } else {
            // Failure response
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        // Catch any SQL execution errors (will also catch syntax errors from injection)
 console.error('SQL Error:', err.stack);
        res.status(500).send('Server Error during login attempt. (SQL Syntax or Injection Error)');

    }
});


// Original route (check server status)
app.get('/', (req, res) => res.send('Hello World! Server is connected.'));

app.listen(port, () => console.log(`Server running on port ${port}`));