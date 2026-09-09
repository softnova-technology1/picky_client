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
  CheckCircle2,
  Send
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
              {/* Live Status Pill */}
              <div className="k-hero-status-pill">
                <span className="k-status-dot"></span>
                <span>Live Support Active • We're Online Now</span>
              </div>

              <div className="k-eyebrow-container">
                <span className="k-eyebrow">GET IN TOUCH</span>
                <div className="k-eyebrow-line"></div>
              </div>
              <h1 className="k-hero-title">
                We're Here to Help Your <span>Picky Experience</span>
              </h1>
              <p className="k-hero-desc">
                Have a query about your order, product recommendations, or custom requests? Our customer care specialists are standing by to assist you 24/7 with dedicated support.
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



              {/* Single Horizontal Line Text-Only Pills */}
              <div className="k-hero-features-capsules">
                <div className="k-feature-pill-card">
                  <span className="k-pill-label">Quick Support</span>
                  <span className="k-pill-stat k-stat-violet">⚡ Within 15 Mins</span>
                </div>

                <div className="k-feature-pill-card">
                  <span className="k-pill-label">Trusted Choice</span>
                  <span className="k-pill-stat k-stat-emerald">⭐ 10,000+ Homes</span>
                </div>

                <div className="k-feature-pill-card">
                  <span className="k-pill-label">Satisfaction</span>
                  <span className="k-pill-stat k-stat-rose">🛡️ 100% Guaranteed</span>
                </div>
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
              </p>
            </div>

            <div className="k-info-cards">
              <div className="k-info-card">
                <div className="k-card-icon-box">
                  <Phone size={26} />
                </div>
                <div className="k-card-text">
                  <h3>(+654) 6544 55</h3>
                  <p>Call us anytime<br/>Mon - Sat, 9AM - 6PM</p>
                </div>
              </div>

              <div className="k-info-card">
                <div className="k-card-icon-box">
                  <Mail size={26} />
                </div>
                <div className="k-card-text">
                  <h3>mail@ktchn.com</h3>
                  <p>Drop us an email<br/>We reply within 24hrs</p>
                </div>
              </div>

              <div className="k-info-card">
                <div className="k-card-icon-box">
                  <MapPin size={26} />
                </div>
                <div className="k-card-text">
                  <h3>London Eye, UK</h3>
                  <p>Visit our showroom<br/>Open on weekdays</p>
                </div>
              </div>

              <div className="k-info-card">
                <div className="k-card-icon-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <div className="k-card-text">
                  <h3>@ktchn.design</h3>
                  <p>Follow us on Instagram<br/>For daily inspiration</p>
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
              <h2 className="k-section-title k-map-title">Visit Our Showroom</h2>
              <p className="k-section-desc k-map-desc">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
              </p>

              {/* Google Map Interactive Iframe */}
              <div className="k-map-box">
                <iframe
                  title="Ktchen Showroom Location"
                  src="https://maps.google.com/maps?q=London%20Eye,%20London,%20UK&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, width: '100%', height: '100%' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                {/* Floating Info Card */}
                <div className="k-map-card">
                  <h4>Ktchen Showroom</h4>
                  <p>London Eye, London, UK</p>
                  <div className="k-map-rating">
                    <span>4.8</span>
                    <div className="k-stars">★★★★★</div>
                    <span className="k-reviews">(1,245 reviews)</span>
                  </div>
                  <a 
                    href="https://maps.google.com/?q=London+Eye+London+UK" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View larger map
                  </a>
                </div>
              </div>


            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* 4. NEWSLETTER SECTION                                          */}
        {/* ============================================================== */}
        <section className="k-newsletter-section">
          <div className="k-container k-newsletter-grid">
            <div className="k-newsletter-text">
              <div className="k-eyebrow-container">
                <div className="k-eyebrow-line-dark"></div>
                <span className="k-eyebrow-dark">OUR NEWSLETTERS</span>
              </div>
              <h2 className="k-newsletter-title">
                Stay <span>Updated</span>
              </h2>
              <p className="k-newsletter-desc">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis pulvinar.
              </p>
            </div>
            
            <div className="k-newsletter-form-wrapper">
              <form className="k-newsletter-form">
                <div className="k-newsletter-input-box">
                  <Mail className="k-newsletter-icon" size={18} />
                  <input type="email" placeholder="Enter your email address" required />
                  <button type="submit" className="k-newsletter-btn">
                    Subscribe <ArrowRight size={16} />
                  </button>
                </div>
              </form>
              <div className="k-newsletter-perks">
                <div className="k-perk">
                  <CheckCircle2 size={16} className="k-perk-icon" /> Latest Offers
                </div>
                <div className="k-perk">
                  <CheckCircle2 size={16} className="k-perk-icon" /> Kitchen Tips
                </div>
                <div className="k-perk">
                  <CheckCircle2 size={16} className="k-perk-icon" /> New Arrivals
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Paper Plane */}
          <div className="k-paper-plane">
            <Send size={32} />
            <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 39C10 20 30 10 59 1" stroke="#a78bfa" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            </svg>
          </div>
        </section>

      </div>
    </PageWrapper>
  );
}
