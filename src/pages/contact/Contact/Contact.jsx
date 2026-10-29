import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../../components/layout/PageWrapper';
import { useUiStore } from '../../../store/uiStore';
import { usePageCustomization } from '../../../store/customizationStore';
import { contactService } from '../../../services/contact.service';
import { settingsService } from '../../../services/settings.service';
import { productService } from '../../../services/product.service';
import './Contact.css';
import '../../../styles/home-premium.css';
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
  Star,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Paperclip,
  UploadCloud,
  FileText,
  X
} from 'lucide-react';

const promoSlides = [
  {
    id: 1,
    tag: 'NEW ARRIVALS',
    subtitle: 'Discover trending seasonal drops & modern curated accessories',
    btnText: 'Shop New Arrivals',
    link: '/new-arrivals',
    image: '/images/contact_slide_1.jpg?v=clean'
  },
  {
    id: 2,
    tag: 'BESTSELLERS',
    subtitle: 'Our highest-rated customer favorites and everyday essentials',
    btnText: 'Explore Best Sellers',
    link: '/best-sellers',
    image: '/images/contact_slide_2.jpg?v=clean'
  },
  {
    id: 3,
    tag: 'SHOP ALL ITEMS',
    subtitle: 'Browse through our full catalog of lifestyle, home & wellness goods',
    btnText: 'Shop All Items',
    link: '/shop',
    image: '/images/contact_slide_3.jpg?v=clean'
  }
];

export default function Contact() {
  const { isEnabled, getSetting } = usePageCustomization('contact_us');
  const navigate = useNavigate();
  const { showToast } = useUiStore();
  const [form, setForm] = useState({ fullName: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // File upload state
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);

  // Live store settings state
  const [storeSettings, setStoreSettings] = useState(() => settingsService.getCachedStoreSettings());

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const res = await settingsService.getSettings();
        const data = res?.data || res;
        if (isMounted && data) {
          setStoreSettings(data);
        }
      } catch (_) {}
    }
    loadSettings();

    const handleUpdate = (e) => {
      if (e?.detail) {
        setStoreSettings(e.detail);
      }
    };
    window.addEventListener('picky_store_settings_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('picky_store_settings_updated', handleUpdate);
    };
  }, []);

  const formattedAddress = storeSettings?.address && typeof storeSettings.address === 'object'
    ? [storeSettings.address.street, storeSettings.address.city, storeSettings.address.state, storeSettings.address.pincode].filter(Boolean).join(', ')
    : (typeof storeSettings?.address === 'string' ? storeSettings.address : 'Main Road, Peravurani, Thanjavur District, Tamil Nadu, 614804');

  const displayStoreName = storeSettings?.storeName || 'Picky Store';
  const displayPhone = storeSettings?.contactPhone || storeSettings?.supportPhone || '+91 83002 95721';
  const displayEmail = storeSettings?.contactEmail || storeSettings?.supportEmail || 'care@pickystore.com';
  const rawCleanPhone = displayPhone.replace(/[^0-9]/g, '');

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds 15MB limit. Please choose a smaller file.', 'warning');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Real DB products for promo slider (No dummy or hardcoded images!)
  const [dbPromoProducts, setDbPromoProducts] = useState([]);

  // Hero section background image (Preserves the original Purple Flower Vase background)
  const heroDbImage = useMemo(() => {
    return (
      getSetting('contact_hero', 'backgroundImage') ||
      getSetting('contact_hero', 'imageUrl') ||
      '/images/contact_hero_bg.png'
    );
  }, [getSetting]);

  useEffect(() => {
    let isMounted = true;
    async function fetchPromoProducts() {
      try {
        const res = await productService.list({ limit: 12, sort: 'newest' });
        const data = res?.data || res;
        const items = Array.isArray(data)
          ? data
          : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.products) ? data.products : []));
        if (isMounted && items.length > 0) {
          setDbPromoProducts(items);
        }
      } catch (err) {
        console.warn('Could not fetch DB products for promo slider:', err);
      }
    }
    fetchPromoProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const promoSlidesList = useMemo(() => {
    const realDbImages = dbPromoProducts
      .map((p) => (Array.isArray(p.images) && p.images[0]) || p.image)
      .filter(Boolean);

    return [
      {
        id: 1,
        tag: 'NEW ARRIVALS',
        subtitle: 'Discover trending seasonal drops & modern curated accessories',
        btnText: 'Shop New Arrivals',
        link: '/new-arrivals',
        image: realDbImages[0] || promoSlides[0].image
      },
      {
        id: 2,
        tag: 'BESTSELLERS',
        subtitle: 'Our highest-rated customer favorites and everyday essentials',
        btnText: 'Explore Best Sellers',
        link: '/best-sellers',
        image: realDbImages[1] || realDbImages[0] || promoSlides[1].image
      },
      {
        id: 3,
        tag: 'SHOP ALL ITEMS',
        subtitle: 'Browse through our full catalog of lifestyle, home & wellness goods',
        btnText: 'Shop All Items',
        link: '/shop',
        image: realDbImages[2] || realDbImages[0] || promoSlides[2].image
      }
    ];
  }, [dbPromoProducts]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlidesList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, promoSlidesList.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promoSlidesList.length) % promoSlidesList.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promoSlidesList.length);
  };

  const [uploadStatus, setUploadStatus] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.message.trim()) {
      showToast('Please fill in your name and message.', 'warning');
      return;
    }

    const startTime = Date.now();
    setLoading(true);
    setUploadStatus(selectedFile ? 'Uploading file to S3...' : 'Sending message...');

    try {
      let uploadedFileResult = null;

      // 1. If user attached a reference file, first directly upload to AWS S3 bucket (picky/inquiries)
      if (selectedFile) {
        try {
          const uploadRes = await contactService.uploadFile(selectedFile);
          uploadedFileResult = uploadRes?.data || null;
        } catch (uploadErr) {
          console.warn('Direct S3 upload note:', uploadErr?.message || uploadErr);
        }
      }

      setUploadStatus('Submitting message...');

      let res;
      if (uploadedFileResult && uploadedFileResult.url) {
        // Send inquiry with pre-uploaded S3 URL
        const payload = {
          fullName: form.fullName.trim(),
          phone: form.phone ? form.phone.trim() : '',
          message: form.message.trim(),
          source: 'contact_page',
          fileUrl: uploadedFileResult.url,
          fileKey: uploadedFileResult.key,
          fileName: uploadedFileResult.originalName || selectedFile.name,
          fileMime: uploadedFileResult.mimeType || selectedFile.type,
          fileSize: uploadedFileResult.size || selectedFile.size,
        };
        res = await contactService.submit(payload);
      } else {
        // Fallback: multipart formData with file attached
        const formData = new FormData();
        formData.append('fullName', form.fullName.trim());
        if (form.phone && form.phone.trim()) {
          formData.append('phone', form.phone.trim());
        }
        formData.append('message', form.message.trim());
        formData.append('source', 'contact_page');
        if (selectedFile) {
          formData.append('file', selectedFile);
        }
        res = await contactService.submit(formData);
      }

      const inquiryData = res?.data?.inquiry || {};
      const finalFileUrl = inquiryData?.file?.url || uploadedFileResult?.url || null;

      // Sync notification with localStorage for instant admin bell badge & notifications feed
      try {
        const saved = localStorage.getItem('picky_admin_notifications');
        const list = saved ? JSON.parse(saved) : [];
        const newNotif = {
          id: res?.data?.notificationId || `notif-contact-${Date.now()}`,
          type: 'contact',
          category: 'Contact & Support',
          title: `New Support Inquiry from ${form.fullName.trim()}`,
          message: selectedFile
            ? `${form.message.slice(0, 90)}... (📎 Attachment: ${selectedFile.name})`
            : form.message.slice(0, 90),
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          relativeTime: 'Just now',
          unread: true,
          starred: false,
          link: '/softpicky-sn2026/notifications',
          linkText: 'View Inquiry',
          hasAttachment: Boolean(selectedFile),
          attachmentName: selectedFile ? selectedFile.name : null,
          attachmentUrl: finalFileUrl,
          metadata: {
            inquiryId: inquiryData?._id,
            fullName: form.fullName.trim(),
            email: '',
            phone: form.phone.trim(),
            message: form.message.trim(),
            hasAttachment: Boolean(selectedFile),
            fileName: selectedFile ? selectedFile.name : null,
            fileUrl: finalFileUrl,
            fileKey: inquiryData?.file?.key || uploadedFileResult?.key || null,
          },
        };
        const updated = [newNotif, ...list];
        localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
        window.dispatchEvent(new Event('picky_inquiries_updated'));
        window.dispatchEvent(new Event('picky_notifications_updated'));
      } catch (syncErr) {
        console.error('Local notification sync error:', syncErr);
      }

      showToast('Your message has been sent successfully! Our team will get back to you soon.', 'success');
      setForm({ fullName: '', phone: '', message: '' });
      handleRemoveFile();
    } catch (err) {
      console.error('Contact submission error:', err);
      showToast(err?.message || 'Failed to send message. Please try again or WhatsApp us.', 'error');
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 1000 - elapsed);
      if (remainingDelay > 0) {
        await new Promise((r) => setTimeout(r, remainingDelay));
      }
      setLoading(false);
      setUploadStatus('');
    }
  };

  return (
    <PageWrapper>
      <div className="ketchen-contact-page">
        {/* ============================================================== */}
        {/* 1. HERO SECTION                                                */}
        {/* ============================================================== */}
        {isEnabled('contact_hero') && (
        <section className="k-hero-section" style={heroDbImage ? { '--k-hero-bg': `url("${heroDbImage}")` } : undefined}>
          {/* Top subtle glow/curves can be added via CSS before/after */}
          <div className="k-container k-hero-grid">
            <div className="k-hero-content">
              {/* Mobile Heritage Pills (Visible only on mobile <= 768px) */}
              <div className="k-hero-mobile-pills">
                <span className="k-hero-pill-item">
                  <span className="k-pill-dot-emerald"></span>
                  Tamil Nadu Heritage Care
                </span>
                <span className="k-hero-pill-item">
                  Always Listening
                </span>
              </div>

              <div className="k-eyebrow-container">
                <span className="k-eyebrow">{getSetting('contact_hero', 'eyebrow', 'GET IN TOUCH')}</span>
                <div className="k-eyebrow-line"></div>
              </div>
              <h1 className="k-hero-title">
                {(() => {
                  const title = getSetting('contact_hero', 'title', 'We’re Here to Help With Your Picky Experience');
                  const words = title.split(' ');
                  if (words.length > 2) {
                    return (
                      <>
                        {words.slice(0, -2).join(' ')} <span>{words.slice(-2).join(' ')}</span>
                      </>
                    );
                  }
                  return title;
                })()}
              </h1>
              <p className="k-hero-desc">
                {getSetting('contact_hero', 'description', 'Have a question about your order, product, delivery, or anything else? Our customer support team is here to help you with your Picky shopping experience.')}
              </p>

              {/* CTA Action Buttons */}
              <div className="k-hero-actions">
                <a href="#contact-form-section" className="k-hero-btn-primary">
                  <MessageSquare size={18} />
                  <span>{getSetting('contact_hero', 'primaryButtonText', 'Send Us a Message')}</span>
                  <ArrowRight size={16} />
                </a>

                <a
                  href={`https://wa.me/${rawCleanPhone || '918300295721'}?text=${encodeURIComponent('Hi ' + displayStoreName + '! I would like to consult regarding products.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="k-hero-btn-secondary"
                  style={{ borderColor: 'rgba(37, 211, 102, 0.5)', color: '#047857' }}
                  title={`WhatsApp Consulting (${displayPhone})`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                  </svg>
                  <span>{getSetting('contact_hero', 'whatsappButtonText', 'WhatsApp Consulting')}</span>
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
        )}

        {/* ============================================================== */}
        {/* 2. CONTACT INFORMATION CARDS                                   */}
        {/* ============================================================== */}
        {isEnabled('contact_channels') && (
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
                  <h3 className="k-flow-title">{displayPhone}</h3>
                  <p className="k-flow-desc">
                    Customer Care & Support<br />
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
                  <h3 className="k-flow-title k-email-title">{displayEmail}</h3>
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
                  <h3 className="k-flow-title">{displayStoreName}</h3>
                  <p className="k-flow-desc" style={{ fontSize: '0.78rem', lineHeight: 1.35, maxHeight: '48px', overflow: 'hidden' }}>
                    {formattedAddress}
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

            {/* Mobile View (<= 768px): 2x2 Contact Orbs (Matching Design & Real Data) */}
            <div className="k-mobile-contact-grid">
              {/* Call Orb */}
              <a href={`tel:${rawCleanPhone || '+918300295721'}`} className="k-mobile-contact-card">
                <div className="k-orb-icon-circle k-orb-purple">
                  <Phone size={19} strokeWidth={2.4} />
                </div>
                <span className="k-orb-title">{displayPhone}</span>
                <span className="k-orb-sub">Customer Care & Support</span>
                <span className="k-orb-badge k-orb-badge-purple">Mon - Sat, 9AM - 8PM</span>
              </a>

              {/* Email Orb */}
              <a href={`mailto:${displayEmail}`} className="k-mobile-contact-card">
                <div className="k-orb-icon-circle k-orb-teal">
                  <Mail size={19} strokeWidth={2.4} />
                </div>
                <span className="k-orb-title">{displayEmail}</span>
                <span className="k-orb-sub">Drop us an email</span>
                <span className="k-orb-badge k-orb-badge-teal">We reply within 24hrs</span>
              </a>

              {/* Store Orb */}
              <a href="#store-map-section" className="k-mobile-contact-card">
                <div className="k-orb-icon-circle k-orb-rose">
                  <MapPin size={19} strokeWidth={2.4} />
                </div>
                <span className="k-orb-title">{displayStoreName}</span>
                <span className="k-orb-sub">Main Road, Peravurani</span>
                <span className="k-orb-badge k-orb-badge-rose">Thanjavur Dist, TN</span>
              </a>

              {/* Instagram Orb */}
              <a
                href={getSetting('contact_community', 'instagramLink', 'https://www.instagram.com/picky.co.in/')}
                target="_blank"
                rel="noopener noreferrer"
                className="k-mobile-contact-card"
              >
                <div className="k-orb-icon-circle k-orb-magenta">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <span className="k-orb-title">@picky.co.in</span>
                <span className="k-orb-sub">Follow on Instagram</span>
                <span className="k-orb-badge k-orb-badge-purple">For daily updates</span>
              </a>
            </div>
          </div>
        </section>
        )}

        {/* ============================================================== */}
        {/* 3. FORM AND DIRECT ASSISTANCE HUB                              */}
        {/* ============================================================== */}
        {isEnabled('contact_form') && (
        <section id="contact-form-section" className="k-form-map-section">
          <div className="k-container k-form-map-grid">
            
            {/* Left: Form Container */}
            <div className="k-form-container">
              <div className="k-eyebrow-container">
                <div className="k-eyebrow-line"></div>
                <span className="k-eyebrow">GET IN TOUCH</span>
              </div>
              <h2 className="k-form-title">
                Let's Connect With<br/>Our <span>Support Team</span>
              </h2>
              <p className="k-form-desc">
                Have questions about your order, products, or deliveries? Send us a message and our team will get back to you promptly.
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
                  <Phone className="k-input-icon" size={18} />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="k-input-group k-textarea-group">
                  <MessageSquare className="k-input-icon" size={18} />
                  <textarea
                    placeholder="Message *"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                {/* File Upload Zone */}
                <div className="k-file-upload-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    id="contact-file-input"
                    className="k-file-hidden-input"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  {!selectedFile ? (
                    <button
                      type="button"
                      className="k-file-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="k-file-icon-box">
                        <Paperclip size={18} />
                      </div>
                      <div className="k-file-text-col">
                        <span className="k-file-main-text">Attach Screenshot or Document (Optional)</span>
                        <span className="k-file-sub-text">Supports JPG, PNG, PDF, DOC up to 15MB</span>
                      </div>
                      <UploadCloud size={16} className="k-file-upload-cloud" />
                    </button>
                  ) : (
                    <div className="k-file-selected-card">
                      <div className="k-file-selected-left">
                        {filePreviewUrl ? (
                          <div className="k-file-thumb-box">
                            <img src={filePreviewUrl} alt="Upload preview" className="k-file-thumb-img" />
                          </div>
                        ) : (
                          <div className="k-file-doc-box">
                            <FileText size={20} />
                          </div>
                        )}
                        <div className="k-file-selected-meta">
                          <span className="k-file-name" title={selectedFile.name}>
                            {selectedFile.name}
                          </span>
                          <span className="k-file-size">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to send
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="k-file-remove-btn"
                        onClick={handleRemoveFile}
                        title="Remove attached file"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} className="k-submit-btn">
                  {loading ? (uploadStatus || 'Submitting Message...') : 'Submit Message'}
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>

            {/* Right: 3-Images Interactive Slide Section (Dynamic Real DB Images) */}
            <div
              className="k-promo-slider-container"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {promoSlidesList.map((slide, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <div
                    key={slide.id}
                    className={`k-promo-slide ${isActive ? 'is-active' : ''}`}
                    aria-hidden={!isActive}
                  >
                    <img
                      src={slide.image}
                      alt={slide.tag}
                      className="k-promo-slide-img"
                    />

                    {/* Gradient & Clean Overlay */}
                    <div className="k-promo-slide-overlay">
                      {/* Top Header Pill */}
                      <div className="k-promo-slide-top">
                        <span className="k-promo-slide-tag">
                          <Sparkles size={13} />
                          <span>{slide.tag}</span>
                        </span>
                        <span className="k-promo-slide-counter">
                          0{idx + 1} / 0{promoSlidesList.length}
                        </span>
                      </div>

                      {/* Bottom Floating Action Card */}
                      <div className="k-promo-slide-footer">
                        <h3 className="k-promo-slide-title-mobile">{slide.tag}</h3>
                        <p className="k-promo-slide-desc">{slide.subtitle}</p>
                        <button
                          type="button"
                          className="k-promo-slide-btn"
                          onClick={() => navigate(slide.link)}
                        >
                          <span>{slide.btnText}</span>
                          <ArrowRight size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Navigation Arrows */}
              <button
                type="button"
                className="k-promo-nav-btn k-promo-prev"
                onClick={handlePrevSlide}
                aria-label="Previous Slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="k-promo-nav-btn k-promo-next"
                onClick={handleNextSlide}
                aria-label="Next Slide"
              >
                <ChevronRight size={20} />
              </button>

              {/* Pagination Dots */}
              <div className="k-promo-dots">
                {promoSlidesList.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`k-promo-dot ${currentSlide === idx ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </section>
        )}

        {/* ============================================================== */}
        {/* 4. DEDICATED STORE LOCATION & MAP SECTION                      */}
        {/* ============================================================== */}
        {isEnabled('contact_location') && (
        <section id="store-map-section" className="k-store-map-section">
          <div className="k-container">
            <div className="k-store-map-header">
              <div className="k-eyebrow-container-center">
                <div className="k-eyebrow-line-dark"></div>
                <span className="k-eyebrow-dark">FIND OUR STORE</span>
                <div className="k-eyebrow-line-dark"></div>
              </div>
              <h2 className="k-section-title k-store-map-title">Visit Our Experience Store</h2>
              <p className="k-section-desc k-store-map-desc">
                Experience our curated collections in person. Drop by our store located in the heart of Peravurani for hands-on browsing and personalized assistance.
              </p>
            </div>
          </div>

          {/* Full-width Satellite Map Container with Floating Store Details Badge */}
          <div className="k-store-map-wrapper k-store-map-fullwidth">
            <div className="k-store-map-iframe-box">
              <a
                href="https://www.google.com/maps/search/?api=1&query=10.292564423223569,79.20430085807035"
                target="_blank"
                rel="noopener noreferrer"
                className="k-map-open-btn-floating"
              >
                <span>Open in Maps</span>
                <ExternalLink size={13} />
              </a>
              <iframe
                title="Softnova Picky Store Location - Satellite View"
                src="https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d2200!2d79.20430085807035!3d10.292564423223569!3m2!1i1024!2i768!4f13.1!2m1!1ssoftnova!5e1!3m2!1sen!2sin!4v1791799524428!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, width: '100%', height: '100%', display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>

            {/* Store Details Card Overlay */}
            <div className="k-store-map-badge">
              <div className="k-store-badge-top">
                <span className="k-store-badge-pill">★ 4.9 Rated</span>
                <span className="k-store-badge-status">Open Today</span>
              </div>
              <h3 className="k-store-badge-name">Picky Experience Center</h3>
              <p className="k-store-badge-addr">
                Softnova, Peravurani, Tamil Nadu 614804
              </p>
              <div className="k-store-badge-meta">
                <div className="k-store-badge-meta-item">
                  <Clock size={14} />
                  <span>Mon - Sat: 9:00 AM - 8:00 PM</span>
                </div>
                <div className="k-store-badge-meta-item">
                  <Phone size={14} />
                  <span>{displayPhone}</span>
                </div>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=10.292564423223569,79.20430085807035"
                target="_blank"
                rel="noopener noreferrer"
                className="k-store-badge-btn"
              >
                <span>Get Directions on Google Maps</span>
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </section>
        )}

        {/* ── 4. Community CTA Banner ── */}
        {isEnabled('contact_community') && (
        <section className="hp-final-cta-section" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
          <div className="hp-final-cta-container">
            <div className="hp-final-cta-box">
              <span className="hp-final-cta-badge">{getSetting('contact_community', 'badgeText', '✦ JOIN OUR COMMUNITY')}</span>
              <h2 className="hp-final-title">{getSetting('contact_community', 'title', 'Connect With Us @picky.co.in')}</h2>
              <p className="hp-final-subtitle">
                {getSetting('contact_community', 'subtitle', 'Follow us on Instagram & WhatsApp for daily style inspiration, exclusive drops, and behind-the-scenes stories.')}
              </p>
              <div className="hp-final-cta-btn-group no-hover-fx">
                <button
                  type="button"
                  className="hp-final-cta-btn no-hover-fx"
                  onClick={() => window.open(getSetting('contact_community', 'instagramLink', 'https://www.instagram.com/picky.co.in/'), '_blank', 'noopener,noreferrer')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>Follow on Instagram</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className="hp-final-cta-outline-btn no-hover-fx"
                  onClick={() => {
                    const wa = getSetting('contact_community', 'whatsappNumber', '918300295721').replace(/\D/g, '');
                    window.open(`https://wa.me/${wa}?text=Hi%20Picky!%20I%20would%20like%20to%20join%20the%20community.`, '_blank', 'noopener,noreferrer');
                  }}
                  aria-label="Join WhatsApp Group"
                  title="Join WhatsApp Group"
                >
                  <svg className="hp-cta-wa-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                  </svg>
                  <span className="hp-cta-wa-label">
                    <span>Join WhatsApp Group</span>
                    <ArrowRight size={16} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
        )}

      </div>
    </PageWrapper>
  );
}
