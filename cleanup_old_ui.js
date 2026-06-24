const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '배달', 'deploy', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '<div className="px-4 py-2 max-w-5xl mx-auto">';
const endMarker = '<main className={`px-4 pb-32 max-w-7xl mx-auto ${view === \'admin\' ? \'pt-0\' : \'pt-2\'}`}>';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    // We want to remove from startMarker up to (but not including) endMarker.
    // Actually, we want to remove the div and its content.
    // The endMarker is the start of the next tag.
    // So we remove everything between startIndex and endIndex.
    
    // Check if there is whitespace/newlines to preserve or remove.
    // Removing everything up to endIndex will bring <main> up to where <div> was.
    
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    
    const newContent = before + after;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Successfully removed old driver UI blocks.");
} else {
    console.error("Could not find start or end markers for cleanup.");
    console.log("Start marker index:", startIndex);
    console.log("End marker index:", endIndex);
}
