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
  Truck,
  CheckCircle2,
  Filter,
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
  const [orderFilter, setOrderFilter] = useState('all');

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

  const userInitials = user?.name
    ? user.name
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ME';

  return (
    <PageWrapper>
      <style>{`
        .account-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 1.25rem;
          border-radius: 14px;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          outline: none;
          border: 1.5px solid transparent;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          user-select: none;
        }
        .account-tab-btn:hover {
          transform: translateY(-2px);
        }
        .account-tab-inactive {
          background: #ffffff;
          color: #475569;
          border-color: #e2e8f0;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
        }
        .account-tab-inactive:hover {
          background: #faf5ff;
          color: #6d28d9;
          border-color: #c4b5fd;
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.1);
        }
        .account-tab-active {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #ffffff !important;
          border-color: #6d28d9;
          box-shadow: 0 8px 20px -3px rgba(124, 58, 237, 0.38);
        }
        .account-logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.15rem;
          border-radius: 12px;
          border: 1.5px solid #fecaca;
          background: #fff1f2;
          color: #e11d48;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .account-logout-btn:hover {
          background: #ffe4e6;
          border-color: #fda4af;
          color: #be123c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.12);
        }
        .account-tabs-row::-webkit-scrollbar {
          display: none;
        }
        .account-tabs-row {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .order-card-box {
          border: 1.5px solid #e2e8f0;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .order-card-box:hover {
          transform: translateY(-2px);
          border-color: #c4b5fd;
          box-shadow: 0 14px 30px -8px rgba(124, 58, 237, 0.12);
        }
        .order-track-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #ffffff !important;
          padding: 0.6rem 1.25rem;
          border-radius: 12px;
          font-size: 0.86rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
          border: 1px solid #6d28d9;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }
        .order-track-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 20px rgba(124, 58, 237, 0.45);
          background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
        }
      `}</style>

      <div className="section" style={{ background: 'linear-gradient(135deg, #faf7ff 0%, #f4effe 50%, #f8f5fe 100%)', minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          {/* Executive Top Profile Header & Navigation Bar */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '1.5rem 1.75rem',
              marginBottom: '2rem',
              boxShadow: '0 15px 35px -10px rgba(124, 58, 237, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
              border: '1.5px solid rgba(221, 214, 254, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Top Row: User Identity & Sign Out */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              {/* User Avatar + Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    boxShadow: '0 8px 20px -4px rgba(124, 58, 237, 0.4)',
                    border: '3px solid #ffffff',
                    flexShrink: 0,
                  }}
                >
                  {userInitials}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                      {user?.name || 'My Account'}
                    </h2>
                  </div>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                    {user?.phone ? `📱 +91 ${user.phone}` : user?.email || 'Manage your orders, profile & delivery addresses'}
                  </p>
                </div>
              </div>

              {/* Sign Out Action Button */}
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="account-logout-btn"
                title="Sign out of your account"
              >
                <LogOut size={16} color="#e11d48" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div style={{ height: '1px', background: 'rgba(226, 232, 240, 0.85)', width: '100%' }} />

            {/* Horizontal Segmented Navigation Tabs */}
            <div
              className="account-tabs-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                overflowX: 'auto',
                paddingBottom: '0.2rem',
              }}
            >
              {/* Tab 1: Profile */}
              <button
                onClick={() => handleTabChange('profile')}
                className={`account-tab-btn ${currentTab === 'profile' ? 'account-tab-active' : 'account-tab-inactive'}`}
              >
                <User size={18} color={currentTab === 'profile' ? '#ffffff' : '#7c3aed'} />
                <span>My Profile</span>
              </button>

              {/* Tab 2: Orders */}
              <button
                onClick={() => handleTabChange('orders')}
                className={`account-tab-btn ${currentTab === 'orders' ? 'account-tab-active' : 'account-tab-inactive'}`}
              >
                <Package size={18} color={currentTab === 'orders' ? '#ffffff' : '#7c3aed'} />
                <span>My Orders</span>
                {orders.length > 0 && (
                  <span
                    style={{
                      background: currentTab === 'orders' ? 'rgba(255, 255, 255, 0.25)' : '#ede9fe',
                      color: currentTab === 'orders' ? '#ffffff' : '#6d28d9',
                      fontSize: '0.74rem',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px',
                      fontWeight: 700,
                    }}
                  >
                    {orders.length}
                  </span>
                )}
              </button>

              {/* Tab 3: Addresses */}
              <button
                onClick={() => handleTabChange('addresses')}
                className={`account-tab-btn ${currentTab === 'addresses' ? 'account-tab-active' : 'account-tab-inactive'}`}
              >
                <MapPin size={18} color={currentTab === 'addresses' ? '#ffffff' : '#7c3aed'} />
                <span>Saved Addresses</span>
              </button>

              {/* Tab 4: Wishlist Link */}
              <Link
                to="/wishlist"
                className="account-tab-btn account-tab-inactive"
                style={{
                  border: '1.5px solid #e2e8f0',
                }}
              >
                <Heart size={18} color="#ec4899" fill={wishlistItems.length > 0 ? '#ec4899' : 'none'} />
                <span>My Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span
                    style={{
                      background: '#fce7f3',
                      color: '#be185d',
                      fontSize: '0.74rem',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px',
                      fontWeight: 700,
                    }}
                  >
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Main Tab Content Area */}
          <div className="account-main-content" style={{ width: '100%' }}>
              {/* TAB 1: MY ORDERS */}
              {currentTab === 'orders' && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.94)',
                    borderRadius: '24px',
                    padding: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                    boxShadow: '0 15px 35px -10px rgba(124, 58, 237, 0.08)',
                    border: '1.5px solid rgba(221, 214, 254, 0.75)',
                  }}
                >
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 0.35rem' }}>My Orders</h2>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
                      Track current shipments and view your order history.
                    </p>
                  </div>

                  {/* ── Order Status Filter Chips ── */}
                  {!loadingOrders && orders.length > 0 && (() => {
                    const filterOptions = [
                      { key: 'all', label: 'All Orders', color: '#7c3aed', bg: '#ede9fe', activeBg: 'linear-gradient(135deg, #7c3aed, #6d28d9)', activeColor: '#fff' },
                      { key: 'confirmed', label: 'Confirmed', color: '#0369a1', bg: '#e0f2fe', activeBg: 'linear-gradient(135deg, #0284c7, #0369a1)', activeColor: '#fff' },
                      { key: 'packing', label: 'Packing', color: '#7c3aed', bg: '#f3e8ff', activeBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', activeColor: '#fff' },
                      { key: 'shipped', label: 'Shipping', color: '#b45309', bg: '#fef3c7', activeBg: 'linear-gradient(135deg, #d97706, #b45309)', activeColor: '#fff' },
                      { key: 'delivered', label: 'Delivered', color: '#15803d', bg: '#dcfce7', activeBg: 'linear-gradient(135deg, #16a34a, #15803d)', activeColor: '#fff' },
                      { key: 'cancelled', label: 'Cancelled', color: '#b91c1c', bg: '#fee2e2', activeBg: 'linear-gradient(135deg, #dc2626, #b91c1c)', activeColor: '#fff' },
                    ];
                    return (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          marginBottom: '1.5rem',
                          padding: '0.85rem 1rem',
                          background: '#f8fafc',
                          borderRadius: '14px',
                          border: '1.5px solid #f1f5f9',
                        }}
                      >
                        <Filter size={14} color="#94a3b8" style={{ marginRight: '0.25rem', flexShrink: 0 }} />
                        {filterOptions.map((opt) => {
                          const isActive = orderFilter === opt.key;
                          const statusCount = opt.key === 'all'
                            ? orders.length
                            : orders.filter((o) => {
                                const st = (o.status || '').toLowerCase();
                                if (opt.key === 'shipped') return st === 'shipped' || st === 'out_for_delivery';
                                return st === opt.key;
                              }).length;
                          if (opt.key !== 'all' && statusCount === 0) return null;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => setOrderFilter(opt.key)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.38rem 0.85rem',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: 'none',
                                outline: 'none',
                                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                                background: isActive ? opt.activeBg : opt.bg,
                                color: isActive ? opt.activeColor : opt.color,
                                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                                transform: isActive ? 'translateY(-1px)' : 'none',
                              }}
                            >
                              {opt.label}
                              <span
                                style={{
                                  background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)',
                                  borderRadius: '999px',
                                  padding: '0 0.4rem',
                                  fontSize: '0.72rem',
                                }}
                              >
                                {statusCount}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {loadingOrders ? (
                    <Spinner size={36} />
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                      <Package size={40} color="#7c3aed" style={{ marginBottom: '1rem' }} />
                      <h4 style={{ margin: '0 0 0.4rem', color: '#0f172a' }}>No orders yet</h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                        Discover our authentic Tamil traditional crafts and place your first order!
                      </p>
                      <Link to="/shop" className="btn btn-primary">
                        Shop Now
                      </Link>
                    </div>
                  ) : (() => {
                    const filteredOrders = orderFilter === 'all'
                      ? orders
                      : orders.filter((o) => {
                          const st = (o.status || '').toLowerCase();
                          if (orderFilter === 'shipped') return st === 'shipped' || st === 'out_for_delivery';
                          return st === orderFilter;
                        });
                    return filteredOrders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                        <Package size={32} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                          No <strong>{orderFilter}</strong> orders found.
                        </p>
                      </div>
                    ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {filteredOrders.map((order) => {
                        const totalFormatted = formatPrice(order.total ?? order.totalAmount ?? 0);
                        return (
                          <div
                            key={order._id}
                            className="order-card-box"
                          >
                            {/* Card Header Bar */}
                            <div
                              style={{
                                background: 'linear-gradient(135deg, #fbfaff 0%, #f8fafc 100%)',
                                borderBottom: '1px solid #e2e8f0',
                                padding: '1rem 1.35rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.85rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: '#f3e8ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#7c3aed',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Package size={20} />
                                </div>
                                <div>
                                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', display: 'block', letterSpacing: '-0.01em' }}>
                                    Order #{order.orderNumber}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    Placed on {formatDate(order.createdAt)}
                                  </span>
                                </div>
                              </div>

                              {/* Prominent, Uncluttered Status Badge */}
                              <div>
                                <Badge status={order.status} />
                              </div>
                            </div>

                            {/* Card Items Body */}
                            <div style={{ padding: '1.25rem 1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                                      width: '60px',
                                      height: '60px',
                                      borderRadius: '12px',
                                      objectFit: 'cover',
                                      border: '1.5px solid #ede9fe',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                      flexShrink: 0,
                                    }}
                                  />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4
                                      style={{
                                        margin: '0 0 0.35rem',
                                        fontSize: '0.94rem',
                                        color: '#0f172a',
                                        fontWeight: 600,
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {item.name}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                                      <span
                                        style={{
                                          background: '#f8fafc',
                                          border: '1px solid #e2e8f0',
                                          color: '#475569',
                                          fontSize: '0.78rem',
                                          fontWeight: 600,
                                          padding: '0.15rem 0.55rem',
                                          borderRadius: '6px',
                                        }}
                                      >
                                        Qty: {item.quantity}
                                      </span>
                                      {item.price && (
                                        <span style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.92rem' }}>
                                          {formatPrice(item.price)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Card Footer Bar - With Track Order on the Right */}
                            <div
                              style={{
                                background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)',
                                borderTop: '1px solid #ede9fe',
                                padding: '1rem 1.35rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.85rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                                  Total Paid:{' '}
                                  <strong style={{ color: '#0f172a', fontSize: '1.15rem', fontWeight: 800, marginLeft: '0.2rem' }}>
                                    {totalFormatted}
                                  </strong>
                                </div>

                                {order.trackingId ? (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#6d28d9', background: '#ede9fe', border: '1px solid #ddd6fe', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: 600 }}>
                                    🚚 {order.courier || 'Express'}: {order.trackingId}
                                  </div>
                                ) : (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: 600 }}>
                                    ✓ 100% Prepaid Verified
                                  </span>
                                )}
                              </div>

                              {/* Right: Prominent Track Order Button */}
                              <Link
                                to={`/orders/${order._id}`}
                                className="order-track-btn"
                              >
                                <Truck size={15} strokeWidth={2.5} />
                                <span>Track Order</span>
                                <span style={{ fontSize: '0.95rem', marginLeft: '0.1rem' }}>→</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 3: PROFILE */}
              {currentTab === 'profile' && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.94)',
                    borderRadius: '24px',
                    padding: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                    boxShadow: '0 15px 35px -10px rgba(124, 58, 237, 0.08)',
                    border: '1.5px solid rgba(221, 214, 254, 0.75)',
                  }}
                >
                  <AccountProfile />
                </div>
              )}

              {/* TAB 4: ADDRESSES */}
              {currentTab === 'addresses' && <AccountAddresses />}
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
