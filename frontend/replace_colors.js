const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/page.tsx', 'utf8');

// Global replaces for dark mode to light mode
content = content.replace(/bg-gronow-asphalt/g, 'bg-white');
content = content.replace(/text-gronow-cloud/g, 'text-gray-900');
content = content.replace(/border-\[#333330\]/g, 'border-gray-200');
content = content.replace(/border-gray-800/g, 'border-gray-200');

// Fix headers and text colors
content = content.replace(/text-gray-400/g, 'text-gray-600');
content = content.replace(/text-gray-500/g, 'text-gray-600');
content = content.replace(/text-white/g, 'text-gray-900'); 
content = content.replace(/text-gronow-asphalt/g, 'text-white'); // For buttons with bg-gronow-turmeric
content = content.replace(/bg-gronow-turmeric/g, 'bg-green-600'); // Make buttons green instead of yellow
content = content.replace(/text-gronow-turmeric/g, 'text-green-600'); 

// Inject scrolling bags animation component
const bagsComponent = `
// Scrolling Grocery Bags Animation
function ScrollingBags() {
  const bags = ["🛒", "🛍️", "🍎", "🥦", "🍞", "🥛", "🥚", "🥩"];
  
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-20">
      <motion.div 
        className="flex gap-16 absolute top-[20%] left-0 text-6xl whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
      >
        {[...bags, ...bags, ...bags, ...bags].map((emoji, i) => (
          <span key={i} className="inline-block">{emoji}</span>
        ))}
      </motion.div>
      <motion.div 
        className="flex gap-24 absolute top-[60%] right-0 text-7xl whitespace-nowrap"
        animate={{ x: ["-50%", "0%"] }}
        transition={{ duration: 25, ease: "linear", repeat: Infinity }}
      >
        {[...bags, ...bags, ...bags, ...bags].reverse().map((emoji, i) => (
          <span key={i} className="inline-block">{emoji}</span>
        ))}
      </motion.div>
    </div>
  );
}
`;

content = content.replace('export default function LandingPage()', bagsComponent + '\nexport default function LandingPage()');
content = content.replace('<RoutingLine />', '<ScrollingBags />\n        <RoutingLine />');
content = content.replace('<section className="relative pt-32 pb-24 px-6 md:px-12 border-b border-gray-200">', '<section className="relative pt-32 pb-24 px-6 md:px-12 border-b border-gray-200 bg-yellow-400 overflow-hidden">');
content = content.replace('<main className="min-h-screen selection:bg-green-600 selection:text-white">', '<main className="min-h-screen bg-white text-gray-900 selection:bg-yellow-200 selection:text-green-900 overflow-x-hidden">');
content = content.replace('<nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-md">', '<nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md shadow-sm">');

fs.writeFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/page.tsx', content);
