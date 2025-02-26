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
                    console.log('Database initialized and table ready.');
                }
            }
        );
    }
});

// Serve the front-end HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Sign Up Route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (row) return res.status(400).json({ message: 'Username already exists' });

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
                if (err) {
                    console.error('Database Insert Error:', err);
                    return res.status(500).json({ message: 'Database error' });
                }
                res.status(201).json({ message: 'Sign-up successful!' });
            });
        } catch (error) {
            console.error('Hashing error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
});

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (!user) return res.status(400).json({ message: 'Invalid username or password' });

        try {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) return res.status(400).json({ message: 'Invalid username or password' });

            res.status(200).json({ message: 'Login successful!' });
        } catch (error) {
            console.error('Password comparison error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
