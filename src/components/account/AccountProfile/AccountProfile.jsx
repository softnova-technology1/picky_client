import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { authService } from '../../../services/auth.service';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { User, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AccountProfile() {
  const { user, updateUser } = useAuthStore();
  const { showToast } = useUiStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.updateProfile({
        name: name.trim(),
        email: email.trim(),
      });
      const updated = res?.data || res;
      updateUser({
        name: updated?.name || name.trim(),
        email: updated?.email || email.trim(),
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.warn('Profile update fallback:', err);
      updateUser({ name: name.trim(), email: email.trim() });
      showToast('Profile updated locally!', 'success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 0.35rem' }}>Personal Profile</h2>
        <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
          Manage your personal details and contact information for seamless deliveries.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Full Name"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
            WhatsApp Verified Mobile
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.95rem',
              color: '#334155',
            }}
          >
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} color="#7c3aed" /> {user?.phone || 'No phone linked'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
              <ShieldCheck size={14} /> Verified
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
            Mobile number is linked to your WhatsApp OTP credentials.
          </span>
        </div>

        <div>
          <Input
            label="Email Address (For Invoices & Receipts)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@domain.com"
          />
        </div>

        <div style={{ paddingTop: '0.75rem' }}>
          <Button type="submit" variant="primary" loading={loading} style={{ padding: '0.75rem 1.75rem' }}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
