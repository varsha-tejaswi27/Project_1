const express = require('express');
const router = express.Router();

// Home Page
router.get('/', (req, res) => {
    res.render('index');
});

// Handle Login (This is a dummy login action)
router.post('/login', (req, res) => {
    const username = req.body.username;
    res.send(`Welcome, ${username}!`);
});

// Handle 10K+ Button
router.post('/fan-count', (req, res) => {
    const fans = 10000; // Example number of fans
    res.send(`There are over ${fans} Samurai fans!`);
});

module.exports = router;
