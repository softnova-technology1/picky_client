// ─── Centralized Picky Customer Reviews & Ratings Dataset ──────────────────────
// Single source of truth for all reviews across ProductDetail, Home, About, Contact, and Catalog

export const REVIEWS_DATA = [
  {
    id: 'rev-tn-1',
    name: 'Soundarya Balasubramanian',
    city: 'Chennai, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    initials: 'SB',
    badgeColor: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
    rating: 5,
    date: 'March 8, 2026',
    verified: true,
    productName: 'Pure Cotton Handloom Madurai Sungudi Saree',
    productSlug: 'pure-cotton-handloom-madurai-sungudi-saree',
    categorySlug: 'womens-fashion',
    comment:
      'Authentic handloom feel! The traditional zari border and genuine tie-dye dot finish are pure perfection. Delivered in just 2 days to Chennai with eco-friendly packing.',
  },
  {
    id: 'rev-tn-2',
    name: 'Meenakshi Ramachandran',
    city: 'Madurai, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    initials: 'MR',
    badgeColor: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
    rating: 5,
    date: 'February 24, 2026',
    verified: true,
    productName: 'Antique Matte Gold Temple Choker Set',
    productSlug: 'traditional-kemp-pearl-bell-jhumka-earrings',
    categorySlug: 'artificial-jewellery',
    comment:
      'The carved ruby Kemp stones and antique matte gold polish look identical to heirloom bridal jewellery from Mylapore. Everyone at our family temple function asked where I got it!',
  },
  {
    id: 'rev-tn-3',
    name: 'Rajesh Kannan',
    city: 'Coimbatore, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    initials: 'RK',
    badgeColor: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    rating: 5,
    date: 'February 18, 2026',
    verified: true,
    productName: 'Pre-Seasoned Heavy Cast Iron Kadai',
    productSlug: 'pre-seasoned-heavy-duty-cast-iron-deep-kadai-28cm',
    categorySlug: 'home-kitchen',
    comment:
      'Natural organic gingelly oil seasoning is completely genuine. Zero chemical Teflon smell, fish curries and Chettinad roasts come out with that rich, traditional village flavour.',
  },
  {
    id: 'rev-tn-4',
    name: 'Karthik Swaminathan',
    city: 'Thanjavur, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    initials: 'KS',
    badgeColor: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
    rating: 5,
    date: 'March 2, 2026',
    verified: true,
    productName: 'Traditional Brass Filter Coffee Davarah Set',
    productSlug: 'solid-pine-wood-tripod-ambient-floor-lamp',
    categorySlug: 'home-decor',
    comment:
      'Crafted from heavy food-grade brass with a brilliant golden polish. Extracts thick, aromatic decoction every morning for that authentic Kumbakonam degree coffee experience.',
  },
  {
    id: 'rev-tn-5',
    name: 'Kavitha Murugesan',
    city: 'Tirunelveli, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    initials: 'KM',
    badgeColor: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
    rating: 5,
    date: 'February 5, 2026',
    verified: true,
    productName: 'Native Special Pure Ghee Wheat Halwa',
    productSlug: 'native-special-tirunelveli-pure-desi-ghee-halwa',
    categorySlug: 'snacks-foods',
    comment:
      'Slow-cooked in pure country cow ghee with rich whole cashews. It melts in the mouth instantly and tastes identical to the iconic Tirunelveli Iruttu Kadai halwa!',
  },
  {
    id: 'rev-tn-6',
    name: 'Senthil Nathan',
    city: 'Kanchipuram, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    initials: 'SN',
    badgeColor: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
    rating: 5,
    date: 'January 29, 2026',
    verified: true,
    productName: 'Pure Silk Handloom Zari Dhoti & Angavastram',
    productSlug: 'embroidered-rayon-anarkali-kurti-pant-set',
    categorySlug: 'womens-fashion',
    comment:
      'Ordered for our family temple consecration. The pure Mayilkan border weaving and silk lustre are magnificent. Traditional heritage craft at honest pricing.',
  },
  {
    id: 'rev-tn-7',
    name: 'Deepa Rajagopalan',
    city: 'Salem, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    initials: 'DR',
    badgeColor: 'linear-gradient(135deg, #db2777 0%, #f43f5e 100%)',
    rating: 5,
    date: 'January 15, 2026',
    verified: true,
    productName: 'Stone-Ground Erode High-Curcumin Turmeric',
    productSlug: 'authentic-manapparai-crispy-rice-murukku-500g',
    categorySlug: 'snacks-foods',
    comment:
      'Golden natural curcumin aroma that you simply cannot find in commercial grocery brands. Pristine purity from the fields of Erode, packaged with immense care.',
  },
];

// Helper: Get reviews for a specific product or return curated selection of the 10 reviews
export function getProductReviews(product) {
  if (!product) return REVIEWS_DATA.slice(0, 4);

  const slug = product.slug || '';
  const categorySlug = product.category?.slug || '';

  // 1. Direct match by product slug
  const directMatches = REVIEWS_DATA.filter(
    (r) => r.productSlug === slug || r.productName?.toLowerCase() === product.name?.toLowerCase()
  );

  // 2. Category matches
  const categoryMatches = REVIEWS_DATA.filter(
    (r) => r.categorySlug === categorySlug && !directMatches.some((dm) => dm.id === r.id)
  );

  // 3. Combine with balance from rest of the 10 reviews
  const combined = [...directMatches, ...categoryMatches];
  for (const r of REVIEWS_DATA) {
    if (!combined.some((item) => item.id === r.id)) {
      combined.push(r);
    }
  }

  return combined.slice(0, 4); // Always display 4 rich reviews on PDP
}

// Helper: Overall store rating summary
export const STORE_RATING_SUMMARY = {
  score: 4.9,
  maxScore: 5.0,
  totalReviews: 2450,
  satisfactionRate: '99.4%',
  verifiedBadge: 'Verified Indian Shoppers',
};
