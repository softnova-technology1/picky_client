import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import StatusTimeline from '../../components/order/StatusTimeline';
import { adminService } from '../../services/admin.service';
import { useUiStore } from '../../store/uiStore';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';

const ADMIN = '/pickyadmin-softnova2026';
const COURIERS = ['DTDC Express', 'Blue Dart', 'Delhivery', 'Shadowfax', 'Ecom Express', 'India Post Speed Post'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { showToast } = useUiStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // AWB Entry state
  const [trackingId, setTrackingId] = useState('');
  const [courier, setCourier] = useState('DTDC Express');
  const [shipLoading, setShipLoading] = useState(false);

  // Status Change state
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const res = await adminService.getOrderDetail(id);
        const data = res?.data || res;
        setOrder(data);
        if (data.trackingId) setTrackingId(data.trackingId);
        if (data.courier) setCourier(data.courier);
        setNewStatus(data.status);
      } catch (err) {
        console.error('Failed to load order detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const handleShipOrder = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      showToast('Please enter an AWB tracking number', 'error');
      return;
    }

    try {
      setShipLoading(true);
      const res = await adminService.addTracking(id, { trackingId: trackingId.trim(), courier });
      const updated = res?.data || res;
      setOrder(updated);
      setNewStatus(updated.status);
      showToast('🚀 Order marked as Shipped! WhatsApp notification dispatched to customer.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update tracking', 'error');
    } finally {
      setShipLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setStatusLoading(true);
      const res = await adminService.updateOrderStatus(id, { status: newStatus, note: statusNote });
      const updated = res?.data || res;
      setOrder(updated);
      setStatusNote('');
      showToast(`Order status changed to "${newStatus}"!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Order Details">
        <Spinner size={40} />
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Details">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <h3>Order Not Found</h3>
          <Link to={`${ADMIN}/orders`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Orders
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Manage Order #${order.orderNumber}`}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to={`${ADMIN}/orders`} style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
          ← Back to Orders List
        </Link>
        <Badge status={order.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Shipment Actions & Order Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AWB & Dispatch Action Card */}
          <div className="card" style={{ border: '2px solid var(--color-primary)', background: '#faf5ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🚚</span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>
                Courier & AWB Tracking Entry
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#6b21a8', marginBottom: '1.25rem' }}>
              Entering the AWB number updates order to <strong>Shipped</strong> and automatically triggers a live WhatsApp notification to the customer.
            </p>

            <form onSubmit={handleShipOrder}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Courier Partner</label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="form-select"
                  >
                    {COURIERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="AWB Tracking ID"
                  placeholder="e.g. D123456789IN"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={shipLoading}
                block
                style={{ padding: '0.85rem' }}
              >
                {order.status === 'shipped' ? 'Update AWB & Re-notify ➔' : 'Mark as Shipped & Send WhatsApp ➔'}
              </Button>
            </form>
          </div>

          {/* Purchased Items List */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Ordered Items ({order.items?.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160'}
                    alt={item.name}
                    style={{ width: '55px', height: '55px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                      {item.name}
                    </strong>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                  <strong style={{ fontSize: '0.95rem' }}>
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Discount</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                <span>Total Amount (COD)</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Status Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Switcher Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Order Status Transition</h3>
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label className="form-label">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered (Triggers Delivered WhatsApp)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <Input
                label="Note / Comment"
                placeholder="e.g. Delivered to customer at reception"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />

              <Button
                type="submit"
                variant="secondary"
                loading={statusLoading}
                block
              >
                Update Status
              </Button>
            </form>
          </div>

          {/* Delivery Address Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Customer & Shipping Details</h3>
            <div style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.7 }}>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>Customer ID:</strong> {order.user?._id || order.user}<br />
                <strong>Order Date:</strong> {formatDate(order.createdAt)}
              </p>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#0f172a' }}>Delivery Address:</strong>
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.landmark && <span>Landmark: {order.shippingAddress.landmark}<br /></span>}
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </div>
            </div>

            {order.statusHistory && order.statusHistory.length > 0 && (
              <StatusTimeline statusHistory={order.statusHistory} />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
