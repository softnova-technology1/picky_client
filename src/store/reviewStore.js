import { create } from 'zustand';
import { reviewService } from '../services/review.service';
import { INITIAL_REVIEWS_MODERATION_DATA } from '../data/reviewsModerationMockData';

const VIEWED_REVIEWS_STORAGE_KEY = 'picky_admin_viewed_review_ids';
const LAST_VIEWED_TIME_KEY = 'picky_admin_reviews_last_viewed_at';

const getViewedReviewIds = () => {
  try {
    const raw = localStorage.getItem(VIEWED_REVIEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const calculateUnreadCount = (list) => {
  if (!Array.isArray(list) || list.length === 0) return 0;
  const viewedIds = new Set(getViewedReviewIds());
  const lastViewedAt = localStorage.getItem(LAST_VIEWED_TIME_KEY);

  return list.filter((r) => {
    const id = String(r.id || r._id || '');
    if (!id) return false;
    if (viewedIds.has(id)) return false;
    if (r.isViewedByAdmin) return false;
    if (lastViewedAt && r.createdAt && new Date(r.createdAt) <= new Date(lastViewedAt)) return false;
    return true;
  }).length;
};

export const useReviewStore = create((set, get) => ({
  reviews: [],
  unreadCount: 0,
  kpis: {
    total: 0,
    avgScore: '0.0',
    pending: 0,
    published: 0,
    flagged: 0,
    withPhotos: 0,
  },
  loading: false,
  error: null,

  // 1. Fetch real reviews from MongoDB Atlas
  fetchReviews: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const data = await reviewService.getAdminReviews(params);
      const list = Array.isArray(data?.reviews)
        ? data.reviews
        : Array.isArray(data?.data?.reviews)
        ? data.data.reviews
        : Array.isArray(data)
        ? data
        : [];
      const kpis = data?.kpis || data?.data?.kpis || {
        total: list.length,
        avgScore: '0.0',
        pending: 0,
        published: 0,
        flagged: 0,
        withPhotos: 0,
      };

      const unreadCount = calculateUnreadCount(list);
      set({ reviews: list, kpis, unreadCount, loading: false });
    } catch (err) {
      console.error('Failed to fetch admin reviews:', err);
      set({
        loading: false,
        error: err?.message || 'Failed to fetch reviews',
        reviews: [],
        unreadCount: 0,
      });
    }
  },

  // 2. Approve Review & Publish to Storefront
  approveReview: async (id) => {
    try {
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === id || r._id === id ? { ...r, status: 'published', rejectionReason: null } : r
        ),
      }));
      await reviewService.updateStatus(id, 'published');
      get().fetchReviews();
    } catch (err) {
      console.error('Failed to approve review:', err);
    }
  },

  // 3. Reject Review
  rejectReview: async (id, rejectionReason) => {
    try {
      const reason = rejectionReason || 'Content violates moderation guidelines';
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === id || r._id === id ? { ...r, status: 'rejected', rejectionReason: reason } : r
        ),
      }));
      await reviewService.updateStatus(id, 'rejected', reason);
      get().fetchReviews();
    } catch (err) {
      console.error('Failed to reject review:', err);
    }
  },

  // 4. Flag Review as Spam
  flagReview: async (id) => {
    try {
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === id || r._id === id ? { ...r, status: 'flagged' } : r
        ),
      }));
      await reviewService.updateStatus(id, 'flagged');
      get().fetchReviews();
    } catch (err) {
      console.error('Failed to flag review:', err);
    }
  },

  // 5. Delete Review Permanently
  deleteReview: async (id) => {
    try {
      set((state) => ({
        reviews: state.reviews.filter((r) => r.id !== id && r._id !== id),
      }));
      await reviewService.delete(id);
      get().fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  },

  // 6. Toggle Featured Review
  toggleFeatured: async (id) => {
    try {
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === id || r._id === id ? { ...r, isFeatured: !r.isFeatured } : r
        ),
      }));
      await reviewService.toggleFeatured(id);
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  },

  // 7. Add or Edit Official Admin Reply
  replyToReview: async (id, { text, author = 'Picky Store Manager' }) => {
    try {
      const now = new Date().toISOString();
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === id || r._id === id
            ? {
                ...r,
                adminReply: {
                  author,
                  text,
                  repliedAt: now,
                },
              }
            : r
        ),
      }));
      await reviewService.reply(id, text, author);
      get().fetchReviews();
    } catch (err) {
      console.error('Failed to reply to review:', err);
    }
  },

  // 8. Delete Admin Reply
  deleteReply: async (id) => {
    try {
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === id || r._id === id ? { ...r, adminReply: null } : r
        ),
      }));
      await reviewService.deleteReply(id);
      get().fetchReviews();
    } catch (err) {
      console.error('Failed to delete reply:', err);
    }
  },

  // 9. Add New Review (Customer Storefront)
  addReview: async (reviewPayload) => {
    try {
      const created = await reviewService.create(reviewPayload);
      return created;
    } catch (err) {
      console.error('Failed to add review:', err);
      throw err;
    }
  },

  // 10. Bulk Approve Reviews
  bulkApprove: async (ids) => {
    try {
      set((state) => ({
        reviews: state.reviews.map((r) =>
          ids.includes(r.id) || ids.includes(r._id)
            ? { ...r, status: 'published', rejectionReason: null }
            : r
        ),
      }));
      await reviewService.bulkUpdateStatus(ids, 'published');
      get().fetchReviews();
    } catch (err) {
      console.error('Failed to bulk approve reviews:', err);
      throw err;
    }
  },

  // 11. Bulk Reject Reviews
  bulkReject: async (ids, rejectionReason = 'Violates moderation policy') => {
    try {
      set((state) => ({
        reviews: state.reviews.map((r) =>
          ids.includes(r.id) || ids.includes(r._id)
            ? { ...r, status: 'rejected', rejectionReason }
            : r
        ),
      }));
      await reviewService.bulkUpdateStatus(ids, 'rejected', rejectionReason);
      get().fetchReviews();
    } catch (err) {
      console.error('Failed to bulk reject reviews:', err);
      throw err;
    }
  },

  // 12. Bulk Flag Reviews
  bulkFlag: async (ids) => {
    try {
      set((state) => ({
        reviews: state.reviews.map((r) =>
          ids.includes(r.id) || ids.includes(r._id)
            ? { ...r, status: 'flagged' }
            : r
        ),
      }));
      await reviewService.bulkUpdateStatus(ids, 'flagged');
      get().fetchReviews();
    } catch (err) {
      console.error('Failed to bulk flag reviews:', err);
      throw err;
    }
  },

  // 13. Bulk Delete Reviews
  bulkDelete: async (ids) => {
    try {
      set((state) => ({
        reviews: state.reviews.filter((r) => !ids.includes(r.id) && !ids.includes(r._id)),
      }));
      await reviewService.bulkDelete(ids);
      get().fetchReviews();
    } catch (err) {
      console.error('Failed to bulk delete reviews:', err);
      throw err;
    }
  },

  // 14. Admin: Mark All Reviews As Viewed / Read
  markReviewsAsViewed: async () => {
    try {
      const currentList = get().reviews;
      const currentIds = currentList.map((r) => String(r.id || r._id)).filter(Boolean);
      const existingViewed = getViewedReviewIds();
      const combined = Array.from(new Set([...existingViewed, ...currentIds]));
      localStorage.setItem(VIEWED_REVIEWS_STORAGE_KEY, JSON.stringify(combined));
      localStorage.setItem(LAST_VIEWED_TIME_KEY, new Date().toISOString());

      // Update local state immediately so UI reacts instantly
      set((state) => ({
        unreadCount: 0,
        reviews: state.reviews.map((r) => ({ ...r, isViewedByAdmin: true })),
      }));

      // Notify backend API in background
      reviewService.markAllViewed().catch(() => {});
    } catch (err) {
      console.error('Failed to mark reviews as viewed:', err);
    }
  },
}));
