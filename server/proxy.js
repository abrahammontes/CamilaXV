const http = require('http');
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/api.xvdecamila.mipagina.pro/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/api.xvdecamila.mipagina.pro/fullchain.pem')
};

const server = https.createServer(options, (req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end('{"status":"ok"}');
});

server.listen(80, '0.0.0.0', () => {
    console.log('HTTP proxy running on port 80');
});

const sslServer = https.createServer(options, (req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end('{"status":"ok"}');
});

sslServer.listen(443, '0.0.0.0', () => {
    console.log('HTTPS proxy running on port 443');
});