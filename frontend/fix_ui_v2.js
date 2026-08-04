const fs = require('fs');

// Fix Landing Page Button Hover Issue
let pageContent = fs.readFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/page.tsx', 'utf8');
pageContent = pageContent.replace(
  /bg-green-600 text-white px-8 py-5 hover:bg-white transition-all/g,
  'bg-green-600 text-white px-8 py-5 hover:bg-white hover:text-green-600 transition-all border border-transparent hover:border-green-600'
);
pageContent = pageContent.replace(
  /bg-green-600 text-white px-6 py-2 hover:bg-white transition-colors/g,
  'bg-green-600 text-white px-6 py-2 hover:bg-white hover:text-green-600 transition-colors border border-transparent hover:border-green-600'
);
fs.writeFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/page.tsx', pageContent);

// Fix Store UI
let storeContent = fs.readFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/(portals)/store/page.tsx', 'utf8');

// Global Backgrounds
storeContent = storeContent.replace(/bg-\\[#0A0A0A\\]/g, 'bg-gray-50');
storeContent = storeContent.replace(/bg-gronow-asphalt/g, 'bg-white');
storeContent = storeContent.replace(/bg-\\[#111110\\]/g, 'bg-white');
storeContent = storeContent.replace(/bg-\\[#1A1A18\\]/g, 'bg-gray-50');
storeContent = storeContent.replace(/bg-\\[#222220\\]/g, 'bg-white');

// Global Borders
storeContent = storeContent.replace(/border-\\[#333330\\]/g, 'border-gray-200');
storeContent = storeContent.replace(/border-gronow-turmeric/g, 'border-green-600');
storeContent = storeContent.replace(/shadow-\\[4px_4px_0px_0px_#333330\\]/g, 'shadow-sm rounded-xl');

// Global Text Colors
storeContent = storeContent.replace(/text-gronow-cloud/g, 'text-gray-900');
storeContent = storeContent.replace(/text-gronow-turmeric/g, 'text-green-600');
storeContent = storeContent.replace(/text-gronow-asphalt/g, 'text-white');
storeContent = storeContent.replace(/text-gray-300/g, 'text-gray-700');
storeContent = storeContent.replace(/text-white/g, 'text-gray-900'); // this breaks the buttons we fixed, so let's fix them right after
storeContent = storeContent.replace(/className=\"bg-green-600 text-gray-900/g, 'className=\"bg-green-600 text-white');

// Specifically fix buttons in Store UI
storeContent = storeContent.replace(/bg-gronow-turmeric/g, 'bg-green-600');
storeContent = storeContent.replace(/hover:border-white/g, 'hover:border-green-700');

fs.writeFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/(portals)/store/page.tsx', storeContent);
