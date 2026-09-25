import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Palette,
  Sliders,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Type,
  Link as LinkIcon,
  Sparkles,
  ShoppingBag,
  Megaphone,
  Store,
  HelpCircle,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useUiStore } from '../../../store/uiStore';
import { useCustomizationStore } from '../../../store/customizationStore';
import { MOCK_STORE_CUSTOMIZATION } from '../../../data/customizationMockData';

export default function AdminCustomization() {
  const { showToast } = useUiStore();
  const { setSections: storeSaveSections, setStoreInfo: storeSaveInfo } = useCustomizationStore();

  const [sections, setSections] = useState(MOCK_STORE_CUSTOMIZATION.sections);
  const [storeInfo, setStoreInfo] = useState(MOCK_STORE_CUSTOMIZATION.storeInfo);
  const [activeSectionId, setActiveSectionId] = useState(sections[1]?.id || 'hero_banner'); // default to Hero Banner
  const [isSaving, setIsSaving] = useState(false);

  // Active section data
  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  // Move section Up
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const updated = [...sections];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;

    // re-index order
    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSections(updated);
    showToast(`Moved "${updated[index - 1].name}" up`, 'info');
  };

  // Move section Down
  const handleMoveDown = (index) => {
    if (index >= sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;

    // re-index order
    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSections(updated);
    showToast(`Moved "${updated[index + 1].name}" down`, 'info');
  };

  // Toggle Section Visibility (Enable / Disable)
  const handleToggleEnable = (id, e) => {
    e.stopPropagation();
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextState = !s.enabled;
          showToast(`${s.name} is now ${nextState ? 'Enabled' : 'Hidden'}`, 'info');
          return { ...s, enabled: nextState };
        }
        return s;
      })
    );
  };

  // Update Settings of active section
  const handleUpdateSetting = (field, value) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === activeSectionId) {
          return {
            ...s,
            settings: {
              ...s.settings,
              [field]: value,
            },
          };
        }
        return s;
      })
    );
  };

  // Save All Changes — propagates to customizationStore so customer AnnouncementBar + sections update live
  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      // Push updated sections to shared store so customer-facing components react
      storeSaveSections(sections);
      storeSaveInfo(storeInfo);
      setIsSaving(false);
      showToast('🎉 Store Customization saved! Customer storefront is now updated.', 'success');
    }, 400);
  };

  return (
    <AdminLayout title="Store Customization">
      {/* ─── Top Control Header ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Storefront Layout & Visual Sections
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Control homepage section order, headlines, hero banners, and promotional copy
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link
            to="/"
            target="_blank"
            className="admin-period-select-btn"
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', textDecoration: 'none' }}
            title="Open customer storefront in a new tab"
          >
            <ExternalLink size={14} />
            <span>Preview Store</span>
          </Link>

          <Button
            onClick={handleSaveAll}
            loading={isSaving}
            style={{
              padding: '0.5rem 1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Save size={15} />
            <span>Save Settings</span>
          </Button>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 380px) 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* ── Left Column: Section Reordering & Enable/Disable List ── */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e1b4b', margin: '0 0 0.25rem' }}>
              Homepage Sections
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Click a section to edit controls. Use arrows to reorder.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {sections.map((section, index) => {
              const isSelected = section.id === activeSectionId;
              return (
                <div
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isSelected ? '#ede8f8' : section.enabled ? '#ffffff' : '#f8fafc',
                    borderColor: isSelected ? '#7c3aed' : '#ede8f8',
                    boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.12)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                    {/* Order index pill */}
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: isSelected ? '#7c3aed' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </span>

                    <div style={{ overflow: 'hidden' }}>
                      <strong
                        style={{
                          fontSize: '0.88rem',
                          color: section.enabled ? '#1e1b4b' : '#94a3b8',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                      >
                        {section.name}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {section.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Reorder Arrows & Visibility Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(index);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        padding: '0.25rem',
                        color: index === 0 ? '#cbd5e1' : '#64748b',
                        borderRadius: '6px',
                      }}
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(index);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: index === sections.length - 1 ? 'not-allowed' : 'pointer',
                        padding: '0.25rem',
                        color: index === sections.length - 1 ? '#cbd5e1' : '#64748b',
                        borderRadius: '6px',
                      }}
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleEnable(section.id, e)}
                      style={{
                        background: section.enabled ? '#dcfce7' : '#f1f5f9',
                        border: '1px solid',
                        borderColor: section.enabled ? '#bbf7d0' : '#e2e8f0',
                        color: section.enabled ? '#15803d' : '#94a3b8',
                        padding: '0.22rem 0.45rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                      title={section.enabled ? 'Click to hide section' : 'Click to enable section'}
                    >
                      {section.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{section.enabled ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: Controlled Section Settings Form ── */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #ede8f8',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                  {currentSection.name}
                </h3>
                <span
                  className={`adm-status-pill ${
                    currentSection.enabled ? 'adm-status-confirmed' : 'adm-status-cancelled'
                  }`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {currentSection.enabled ? '● Visible on Store' : '○ Section Hidden'}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                {currentSection.description}
              </span>
            </div>

            {/* Quick Toggle in edit pane */}
            <button
              type="button"
              onClick={(e) => handleToggleEnable(currentSection.id, e)}
              className="admin-period-select-btn"
              style={{
                fontSize: '0.78rem',
                background: currentSection.enabled ? '#fee2e2' : '#dcfce7',
                borderColor: currentSection.enabled ? '#fecaca' : '#bbf7d0',
                color: currentSection.enabled ? '#dc2626' : '#15803d',
              }}
            >
              {currentSection.enabled ? 'Disable Section' : 'Enable Section'}
            </button>
          </div>

          {/* ── Form Controls Specialized by Section Type ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* 1. Announcement Bar Settings */}
            {currentSection.id === 'announcement_bar' && (
              <>
                <Input
                  label="Announcement Message"
                  value={currentSection.settings.text || ''}
                  onChange={(e) => handleUpdateSetting('text', e.target.value)}
                  placeholder="e.g. Free Shipping across Tamil Nadu on orders above ₹499"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Action Button Label"
                    value={currentSection.settings.linkText || ''}
                    onChange={(e) => handleUpdateSetting('linkText', e.target.value)}
                    placeholder="e.g. Shop Sale"
                  />
                  <Input
                    label="Destination URL"
                    value={currentSection.settings.linkUrl || ''}
                    onChange={(e) => handleUpdateSetting('linkUrl', e.target.value)}
                    placeholder="e.g. /shop"
                  />
                </div>
                <Input
                  label="Promotional Badge Text"
                  value={currentSection.settings.badge || ''}
                  onChange={(e) => handleUpdateSetting('badge', e.target.value)}
                  placeholder="e.g. FESTIVE OFFER"
                />
              </>
            )}

            {/* 2. Hero Banner Settings */}
            {currentSection.id === 'hero_banner' && (
              <>
                <Input
                  label="Headline Title"
                  value={currentSection.settings.headline || ''}
                  onChange={(e) => handleUpdateSetting('headline', e.target.value)}
                  placeholder="e.g. Authentic South Indian Elegance"
                />
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                    Subheadline Description
                  </label>
                  <textarea
                    value={currentSection.settings.subheadline || ''}
                    onChange={(e) => handleUpdateSetting('subheadline', e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #dfd5f5',
                      fontSize: '0.88rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Primary CTA Text"
                    value={currentSection.settings.ctaText || ''}
                    onChange={(e) => handleUpdateSetting('ctaText', e.target.value)}
                  />
                  <Input
                    label="Primary CTA Link"
                    value={currentSection.settings.ctaLink || ''}
                    onChange={(e) => handleUpdateSetting('ctaLink', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Secondary CTA Text"
                    value={currentSection.settings.secondaryCtaText || ''}
                    onChange={(e) => handleUpdateSetting('secondaryCtaText', e.target.value)}
                  />
                  <Input
                    label="Secondary CTA Link"
                    value={currentSection.settings.secondaryCtaLink || ''}
                    onChange={(e) => handleUpdateSetting('secondaryCtaLink', e.target.value)}
                  />
                </div>

                <Input
                  label="Hero Banner Image URL"
                  value={currentSection.settings.imageUrl || ''}
                  onChange={(e) => handleUpdateSetting('imageUrl', e.target.value)}
                />

                {currentSection.settings.imageUrl && (
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                      Banner Preview
                    </label>
                    <img
                      src={currentSection.settings.imageUrl}
                      alt="Hero Preview"
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '1px solid #ede8f8',
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* 3. Shop by Category Settings */}
            {currentSection.id === 'shop_by_category' && (
              <>
                <Input
                  label="Section Title"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <Input
                  label="Section Subtitle"
                  value={currentSection.settings.subtitle || ''}
                  onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Grid Columns (Desktop)"
                    type="number"
                    min="2"
                    max="6"
                    value={currentSection.settings.columns || 5}
                    onChange={(e) => handleUpdateSetting('columns', Number(e.target.value))}
                  />
                  <Input
                    label="Max Visible Categories"
                    type="number"
                    min="3"
                    max="12"
                    value={currentSection.settings.maxItems || 10}
                    onChange={(e) => handleUpdateSetting('maxItems', Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {/* 4. New Arrivals Settings */}
            {currentSection.id === 'new_arrivals' && (
              <>
                <Input
                  label="Section Title"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <Input
                  label="Section Subtitle"
                  value={currentSection.settings.subtitle || ''}
                  onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Badge Text"
                    value={currentSection.settings.badge || ''}
                    onChange={(e) => handleUpdateSetting('badge', e.target.value)}
                  />
                  <Input
                    label="Number of Items Displayed"
                    type="number"
                    min="4"
                    max="16"
                    value={currentSection.settings.limit || 8}
                    onChange={(e) => handleUpdateSetting('limit', Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {/* 5. Best Sellers Settings */}
            {currentSection.id === 'best_sellers' && (
              <>
                <Input
                  label="Section Title"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <Input
                  label="Section Subtitle"
                  value={currentSection.settings.subtitle || ''}
                  onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Badge Pill"
                    value={currentSection.settings.badge || ''}
                    onChange={(e) => handleUpdateSetting('badge', e.target.value)}
                  />
                  <Input
                    label="Limit"
                    type="number"
                    min="4"
                    max="16"
                    value={currentSection.settings.limit || 8}
                    onChange={(e) => handleUpdateSetting('limit', Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {/* 6. Special Offers Settings */}
            {currentSection.id === 'special_offers' && (
              <>
                <Input
                  label="Offer Headline"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                    Banner Promotional Text
                  </label>
                  <textarea
                    value={currentSection.settings.bannerText || ''}
                    onChange={(e) => handleUpdateSetting('bannerText', e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #dfd5f5',
                      fontSize: '0.88rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Promo Coupon Code"
                    value={currentSection.settings.couponCode || ''}
                    onChange={(e) => handleUpdateSetting('couponCode', e.target.value)}
                  />
                  <Input
                    label="CTA Button Label"
                    value={currentSection.settings.ctaText || ''}
                    onChange={(e) => handleUpdateSetting('ctaText', e.target.value)}
                  />
                </div>
                <Input
                  label="Offer Background Image URL"
                  value={currentSection.settings.imageUrl || ''}
                  onChange={(e) => handleUpdateSetting('imageUrl', e.target.value)}
                />
              </>
            )}

            {/* 7. Featured Products Settings */}
            {currentSection.id === 'featured_products' && (
              <>
                <Input
                  label="Section Title"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <Input
                  label="Section Subtitle"
                  value={currentSection.settings.subtitle || ''}
                  onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                />
                <Input
                  label="Product Limit"
                  type="number"
                  min="2"
                  max="12"
                  value={currentSection.settings.limit || 6}
                  onChange={(e) => handleUpdateSetting('limit', Number(e.target.value))}
                />
              </>
            )}

            {/* 8. Why Picky Settings */}
            {currentSection.id === 'why_picky' && (
              <>
                <Input
                  label="Heading Title"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <Input
                  label="Subtitle"
                  value={currentSection.settings.subtitle || ''}
                  onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                />

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.5rem' }}>
                    Trust Proposition Features (4 Pillars)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(currentSection.settings.features || []).map((feat, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#faf8fe',
                          padding: '0.85rem',
                          borderRadius: '10px',
                          border: '1px solid #ede8f8',
                          display: 'grid',
                          gridTemplateColumns: '1fr 2fr',
                          gap: '0.75rem',
                          alignItems: 'center',
                        }}
                      >
                        <Input
                          label={`Feature #${idx + 1} Title`}
                          value={feat.title}
                          onChange={(e) => {
                            const newFeats = [...currentSection.settings.features];
                            newFeats[idx] = { ...newFeats[idx], title: e.target.value };
                            handleUpdateSetting('features', newFeats);
                          }}
                        />
                        <Input
                          label="Description"
                          value={feat.desc}
                          onChange={(e) => {
                            const newFeats = [...currentSection.settings.features];
                            newFeats[idx] = { ...newFeats[idx], desc: e.target.value };
                            handleUpdateSetting('features', newFeats);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 9. Footer Settings */}
            {currentSection.id === 'footer_config' && (
              <>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                    About Storefront Blurb
                  </label>
                  <textarea
                    value={currentSection.settings.aboutText || ''}
                    onChange={(e) => handleUpdateSetting('aboutText', e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #dfd5f5',
                      fontSize: '0.88rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Newsletter Heading"
                    value={currentSection.settings.newsletterTitle || ''}
                    onChange={(e) => handleUpdateSetting('newsletterTitle', e.target.value)}
                  />
                  <Input
                    label="Support Phone"
                    value={currentSection.settings.whatsapp || ''}
                    onChange={(e) => handleUpdateSetting('whatsapp', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Support Email"
                    value={currentSection.settings.supportEmail || ''}
                    onChange={(e) => handleUpdateSetting('supportEmail', e.target.value)}
                  />
                  <Input
                    label="Instagram URL"
                    value={currentSection.settings.instagram || ''}
                    onChange={(e) => handleUpdateSetting('instagram', e.target.value)}
                  />
                </div>

                <Input
                  label="Copyright Notice"
                  value={currentSection.settings.copyrightText || ''}
                  onChange={(e) => handleUpdateSetting('copyrightText', e.target.value)}
                />
              </>
            )}

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button onClick={handleSaveAll} loading={isSaving}>
                Save Changes to {currentSection.name}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
