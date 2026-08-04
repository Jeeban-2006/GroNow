const fs = require('fs');

// Fix store UI
let storeContent = fs.readFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/(portals)/store/page.tsx', 'utf8');
storeContent = storeContent.replace(/bg-\\[#111110\\]/g, 'bg-gray-50');
storeContent = storeContent.replace(/bg-\\[#222220\\]/g, 'bg-white');
storeContent = storeContent.replace(/bg-black/g, 'bg-white');
storeContent = storeContent.replace(/border-\\[#333330\\]/g, 'border-gray-200');
storeContent = storeContent.replace(/text-gray-400/g, 'text-gray-600');
storeContent = storeContent.replace(/text-gray-500/g, 'text-gray-600');
storeContent = storeContent.replace(/text-white/g, 'text-gray-900');
storeContent = storeContent.replace(/bg-white/g, 'bg-white'); // ensure buttons are still ok
// Make sure "text-white" in buttons doesn't get messed up.
storeContent = storeContent.replace(/className=\"bg-green-600 text-gray-900/g, 'className=\"bg-green-600 text-white');
storeContent = storeContent.replace(/className=\"px-4 py-2 bg-green-600 text-gray-900/g, 'className=\"px-4 py-2 bg-green-600 text-white');
storeContent = storeContent.replace(/className=\"w-full py-3 bg-gronow-turmeric text-gronow-asphalt/g, 'className=\"w-full py-3 bg-green-600 text-white');
fs.writeFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/(portals)/store/page.tsx', storeContent);

// Fix admin UI (Pricing Engine)
let adminContent = fs.readFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/(portals)/admin/page.tsx', 'utf8');
adminContent = adminContent.replace(/bg-\\[#111110\\]/g, 'bg-gray-50');
adminContent = adminContent.replace(/bg-\\[#222220\\]/g, 'bg-white');
adminContent = adminContent.replace(/bg-black/g, 'bg-white');
adminContent = adminContent.replace(/border-\\[#333330\\]/g, 'border-gray-200');
adminContent = adminContent.replace(/text-gray-500/g, 'text-gray-600');
fs.writeFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/(portals)/admin/page.tsx', adminContent);
