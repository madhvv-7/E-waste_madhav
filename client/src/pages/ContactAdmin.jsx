import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api';
import './ContactAdmin.css';

function ContactAdmin() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const emailFromQuery = params.get('email') || '';

  const [email] = useState(emailFromQuery);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // prevent editing email if not provided
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please provide the email you used to register.');
      return;
    }
    if (!message || message.trim().length === 0) {
      setError('Please enter a message describing your appeal.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/appeals', { email, subject, message });
      setSuccess('Your appeal has been submitted. An administrator will review it.');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit appeal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="contact-card">
            <div className="row g-0">
              {/* Left Panel */}
              <div className="col-12 col-md-5 order-2 order-md-1">
                <div className="contact-left-panel">
                  <div className="contact-left-content">
                    <div className="contact-icon">✉️</div>
                    <h3>Need Help?</h3>
                    <p>
                      If your account was rejected or deactivated, submit an appeal and our team will review it promptly.
                    </p>
                    <Link to="/" className="btn btn-outline-light rounded-pill contact-back-btn">
                      Back to Home
                    </Link>
                  </div>
                  <div className="contact-circle contact-circle-1"></div>
                  <div className="contact-circle contact-circle-2"></div>
                </div>
              </div>

              {/* Right Panel - Form */}
              <div className="col-12 col-md-7 order-1 order-md-2">
                <div className="contact-form-panel">
                  <h2 className="contact-title">Contact Administrator</h2>
                  <p className="contact-subtitle">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>

                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <form onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="contact-field-wrapper">
                      <label className="contact-label">Email Address</label>
                      <div className="contact-input-group">
                        <span className="contact-input-icon">📧</span>
                        <input
                          type="email"
                          name="email"
                          value={email}
                          readOnly
                          className="contact-input"
                          placeholder="your@email.com"
                        />
                      </div>
                      <small className="contact-hint">This is the email associated with your account</small>
                    </div>

                    {/* Subject Field */}
                    <div className="contact-field-wrapper">
                      <label className="contact-label">Subject <span className="text-muted">(optional)</span></label>
                      <div className="contact-input-group">
                        <span className="contact-input-icon">📝</span>
                        <input
                          type="text"
                          name="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="contact-input"
                          placeholder="e.g., Account Reactivation Request"
                        />
                      </div>
                    </div>

                    {/* Message Field */}
                    <div className="contact-field-wrapper">
                      <label className="contact-label">Message <span className="text-danger">*</span></label>
                      <textarea
                        name="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows="5"
                        required
                        className="contact-textarea"
                        placeholder="Please describe your situation and why you'd like your account to be reviewed..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="contact-submit-btn"
                      disabled={loading || submitted}
                    >
                      {loading ? 'Submitting...' : submitted ? '✓ Appeal Submitted' : 'Submit Appeal'}
                    </button>

                    {submitted && (
                      <div className="contact-success-note">
                        <p>Thank you for your submission. You will receive a response via email.</p>
                        <Link to="/" className="contact-home-link">Return to Home</Link>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactAdmin;

