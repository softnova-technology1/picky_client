import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useOrderStore } from '../../store/orderStore';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import AccountProfile from '../../components/account/AccountProfile';
import AccountAddresses from '../../components/account/AccountAddresses';
import styles from './Account.module.css';
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
        const res = await orderService.list().catch(() => null);
        const serverList = res?.data?.data || res?.data || [];
        setOrders(Array.isArray(serverList) ? serverList : []);
      } catch (err) {
        console.warn('Account orders load error:', err);
        const fallback = useOrderStore.getState().orders || [];
        setOrders(fallback);
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
      <div className="section" style={{ background: 'linear-gradient(135deg, #faf7ff 0%, #f4effe 50%, #f8f5fe 100%)', minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          {/* Executive Top Profile Header & Navigation Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              onClick={() => setLogoutModalOpen(true)}
              className={styles.accountLogoutBtn}
              title="Sign out of your account"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>

          <div className={styles.profileBanner}>
            {/* User Avatar + Details */}
            <div className={styles.avatar3d}>
              {userInitials}
              <div className={styles.statusDot}></div>
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {user?.name || 'My Account'}
              </h2>
            </div>
          </div>

          {/* Horizontal Segmented Navigation Tabs */}
          <div className={styles.accountTabsRow}>
            {/* Tab 1: Profile */}
            <button
              onClick={() => handleTabChange('profile')}
              className={`${styles.accountTabBtn} ${currentTab === 'profile' ? styles.accountTabActive : styles.accountTabInactive}`}
            >
              <User size={18} color={currentTab === 'profile' ? '#ffffff' : '#7c3aed'} />
              <span>My Profile</span>
            </button>

            {/* Tab 2: Orders */}
            <button
              onClick={() => handleTabChange('orders')}
              className={`${styles.accountTabBtn} ${currentTab === 'orders' ? styles.accountTabActive : styles.accountTabInactive}`}
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
              className={`${styles.accountTabBtn} ${currentTab === 'addresses' ? styles.accountTabActive : styles.accountTabInactive}`}
            >
              <MapPin size={18} color={currentTab === 'addresses' ? '#ffffff' : '#7c3aed'} />
              <span>Saved Addresses</span>
            </button>

            {/* Tab 4: Wishlist Link */}
            <Link
              to="/wishlist"
              className={`${styles.accountTabBtn} ${styles.accountTabInactive}`}
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

          {/* Main Tab Content Area */}
          <div key={currentTab} className={`account-main-content ${styles.tabContentSwap}`} style={{ width: '100%' }}>
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
                  {/* ── Top Header Row with 3D Illustration ── */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '18px',
                          background: '#f3e8ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#7c3aed',
                          flexShrink: 0,
                          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.15)',
                        }}
                      >
                        <Package size={26} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e1b4b', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
                          My Orders
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.94rem', margin: 0, fontWeight: 500 }}>
                          Track current shipments and view your order history.
                        </p>
                      </div>
                    </div>

                    {/* Floating 3D Box Header Graphic */}
                    <div style={{ position: 'relative', pointerEvents: 'none' }}>
                      <img
                        src="/orders-header-box.png"
                        alt="3D Orders Box"
                        style={{
                          width: '130px',
                          height: '130px',
                          objectFit: 'contain',
                          mixBlendMode: 'multiply',
                          filter: 'drop-shadow(0 8px 16px rgba(124, 58, 237, 0.12))'
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Order Status Filter Chips (Exact Pill Bar) ── */}
                  {!loadingOrders && orders.length > 0 && (() => {
                    const filterOptions = [
                      { key: 'all', label: 'All Orders', icon: Package, color: '#7c3aed', bg: '#ede9fe', activeBg: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', activeColor: '#ffffff' },
                      { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: '#0369a1', bg: '#e0f2fe', activeBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', activeColor: '#ffffff' },
                      { key: 'shipped', label: 'Shipping', icon: Truck, color: '#b45309', bg: '#fef3c7', activeBg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', activeColor: '#ffffff' },
                      { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: '#15803d', bg: '#dcfce7', activeBg: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', activeColor: '#ffffff' },
                    ];
                    return (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                          marginBottom: '2rem',
                          padding: '0.65rem 0.85rem',
                          background: '#ffffff',
                          borderRadius: '20px',
                          border: '1.5px solid #f1f5f9',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        {filterOptions.map((opt) => {
                          const isActive = orderFilter === opt.key;
                          const statusCount = opt.key === 'all'
                            ? orders.length
                            : orders.filter((o) => {
                                const st = (o.status || '').toLowerCase();
                                if (opt.key === 'shipped') return st === 'shipped' || st === 'out_for_delivery';
                                return st === opt.key;
                              }).length;
                          const IconComp = opt.icon;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => setOrderFilter(opt.key)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.55rem 1.15rem',
                                borderRadius: '999px',
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: 'none',
                                outline: 'none',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                background: isActive ? opt.activeBg : opt.bg,
                                color: isActive ? opt.activeColor : opt.color,
                                boxShadow: isActive ? '0 4px 14px rgba(124, 58, 237, 0.35)' : 'none',
                                transform: isActive ? 'translateY(-1px)' : 'none',
                              }}
                            >
                              <IconComp size={15} />
                              <span>{opt.label}</span>
                              <span
                                style={{
                                  background: isActive ? '#ffffff' : 'rgba(0, 0, 0, 0.08)',
                                  color: isActive ? '#7c3aed' : opt.color,
                                  borderRadius: '999px',
                                  padding: '0.1rem 0.55rem',
                                  fontSize: '0.76rem',
                                  fontWeight: 800,
                                  minWidth: '18px',
                                  textAlign: 'center',
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                      {filteredOrders.map((order) => {
                        const totalFormatted = formatPrice(order.total ?? order.totalAmount ?? 0);
                        const isShipping = (order.status || '').toLowerCase() === 'shipped' || (order.status || '').toLowerCase() === 'out_for_delivery';
                        const isConfirmed = (order.status || '').toLowerCase() === 'confirmed';
                        
                        return (
                          <div
                            key={order._id}
                            style={{
                              position: 'relative',
                              borderRadius: '24px',
                              background: '#ffffff',
                              boxShadow: '0 15px 35px -10px rgba(124, 58, 237, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
                              border: '1.5px solid rgba(221, 214, 254, 0.75)',
                              overflow: 'hidden',
                              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                          >
                            {/* Left Accent Bar */}
                            <div
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '5px',
                                background: isShipping ? '#f59e0b' : isConfirmed ? '#3b82f6' : 'linear-gradient(180deg, #7c3aed 0%, #4f46e5 100%)',
                              }}
                            />

                            {/* Card Header Bar */}
                            <div
                              style={{
                                background: 'linear-gradient(135deg, #f8faff 0%, #f4f3ff 100%)',
                                borderBottom: '1px solid #f1f5f9',
                                padding: '1.15rem 1.6rem 1.15rem 1.8rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <div
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '14px',
                                    background: '#f3e8ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#7c3aed',
                                    flexShrink: 0,
                                    boxShadow: '0 3px 10px rgba(124, 58, 237, 0.12)',
                                  }}
                                >
                                  {isShipping ? <Truck size={20} color="#d97706" /> : <Package size={20} />}
                                </div>
                                <div>
                                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', display: 'block', letterSpacing: '-0.01em' }}>
                                    Order #{order.orderNumber}
                                  </span>
                                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                                    Placed on {formatDate(order.createdAt)}
                                  </span>
                                </div>
                              </div>

                              {/* Prominent Status Pill matching design */}
                              <div>
                                {isShipping ? (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.45rem',
                                      padding: '0.45rem 1.1rem',
                                      borderRadius: '999px',
                                      background: '#fff8e6',
                                      border: '1.5px solid #ffe0b2',
                                      color: '#d97706',
                                      fontSize: '0.8rem',
                                      fontWeight: 800,
                                      letterSpacing: '0.02em',
                                      boxShadow: '0 2px 8px rgba(217, 119, 6, 0.1)',
                                    }}
                                  >
                                    <Truck size={14} /> ORDER SHIPPING &gt;
                                  </span>
                                ) : isConfirmed ? (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.45rem',
                                      padding: '0.45rem 1.1rem',
                                      borderRadius: '999px',
                                      background: '#e6fffa',
                                      border: '1.5px solid #a7f3d0',
                                      color: '#0d9488',
                                      fontSize: '0.8rem',
                                      fontWeight: 800,
                                      letterSpacing: '0.02em',
                                      boxShadow: '0 2px 8px rgba(13, 148, 136, 0.1)',
                                    }}
                                  >
                                    <CheckCircle2 size={14} /> ORDER CONFIRMED &gt;
                                  </span>
                                ) : (
                                  <Badge status={order.status} />
                                )}
                              </div>
                            </div>

                            {/* Card Items Body */}
                            <div style={{ padding: '1.4rem 1.6rem 1.4rem 1.8rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                              {order.items?.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    paddingBottom: idx !== order.items.length - 1 ? '1.25rem' : 0,
                                    borderBottom: idx !== order.items.length - 1 ? '1px dashed #e2e8f0' : 'none',
                                  }}
                                >
                                  <img
                                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160'}
                                    alt={item.name}
                                    style={{
                                      width: '76px',
                                      height: '76px',
                                      borderRadius: '16px',
                                      objectFit: 'cover',
                                      border: '1.5px solid #ede9fe',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                                      flexShrink: 0,
                                    }}
                                  />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4
                                      style={{
                                        margin: '0 0 0.45rem',
                                        fontSize: '1rem',
                                        color: '#0f172a',
                                        fontWeight: 700,
                                        lineHeight: 1.4,
                                        letterSpacing: '-0.01em',
                                      }}
                                    >
                                      {item.name}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                                      <span
                                        style={{
                                          background: '#f1f5f9',
                                          color: '#64748b',
                                          fontSize: '0.8rem',
                                          fontWeight: 600,
                                          padding: '0.2rem 0.65rem',
                                          borderRadius: '8px',
                                        }}
                                      >
                                        Qty: {item.quantity}
                                      </span>
                                      {item.price && (
                                        <span style={{ color: '#7c3aed', fontWeight: 800, fontSize: '1.05rem' }}>
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
                                background: 'linear-gradient(135deg, #f8faff 0%, #f4f3ff 100%)',
                                borderTop: '1px solid #f1f5f9',
                                padding: '1.15rem 1.6rem 1.15rem 1.8rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                                <div style={{ fontSize: '0.94rem', color: '#64748b', fontWeight: 500 }}>
                                  Total Paid:{' '}
                                  <strong style={{ color: '#0f172a', fontSize: '1.35rem', fontWeight: 800, marginLeft: '0.35rem' }}>
                                    {totalFormatted}
                                  </strong>
                                </div>

                                {order.trackingId && (
                                  <>
                                    <div style={{ height: '24px', width: '1px', background: '#cbd5e1' }} />
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#6d28d9', background: '#ede9fe', border: '1px solid #ddd6fe', padding: '0.35rem 0.85rem', borderRadius: '999px', fontWeight: 700, boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)' }}>
                                      💳 {order.courier || 'Express'}: {order.trackingId}
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Right: Prominent Track Order Button */}
                              <Link
                                to={`/orders/${order._id}`}
                                className={styles.orderTrackBtn}
                                style={{
                                  borderRadius: '16px',
                                  padding: '0.65rem 1.4rem',
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                                }}
                              >
                                <Truck size={16} strokeWidth={2.5} />
                                <span>Track Order</span>
                                <span style={{ fontSize: '1rem', marginLeft: '0.15rem' }}>→</span>
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
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '28px',
                    padding: 'clamp(2rem, 4vw, 3rem)',
                    boxShadow: '0 20px 40px -15px rgba(124, 58, 237, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
                    border: '1.5px solid rgba(221, 214, 254, 0.75)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Dot pattern decorative element */}
                  <div style={{ position: 'absolute', top: '1.75rem', right: '1.75rem', display: 'grid', gridTemplateColumns: 'repeat(4, 5px)', gap: '6px', opacity: 0.4 }}>
                    {Array(16).fill(0).map((_, i) => (
                       <div key={i} style={{ width: '5px', height: '5px', background: '#a78bfa', borderRadius: '50%' }} />
                    ))}
                  </div>
                  
                  {/* Soft Radial Glow behind decoration */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '-20px', 
                      right: '-20px', 
                      width: '260px', 
                      height: '260px', 
                      background: 'radial-gradient(circle, rgba(221, 214, 254, 0.45) 0%, rgba(255, 255, 255, 0) 70%)', 
                      borderRadius: '50%',
                      pointerEvents: 'none'
                    }} 
                  />

                  {/* Generated 3D e-commerce profile decoration on bottom right */}
                  <div style={{ position: 'absolute', bottom: '5px', right: '15px', pointerEvents: 'none', zIndex: 0 }}>
                    <img 
                      src="/profile-corner-3d.png" 
                      alt="Profile 3D Decoration" 
                      style={{ 
                        width: '200px', 
                        height: '200px', 
                        objectFit: 'contain', 
                        mixBlendMode: 'multiply',
                        filter: 'contrast(105%) brightness(102%) drop-shadow(0 10px 20px rgba(124, 58, 237, 0.1))' 
                      }} 
                    />
                  </div>

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
