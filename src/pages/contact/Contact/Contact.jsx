import React, { useState } from 'react';
import PageWrapper from '../../../components/layout/PageWrapper';
import { useUiStore } from '../../../store/uiStore';
import './Contact.css';
import {
  Headset,
  ShieldCheck,
  Heart,
  Home,
  Phone,
  Mail,
  MapPin,
  User,
  MessageSquare,
  ArrowRight,
  Camera,
  Globe,
  Hash,
  MonitorPlay,
  MessageCircle,
  Star
} from 'lucide-react';

export default function Contact() {
  const { showToast } = useUiStore();
  const [form, setForm] = useState({ fullName: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Message sent successfully! We will get back to you soon.', 'success');
      setForm({ fullName: '', email: '', message: '' });
    }, 600);
  };

  return (
    <PageWrapper>
      <div className="ketchen-contact-page">
        {/* ============================================================== */}
        {/* 1. HERO SECTION                                                */}
        {/* ============================================================== */}
        <section className="k-hero-section">
          {/* Top subtle glow/curves can be added via CSS before/after */}
          <div className="k-container k-hero-grid">
            <div className="k-hero-content">
              <div className="k-eyebrow-container">
                <span className="k-eyebrow">GET IN TOUCH</span>
                <div className="k-eyebrow-line"></div>
              </div>
              <h1 className="k-hero-title">
                We’re Here to Help With Your <span>Picky Experience</span>
              </h1>
              <p className="k-hero-desc">
                Have a question about your order, product, delivery, or anything else? Our customer support team is here to help you with your Picky shopping experience.
              </p>

              {/* CTA Action Buttons */}
              <div className="k-hero-actions">
                <a href="#contact-form-section" className="k-hero-btn-primary">
                  <MessageSquare size={18} />
                  <span>Send Us a Message</span>
                  <ArrowRight size={16} />
                </a>
                <a href="tel:+919876543210" className="k-hero-btn-secondary">
                  <Phone size={18} />
                  <span>Call Customer Care</span>
                </a>
              </div>
            </div>

          </div>

          {/* Wave Bottom Divider */}
          <div className="k-hero-wave">
            <svg viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,32 C320,96 520,0 720,48 C920,96 1120,16 1440,48 L1440,96 L0,96 Z" fill="#ffffff"></path>
            </svg>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 2. CONTACT INFORMATION CARDS                                   */}
        {/* ============================================================== */}
        <section className="k-info-section">
          <div className="k-container">
            <div className="k-section-header">
              <div className="k-eyebrow-container-center">
                <div className="k-eyebrow-line"></div>
                <span className="k-eyebrow-dark">CONTACT INFORMATION</span>
              </div>
              <h2 className="k-section-title">Our Contact Information</h2>
              <p className="k-section-desc">
                Reach out to us directly through any of the channels below. We're always here to assist you.
              </p>
            </div>
            <div className="k-infographic-flow">
              {/* Step 01: Phone (Royal Purple) */}
              <div className="k-flow-item step-purple">
                <svg viewBox="0 0 270 270" className="k-flow-svg" preserveAspectRatio="none">
                  <path
                    d="M 228.5,56.6 A 122 122 0 1 0 135,257 C 195,257 245,210 270,135"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="228.5" cy="56.6" r="6" fill="#7c3aed" />
                </svg>
                <div className="k-flow-circle">
                  <div className="k-flow-icon">
                    <Phone size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="k-flow-title">+91 83002 95721</h3>
                  <p className="k-flow-desc">
                    +91 6385118083<br />
                    Mon - Sat, 9AM - 8PM
                  </p>
                </div>
              </div>

              {/* Step 02: Email (Azure Sky Blue) */}
              <div className="k-flow-item step-blue">
                <svg viewBox="0 0 270 270" className="k-flow-svg" preserveAspectRatio="none">
                  <path
                    d="M 0,135 C 25,60 75,13 135,13 A 122 122 0 0 1 135,257 A 122 122 0 0 1 29.35,196"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 135,257 C 195,257 245,210 270,135"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="29.35" cy="196" r="6" fill="#0ea5e9" />
                </svg>
                <div className="k-flow-circle">
                  <div className="k-flow-icon">
                    <Mail size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="k-flow-title k-email-title">pickysn2026@gmail.com</h3>
                  <p className="k-flow-desc">
                    Drop us an email<br />
                    We reply within 24hrs
                  </p>
                </div>
              </div>

              {/* Step 03: Location (Coral Rose) */}
              <div className="k-flow-item step-coral">
                <svg viewBox="0 0 270 270" className="k-flow-svg" preserveAspectRatio="none">
                  <path
                    d="M 0,135 C 25,60 75,13 135,13 A 122 122 0 0 1 135,257 A 122 122 0 0 1 29.35,196"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 135,257 C 195,257 245,210 270,135"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="29.35" cy="196" r="6" fill="#f43f5e" />
                </svg>
                <div className="k-flow-circle">
                  <div className="k-flow-icon">
                    <MapPin size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="k-flow-title">Peravurani, TN</h3>
                  <p className="k-flow-desc">
                    1st Floor, Softnova Apt<br />
                    SNV Mahal back side
                  </p>
                </div>
              </div>

              {/* Step 04: Instagram (Radiant Magenta) */}
              <div className="k-flow-item step-magenta">
                <svg viewBox="0 0 270 270" className="k-flow-svg" preserveAspectRatio="none">
                  <path
                    d="M 0,135 C 25,60 75,13 135,13 A 122 122 0 0 1 135,257 A 122 122 0 0 1 29.35,196"
                    fill="none"
                    stroke="#d946ef"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="29.35" cy="196" r="6" fill="#d946ef" />
                </svg>
                <div className="k-flow-circle">
                  <div className="k-flow-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <h3 className="k-flow-title">@picky.co.in</h3>
                  <p className="k-flow-desc">
                    Follow on Instagram<br />
                    For daily updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. FORM AND MAP SECTION                                        */}
        {/* ============================================================== */}
        <section className="k-form-map-section">
          <div className="k-container k-form-map-grid">
            
            {/* Left: Form Container */}
            <div className="k-form-container">
              <div className="k-eyebrow-container">
                <div className="k-eyebrow-line"></div>
                <span className="k-eyebrow">GET IN TOUCH</span>
              </div>
              <h2 className="k-form-title">
                Let's Talk About<br/>Your <span>Dream Kitchen</span>
              </h2>
              <p className="k-form-desc">
                Have a project in mind? Send us a message and our team will get back to you as soon as possible.
              </p>

              <form onSubmit={handleFormSubmit} className="k-contact-form">
                <div className="k-input-group">
                  <User className="k-input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="k-input-group">
                  <Mail className="k-input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="k-input-group k-textarea-group">
                  <MessageSquare className="k-input-icon" size={18} />
                  <textarea
                    placeholder="Message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  ></textarea>
                </div>
                <button type="submit" disabled={loading} className="k-submit-btn">
                  {loading ? 'Sending...' : 'Submit Message'}
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>

            {/* Right: Map and Social */}
            <div className="k-map-container">
              <div className="k-eyebrow-container">
                <div className="k-eyebrow-line-dark"></div>
                <span className="k-eyebrow-dark">OUR LOCATION</span>
              </div>
              <h2 className="k-section-title k-map-title">Visit Our Store</h2>
              <p className="k-section-desc k-map-desc">
                Experience our curated collections in person. Drop by our store located in the heart of Peravurani.
              </p>

              {/* Google Map Interactive Iframe */}
              <div className="k-map-box">
                <iframe
                  title="Picky Store Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15682.261947230621!2d79.23122712952882!3d10.29749550302482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5518b3f2e1a3d9%3A0x6b8f3a3e6f7b1b3a!2sPeravurani%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1698765432100!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, width: '100%', height: '100%' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                {/* Floating Info Card */}
                <div className="k-map-card">
                  <h4>Picky Experience Center</h4>
                  <p>1st Floor, Softnova Apartment, Peravurani</p>
                  <div className="k-map-rating">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <span>4.9</span>
                  </div>
                  <a 
                    href="https://maps.google.com/?q=T+Nagar+Chennai+Tamil+Nadu" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View on Google Maps ↗
                  </a>
                </div>
              </div>


            </div>

          </div>
        </section>

      </div>
    </PageWrapper>
  );
}
