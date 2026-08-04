import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Award, Sparkles, HeartHandshake, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Programs() {
  const programs = [
    {
      title: 'State-Level Chess Tournaments',
      category: 'Sports & Strategy',
      desc: 'Annual competitive chess championships fostering focus, tactical thinking, and sportsmanship among student participants.',
      highlights: ['State-level player participation', 'Cash prizes & trophies', 'Verified Certificates']
    },
    {
      title: 'French Impression & Cultural Festivals',
      category: 'Cultural & Art',
      desc: 'Artistic installations, stage drama, music performances, and creative showcases celebrating cultural diversity.',
      highlights: ['Art Exhibitions', 'Stage Performances', 'Youth Showcase']
    },
    {
      title: 'Blood Donation & Social Campaigns',
      category: 'Community Service',
      desc: 'Regular blood donation camps in collaboration with local medical authorities and youth awareness rallies.',
      highlights: ['Over 300+ units collected', 'Health Awareness', 'Community Impact']
    }
  ];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-3.5 py-1 rounded-full border border-purple-500/30 shadow-purple-glow">
          Initiatives & Campaigns
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
          MAGIC Youth Programs
        </h1>
        <p className="mt-3 text-purple-200/70 text-xs sm:text-base">
          Discover our ongoing flagship initiatives in leadership, sports, culture, and community service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {programs.map((prog, idx) => (
          <div key={idx} className="dark-glass-card p-8 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950 px-2.5 py-1 rounded-md border border-purple-500/20 mb-4 inline-block">
                {prog.category}
              </span>
              <h3 className="font-bold text-white text-xl mb-3">{prog.title}</h3>
              <p className="text-xs text-purple-200/70 leading-relaxed mb-6">{prog.desc}</p>
              
              <div className="space-y-2 pt-4 border-t border-purple-900/30">
                {prog.highlights.map(h => (
                  <div key={h} className="flex items-center gap-2 text-xs text-purple-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
