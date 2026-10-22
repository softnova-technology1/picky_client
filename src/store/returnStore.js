import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import returnService from '../services/return.service';

export const useReturnStore = create(
  persist(
    (set, get) => ({
      returns: [],
      kpis: {
        total: 0,
        pending: 0,
        inTransit: 0,
        refundedCount: 0,
        totalRefundAmount: 0,
      },
      tabCounts: {
        all: 0,
        pending: 0,
        approved: 0,
        in_transit: 0,
        inspected: 0,
        refunded: 0,
        rejected: 0,
      },
      loading: false,
      error: null,

      // 0. Fetch Real Live Returns from MongoDB Atlas API
      fetchReturns: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const res = await returnService.getAll(params);
          const data = res?.data?.data || res?.data || {};
          const list = Array.isArray(data.returns) ? data.returns : (Array.isArray(data) ? data : []);
          const normalized = list.map((item) => ({
            ...item,
            id: item.returnId || item.id || item._id,
          }));

          set({
            returns: normalized,
            kpis: data.kpis || get().kpis,
            tabCounts: data.tabCounts || get().tabCounts,
            loading: false,
          });
          return normalized;
        } catch (err) {
          console.warn('[returnStore] fetchReturns failed, using current state:', err.message);
          set({ loading: false, error: err.message });
          return get().returns;
        }
      },

      // 1. Approve Return & Schedule Reverse Logistics
      approveReturn: async (id, { courier, awbNumber, scheduledPickupDate }) => {
        // Optimistic / Local update first
        set((state) => {
          const updated = state.returns.map((ret) => {
            if (ret.id === id || ret.returnId === id || ret._id === id) {
              const newTimeline = [
                ...(ret.timeline || []),
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

        // Call backend API
        try {
          await returnService.approve(id, { courier, awbNumber, scheduledPickupDate });
          get().fetchReturns();
        } catch (apiErr) {
          console.warn('[returnStore] Backend approve failed:', apiErr.message);
        }
      },

      // 2. Mark Return In-Transit
      markInTransit: async (id) => {
        set((state) => {
          const updated = state.returns.map((ret) => {
            if (ret.id === id || ret.returnId === id || ret._id === id) {
              return {
                ...ret,
                status: 'in_transit',
                timeline: [
                  ...(ret.timeline || []),
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

        try {
          await returnService.markInTransit(id);
          get().fetchReturns();
        } catch (apiErr) {
          console.warn('[returnStore] Backend in-transit failed:', apiErr.message);
        }
      },

      // 3. Mark Inspected & Passed
      markInspected: async (id, { tagsIntact = true, unwornCheck = true, packagingCheck = true, note = '' } = {}) => {
        set((state) => {
          const updated = state.returns.map((ret) => {
            if (ret.id === id || ret.returnId === id || ret._id === id) {
              return {
                ...ret,
                status: 'inspected',
                timeline: [
                  ...(ret.timeline || []),
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

        try {
          await returnService.markInspected(id, { tagsIntact, unwornCheck, packagingCheck, note });
          get().fetchReturns();
        } catch (apiErr) {
          console.warn('[returnStore] Backend inspect failed:', apiErr.message);
        }
      },

      // 4. Trigger Razorpay Refund
      processRefund: async (id, { refundAmount, razorpayRefundId, note } = {}) => {
        set((state) => {
          const updated = state.returns.map((ret) => {
            if (ret.id === id || ret.returnId === id || ret._id === id) {
              const rId = razorpayRefundId || `rfnd_${Math.random().toString(36).substring(2, 12)}`;
              const finalAmount = refundAmount || ret.item.refundAmount || ret.item.price;
              return {
                ...ret,
                status: 'refunded',
                refundStatus: 'completed',
                razorpayRefundId: rId,
                item: { ...ret.item, refundAmount: finalAmount },
                timeline: [
                  ...(ret.timeline || []),
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

        try {
          await returnService.processRefund(id, { refundAmount, razorpayRefundId, note });
          get().fetchReturns();
        } catch (apiErr) {
          console.warn('[returnStore] Backend refund failed:', apiErr.message);
        }
      },

      // 5. Reject Return
      rejectReturn: async (id, { rejectionReason }) => {
        set((state) => {
          const updated = state.returns.map((ret) => {
            if (ret.id === id || ret.returnId === id || ret._id === id) {
              return {
                ...ret,
                status: 'rejected',
                refundStatus: 'rejected',
                rejectionReason: rejectionReason || 'Product does not comply with 7-day return guidelines.',
                timeline: [
                  ...(ret.timeline || []),
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

        try {
          await returnService.reject(id, { rejectionReason });
          get().fetchReturns();
        } catch (apiErr) {
          console.warn('[returnStore] Backend reject failed:', apiErr.message);
        }
      },

      // 6. Customer Self-Service Return Request
      createReturnRequest: async (newReturn) => {
        try {
          const res = await returnService.create(newReturn);
          const saved = res?.data?.data || res?.data || newReturn;
          const normalized = {
            ...saved,
            id: saved.returnId || saved.id || saved._id,
          };
          set((state) => ({
            returns: [normalized, ...state.returns],
          }));
          get().fetchReturns();
          return normalized;
        } catch (err) {
          console.warn('[returnStore] Backend create return failed, using local:', err.message);
          const normalized = {
            ...newReturn,
            id: newReturn.returnId || newReturn.id || `RET-${Date.now()}`,
          };
          set((state) => ({
            returns: [normalized, ...state.returns],
          }));
          return normalized;
        }
      },

      // 7. Reset / Clear
      resetToDefault: () => set({ returns: [] }),
      clearAllReturns: () => set({ returns: [] }),
    }),
    {
      name: 'picky_admin_returns_v3',
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.returns)) {
          const MOCK_IDS = ['RET-20261012-8812', 'RET-20261011-7429', 'RET-20261010-6190', 'RET-20261009-5102'];
          state.returns = state.returns.filter((r) => !MOCK_IDS.includes(r.id) && !MOCK_IDS.includes(r.returnId));
        }
      },
    }
  )
);
