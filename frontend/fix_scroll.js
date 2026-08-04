const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/page.tsx', 'utf8');

// Replace LandingPage component signature to add active state hook
const activeStateHook = `
export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["logic", "network"];
      let current = "";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= (el.offsetTop - 200)) {
          current = section;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
`;

content = content.replace('export default function LandingPage() {', activeStateHook);

// Update nav to be fixed and use active state
content = content.replace(
  '<nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md shadow-sm">',
  '<nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md shadow-sm">'
);

// We need to change the links to include active styles
content = content.replace(
  /<Link href="#logic" className="hover:text-green-600 transition-colors">Algorithm<\/Link>/g,
  '<Link href="#logic" className={`transition-colors ${activeSection === "logic" ? "text-green-600 font-bold" : "hover:text-green-600"}`}>Algorithm</Link>'
);
content = content.replace(
  /<Link href="#network" className="hover:text-green-600 transition-colors">Network<\/Link>/g,
  '<Link href="#network" className={`transition-colors ${activeSection === "network" ? "text-green-600 font-bold" : "hover:text-green-600"}`}>Network</Link>'
);

// Add scroll animations to the sections
content = content.replace(
  /<section id="logic" className="py-32 px-6 md:px-12 border-b border-gray-200">/g,
  '<motion.section id="logic" className="py-32 px-6 md:px-12 border-b border-gray-200" initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.8}}>'
);
content = content.replace(
  /<\/section>\n\n      {\/\* Network /g,
  '</motion.section>\n\n      {/* Network '
);

content = content.replace(
  /<section id="network" className="py-32 px-6 md:px-12 bg-green-600 text-white">/g,
  '<motion.section id="network" className="py-32 px-6 md:px-12 bg-green-600 text-white" initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.8}}>'
);

content = content.replace(
  /<\/section>\n\n      {\/\* Driver /g,
  '</motion.section>\n\n      {/* Driver '
);

content = content.replace(
  /<section className="py-32 px-6 md:px-12 border-b border-gray-200">/g,
  '<motion.section className="py-32 px-6 md:px-12 border-b border-gray-200" initial={{opacity:0, y:50}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.8}}>'
);
// Replace the last section tag before footer
content = content.replace(
  /<\/section>\n\n      {\/\* Footer/g,
  '</motion.section>\n\n      {/* Footer'
);

fs.writeFileSync('c:/Users/ASUS/Downloads/v1/frontend/src/app/page.tsx', content);
