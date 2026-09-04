import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';

export default function Contact() {
  const { showToast } = useUiStore();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Message sent! Our support team will get back to you shortly.', 'success');
    setSubmitted(true);
    setForm({ name: '', phone: '', message: '' });
  };

  return (
    <PageWrapper>
      <div className="section">
        <div className="container" style={{ maxWidth: '640px' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Contact Us</h1>
          <p style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Have a question about an order, tracking, or products? We are here to help!
          </p>

          <div className="card" style={{ padding: '2rem' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
                <h3>Thank you for reaching out!</h3>
                <p>We have received your message and will respond via WhatsApp / Phone.</p>
                <button onClick={() => setSubmitted(false)} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Input
                  label="Your Name"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  label="Phone / WhatsApp Number"
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  type="tel"
                  required
                />
                <div className="form-group">
                  <label className="form-label">Message / Query *</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Tell us how we can assist you..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" variant="primary" block size="lg" style={{ marginTop: '1rem' }}>
                  Send Message ➔
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
