const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
let db;

function initDb() {
    return new Promise((resolve, reject) => {
        try {
            db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    db = new sqlite3.Database(':memory:');
                    console.log('Using in-memory database');
                } else {
                    console.log('Database opened successfully at', dbPath);
                }
                
                db.serialize(() => {
                    db.run(`CREATE TABLE IF NOT EXISTS rsvps (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        attending TEXT NOT NULL,
                        guests INTEGER DEFAULT 0,
                        message TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`);
                    db.run(`CREATE TABLE IF NOT EXISTS songs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        song_name TEXT NOT NULL,
                        artist TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`);
                });
                resolve(db);
            });
        } catch (err) {
            console.error('Database init error:', err);
            db = new sqlite3.Database(':memory:');
            resolve(db);
        }
    });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/dashboard', express.static(path.join(__dirname, '../dashboard')));

app.get('/api/rsvps', (req, res) => {
    if (!db) {
        res.status(500).json({ error: 'Database not initialized' });
        return;
    }
    db.all(`SELECT * FROM rsvps ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/songs', (req, res) => {
    if (!db) {
        res.status(500).json({ error: 'Database not initialized' });
        return;
    }
    db.all(`SELECT * FROM songs ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/rsvp', (req, res) => {
    if (!db) {
        res.status(500).json({ error: 'Database not initialized' });
        return;
    }
    const { name, attending, guests, message } = req.body;
    
    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }

    db.run(
        `INSERT INTO rsvps (name, attending, guests, message) VALUES (?, ?, ?, ?)`,
        [name, attending || 'yes', guests || 0, message || ''],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.post('/api/song', (req, res) => {
    if (!db) {
        res.status(500).json({ error: 'Database not initialized' });
        return;
    }
    const { songName, artist } = req.body;
    
    if (!songName || !artist) {
        res.status(400).json({ error: 'Song name and artist are required' });
        return;
    }

    db.run(
        `INSERT INTO songs (song_name, artist) VALUES (?, ?)`,
        [songName, artist],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../dashboard/index.html'));
});

initDb()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });