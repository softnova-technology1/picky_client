// ─── Centralized Picky Customer Reviews & Ratings Dataset ──────────────────────
// Single source of truth for all reviews across ProductDetail, Home, About, Contact, and Catalog

export const REVIEWS_DATA = [
  {
    id: 'rev-in-1',
    name: 'Priya Sharma',
    city: 'Chennai, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    initials: 'PS',
    rating: 5,
    date: 'March 8, 2026',
    verified: true,
    productName: 'Pure Cotton Handloom Madurai Sungudi Saree',
    productSlug: 'pure-cotton-handloom-madurai-sungudi-saree',
    categorySlug: 'womens-fashion',
    comment:
      'Authentic handloom feel! The traditional zari border and tie-dye dot finish are pure perfection. Delivered in just 2 days to Chennai with eco-friendly packing.',
  },
  {
    id: 'rev-in-2',
    name: 'Meenakshi Ramachandran',
    city: 'Madurai, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    initials: 'MR',
    rating: 5,
    date: 'February 24, 2026',
    verified: true,
    productName: 'Antique Matte Gold Temple Choker Set',
    productSlug: 'traditional-kemp-pearl-bell-jhumka-earrings',
    categorySlug: 'artificial-jewellery',
    comment:
      'The carved ruby Kemp stones and antique matte gold polish look identical to pure heirloom bridal jewellery. Everyone at our family temple function asked where I got it!',
  },
  {
    id: 'rev-in-3',
    name: 'Rajesh Kannan',
    city: 'Coimbatore, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    initials: 'RK',
    rating: 5,
    date: 'February 18, 2026',
    verified: true,
    productName: 'Pre-Seasoned Heavy Cast Iron Kadai',
    productSlug: 'pre-seasoned-heavy-duty-cast-iron-deep-kadai-28cm',
    categorySlug: 'home-kitchen',
    comment:
      'Natural organic oil seasoning is completely genuine. Zero chemical Teflon smell, curries and roasts come out with that rich, traditional village flavour.',
  },
  {
    id: 'rev-in-4',
    name: 'Ananya Sundaram',
    city: 'Bengaluru, Karnataka',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    initials: 'AS',
    rating: 5,
    date: 'March 2, 2026',
    verified: true,
    productName: 'Authentic Manapparai Rice Murukku Jars',
    productSlug: 'authentic-manapparai-crispy-rice-murukku-500g',
    categorySlug: 'snacks-foods',
    comment:
      'Super crunchy, authentic spiral shape, and zero palm oil! Pure cold-pressed groundnut oil aroma reminds me of my grandmother’s kitchen in Tamil Nadu.',
  },
  {
    id: 'rev-in-5',
    name: 'Karthik Swaminathan',
    city: 'Chennai, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    initials: 'KS',
    rating: 5,
    date: 'January 29, 2026',
    verified: true,
    productName: 'Studio Pro Wireless ANC Headphones',
    productSlug: 'studio-pro-hi-fi-wireless-over-ear-headphones-anc',
    categorySlug: 'mobile-accessories',
    comment:
      'The 30dB active noise cancellation blocks out all street noise during my work calls. Deep bass and crystal clear acoustics for both Carnatic fusion and gaming.',
  },
  {
    id: 'rev-in-6',
    name: 'Divya Venkat',
    city: 'Hyderabad, Telangana',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    initials: 'DV',
    rating: 5,
    date: 'February 12, 2026',
    verified: true,
    productName: 'Traditional Kemp Pearl Bell Jhumkas',
    productSlug: 'traditional-kemp-pearl-bell-jhumka-earrings',
    categorySlug: 'artificial-jewellery',
    comment:
      'Lightweight festive polish that doesn’t hurt the earlobes after long hours. The micro gold finish and dangling seed pearls look ultra-premium.',
  },
  {
    id: 'rev-in-7',
    name: 'Suresh Kumar',
    city: 'Tiruchirappalli, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    initials: 'SK',
    rating: 5,
    date: 'January 15, 2026',
    verified: true,
    productName: 'Heavy Duty 65W Braided Fast Type-C Cable',
    productSlug: 'heavy-duty-65w-braided-fast-charge-type-c-cable',
    categorySlug: 'mobile-accessories',
    comment:
      'Tough nylon braiding that survives rough daily bike travels. Charges my phone from 10% to 80% in under 35 minutes. Top quality build!',
  },
  {
    id: 'rev-in-8',
    name: 'Kavitha Balaji',
    city: 'Salem, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    initials: 'KB',
    rating: 5,
    date: 'February 5, 2026',
    verified: true,
    productName: 'Tirunelveli Pure Desi Ghee Wheat Halwa',
    productSlug: 'native-special-tirunelveli-pure-desi-ghee-halwa',
    categorySlug: 'snacks-foods',
    comment:
      'Melt-in-mouth slow-cooked wheat halwa with generous crunchy cashew nuts. Tastes exactly like authentic Tirunelveli Iruttu Kadai halwa!',
  },
  {
    id: 'rev-in-9',
    name: 'Sneha Reddy',
    city: 'Bengaluru, Karnataka',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    initials: 'SR',
    rating: 5,
    date: 'February 28, 2026',
    verified: true,
    productName: 'Embroidered Rayon Anarkali Kurti & Pant Set',
    productSlug: 'embroidered-rayon-anarkali-kurti-pant-set',
    categorySlug: 'womens-fashion',
    comment:
      'Super breathable 14kg heavy rayon fabric, elegant gold zari neckline, and perfect tailored straight-pant fit. Wore it to our office festival day!',
  },
  {
    id: 'rev-in-10',
    name: 'Arvind Ramanathan',
    city: 'Kochi, Kerala',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    initials: 'AR',
    rating: 5,
    date: 'January 22, 2026',
    verified: true,
    productName: 'Solid Pine Wood Tripod Nordic Lamp',
    productSlug: 'solid-pine-wood-tripod-ambient-floor-lamp',
    categorySlug: 'home-decor',
    comment:
      'Warm 3000K soothing light that completely transformed our living room aesthetic. Real solid pine wood legs and sturdy brass fittings.',
  },
];

// Helper: Get reviews for a specific product or return curated selection of the 10 reviews
export function getProductReviews(product) {
  if (!product) return REVIEWS_DATA.slice(0, 4);

  const slug = product.slug || '';
  const categorySlug = product.category?.slug || '';

  // 1. Direct match by product slug
  const directMatches = REVIEWS_DATA.filter(
    (r) => r.productSlug === slug || r.productName.toLowerCase() === product.name?.toLowerCase()
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
