import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Explore.css';

export default function Explore() {
  const [animateHero, setAnimateHero] = useState('');
  const [animateFeatures, setAnimateFeatures] = useState('');
  const [animateStats, setAnimateStats] = useState('');

  useEffect(() => {
    const t1 = setTimeout(() => setAnimateHero('fade-in'), 100);
    const t2 = setTimeout(() => setAnimateFeatures('fade-in'), 300);
    const t3 = setTimeout(() => setAnimateStats('fade-in'), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const features = [
    {
      icon: '📦',
      title: 'Request Pickup',
      description: 'Submit e-waste pickup requests instantly from your home or office. Schedule at your convenience and track your request in real-time.',
    },
    {
      icon: '📍',
      title: 'Track Status',
      description: 'Monitor your pickup requests from submission to completion. Get real-time updates on collection and recycling progress.',
    },
    {
      icon: '👤',
      title: 'Agent Assignment',
      description: 'Our intelligent system automatically assigns the nearest available agent to your pickup request for efficient collection.',
    },
    {
      icon: '📊',
      title: 'Recycling Reports',
      description: 'Access detailed reports on your recycling impact. See how your contributions help the environment with comprehensive analytics.',
    },
  ];

  const stats = [
    { number: '50,000+', label: 'Items Recycled', icon: '♻️' },
    { number: '1,200+', label: 'Active Users', icon: '👥' },
    { number: '98%', label: 'Satisfaction Rate', icon: '⭐' },
    { number: '24/7', label: 'Support Available', icon: '💬' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="explore-hero-section">
        <div className="container">
          <div className={`explore-hero-content ${animateHero}`}>
            <h1 className="explore-headline">Explore Our Platform</h1>
            <p className="explore-sub">
              Discover the powerful features that make e-waste management simple, 
              efficient, and impactful. From easy pickup requests to detailed 
              recycling reports, we've got everything you need.
            </p>
          </div>
          <div className={`explore-hero-image ${animateHero}`}>
            <div className="image-placeholder hero-wide">
              <span>Platform Overview Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`features-section ${animateFeatures}`}>
        <div className="container">
          <h2 className="section-title text-center mb-2">Platform Features</h2>
          <p className="section-subtitle text-center mb-5">
            Everything you need to manage e-waste responsibly
          </p>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-3">
                <div className="feature-card">
                  <div className="feature-image-placeholder">
                    <span>Feature Image</span>
                  </div>
                  <div className="feature-icon">
                    <span>{feature.icon}</span>
                  </div>
                  <h5>{feature.title}</h5>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Visual Section */}
      <section className="process-section">
        <div className="container">
          <h2 className="section-title text-center mb-2">How It Works</h2>
          <p className="section-subtitle text-center mb-5">
            A simple 4-step process to recycle your e-waste
          </p>
          <div className="process-visual">
            <div className="image-placeholder process-wide">
              <span>Process Flow Diagram</span>
            </div>
          </div>
          <div className="row g-4 mt-4">
            <div className="col-12 col-md-3">
              <div className="process-step">
                <div className="step-number">1</div>
                <h6>Register</h6>
                <p>Create your free account in minutes</p>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="process-step">
                <div className="step-number">2</div>
                <h6>Request</h6>
                <p>Submit your e-waste pickup request</p>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="process-step">
                <div className="step-number">3</div>
                <h6>Collect</h6>
                <p>Agent collects from your location</p>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="process-step">
                <div className="step-number">4</div>
                <h6>Recycle</h6>
                <p>Items processed responsibly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={`stats-section ${animateStats}`}>
        <div className="container">
          <h2 className="section-title text-center mb-5">Our Impact in Numbers</h2>
          <div className="row g-4">
            {stats.map((stat, index) => (
              <div key={index} className="col-6 col-md-3">
                <div className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="roles-section">
        <div className="container">
          <h2 className="section-title text-center mb-2">For Everyone</h2>
          <p className="section-subtitle text-center mb-5">
            Our platform serves different roles in the e-waste ecosystem
          </p>
          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="role-card">
                <div className="role-image-placeholder">
                  <span>Citizens Image</span>
                </div>
                <h5>Citizens</h5>
                <p>Request pickups, track status, and see your recycling impact with easy-to-use dashboards.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="role-card">
                <div className="role-image-placeholder">
                  <span>Agents Image</span>
                </div>
                <h5>Collection Agents</h5>
                <p>Manage assigned pickups, update collection status, and optimize routes efficiently.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="role-card">
                <div className="role-image-placeholder">
                  <span>Recyclers Image</span>
                </div>
                <h5>Recyclers</h5>
                <p>Process incoming e-waste, manage inventory, and generate compliance reports.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="explore-cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Start Your Recycling Journey Today</h2>
          <p className="cta-subtitle">
            Join our growing community and make a positive impact on the environment.
          </p>
          <div className="d-flex gap-3 justify-content-center mt-4 flex-wrap">
            <Link to="/register" className="btn btn-gradient btn-lg rounded-pill">
              Create Account
            </Link>
            <Link to="/about" className="btn btn-outline-light btn-lg rounded-pill">
              Learn About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="explore-footer">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="mb-3 mb-md-0">
            <strong>E-Waste Management</strong>
            <div className="text-muted small">Smart recycling for a better tomorrow.</div>
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
