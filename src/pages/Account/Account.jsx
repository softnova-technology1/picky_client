import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import AccountProfile from '../../components/account/AccountProfile';
import AccountAddresses from '../../components/account/AccountAddresses';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  Search,
} from 'lucide-react';

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoadingOrders(true);
        const res = await orderService.list();
        const list = res?.data?.data || res?.data || [];
        setOrders(list);
      } catch (err) {
        console.warn('Account orders load error:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, []);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <PageWrapper>
      <div className="section" style={{ background: '#ffffff', minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          {/* Account Body Grid: Sidebar Nav + Tab Content */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
            {/* Left Navigation Sidebar */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                gridColumn: '1 / span 1',
              }}
            >
              <button
                onClick={() => handleTabChange('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentTab === 'profile' ? '#f3e8ff' : 'transparent',
                  color: currentTab === 'profile' ? '#6b21a8' : '#475569',
                  fontWeight: currentTab === 'profile' ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <User size={18} color={currentTab === 'profile' ? '#7c3aed' : '#64748b'} />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => handleTabChange('orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentTab === 'orders' ? '#f3e8ff' : 'transparent',
                  color: currentTab === 'orders' ? '#6b21a8' : '#475569',
                  fontWeight: currentTab === 'orders' ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Package size={18} color={currentTab === 'orders' ? '#7c3aed' : '#64748b'} />
                  <span>My Orders</span>
                </div>
                {orders.length > 0 && (
                  <span style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 700 }}>
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange('addresses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentTab === 'addresses' ? '#f3e8ff' : 'transparent',
                  color: currentTab === 'addresses' ? '#6b21a8' : '#475569',
                  fontWeight: currentTab === 'addresses' ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <MapPin size={18} color={currentTab === 'addresses' ? '#7c3aed' : '#64748b'} />
                <span>Saved Addresses</span>
              </button>

              <Link
                to="/wishlist"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  color: '#475569',
                  fontWeight: 500,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Heart size={18} color="#ec4899" />
                  <span>My Wishlist</span>
                </div>
                {wishlistItems.length > 0 && (
                  <span style={{ background: '#fce7f3', color: '#be185d', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 700 }}>
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <div style={{ height: '1px', background: '#f1f5f9', margin: '0.4rem 0' }} />

              <button
                onClick={() => setLogoutModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'transparent',
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <LogOut size={18} color="#ef4444" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Right Main Content Pane */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                border: '1px solid #f1f5f9',
                gridColumn: '2 / -1',
              }}
            >
              {/* TAB 1: MY ORDERS */}
              {currentTab === 'orders' && (
                <div>
                  <div style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 0.35rem' }}>My Orders</h2>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
                      Track current shipments and view historical invoices.
                    </p>
                  </div>

                  {loadingOrders ? (
                    <Spinner size={36} />
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                      <Package size={40} color="#7c3aed" style={{ marginBottom: '1rem' }} />
                      <h4 style={{ margin: '0 0 0.4rem', color: '#0f172a' }}>No orders found</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                        Browse our catalog of genuine fireworks and festive items.
                      </p>
                      <Link to="/products" className="btn btn-primary">
                        Browse Products Catalog
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {orders.map((order) => {
                        const totalFormatted = formatPrice(order.total ?? order.totalAmount ?? 0);
                        return (
                          <div
                            key={order._id}
                            style={{
                              border: '1.5px solid #e2e8f0',
                              borderRadius: '16px',
                              background: '#ffffff',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                              overflow: 'hidden',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {/* Card Header Bar */}
                            <div
                              style={{
                                background: '#f8fafc',
                                borderBottom: '1px solid #e2e8f0',
                                padding: '1rem 1.25rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.75rem',
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', display: 'block' }}>
                                  Order #{order.orderNumber}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                  Placed on {formatDate(order.createdAt)}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Badge status={order.status} />
                                <Link
                                  to={`/orders/${order._id}`}
                                  className="btn btn-primary btn-sm"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    fontSize: '0.82rem',
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: '8px',
                                  }}
                                >
                                  <Search size={14} /> Track Order
                                </Link>
                              </div>
                            </div>

                            {/* Card Items Body */}
                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              {order.items?.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    paddingBottom: idx !== order.items.length - 1 ? '1rem' : 0,
                                    borderBottom: idx !== order.items.length - 1 ? '1px dashed #f1f5f9' : 'none',
                                  }}
                                >
                                  <img
                                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160'}
                                    alt={item.name}
                                    style={{
                                      width: '56px',
                                      height: '56px',
                                      borderRadius: '10px',
                                      objectFit: 'cover',
                                      border: '1px solid #e2e8f0',
                                      flexShrink: 0,
                                    }}
                                  />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4
                                      style={{
                                        margin: '0 0 0.25rem',
                                        fontSize: '0.92rem',
                                        color: '#0f172a',
                                        fontWeight: 600,
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {item.name}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: '#64748b' }}>
                                      <span>Quantity: <strong style={{ color: '#334155' }}>{item.quantity}</strong></span>
                                      {item.price && (
                                        <span>• Price: <strong style={{ color: '#334155' }}>{formatPrice(item.price)}</strong></span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Card Footer Bar */}
                            <div
                              style={{
                                background: '#faf5ff',
                                borderTop: '1px solid #ede9fe',
                                padding: '0.85rem 1.25rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                              }}
                            >
                              <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                                Total Paid: <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{totalFormatted}</strong>
                              </div>

                              {order.trackingId ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#6d28d9', background: '#ede9fe', padding: '0.25rem 0.65rem', borderRadius: '6px', fontWeight: 600 }}>
                                  🚚 {order.courier || 'Express'}: {order.trackingId}
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                                  ✓ 100% Prepaid Verified
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PROFILE */}
              {currentTab === 'profile' && <AccountProfile />}

              {/* TAB 4: ADDRESSES */}
              {currentTab === 'addresses' && <AccountAddresses />}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <Modal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} title="Sign Out of Picky">
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            Are you sure you want to sign out? Your saved cart items and address book will remain securely synced when you return.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setLogoutModalOpen(false)}>
              Stay Signed In
            </Button>
            <Button variant="danger" onClick={handleConfirmLogout}>
              Yes, Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
