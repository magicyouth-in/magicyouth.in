import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, ExternalLink } from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setDocuments(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Event Reports', 'Annual Reports', 'Magazines', 'Certificates', 'Letters/Documents'];

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch = !searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-3.5 py-1 rounded-full border border-purple-500/30 shadow-purple-glow">
          Official Publications
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Document Center
        </h1>
        <p className="mt-3 text-purple-200/70 text-xs sm:text-base">
          Access event reports, official activity documentations, student magazines, and certificates.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="dark-glass-card p-4 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'btn-purple-glow text-white'
                  : 'bg-purple-950/40 text-purple-300/80 border border-purple-500/20 hover:bg-purple-900/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-purple-500/30 text-white placeholder-purple-300/40 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length > 0 ? (
          filteredDocs.map(doc => (
            <div key={doc._id} className="dark-glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-purple-glow">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950 px-2.5 py-1 rounded-md border border-purple-500/20">
                    {doc.category || 'Document'}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mb-2">{doc.title}</h3>
                <p className="text-xs text-purple-200/70 leading-relaxed line-clamp-3 mb-4">{doc.description || 'Official document released by MAGIC Youth.'}</p>
              </div>

              <div className="pt-4 border-t border-purple-900/30 flex items-center justify-between">
                <span className="text-[11px] text-purple-300/60">{doc.academicYear || '2024-25'}</span>
                <div className="flex items-center space-x-2">
                  <a
                    href={`/uploads/documents/${doc.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 transition border border-purple-500/20"
                    title="View Document"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {doc.isDownloadable !== false && (
                    <a
                      href={`/uploads/documents/${doc.filename}`}
                      download
                      className="btn-purple-glow text-xs font-bold px-3 py-2 rounded-xl inline-flex items-center gap-1 border border-purple-400/30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-16 text-purple-300/50 text-sm">
            No documents found in this category.
          </div>
        )}
      </div>

    </div>
  );
}
