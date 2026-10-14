import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_RETURNS_DATA } from '../data/returnsMockData';

export const useReturnStore = create(
  persist(
    (set, get) => ({
      returns: INITIAL_RETURNS_DATA,

      // 1. Approve Return & Schedule Reverse Logistics
      approveReturn: (id, { courier, awbNumber, scheduledPickupDate }) => {
        set((state) => {
          const updated = state.returns.map((ret) => {
            if (ret.id === id) {
              const newTimeline = [
                ...ret.timeline,
                {
                  status: 'approved',
                  note: `Approved by Admin. Reverse pickup booked via ${courier} (AWB: ${awbNumber || 'Auto-assigned'}).`,
                  timestamp: new Date().toISOString(),
                },
              ];
              return {
                ...ret,
                status: 'approved',
                courier,
                awbNumber: awbNumber || `REV-${Date.now().toString(36).toUpperCase()}`,
                scheduledPickupDate: scheduledPickupDate || new Date().toISOString().slice(0, 10),
                timeline: newTimeline,
              };
            }
            return ret;
          });
          return { returns: updated };
        });
      },

      // 2. Mark Return In-Transit
      markInTransit: (id) => {
        set((state) => {
          const updated = state.returns.map((ret) => {
            if (ret.id === id) {
              return {
                ...ret,
                status: 'in_transit',
                timeline: [
                  ...ret.timeline,
                  {
                    status: 'in_transit',
                    note: `Item picked up by courier partner ${ret.courier || 'Reverse Express'} and in-transit to warehouse.`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              };
            }
            return ret;
          });
          return { returns: updated };
        });
      },

      // 3. Mark Inspected & Passed
      markInspected: (id, { note } = {}) => {
        set((state) => {
          const updated = state.returns.map((ret) => {
            if (ret.id === id) {
              return {
                ...ret,
                status: 'inspected',
                timeline: [
                  ...ret.timeline,
                  {
                    status: 'inspected',
                    note: note || 'Quality check passed: Original tags intact and unused condition verified.',
                    timestamp: new Date().toISOString(),
                  },
                ],
              };
            }
            return ret;
          });
          return { returns: updated };
        });
      },

      // 4. Trigger Razorpay Refund
      processRefund: (id, { refundAmount, razorpayRefundId, note } = {}) => {
        set((state) => {
          const updated = state.returns.map((ret) => {
            if (ret.id === id) {
              const rId = razorpayRefundId || `rfnd_${Math.random().toString(36).substring(2, 12)}`;
              const finalAmount = refundAmount || ret.item.refundAmount || ret.item.price;
              return {
                ...ret,
                status: 'refunded',
                refundStatus: 'completed',
                razorpayRefundId: rId,
                item: { ...ret.item, refundAmount: finalAmount },
                timeline: [
                  ...ret.timeline,
                  {
                    status: 'refunded',
                    note: note || `Instant Refund of ₹${finalAmount} processed to customer via Razorpay Gateway (Ref ID: ${rId}).`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              };
            }
            return ret;
          });
          return { returns: updated };
        });
      },

      // 5. Reject Return
      rejectReturn: (id, { rejectionReason }) => {
        set((state) => {
          const updated = state.returns.map((ret) => {
            if (ret.id === id) {
              return {
                ...ret,
                status: 'rejected',
                refundStatus: 'rejected',
                rejectionReason: rejectionReason || 'Product does not comply with 7-day return guidelines.',
                timeline: [
                  ...ret.timeline,
                  {
                    status: 'rejected',
                    note: `Return rejected by Store Admin. Reason: ${rejectionReason || 'Inspection criteria not satisfied.'}`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              };
            }
            return ret;
          });
          return { returns: updated };
        });
      },

      // 6. Reset or Add Return
      resetToDefault: () => set({ returns: INITIAL_RETURNS_DATA }),
    }),
    {
      name: 'picky_admin_returns_v1',
    }
  )
);
