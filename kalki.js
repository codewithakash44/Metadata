const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL Connection Pooling
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'database-1.c9y4w8msacj8.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: 'akashrathod',
    database: 'analytics'
});

// Middleware to parse JSON and urlencoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Route handler for the root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Route to handle POST requests to store user data
app.post('/submit', (req, res) => {
    const { name, hobby, favorite_food, favorite_thing_to_do, favorite_movie, favorite_song } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ', err);
            res.status(500).json({ error: 'Error connecting to database' });
            return;
        }

        const sql = `INSERT INTO users (name, hobby, favorite_food, favorite_thing_to_do, favorite_movie, favorite_song) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [name, hobby, favorite_food, favorite_thing_to_do, favorite_movie, favorite_song];

        connection.query(sql, values, (err, result) => {
            connection.release();
            if (err) {
                console.error('Error inserting data: ', err);
                res.status(500).json({ error: 'Error inserting data into database' });
                return;
            }

            console.log('Inserted data successfully!');
            res.status(200).redirect('/'); // Redirect back to the homepage
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
