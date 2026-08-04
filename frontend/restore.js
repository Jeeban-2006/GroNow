const fs = require('fs');
const lines = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity/brain/2cf5b58d-3b04-4efc-98d8-493485b08e24/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');

for (const line of lines) {
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.content && obj.content.includes('Total Lines: 213') && obj.content.includes('RoutingLine')) {
             let text = obj.content;
             // Remove the tool output header
             text = text.substring(text.indexOf('1: "use client";'));
             
             // Remove line numbers (e.g. '1: ', '10: ', '100: ')
             text = text.replace(/^[0-9]+: /gm, '');
             
             // Remove the footer message
             const footerMsg = 'The above content shows the entire, complete file contents of the requested file.';
             if (text.includes(footerMsg)) {
                 text = text.replace(footerMsg, '');
             }
             
             fs.writeFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/page.tsx', text.trim());
             console.log('Successfully wrote page.tsx');
             break;
        }
    } catch (e) {}
}
