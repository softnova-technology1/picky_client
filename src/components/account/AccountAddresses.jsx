import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { authService } from '../../services/auth.service';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building } from 'lucide-react';

const STORAGE_KEY = 'picky-saved-addresses';

export default function AccountAddresses() {
  const { user, updateUser } = useAuthStore();
  const { showToast } = useUiStore();

  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    // Seed default if user has defaultAddress
    if (user?.defaultAddress) {
      return [
        {
          id: 'addr_default',
          fullName: user?.name || 'Home Address',
          phone: user?.phone || '',
          street: user.defaultAddress.street || '',
          city: user.defaultAddress.city || '',
          state: user.defaultAddress.state || '',
          pincode: user.defaultAddress.pincode || '',
          landmark: user.defaultAddress.landmark || '',
          isDefault: true,
        },
      ];
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    landmark: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    isDefault: addresses.length === 0,
  });

  const saveToStorage = (list) => {
    setAddresses(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  };

  const handleOpenAdd = () => {
    setNewAddr({
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '',
      landmark: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: '',
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) {
      showToast('Please fill in street address, city, and pincode', 'error');
      return;
    }

    const created = {
      id: `addr_${Date.now()}`,
      ...newAddr,
    };

    let updatedList = [];
    if (created.isDefault) {
      updatedList = addresses.map((a) => ({ ...a, isDefault: false }));
      updatedList.unshift(created);
    } else {
      updatedList = [...addresses, created];
    }

    saveToStorage(updatedList);
    setIsModalOpen(false);
    showToast('Delivery address saved successfully!', 'success');

    // Optionally sync default address to backend profile
    if (created.isDefault) {
      authService.updateProfile({
        defaultAddress: {
          street: created.street,
          city: created.city,
          state: created.state,
          pincode: created.pincode,
          landmark: created.landmark,
        },
      }).catch(() => null);
    }
  };

  const handleDeleteAddress = (id) => {
    const next = addresses.filter((a) => a.id !== id);
    if (next.length > 0 && !next.some((a) => a.isDefault)) {
      next[0].isDefault = true;
    }
    saveToStorage(next);
    showToast('Address removed', 'info');
  };

  const handleSetDefault = (id) => {
    const next = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveToStorage(next);
    const def = next.find((a) => a.id === id);
    if (def) {
      authService.updateProfile({
        defaultAddress: {
          street: def.street,
          city: def.city,
          state: def.state,
          pincode: def.pincode,
          landmark: def.landmark,
        },
      }).catch(() => null);
    }
    showToast('Default delivery address updated', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 0.35rem' }}>Address Book</h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
            Saved delivery locations for faster 1-click checkout.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          variant="primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem' }}
        >
          <Plus size={16} /> Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '2px dashed #e2e8f0',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#faf5ff',
              color: '#7c3aed',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <MapPin size={26} />
          </div>
          <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', color: '#0f172a' }}>No addresses saved yet</h4>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
            Add your shipping address so you don&rsquo;t have to type it every time you order festival items.
          </p>
          <Button onClick={handleOpenAdd} variant="primary" style={{ padding: '0.65rem 1.25rem' }}>
            + Add First Address
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {addresses.map((addr) => (
            <div
              key={addr.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: addr.isDefault ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: addr.isDefault ? '0 8px 24px rgba(124, 58, 237, 0.1)' : '0 2px 8px rgba(0,0,0,0.02)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                    {addr.fullName || 'Receiver'}
                  </span>
                  {addr.isDefault && (
                    <span
                      style={{
                        background: '#f3e8ff',
                        color: '#7c3aed',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Default
                    </span>
                  )}
                </div>

                <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                  {addr.street}
                  {addr.landmark && `, near ${addr.landmark}`}
                  <br />
                  {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                </p>

                {addr.phone && (
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
                    📱 Phone: {addr.phone}
                  </p>
                )}
              </div>

              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.85rem',
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7c3aed',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Set as Default
                  </button>
                ) : (
                  <span style={{ color: '#059669', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={13} /> Active Default
                  </span>
                )}

                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Delete address"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Delivery Address">
        <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Recipient Full Name *"
            value={newAddr.fullName}
            onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
            placeholder="Name of person receiving order"
            required
          />

          <Input
            label="Phone Number *"
            value={newAddr.phone}
            onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
            placeholder="10-digit mobile number"
            type="tel"
            required
          />

          <Input
            label="Door / Flat / House No, Street Address *"
            value={newAddr.street}
            onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
            placeholder="e.g. 14/2, Anna Street, Gandhi Nagar"
            required
          />

          <Input
            label="Landmark (Optional)"
            value={newAddr.landmark}
            onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
            placeholder="e.g. Near Bus Stand, Opposite Temple"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="City / Town *"
              value={newAddr.city}
              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
              placeholder="e.g. Chennai / Madurai"
              required
            />
            <Input
              label="PIN Code *"
              value={newAddr.pincode}
              onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
              placeholder="6-digit PIN"
              maxLength={6}
              required
            />
          </div>

          <Input
            label="State *"
            value={newAddr.state}
            onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
            placeholder="State"
            required
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#334155', cursor: 'pointer', marginTop: '0.25rem' }}>
            <input
              type="checkbox"
              checked={newAddr.isDefault}
              onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
              style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
            />
            <span>Set as my default shipping address</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
