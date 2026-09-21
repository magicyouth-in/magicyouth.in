import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Leaf, Sparkles, Rocket, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Programs() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const programsData = [
    {
      id: 'shiksha',
      name: 'Project Shiksha',
      category: 'Education & Community Outreach',
      icon: BookOpen,
      color: 'var(--primary-blue)',
      tagline: 'Bridging the educational divide through student-driven mentoring.',
      description: 'Project Shiksha mobilizes college volunteers to provide quality academic support, foundational literacy, and life skills coaching to underprivileged children in neighboring communities and government schools.',
      objectives: [
        'Provide sustained tutoring and educational mentoring to underserved school students.',
        'Foster foundational literacy, numeracy, and digital literacy skills.',
        'Bridge socioeconomic barriers through educational solidarity.',
        'Inculcate active volunteerism and pedagogical empathy among collegiate youth.'
      ],
      activities: [
        'Weekly weekend remedial tutoring centers in rural and semi-urban clusters.',
        'Book drives, stationery distribution, and mini-library setup in community centers.',
        'Interactive science experiments and experiential learning workshops.',
        'Parental engagement sessions on the importance of continued secondary education.'
      ]
    },
    {
      id: 'green-footprints',
      name: 'Green Footprints',
      category: 'Environmental Sustainability',
      icon: Leaf,
      color: 'var(--primary-blue)',
      tagline: 'Empowering campus youth to champion climate action and ecological stewardship.',
      description: 'Green Footprints translates environmental awareness into concrete conservation practices, turning campuses into zero-waste models and organizing community reforestation and conservation drives.',
      objectives: [
        'Promote sustainable environmental practices on college campuses and in local communities.',
        'Raise awareness on biodiversity conservation, climate crisis, and waste segregation.',
        'Engage students in hands-on urban reforestation and native tree plantation campaigns.'
      ],
      activities: [
        'Native tree planting drives across campuses and degraded community lands.',
        'Campus waste audits, single-use plastic reduction campaigns, and composting units.',
        'Water conservation awareness drives and lake/pond cleaning initiatives.',
        'Workshops on upcycling, eco-friendly alternatives, and renewable practices.'
      ]
    },
    {
      id: 'magis',
      name: 'MAGIS / YES-J Yuvotsavaalu',
      category: 'Youth Cultural & Leadership Gathering',
      icon: Sparkles,
      color: 'var(--primary-blue)',
      tagline: 'An annual celebration of youth solidarity, critical reflection, and cultural energy.',
      description: 'MAGIS / YES-J Yuvotsavaalu brings together hundreds of student leaders across colleges for intensive days of cultural expression, social analysis workshops, leadership labs, and solidarity building.',
      objectives: [
        'Celebrate youth diversity, cultural heritage, and creative expression.',
        'Provide a platform for inter-collegiate dialogue on pressing socio-political realities.',
        'Deepen student commitment to ethical leadership, constitutional values, and social equity.'
      ],
      activities: [
        'Thematic street theatre, social music, and artistic performance exhibitions.',
        'Panel discussions with grassroots social activists and community leaders.',
        'Peer-to-peer leadership workshops and cross-chapter strategic planning labs.',
        'Solidarity marches and collective social action resolutions.'
      ]
    },
    {
      id: 'elevate-x',
      name: 'Elevate X',
      category: 'Social Innovation & Entrepreneurship',
      icon: Rocket,
      color: 'var(--primary-blue)',
      tagline: 'Incubating student-designed solutions to grassroots community challenges.',
      description: 'Elevate X provides a structured innovation sandbox where student changemakers design, prototype, and pilot sustainable solutions for local social, educational, and environmental challenges.',
      objectives: [
        'Encourage students to apply their academic knowledge to grassroots social problem-solving.',
        'Provide mentorship from social sector professionals and domain experts.',
        'Incubate high-impact student projects into sustainable community ventures.'
      ],
      activities: [
        'Ideation hackathons focused on local community challenges and sustainable development goals.',
        'Mentorship clinics pairing student teams with experienced social entrepreneurs.',
        'Seed micro-grants for piloting student social enterprise initiatives.',
        'Annual Social Innovation Showcase presenting outcomes to community partners.'
      ]
    }
  ];

  return (
    <div className="programs-page-wrapper">
      {/* Header */}
      <section style={{ backgroundColor: '#0F172A', color: 'white', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Action Pathways
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.5rem' }}>
            Flagship Programs
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Structured institutional initiatives empowering collegiate youth to drive measurable change in education, environment, leadership, and social innovation.
          </p>
        </motion.div>
      </section>

      {/* Program Details List */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {programsData.map((prog, idx) => {
            const IconComp = prog.icon;
            return (
              <motion.div 
                key={prog.id}
                id={prog.id}
                style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '3.5rem 2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '0.75rem', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={28} style={{ color: prog.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {prog.category}
                    </div>
                    <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                      {prog.name}
                    </h2>
                  </div>
                </div>

                <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary-blue)', marginBottom: '1.25rem' }}>
                  {prog.tagline}
                </p>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  {prog.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                      Key Objectives
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {prog.objectives.map((obj, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5 }}>
                          <CheckCircle2 size={16} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ backgroundColor: '#F8FAFC', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                      Core Activities
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {prog.activities.map((act, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5 }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', marginTop: '8px', flexShrink: 0 }} />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/join" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem', boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)' }}>
                    Get Involved in {prog.name} &rarr;
                  </Link>
                  <Link to="/impact" className="btn-outline" style={{ padding: '0.75rem 1.75rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--primary-blue)', borderColor: 'var(--border-color)' }}>
                    View Event Highlights
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: '#0F172A', color: 'white', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.25rem' }}>
            Ready to lead or participate in a program?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Join your campus MAGIC chapter and begin driving initiatives in your community.
          </p>
          <Link to="/join" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '1rem 2.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)' }}>
            Become a Change Agent &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
