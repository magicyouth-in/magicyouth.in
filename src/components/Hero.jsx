import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">Empower Youth, Ignite Change</h1>
          <p className="hero-desc">
            MAGIC Youth is a student‑led nonprofit fostering leadership, community service, and innovation across campuses. Join us to make a real impact.
          </p>
          <div className="hero-buttons">
            <Link to="/join" className="btn-primary">Join MAGIC Youth</Link>
            <Link to="/about" className="btn-outline">Explore MAGIC Youth</Link>
          </div>
        </div>
        <div className="hero-right">
          <img src="/assets/magic.png" alt="MAGIC Youth community" className="hero-img" />
        </div>
      </div>
    </section>
  );
}
