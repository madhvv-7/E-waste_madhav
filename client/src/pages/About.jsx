import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './About.css';

export default function About() {
  const [animateHero, setAnimateHero] = useState('');
  const [animateMission, setAnimateMission] = useState('');
  const [animateCards, setAnimateCards] = useState('');

  useEffect(() => {
    const t1 = setTimeout(() => setAnimateHero('fade-in'), 100);
    const t2 = setTimeout(() => setAnimateMission('fade-in'), 300);
    const t3 = setTimeout(() => setAnimateCards('fade-in'), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="about-hero-section">
        <div className="container">
          <div className={`about-hero-inner ${animateHero}`}>
            <div className="about-hero-text">
              <h1 className="about-headline">About E-Waste Management</h1>
              <p className="about-sub">
                We are committed to creating a sustainable future by making e-waste collection 
                and recycling accessible, transparent, and efficient for everyone. Our platform 
                bridges the gap between citizens, collection agents, and recyclers.
              </p>
              <div className="d-flex gap-3 mt-4">
                <Link to="/explore" className="btn btn-gradient rounded-pill">Explore Features</Link>
                <Link to="/register" className="btn btn-outline-success rounded-pill">Join Us</Link>
              </div>
            </div>
            <div className="about-hero-image">
              <div className="image-placeholder large">
                <span>Hero Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className={`mission-section ${animateMission}`}>
        <div className="container">
          <div className="mission-inner">
            <div className="mission-image">
              <div className="image-placeholder medium">
                <span>Mission Image</span>
              </div>
            </div>
            <div className="mission-text">
              <h2 className="section-title">Our Mission</h2>
              <p className="section-description">
                Our mission is to revolutionize e-waste management by providing a seamless 
                platform that connects communities with responsible recycling solutions. 
                We believe in transparency, environmental responsibility, and the power 
                of technology to create positive change.
              </p>
              <p className="section-description">
                Every year, millions of tons of electronic waste end up in landfills, 
                releasing harmful toxins into our environment. We're here to change that 
                by making responsible disposal easy and accessible for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className={`how-we-work-section ${animateCards}`}>
        <div className="container">
          <h2 className="section-title text-center mb-5">How We Work</h2>
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-4">
              <div className="work-card">
                <div className="card-icon">
                  <span>📋</span>
                </div>
                <h5>Easy Registration</h5>
                <p>Sign up in minutes and start requesting e-waste pickups from your location with just a few clicks.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="work-card">
                <div className="card-icon">
                  <span>🚚</span>
                </div>
                <h5>Smart Collection</h5>
                <p>Our network of trained agents efficiently collects e-waste from your doorstep at your convenience.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="work-card">
                <div className="card-icon">
                  <span>♻️</span>
                </div>
                <h5>Certified Recycling</h5>
                <p>All collected e-waste is processed by certified recyclers following strict environmental standards.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact / Vision Section */}
      <section className="vision-section">
        <div className="container">
          <div className="vision-inner">
            <div className="vision-text">
              <h2 className="section-title">Our Vision & Impact</h2>
              <p className="section-description">
                We envision a world where e-waste is no longer a problem but an opportunity. 
                Through our platform, we aim to recover valuable materials, reduce environmental 
                pollution, and create awareness about responsible electronics disposal.
              </p>
              <div className="impact-stats">
                <div className="stat-item">
                  <span className="stat-number">10,000+</span>
                  <span className="stat-label">Pickups Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Active Agents</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">95%</span>
                  <span className="stat-label">Recycling Rate</span>
                </div>
              </div>
            </div>
            <div className="vision-image">
              <div className="image-placeholder wide">
                <span>Vision Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Ready to Make a Difference?</h2>
          <p className="cta-subtitle">Join thousands of responsible citizens in our mission to create a cleaner, greener future.</p>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <Link to="/register" className="btn btn-gradient btn-lg rounded-pill">Get Started</Link>
            <Link to="/explore" className="btn btn-outline-light btn-lg rounded-pill">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="mb-3 mb-md-0">
            <strong>E-Waste Management</strong>
            <div className="text-muted small">Building a sustainable future, one device at a time.</div>
          </div>
          <div className="mb-3 mb-md-0">
            <strong>Contact</strong>
            <div className="text-muted small">support@ewaste.example</div>
          </div>
          <div className="text-muted small">© 2026 E-Waste Management. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
