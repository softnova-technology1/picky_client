import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_REVIEWS_MODERATION_DATA } from '../data/reviewsModerationMockData';

export const useReviewStore = create(
  persist(
    (set, get) => ({
      reviews: INITIAL_REVIEWS_MODERATION_DATA,

      // 1. Approve Review & Publish on Storefront
      approveReview: (id) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id ? { ...r, status: 'published' } : r
          ),
        }));
      },

      // 2. Reject Review
      rejectReview: (id, rejectionReason) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id
              ? { ...r, status: 'rejected', rejectionReason: rejectionReason || 'Content violates moderation guidelines' }
              : r
          ),
        }));
      },

      // 3. Flag Review as Spam
      flagReview: (id) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id ? { ...r, status: 'flagged' } : r
          ),
        }));
      },

      // 4. Delete Review
      deleteReview: (id) => {
        set((state) => ({
          reviews: state.reviews.filter((r) => r.id !== id),
        }));
      },

      // 5. Toggle Featured Review (e.g. pinned to Home Marquee)
      toggleFeatured: (id) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id ? { ...r, isFeatured: !r.isFeatured } : r
          ),
        }));
      },

      // 6. Add or Edit Official Admin Reply
      replyToReview: (id, { text, author = 'Picky Store Manager' }) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id
              ? {
                  ...r,
                  adminReply: {
                    author,
                    text,
                    repliedAt: new Date().toISOString(),
                  },
                }
              : r
          ),
        }));
      },

      // 7. Delete Admin Reply
      deleteReply: (id) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id ? { ...r, adminReply: null } : r
          ),
        }));
      },

      // 8. Bulk Approve
      bulkApprove: (ids) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            ids.includes(r.id) ? { ...r, status: 'published' } : r
          ),
        }));
      },

      // 9. Bulk Delete
      bulkDelete: (ids) => {
        set((state) => ({
          reviews: state.reviews.filter((r) => !ids.includes(r.id)),
        }));
      },

      // 10. Reset Store to Default Sample Data
      resetToDefault: () => set({ reviews: INITIAL_REVIEWS_MODERATION_DATA }),
    }),
    {
      name: 'picky_admin_reviews_v1',
    }
  )
);
