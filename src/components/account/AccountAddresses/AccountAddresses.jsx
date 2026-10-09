import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { authService } from '../../../services/auth.service';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Compass,
  Smartphone,
  Zap,
  Truck,
  ShieldCheck,
  Pencil,
} from 'lucide-react';
import styles from './AccountAddresses.module.css';

export default function AccountAddresses() {
  const { user, updateUser } = useAuthStore();
  const { showToast } = useUiStore();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch addresses from MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const res = await authService.getAddresses();
        const list = res?.data || res || [];
        const normList = Array.isArray(list)
          ? list.map((a) => ({
              ...a,
              id: a._id ? a._id.toString() : (a.id || `addr_${Math.random()}`),
            }))
          : [];
        if (isMounted) {
          setAddresses(normList);
        }
      } catch (err) {
        console.warn('Failed to fetch addresses from DB:', err);
        if (user?.addresses && Array.isArray(user.addresses)) {
          const normList = user.addresses.map((a) => ({
            ...a,
            id: a._id ? a._id.toString() : (a.id || `addr_${Math.random()}`),
          }));
          if (isMounted) setAddresses(normList);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAddresses();
    return () => {
      isMounted = false;
    };
  }, [user?._id || user?.id]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [editingAddr, setEditingAddr] = useState(null); // null = add new, object = editing existing
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

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenAdd = () => {
    setEditingAddr(null);
    setNewAddr({
      fullName: user?.name || '',
      phone: user?.phone ? user.phone.replace(/^\+91\s*/, '') : '',
      street: '',
      landmark: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: '',
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddr(addr);
    setNewAddr({ ...addr });
    setIsModalOpen(true);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) {
      showToast('Please fill in street address, city, and pincode', 'error');
      return;
    }

    try {
      const res = await authService.addAddress({
        fullName: newAddr.fullName,
        phone: newAddr.phone,
        street: newAddr.street,
        city: newAddr.city,
        state: newAddr.state,
        pincode: newAddr.pincode,
        landmark: newAddr.landmark,
        isDefault: newAddr.isDefault,
      });
      const resData = res?.data || res;
      const updatedList = (resData?.addresses || []).map((a) => ({
        ...a,
        id: a._id ? a._id.toString() : (a.id || `addr_${Math.random()}`),
      }));
      setAddresses(updatedList);
      if (updateUser) {
        updateUser({ addresses: resData?.addresses, defaultAddress: resData?.defaultAddress });
      }
      setIsModalOpen(false);
      showToast('Delivery address saved to database successfully!', 'success');
    } catch (err) {
      console.error('Failed to save address to DB:', err);
      showToast('Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = (id) => {
    setAddressToDelete(id);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      const res = await authService.deleteAddress(addressToDelete);
      const resData = res?.data || res;
      const updatedList = (resData?.addresses || []).map((a) => ({
        ...a,
        id: a._id ? a._id.toString() : (a.id || `addr_${Math.random()}`),
      }));
      setAddresses(updatedList);
      if (updateUser) {
        updateUser({ addresses: resData?.addresses, defaultAddress: resData?.defaultAddress });
      }
      showToast('Address removed from database', 'info');
    } catch (err) {
      console.error('Failed to delete address:', err);
      setAddresses((prev) => prev.filter((a) => a.id !== addressToDelete));
      showToast('Address removed', 'info');
    } finally {
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await authService.setDefaultAddress(id);
      const resData = res?.data || res;
      const updatedList = (resData?.addresses || []).map((a) => ({
        ...a,
        id: a._id ? a._id.toString() : (a.id || `addr_${Math.random()}`),
      }));
      setAddresses(updatedList);
      if (updateUser) {
        updateUser({ addresses: resData?.addresses, defaultAddress: resData?.defaultAddress });
      }
      showToast('Primary delivery address updated in database', 'success');
    } catch (err) {
      console.error('Failed to set default address:', err);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      showToast('Primary delivery address updated', 'success');
    }
  };

  return (
    <div className={styles.container}>
      {/* ── 1. Hero Showcase Banner (With 3D Background Image) ── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <MapPin size={13} /> Delivery Addresses
          </div>
          <h2 className={styles.heroTitle}>Saved Addresses</h2>
          <p className={styles.heroSubtitle}>
            Manage your delivery locations for fast, hassle-free doorstep delivery.
          </p>
        </div>

        <div className={styles.heroStatusCard}>
          <span className={styles.pulseDot} />
          <div>
            <div className={styles.statusLabel}>Saved Locations</div>
            <div className={styles.statusVal}>
              {addresses.length} {addresses.length === 1 ? 'Address Saved' : 'Addresses Saved'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Cards Grid ── */}
      <div className={styles.grid}>
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`${styles.addressCard} ${addr.isDefault ? styles.isDefault : styles.notDefault}`}
          >
            <div>
              {/* Card Top: Recipient Avatar, Name & Pincode Stamp */}
              <div className={styles.cardTop}>
                <div className={styles.recipientGroup}>
                  <div className={styles.avatarCircle}>
                    {getInitials(addr.fullName)}
                  </div>
                  <div>
                    <h4 className={styles.recipientName}>{addr.fullName || 'Receiver'}</h4>
                    {addr.isDefault && (
                      <span className={styles.primaryPill} style={{ marginTop: '0.25rem' }}>
                        <CheckCircle2 size={11} /> Primary
                      </span>
                    )}
                  </div>
                </div>

                {addr.pincode && (
                  <span className={styles.pincodeStamp}>
                    PIN • {addr.pincode}
                  </span>
                )}
              </div>

              {/* Address Details */}
              <div className={styles.addressDetails}>
                <p className={styles.addressRow}>
                  <MapPin size={16} className={styles.addressIcon} />
                  <span>
                    {addr.street}
                    {addr.landmark && `, near ${addr.landmark}`}
                    <br />
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </span>
                </p>

                {addr.phone && (
                  <div className={styles.phoneChip}>
                    <Smartphone size={13} style={{ color: '#7c3aed' }} />
                    <span>{addr.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer: Status & Actions */}
            <div className={styles.cardFooter}>
              {!addr.isDefault ? (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className={styles.setPrimaryBtn}
                >
                  Set as Primary
                </button>
              ) : (
                <span className={styles.primaryStatusText}>
                  <CheckCircle2 size={13} /> Active Primary
                </span>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(addr)}
                  className={styles.editBtn}
                  title="Edit address"
                >
                  <Pencil size={15} />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className={styles.deleteBtn}
                  title="Delete address"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Address Card Box */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpenAdd}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOpenAdd()}
          className={styles.addCard}
        >
          <div className={styles.addCardPortal}>
            <Plus size={28} />
          </div>
          <span className={styles.addCardTitle}>+ Add New Address</span>
          <span className={styles.addCardSubtitle}>Click to add a new home, office, or alternate delivery address</span>
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddr ? 'Edit Delivery Address' : 'Add Delivery Address'}
      >
        <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Recipient Full Name"
            value={newAddr.fullName}
            onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
            placeholder="Name of person receiving order"
            required
          />

          <Input
            label="Phone Number"
            value={newAddr.phone}
            onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
            placeholder="10-digit mobile number"
            type="tel"
            required
          />

          <Input
            label="Door / Flat / House No, Street Address"
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
              label="City / Town"
              value={newAddr.city}
              onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
              placeholder="e.g. Chennai / Madurai"
              required
            />
            <Input
              label="PIN Code"
              value={newAddr.pincode}
              onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
              placeholder="6-digit PIN"
              maxLength={6}
              required
            />
          </div>

          <Input
            label="State"
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
            <span>Set as my primary shipping address</span>
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

      <Modal isOpen={!!addressToDelete} onClose={() => setAddressToDelete(null)} title="Delete Address">
        <p style={{ margin: '0 0 1.5rem', color: '#475569' }}>
          Are you sure you want to delete this address?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={() => setAddressToDelete(null)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirmDeleteAddress} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
