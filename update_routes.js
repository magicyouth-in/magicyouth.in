const fs = require('fs');

let app = fs.readFileSync('src/App.jsx', 'utf8');

// Replace routes
app = app.replace("import Events        from './pages/Events';", "import Impact        from './pages/Impact';");
app = app.replace("import Gallery       from './pages/Gallery';", "import Media         from './pages/Media';");
app = app.replace(/<Route path="\/events".*?\/>/, "<Route path=\"/impact\"       element={<PublicLayout><Impact        /></PublicLayout>} />");
app = app.replace(/<Route path="\/gallery".*?\/>/, "<Route path=\"/media\"        element={<PublicLayout><Media         /></PublicLayout>} />");
app = app.replace(/<Route path="\/mission".*?\/>\n/, ""); // Remove mission route

fs.writeFileSync('src/App.jsx', app);

let nav = fs.readFileSync('src/components/layout/Navbar.jsx', 'utf8');
nav = nav.replace(/<Link to="\/mission" className="my-nav-link">Mission<\/Link>/, "");
nav = nav.replace(/<Link to="\/gallery" className="my-nav-link">Gallery<\/Link>/, "<Link to=\"/impact\" className=\"my-nav-link\">Impact</Link>\n          <Link to=\"/media\" className=\"my-nav-link\">Media</Link>");
nav = nav.replace(/<Link to="\/events" className="my-nav-link">Events<\/Link>/, "");
nav = nav.replace(/<Link to="\/documentation" className="my-nav-link">Docs<\/Link>/, "");

nav = nav.replace(/<Link to="\/mission" className="mobile-nav-link".*?>Mission<\/Link>/, "");
nav = nav.replace(/<Link to="\/gallery" className="mobile-nav-link".*?>Gallery<\/Link>/, "<Link to=\"/impact\" className=\"mobile-nav-link\" onClick={() => setIsMobileOpen(false)}>Impact</Link>\n            <Link to=\"/media\" className=\"mobile-nav-link\" onClick={() => setIsMobileOpen(false)}>Media</Link>");
nav = nav.replace(/<Link to="\/events" className="mobile-nav-link".*?>Events<\/Link>/, "");
nav = nav.replace(/<Link to="\/documentation" className="mobile-nav-link".*?>Docs<\/Link>/, "");

nav = nav.replace(/<Link to="\/admin\/login" className="my-nav-link admin-nav-link">Admin \/ Login<\/Link>/, "");
nav = nav.replace(/<Link to="\/admin\/login" className="mobile-nav-link admin-nav-link".*?>Admin \/ Login<\/Link>/, ""); // Remove admin from nav

fs.writeFileSync('src/components/layout/Navbar.jsx', nav);

let foot = fs.readFileSync('src/components/layout/Footer.jsx', 'utf8');
foot = foot.replace(/<Link to="\/mission".*?>Mission & Vision<\/Link>/, "<Link to=\"/impact\" className=\"footer-link\">Impact</Link>");
foot = foot.replace(/<Link to="\/events".*?>Events<\/Link>/, "<Link to=\"/media\" className=\"footer-link\">Media</Link>");
foot = foot.replace(/<li><Link to="\/gallery".*?>Gallery<\/Link><\/li>/, "<li><Link to=\"/documentation\" className=\"footer-link\">Documentation</Link></li>");
fs.writeFileSync('src/components/layout/Footer.jsx', foot);

console.log('App, Navbar, Footer updated.');
