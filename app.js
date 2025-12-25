const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (e.g., CSS, JS, images) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
const db = new sqlite3.Database('./Login.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        db.run(
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT
            )`,
            (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                } else {
                    console.log('Database initialized and table created (if not exists).');
                }
            }
        );
    }
});

// Serve the front-end HTML file when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route: Sign Up
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (row) return res.status(400).json({ message: 'username already exists' });

        const hashedpassword = await bcrypt.hash(password, 10);

        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedpassword], (err) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.status(201).json({ message: 'Sign-up successful!' });
        });
    });
});

// Route: Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(400).json({ message: 'Invalid username or password' });

        const isValidpassword = await bcrypt.compare(password, user.password);
        if (!isValidpassword) return res.status(400).json({ message: 'Invalid username or password' });

        res.status(200).json({ message: 'Login successful!' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
