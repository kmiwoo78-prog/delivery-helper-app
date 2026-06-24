const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '배달', 'deploy', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Add global error handler
const errorHandlerScript = `
    <script>
        window.onerror = function(msg, url, line, col, error) {
            // Ignore ResizeObserver loop limit exceeded
            if (msg.indexOf('ResizeObserver loop') !== -1) return;
            
            var extra = !col ? '' : '\\ncolumn: ' + col;
            extra += !error ? '' : '\\nerror: ' + error;
            alert("Error: " + msg + "\\nurl: " + url + "\\nline: " + line + extra);
            
            // Also log to console for debugging tools
            console.error("Global Error:", msg, url, line, col, error);
            return false; // Let default handler run as well
        };
        
        // Catch unhandled promise rejections
        window.onunhandledrejection = function(event) {
            alert("Unhandled Rejection: " + event.reason);
            console.error("Unhandled Rejection:", event.reason);
        };
    </script>
`;

// Insert after <head>
if (!content.includes('window.onerror')) {
    content = content.replace('<head>', '<head>' + errorHandlerScript);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Added global error handler.");
} else {
    console.log("Error handler already exists.");
}
