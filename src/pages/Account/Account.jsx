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
  ShieldCheck,
  Truck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  LayoutDashboard,
} from 'lucide-react';

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
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

  // Find most recent active order for the dashboard widget
  const activeOrder = orders.find(
    (o) => o.status === 'confirmed' || o.status === 'shipped' || o.status === 'out_for_delivery'
  );

  return (
    <PageWrapper>
      <div className="section" style={{ background: '#ffffff', minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          {/* Top Profile Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1035 0%, #2e1065 60%, #4c1d95 100%)',
              color: '#ffffff',
              borderRadius: '24px',
              padding: 'clamp(1.5rem, 3vw, 2.25rem)',
              marginBottom: '2rem',
              boxShadow: '0 12px 36px rgba(76, 29, 149, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)',
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : <User size={28} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', color: '#ffffff' }}>
                    {user?.name || 'Valued Customer'}
                  </h1>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: '#e9d5ff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Verified Customer
                  </span>
                </div>
                <p style={{ margin: '0.35rem 0 0', color: '#c4b5fd', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📱 {user?.phone || 'No phone linked'}</span>
                  {user?.email && <span>• ✉️ {user.email}</span>}
                </p>
              </div>
            </div>

            <button
              onClick={() => setLogoutModalOpen(true)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                padding: '0.6rem 1.15rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>

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
                onClick={() => handleTabChange('overview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: currentTab === 'overview' ? '#f3e8ff' : 'transparent',
                  color: currentTab === 'overview' ? '#6b21a8' : '#475569',
                  fontWeight: currentTab === 'overview' ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <LayoutDashboard size={18} color={currentTab === 'overview' ? '#7c3aed' : '#64748b'} />
                <span>Account Overview</span>
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
              {/* TAB 1: OVERVIEW */}
              {currentTab === 'overview' && (
                <div>
                  {/* Active Order Highlight Widget */}
                  {activeOrder && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)',
                        border: '1.5px solid #d8b4fe',
                        borderRadius: '16px',
                        padding: '1.25rem 1.5rem',
                        marginBottom: '2rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#6d28d9', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            <Truck size={14} /> Active Shipment in Progress
                          </div>
                          <h4 style={{ margin: '0.25rem 0 0.15rem', fontSize: '1.1rem', color: '#0f172a' }}>
                            Order #{activeOrder.orderNumber}
                          </h4>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Placed on {formatDate(activeOrder.createdAt)} • Total: {formatPrice(activeOrder.totalAmount)}
                          </span>
                        </div>
                        <Link
                          to={`/orders/${activeOrder._id}`}
                          className="btn btn-primary"
                          style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <Search size={14} /> Track Live AWB
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Summary Metric Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Orders</span>
                      <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.6rem', color: '#0f172a' }}>{orders.length}</h3>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Wishlist Items</span>
                      <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.6rem', color: '#0f172a' }}>{wishlistItems.length}</h3>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>WhatsApp OTP Status</span>
                      <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ShieldCheck size={18} /> Verified
                      </h3>
                    </div>
                  </div>

                  {/* Recent Orders Snippet */}
                  <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Recent Orders</h3>
                    <button
                      onClick={() => handleTabChange('orders')}
                      style={{ background: 'none', border: 'none', color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      View All <ChevronRight size={14} />
                    </button>
                  </div>

                  {loadingOrders ? (
                    <Spinner size={30} />
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '14px' }}>
                      <p style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.92rem' }}>No orders placed yet.</p>
                      <Link to="/products" className="btn btn-primary btn-sm">
                        Start Shopping Now
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {orders.slice(0, 3).map((ord) => (
                        <div
                          key={ord._id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div>
                            <strong style={{ color: '#0f172a', fontSize: '0.95rem', display: 'block' }}>
                              #{ord.orderNumber}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {formatDate(ord.createdAt)} • {formatPrice(ord.totalAmount)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Badge status={ord.status} />
                            <Link to={`/orders/${ord._id}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
                              View ➔
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MY ORDERS */}
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
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            background: '#ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              flexWrap: 'wrap',
                              gap: '0.75rem',
                              borderBottom: '1px solid #f1f5f9',
                              paddingBottom: '0.85rem',
                              marginBottom: '0.85rem',
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Order Number</span>
                              <h4 style={{ margin: '0.1rem 0 0.2rem', fontSize: '1.05rem', color: '#0f172a' }}>
                                #{order.orderNumber}
                              </h4>
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Placed on {formatDate(order.createdAt)}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Badge status={order.status} />
                              <Link
                                to={`/orders/${order._id}`}
                                className="btn btn-outline btn-sm"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              >
                                <Search size={14} /> Track Order
                              </Link>
                            </div>
                          </div>

                          {/* Order items preview row */}
                          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {order.items?.map((item, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.65rem',
                                  minWidth: '200px',
                                  background: '#f8fafc',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0',
                                }}
                              >
                                <img
                                  src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120'}
                                  alt={item.name}
                                  style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                />
                                <div style={{ overflow: 'hidden' }}>
                                  <div style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.name}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderTop: '1px solid #f1f5f9',
                              paddingTop: '0.75rem',
                              marginTop: '0.75rem',
                              fontSize: '0.9rem',
                            }}
                          >
                            <span style={{ color: '#64748b' }}>Total Paid: <strong style={{ color: '#0f172a' }}>{formatPrice(order.totalAmount)}</strong></span>
                            {order.trackingId && (
                              <span style={{ color: '#7c3aed', fontSize: '0.82rem', fontWeight: 600 }}>
                                AWB: {order.trackingId}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
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
