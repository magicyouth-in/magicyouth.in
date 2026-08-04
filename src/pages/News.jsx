import React from 'react';

export default function News() {
  const articles = [
    {
      title: 'MAGIC Youth Digital Platform v2.0 Official Rollout',
      date: 'Aug 2026',
      category: 'Announcement',
      desc: 'Our newly upgraded full-stack digital platform is live with Socket.IO real-time notifications, volunteer application portals, and interactive event registrations.',
      author: 'Leadership Board'
    },
    {
      title: 'State-Level Chess Tournament Concluded at ALIET Campus',
      date: 'Nov 2024',
      category: 'Achievement',
      desc: 'Over 150 student chess players participated in our annual tournament, celebrating strategic thinking and sportsmanship.',
      author: 'Event Organizing Team'
    },
    {
      title: 'French Impression Cultural & Artistic Showcase',
      date: 'Nov 2024',
      category: 'Event Recap',
      desc: 'An inspiring showcase celebrating creative expressions, student art installations, and cultural performances.',
      author: 'Cultural Wing'
    }
  ];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-3.5 py-1 rounded-full border border-purple-500/30 shadow-purple-glow">
          News & Media
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
          News & Achievements
        </h1>
        <p className="mt-3 text-purple-200/70 text-xs sm:text-base">
          Stay updated with the latest press releases, event recaps, awards, and student volunteer highlights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((item, idx) => (
          <div key={idx} className="dark-glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950 px-2.5 py-1 rounded-md border border-purple-500/20">
                  {item.category}
                </span>
                <span className="text-xs text-purple-300/60">📅 {item.date}</span>
              </div>
              <h3 className="font-bold text-white text-base mb-2">{item.title}</h3>
              <p className="text-xs text-purple-200/70 leading-relaxed">{item.desc}</p>
            </div>
            <div className="pt-4 mt-6 border-t border-purple-900/30 flex items-center justify-between text-xs text-purple-300/60 font-medium">
              <span>By {item.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
