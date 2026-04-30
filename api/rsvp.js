const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const path = require('path');

const dbPath = path.join(__dirname, '../server/database.sqlite');

const transporter = nodemailer.createTransport({
    host: '51.77.71.235',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'xvdecamila@mipagina.pro',
        pass: '.Camila.2026.'
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, attending, guests, message } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const db = new sqlite3.Database(dbPath);
    
    db.run(
        `INSERT INTO rsvps (name, attending, guests, message) VALUES (?, ?, ?, ?)`,
        [name, attending || 'yes', guests || 0, message || ''],
        async function(err) {
            if (err) {
                db.close();
                return res.status(500).json({ error: err.message });
            }
            
            try {
                const emailText = `Nueva confirmación de asistencia:\n\nNombre: ${name}\nAsistencia: ${attending || 'yes'}\nInvitados: ${guests || 0}\nMensaje: ${message || 'Ninguno'}`;
                
                await transporter.sendMail({
                    from: 'xvdecamila@mipagina.pro',
                    to: 'xvcamila@mipagina.pro',
                    subject: 'Nueva confirmación de asistencia - XV Camila',
                    text: emailText
                });
                
                db.close();
                res.json({ success: true, id: this.lastID });
            } catch (emailErr) {
                console.error('Email failed:', emailErr);
                db.close();
                res.status(500).json({ error: 'Error enviando correo de confirmación' });
            }
        }
    );
};
