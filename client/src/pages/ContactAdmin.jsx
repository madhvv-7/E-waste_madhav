import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

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
    <div className="container">
      <div className="card" style={{ maxWidth: 700, margin: '2rem auto' }}>
        <h2>Contact Admin / Appeal</h2>
        <p>
          Use this form to submit an appeal if your account was rejected or deactivated.
          Provide details below and an administrator will review your request.
        </p>
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Email (read-only)
              <input type="email" name="email" value={email} readOnly />
            </label>
          </div>
          <div className="form-group">
            <label>
              Subject (optional)
              <input type="text" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>
          </div>
          <div className="form-group">
            <label>
              Message (required)
              <textarea name="message" value={message} onChange={(e) => setMessage(e.target.value)} rows="6" required />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || submitted}>
            {loading ? 'Submitting...' : submitted ? 'Submitted' : 'Submit Appeal'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactAdmin;

