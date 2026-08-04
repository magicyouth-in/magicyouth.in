import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950/90 text-purple-200/80 pt-16 pb-12 border-t border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-purple-900/30">
          
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-900 to-indigo-600 flex items-center justify-center text-white shadow-purple-glow border border-purple-400/30">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                MAGIC <span className="text-purple-400">YOUTH</span>
              </span>
            </Link>
            <p className="text-xs text-purple-300/70 leading-relaxed max-w-sm">
              Making A Greater Impact in Communities (MAGIC Youth) is a student-led youth movement inspiring leadership, innovation, and community volunteering.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://www.instagram.com/magicyouth.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/20 hover:border-purple-400 text-purple-300 hover:text-white flex items-center justify-center transition shadow-purple-glow"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/20 hover:border-purple-400 text-purple-300 hover:text-white flex items-center justify-center transition shadow-purple-glow"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://maps.google.com/?q=Andhra+Loyola+Institute+of+Engineering+and+Technology"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/20 hover:border-purple-400 text-purple-300 hover:text-white flex items-center justify-center transition shadow-purple-glow"
                aria-label="Location"
              >
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Sitemap */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">Quick Links</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/events" className="hover:text-white transition">Events & Programs</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition">Photo Gallery</Link></li>
              <li><Link to="/documents" className="hover:text-white transition">Document Center</Link></li>
              <li><Link to="/news" className="hover:text-white transition">News & Media</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">Get Involved</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/join" className="text-purple-400 hover:text-purple-300 font-semibold transition">✨ Volunteer Application</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link to="/admin" className="text-purple-400/80 hover:text-purple-200 transition">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">Campus Address</h3>
            <ul className="space-y-2.5 text-xs text-purple-300/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>Andhra Loyola Institute of Engineering and Technology, Vijayawada</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>contact@magicyouth.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-400/60 gap-4">
          <p>© 2025 MAGIC Youth Organization. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="hover:text-purple-300 transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-purple-300 transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
