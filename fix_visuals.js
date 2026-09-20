const fs = require('fs');

// 1. Fix CSS Typography and Mobile Issues
let css = fs.readFileSync('src/styles/home.css', 'utf8');

// Re-adjust Hero Headline
css = css.replace(/\.hero-headline \{[\s\S]*?\}/, '.hero-headline {\n  font-size: 2.5rem;\n  font-weight: 900;\n  color: var(--text-primary);\n  line-height: 1.15;\n  margin-bottom: 1.25rem;\n  letter-spacing: -0.02em;\n}');
css = css.replace(/@media \(min-width: 768px\) \{\s*\.hero-headline \{.*?\}\s*\}/g, '@media (min-width: 768px) {\n  .hero-headline { font-size: 4rem; }\n}');

// Fix Dark Section
css = css.replace(/\.dark-brand-section h2 \{[\s\S]*?\}/, '.dark-brand-section h2 {\n  font-size: 2.25rem;\n  font-weight: 900;\n  line-height: 1.2;\n  margin-bottom: 2rem;\n  letter-spacing: -0.02em;\n}');
css = css.replace(/@media \(min-width: 768px\) \{\s*\.dark-brand-section h2 \{.*?\}\s*\}/g, '@media (min-width: 768px) {\n  .dark-brand-section h2 { font-size: 3.5rem; }\n}');

// Fix Section Titles
css = css.replace(/\.section-title \{[\s\S]*?\}/, '.section-title {\n  font-size: 2.25rem;\n  font-weight: 800;\n  color: var(--text-primary);\n  letter-spacing: -0.02em;\n  margin-bottom: 2rem;\n}');
if (!css.includes('.section-title { font-size: 2.75rem; }')) {
  css += '\n@media (min-width: 768px) { .section-title { font-size: 2.75rem; } }';
}

// Fix Mobile Impact Strip numbers
css = css.replace(/\.impact-number \{\s*font-size: 3rem;/g, '.impact-number {\n  font-size: 2rem;\n');
if (!css.includes('.impact-number { font-size: 3rem; }')) {
  css += '\n@media (min-width: 768px) { .impact-number { font-size: 3rem; } }';
}

// Fix Collage height on mobile
css = css.replace(/\.about-collage \{\s*position: relative;\s*height: 500px;\s*\}/, '.about-collage {\n  position: relative;\n  height: 350px;\n}\n@media (min-width: 768px) { .about-collage { height: 500px; } }');

fs.writeFileSync('src/styles/home.css', css);

// 2. Fix Home.jsx Fake Statistics
let jsx = fs.readFileSync('src/pages/Home.jsx', 'utf8');
jsx = jsx.replace(/stats\.units \> 0 \? stats\.units : '10\+'/g, "stats.units > 0 ? stats.units : 'Youth'");
jsx = jsx.replace(/stats\.events \> 0 \? stats\.events : '50\+'/g, "stats.events > 0 ? stats.events : 'Service'");
jsx = jsx.replace(/stats\.photos \> 0 \? stats\.photos : '500\+'/g, "stats.photos > 0 ? stats.photos : 'Impact'");
jsx = jsx.replace(/stats\.members \> 0 \? stats\.members : '100\+'/g, "stats.members > 0 ? stats.members : 'Action'");

fs.writeFileSync('src/pages/Home.jsx', jsx);

console.log('Done!');
