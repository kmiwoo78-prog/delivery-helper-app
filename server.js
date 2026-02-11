const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8081;
const ip = '0.0.0.0';
const DATA_FILE = path.join(__dirname, 'db.json');

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.url} ${req.method}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API: Save Data
    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                // [Security] 데이터 보호 로직 제거됨
                const newData = JSON.parse(body);
                
                fs.writeFile(DATA_FILE, body, (err) => {
                    if (err) {
                        console.error('Error saving data:', err);
                        res.writeHead(500);
                        res.end('Error saving data');
                    } else {
                        console.log('Data saved successfully');
                        res.writeHead(200);
                        res.end('Data saved');
                    }
                });
            } catch (e) {
                console.error('Error processing save request:', e);
                res.writeHead(400);
                res.end('Invalid JSON data');
            }
        });
        return;
    }

    // API: Load Data
    if (req.url === '/api/load' && req.method === 'GET') {
        fs.readFile(DATA_FILE, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end('[]'); 
                } else {
                    console.error('Error loading data:', err);
                    res.writeHead(500);
                    res.end('Error loading data');
                }
            } else {
                console.log('Data loaded successfully');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        });
        return;
    }

    // Static File Serving
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Clean up query parameters
    filePath = filePath.split('?')[0];

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    const mimeTypes = {
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav'
    };
    if (mimeTypes[extname]) {
        contentType = mimeTypes[extname];
    }

    fs.readFile(path.join(__dirname, filePath), (error, content) => {
        if (error) {
            if(error.code == 'ENOENT'){
                console.log(`File not found: ${filePath}`);
                res.writeHead(404);
                res.end('File not found');
            } else {
                console.log(`Server error: ${error.code}`);
                res.writeHead(500);
                res.end('Server Error: '+error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, ip, () => {
    console.log(`Server running at http://localhost:${port}/`);
});