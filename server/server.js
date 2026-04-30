const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const { URL } = require('url');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;
const SMTP_HOST = process.env.SMTP_HOST || '51.77.71.235';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || 'xvdecamila@mipagina.pro';
const SMTP_PASS = process.env.SMTP_PASS || '.Camila.2026.';
const CC_EMAIL = process.env.CC_EMAIL || 'xvcamila@mipagina.pro';

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
let db;

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000
});

function sendEmail(subject, text) {
    const mailOptions = {
        from: SMTP_USER,
        to: CC_EMAIL,
        subject: subject,
        text: text
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                reject(error);
            } else {
                console.log('Email sent:', info.response);
                resolve(info);
            }
        });
    });
}

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
        async function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            try {
                const emailText = `Nueva confirmación de asistencia:\n\nNombre: ${name}\nAsistencia: ${attending || 'yes'}\nInvitados: ${guests || 0}\nMensaje: ${message || 'Ninguno'}`;
                await sendEmail('Nueva confirmación de asistencia - XV Camila', emailText);
                res.json({ success: true, id: this.lastID, emailSent: true });
            } catch (emailErr) {
                console.error('Email failed:', emailErr.message);
                res.json({ success: true, id: this.lastID, emailSent: false });
            }
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
        async function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            try {
                const emailText = `Nueva sugerencia de canción:\n\nCanción: ${songName}\nArtista: ${artist}`;
                await sendEmail('Nueva sugerencia de canción - XV Camila', emailText);
                res.json({ success: true, id: this.lastID, emailSent: true });
            } catch (emailErr) {
                console.error('Email failed:', emailErr.message);
                res.json({ success: true, id: this.lastID, emailSent: false });
            }
        }
    );
});

initDb()
    .then(() => {
        const sslDir = '/etc/letsencrypt/live/api.xvdecamila.mipagina.pro';
        const keyPath = path.join(sslDir, 'privkey.pem');
        const certPath = path.join(sslDir, 'fullchain.pem');
        
        const httpApp = express();
        httpApp.use((req, res) => {
            const url = new URL(req.url, `https://${req.headers.host}`);
            res.redirect(301, url.toString());
        });
        
        http.createServer(httpApp).listen(80, '0.0.0.0', () => {
            console.log('HTTP server running on port 80 (redirect to HTTPS)');
        });
        
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            const httpsServer = https.createServer({
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath)
            }, app);
            
            httpsServer.listen(443, '0.0.0.0', () => {
                console.log('HTTPS Server running on port 443 with SSL');
            });
            
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`Server also running on port ${PORT}`);
            });
        } else {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`Server running on port ${PORT} (HTTP)`);
            });
        }
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
