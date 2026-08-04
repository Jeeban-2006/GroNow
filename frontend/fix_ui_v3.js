const fs = require('fs');

// Fix Store UI again because regex was wrong
let storeContent = fs.readFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/(portals)/store/page.tsx', 'utf8');

// Global Backgrounds
storeContent = storeContent.replace(/bg-\[#0A0A0A\]/g, 'bg-gray-50');
storeContent = storeContent.replace(/bg-\[#111110\]/g, 'bg-white');
storeContent = storeContent.replace(/bg-\[#1A1A18\]/g, 'bg-gray-50');
storeContent = storeContent.replace(/bg-\[#222220\]/g, 'bg-white');

// Global Borders
storeContent = storeContent.replace(/border-\[#333330\]/g, 'border-gray-200');
storeContent = storeContent.replace(/shadow-\[4px_4px_0px_0px_#333330\]/g, 'shadow-sm rounded-xl');

// Add text color fixes for buttons to match hover
storeContent = storeContent.replace(/hover:bg-gronow-turmeric/g, 'hover:bg-green-600 hover:text-white');

fs.writeFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/(portals)/store/page.tsx', storeContent);
