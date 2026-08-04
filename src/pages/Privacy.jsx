import React from 'react';

export default function Privacy() {
  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-white mb-6">Privacy Policy</h1>
      <div className="dark-glass-card p-8 text-purple-200/80 text-xs sm:text-sm space-y-4 leading-relaxed">
        <p>At MAGIC Youth (Making A Greater Impact in Communities), we value your privacy and are committed to protecting your personal data.</p>
        <h2 className="text-sm font-bold text-white pt-2">Information We Collect</h2>
        <p>We collect information you provide directly, such as name, email address, phone number, academic details, and volunteer application submissions when you fill out forms on our website.</p>
        <h2 className="text-sm font-bold text-white pt-2">How We Use Information</h2>
        <p>We use your information solely to process volunteer applications, manage event registrations, respond to inquiries, and issue verified participation certificates.</p>
      </div>
    </div>
  );
}
