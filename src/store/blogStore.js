import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const INITIAL_BLOG_DATA = {
  isBlogPageEnabled: true,
  hero: {
    enabled: true,
    badgeText: 'THE PICKY JOURNAL',
    title: 'Discover Better. Shop Smarter.',
    subtitle: 'Helpful ideas, product guides, shopping tips, and stories to make everyday choices easier.',
    primaryButtonText: 'Explore Stories',
    secondaryButtonText: 'Shop Products',
    imageUrl: 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/blog/blog_hero_slash.jpg',
  },
  metrics: {
    enabled: true,
    items: [
      { id: 'm-1', value: '50+ Shoppable Guides', label: 'Tested & Curated by Editors', iconName: 'Video' },
      { id: 'm-2', value: '100% Quality Verified', label: 'Hands-on Product Reviews', iconName: 'ShieldCheck' },
      { id: 'm-3', value: '1-Click Direct Bag', label: 'Instant Shelves Checkout', iconName: 'ShoppingBag' },
      { id: 'm-4', value: '4.9/5 Shopper Rating', label: 'Over 12,000+ Verified Buyers', iconName: 'Star' },
    ],
  },
  categories: {
    enabled: true,
    items: [
      { id: 'all', label: 'All Finds', iconName: 'LayoutGrid', count: 18 },
      { id: 'womens-fashion', label: "Women's Fashion", iconName: 'Shirt', count: 6 },
      { id: 'home-kitchen', label: 'Home & Kitchen', iconName: 'UtensilsCrossed', count: 5 },
      { id: 'artificial-jewellery', label: 'Jewellery', iconName: 'Gem', count: 4 },
      { id: 'beauty-personal-care', label: 'Beauty & Care', iconName: 'Sparkles', count: 4 },
      { id: 'mobile-accessories', label: 'Mobile & Tech', iconName: 'Smartphone', count: 5 },
      { id: 'traditional-tamil-products', label: 'Tamil Heritage', iconName: 'Flame', count: 3 },
      { id: 'snacks-foods', label: 'Snacks & Foods', iconName: 'Coffee', count: 2 },
      { id: 'home-decor', label: 'Home Décor', iconName: 'Home', count: 3 },
      { id: 'kids-products', label: 'Kids & Toys', iconName: 'Smile', count: 2 },
      { id: 'fitness-products', label: 'Fitness', iconName: 'Dumbbell', count: 2 },
    ],
  },
  shoppableShorts: {
    enabled: true,
    title: 'Trending Shoppable Shorts',
    subtitle: 'Carousel video reels on a carousel with trending categories.',
    items: [
      {
        id: 'short-1',
        productId: 'short-prod-earbuds',
        title: 'TWS Earbuds',
        price: 1299,
        priceFormatted: '₹1,299',
        category: 'Tech & Mobile',
        image: '/images/blog/shorts/multi_1_earbuds.jpg',
      },
      {
        id: 'short-2',
        productId: 'short-prod-chopper',
        title: 'Smart Chopper',
        price: 599,
        priceFormatted: '₹599',
        category: 'Home & Kitchen',
        image: '/images/blog/shorts/multi_2_chopper.jpg',
      },
      {
        id: 'short-3',
        productId: 'short-prod-kurti',
        title: 'Cotton Kurti',
        price: 899,
        priceFormatted: '₹899',
        category: 'Fashion',
        image: '/images/blog/shorts/multi_3_kurti.jpg',
      },
      {
        id: 'short-4',
        productId: 'short-prod-serum',
        title: 'Vitamin C Serum',
        price: 499,
        priceFormatted: '₹499',
        category: 'Beauty & Skincare',
        image: '/images/blog/shorts/multi_4_serum_face.jpg',
      },
      {
        id: 'short-5',
        productId: 'short-prod-serum-bottle',
        title: 'Vitamin C Drops',
        price: 499,
        priceFormatted: '₹499',
        category: 'Beauty & Skincare',
        image: '/images/blog/shorts/multi_5_serum_bottle.jpg',
      },
    ],
  },
  masterclass: {
    enabled: true,
    badgeText: 'IN-DEPTH VIDEO REVIEW & GUIDE',
    title: 'The Everyday Essentials Guide',
    subtitle: 'Watch our complete 16:9 walkthrough testing top Picky finds across Tech, Kitchen, Fashion & Skincare with direct quick-add shelves.',
    videoImage: '/images/blog/masterclass_host.jpg',
    videoDuration: '5:00 / 8:40',
    chapters: [
      { id: 1, label: 'Tech Setup' },
      { id: 2, label: 'Kitchen Hacks' },
      { id: 3, label: 'Daily Wear' },
      { id: 4, label: 'Skincare Glow' },
      { id: 5, label: 'Desk Gear' },
    ],
    leftShelf: [
      {
        id: 'shelf-1',
        productId: 'shelf-prod-earbuds',
        title: 'TWS Earbuds',
        price: 1299,
        priceFormatted: '₹1,299',
        image: '/images/blog/shorts/multi_1_earbuds.jpg',
      },
      {
        id: 'shelf-2',
        productId: 'shelf-prod-chopper',
        title: 'Smart Chopper',
        price: 599,
        priceFormatted: '₹599',
        image: '/images/blog/shorts/multi_2_chopper.jpg',
      },
      {
        id: 'shelf-3',
        productId: 'shelf-prod-kurti',
        title: 'Cotton Kurti',
        price: 899,
        priceFormatted: '₹899',
        image: '/images/blog/shorts/multi_3_kurti.jpg',
      },
    ],
    rightShelf: [
      {
        id: 'shelf-4',
        productId: 'shelf-prod-organizer',
        title: 'Smart Gadget',
        price: 1499,
        priceFormatted: '₹1,499',
        image: '/images/blog/blog_featured_desk.jpg',
      },
      {
        id: 'shelf-5',
        productId: 'shelf-prod-festive-kurti',
        title: 'Cotton Kurti',
        price: 1199,
        priceFormatted: '₹1,199',
        image: '/images/blog/shorts/short_4.jpg',
      },
      {
        id: 'shelf-6',
        productId: 'shelf-prod-serum-bottle',
        title: 'Vitamin C Serum',
        price: 499,
        priceFormatted: '₹499',
        image: '/images/blog/shorts/multi_5_serum_bottle.jpg',
      },
    ],
  },
  buyingGuides: {
    enabled: true,
    title: 'Shoppable Buying Guides',
    subtitle: 'High-resolution photos with interactive hotspots.',
    items: [
      {
        id: 'guide-desk',
        title: 'Desk Setup Gadgets',
        image: '/images/blog/desk_setup_hotspot.jpg',
        hotspots: [
          {
            id: 'hs-lamp',
            productId: 'guide-prod-organizer',
            x: 21.5,
            y: 56,
            title: 'Ceramic Desk Pen Pot',
            category: 'Workspace',
            price: 499,
            priceFormatted: '₹499',
            image: '/images/blog/desk_setup_hotspot.jpg',
            positionClass: '',
          },
          {
            id: 'hs-monitor',
            productId: 'guide-prod-monitor',
            x: 48,
            y: 47,
            title: 'UltraWide 34" Curved Display',
            category: 'Electronics',
            price: 28999,
            priceFormatted: '₹28,999',
            image: '/images/blog/desk_setup_hotspot.jpg',
            positionClass: '',
          },
          {
            id: 'hs-keyboard',
            productId: 'guide-prod-keyboard',
            x: 52,
            y: 69,
            title: 'Slim Wireless Keyboard',
            category: 'Tech Accessories',
            price: 2499,
            priceFormatted: '₹2,499',
            image: '/images/blog/desk_setup_hotspot.jpg',
            positionClass: 'popover-down',
          },
          {
            id: 'hs-speaker',
            productId: 'guide-prod-speaker',
            x: 87,
            y: 58,
            title: 'Hi-Fi Studio Monitor Speaker',
            category: 'Audio',
            price: 7999,
            priceFormatted: '₹7,999',
            image: '/images/blog/desk_setup_hotspot.jpg',
            positionClass: 'align-right',
          },
        ],
      },
      {
        id: 'guide-kitchen',
        title: 'Modern Modular Kitchen Tools',
        image: '/images/blog/kitchen_setup_hotspot.jpg',
        hotspots: [
          {
            id: 'hs-utensils',
            productId: 'guide-prod-utensils',
            x: 32,
            y: 41,
            title: 'Stainless Hanging Utensils Rail',
            category: 'Kitchenware',
            price: 1299,
            priceFormatted: '₹1,299',
            image: '/images/blog/kitchen_setup_hotspot.jpg',
            positionClass: '',
          },
          {
            id: 'hs-knives',
            productId: 'guide-prod-knives',
            x: 24.5,
            y: 64,
            title: 'Japanese Knife Block Set',
            category: 'Cutlery',
            price: 2899,
            priceFormatted: '₹2,899',
            image: '/images/blog/kitchen_setup_hotspot.jpg',
            positionClass: 'popover-down',
          },
          {
            id: 'hs-cooktop',
            productId: 'guide-prod-cooktop',
            x: 72,
            y: 68,
            title: 'Smart 3-Burner Glass Hob',
            category: 'Appliances',
            price: 6499,
            priceFormatted: '₹6,499',
            image: '/images/blog/kitchen_setup_hotspot.jpg',
            positionClass: 'align-right',
          },
        ],
      },
    ],
  },
  customerReviews: {
    enabled: true,
    title: 'Customer Video Reviews',
    subtitle: 'Submitted by tech enthusiasts, home cooks, and fashion shoppers.',
    items: [
      {
        id: 'review-1',
        category: 'Tech Enthusiasts',
        time: '13m',
        title: 'Top Flagship Features & Everyday Speed Test',
        author: 'Arun K.',
        image: '/images/blog/customer_review_tech.jpg',
      },
      {
        id: 'review-2',
        category: 'Home Cooks',
        time: '13m',
        title: 'Quick Indian Meal Prep with Smart Chopper & Cooktop',
        author: 'Lakshmi S.',
        image: '/images/blog/customer_review_cook.jpg',
      },
      {
        id: 'review-3',
        category: 'Fashion Shopper',
        time: '13m',
        title: 'Pure Cotton Ethnic Kurti Haul & Fitting Review',
        author: 'Ananya S.',
        image: '/images/blog/customer_review_fashion.jpg',
      },
      {
        id: 'review-4',
        category: 'Wardrobe Stylists',
        time: '13m',
        title: 'Festive Wear Wardrobe Organizing & Care Routine',
        author: 'Priya N.',
        image: '/images/blog/customer_review_wardrobe.jpg',
      },
    ],
  },
  communityBanner: {
    enabled: true,
    badgeText: '✦ JOIN OUR COMMUNITY',
    title: 'Connect With Us @picky.co.in',
    subtitle: 'Follow us on Instagram & WhatsApp for daily style inspiration, exclusive drops, and behind-the-scenes stories.',
    instagramLink: 'https://www.instagram.com/picky.co.in/',
    whatsappNumber: '918300295721',
  },
};

// ─── BroadcastChannel for Instant 0ms Cross-Tab / Window Live Sync ───────────
let blogSyncChannel = null;
export function getBlogSyncChannel() {
  if (typeof window === 'undefined') return null;
  if (!blogSyncChannel) {
    try {
      blogSyncChannel = new BroadcastChannel('picky_blog_live_channel');
    } catch (e) {
      blogSyncChannel = null;
    }
  }
  return blogSyncChannel;
}

export function broadcastBlogUpdate(blogData) {
  const ch = getBlogSyncChannel();
  if (ch) {
    try {
      ch.postMessage({
        type: 'BLOG_DATA_UPDATED',
        blogData,
        timestamp: Date.now(),
      });
    } catch (e) {}
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('picky_blog_updated', { detail: { blogData } }));
  }
}

export const useBlogStore = create(
  persist(
    (set, get) => ({
      blogData: INITIAL_BLOG_DATA,

      updateSection: (sectionKey, updates) => {
        const current = get().blogData;
        const updated = {
          ...current,
          [sectionKey]: {
            ...current[sectionKey],
            ...updates,
          },
        };
        set({ blogData: updated });
        broadcastBlogUpdate(updated);
      },

      toggleSection: (sectionKey) => {
        const current = get().blogData;
        const updated = {
          ...current,
          [sectionKey]: {
            ...current[sectionKey],
            enabled: !current[sectionKey]?.enabled,
          },
        };
        set({ blogData: updated });
        broadcastBlogUpdate(updated);
      },

      toggleBlogPageStatus: () => {
        const current = get().blogData;
        const updated = {
          ...current,
          isBlogPageEnabled: current.isBlogPageEnabled === false ? true : false,
        };
        set({ blogData: updated });
        broadcastBlogUpdate(updated);
      },

      setBlogData: (newBlogData) => {
        set((state) => {
          const resolved = typeof newBlogData === 'function' ? newBlogData(state.blogData) : newBlogData;
          broadcastBlogUpdate(resolved);
          return { blogData: resolved };
        });
      },

      fetchBlogFromApi: async () => {
        try {
          const res = await fetch('http://localhost:5000/api/v1/blog');
          const json = await res.json();
          if (json?.success && json?.data) {
            const apiData = json.data;
            set((state) => {
              const updated = {
                ...state.blogData,
                isBlogPageEnabled: apiData.isBlogPageEnabled !== undefined ? apiData.isBlogPageEnabled : state.blogData.isBlogPageEnabled,
                hero: apiData.hero ? { ...state.blogData.hero, ...apiData.hero } : state.blogData.hero,
              };
              broadcastBlogUpdate(updated);
              return { blogData: updated };
            });
          }
        } catch (_) {}
      },

      resetToDefaults: () => {
        const defaults = JSON.parse(JSON.stringify(INITIAL_BLOG_DATA));
        set({ blogData: defaults });
        broadcastBlogUpdate(defaults);
      },
    }),
    {
      name: 'picky_blog_store_v1',
    }
  )
);

// Cross-tab and window event listener for real-time live synchronization
if (typeof window !== 'undefined') {
  const ch = getBlogSyncChannel();
  if (ch) {
    ch.onmessage = (event) => {
      if (event?.data?.type === 'BLOG_DATA_UPDATED' && event.data.blogData) {
        useBlogStore.setState({ blogData: event.data.blogData });
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'picky_blog_store_v1' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.state?.blogData) {
          useBlogStore.setState({ blogData: parsed.state.blogData });
        }
      } catch (_) {}
    }
  });

  window.addEventListener('picky_blog_updated', (e) => {
    if (e?.detail?.blogData) {
      useBlogStore.setState({ blogData: e.detail.blogData });
    }
  });
}

