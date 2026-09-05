/**
 * ============================================================================
 * Crackly / Picky E-Commerce — Central Frontend Data & Mock Store
 * ============================================================================
 * Single source of truth for categories, subcategories, products,
 * carousel hero slides, value propositions, coupons, and orders.
 */

// ── Hero Carousel Slides ─────────────────────────────────────────────────────
export const heroSlides = [
  {
    id: 'slide_festive_celebration',
    image: '/images/crackly-artwork.png',
    title: 'Spread Happiness This Diwali',
    subtitle: '100% Safe Green Crackers & Fireworks Direct from Sivakasi',
    ctaText: 'Shop Crackers',
    ctaLink: '/products',
    badges: [
      { icon: '🚚', title: 'Fast Delivery', subtitle: 'Across India' },
      { icon: '🛡️', title: 'Genuine Products', subtitle: '100% Original' },
      { icon: '💛', title: 'Safe Celebrations', subtitle: 'Your Safety First' },
    ],
  },
  {
    id: 'slide_aerial_shots',
    image: '/images/hero_aerial_fireworks.jpg',
    title: 'Grand Aerial Sky Shots & Night Bloom',
    subtitle: 'Spectacular 12 to 120 Shots with Multi-Color Glitter & Whistles',
    ctaText: 'Explore Aerial Shots',
    ctaLink: '/categories/aerial-shots',
    badges: [
      { icon: '🎆', title: 'Aerial Wonders', subtitle: 'Dazzling Sky Bloom' },
      { icon: '⚡', title: 'Fast Dispatch', subtitle: 'Ships in 24 Hours' },
      { icon: '🏷️', title: 'Festival Discount', subtitle: 'Up to 50% Off' },
    ],
  },
  {
    id: 'slide_combo_boxes',
    image: '/images/hero_combo_boxes.jpg',
    title: 'Mega Family Diwali Combo Gift Boxes',
    subtitle: 'Curated 40+ Cracker Assortments with Flower Pots, Sparklers & Chakkars',
    ctaText: 'Shop Combo Packs',
    ctaLink: '/categories/combo-packs',
    badges: [
      { icon: '🎁', title: 'Mega Gift Boxes', subtitle: 'All-in-One Value' },
      { icon: '🌟', title: 'Sivakasi Brands', subtitle: 'Standard & Premium' },
      { icon: '📦', title: 'Free Delivery', subtitle: 'On Orders Above ₹1,999' },
    ],
  },
];

// ── Categories & Sub-Categories Hierarchy ────────────────────────────────────
export const categories = [
  {
    _id: 'cat_sparklers',
    name: 'Sparklers',
    slug: 'sparklers',
    image: '/images/cat_sparklers.jpg',
    color: '#b91c1c',
    description: 'Electric gold, silver, color and neon sparklers safe for kids & family.',
    itemCount: 16,
    sortOrder: 1,
    isActive: true,
    subcategories: [
      {
        _id: 'sub_spk_electric',
        name: 'Electric Sparklers',
        slug: 'electric-sparklers',
        image: '/images/cat_sparklers.jpg',
        description: 'Classic golden & silver cold-spark electric sparkler sticks.',
        itemCount: 4,
      },
      {
        _id: 'sub_spk_color',
        name: 'Color Sparklers',
        slug: 'color-sparklers',
        image: '/images/cat_sparklers.jpg',
        description: 'Vibrant ruby red, emerald green, and neon sparkling glow.',
        itemCount: 4,
      },
      {
        _id: 'sub_spk_giant',
        name: 'Giant & Jumbo Sparklers',
        slug: 'giant-jumbo-sparklers',
        image: '/images/cat_sparklers.jpg',
        description: 'Extra-long 30cm and 50cm mega sparklers lasting over 2 minutes.',
        itemCount: 4,
      },
      {
        _id: 'sub_spk_crackling',
        name: 'Crackling & Whistle Sparklers',
        slug: 'crackling-whistle-sparklers',
        image: '/images/cat_sparklers.jpg',
        description: 'Exciting sparkler sticks with crackling stars and whistle notes.',
        itemCount: 4,
      },
    ],
  },
  {
    _id: 'cat_fountains',
    name: 'Fountains',
    slug: 'fountains',
    image: '/images/cat_fountains.jpg',
    color: '#6d28d9',
    description: 'Flower pots, tri-colour fountain cones, and glittering showers.',
    itemCount: 18,
    sortOrder: 2,
    isActive: true,
    subcategories: [
      {
        _id: 'sub_fnt_flowerpots',
        name: 'Classic Flower Pots',
        slug: 'classic-flower-pots',
        image: '/images/cat_fountains.jpg',
        description: 'Asoka, Special, and Big Flower pots emitting high golden showers.',
        itemCount: 5,
      },
      {
        _id: 'sub_fnt_tricolor',
        name: 'Tri-Colour Fountain Cones',
        slug: 'tri-color-fountains',
        image: '/images/cat_fountains.jpg',
        description: 'Multi-stage color changing fountains with dense sparkle heights.',
        itemCount: 5,
      },
      {
        _id: 'sub_fnt_whistle',
        name: 'Whistling & Musical Fountains',
        slug: 'whistling-fountains',
        image: '/images/cat_fountains.jpg',
        description: 'Siren whistling flower cones with vibrant crackling sparks.',
        itemCount: 4,
      },
      {
        _id: 'sub_fnt_kids',
        name: 'Kids Mini Safe Fountains',
        slug: 'kids-safe-fountains',
        image: '/images/cat_fountains.jpg',
        description: 'Low-smoke table-top cold fountains safe for family & children.',
        itemCount: 4,
      },
    ],
  },
  {
    _id: 'cat_aerial',
    name: 'Aerial Shots',
    slug: 'aerial-shots',
    image: '/images/cat_aerial.jpg',
    color: '#15803d',
    description: '12 shots, 30 shots, multi-break sky rockets, and aerial bloomers.',
    itemCount: 22,
    sortOrder: 3,
    isActive: true,
    subcategories: [
      {
        _id: 'sub_aer_cakes',
        name: 'Multi-Shot Cakes (12 to 30 Shots)',
        slug: 'multi-shot-cakes-12-30',
        image: '/images/cat_aerial.jpg',
        description: 'Synchronized repeater sky cakes with colorful peony and strobe blooms.',
        itemCount: 6,
      },
      {
        _id: 'sub_aer_mega',
        name: 'Mega Sky Symphony (60 to 120 Shots)',
        slug: 'mega-symphony-60-120',
        image: '/images/hero_aerial_fireworks.jpg',
        description: 'Grand festival finale cakes with brocade crowns and palm tree effects.',
        itemCount: 6,
      },
      {
        _id: 'sub_aer_rockets',
        name: 'Single & Double Sound Rockets',
        slug: 'single-double-rockets',
        image: '/images/cat_aerial.jpg',
        description: 'High-flying sky rockets with whistle lift and dual boom bursts.',
        itemCount: 5,
      },
      {
        _id: 'sub_aer_parachute',
        name: 'Parachute & Night Sky Drone Shots',
        slug: 'parachute-drone-aerials',
        image: '/images/hero_aerial_fireworks.jpg',
        description: 'Illuminating floating parachute flares and helicopter spinners.',
        itemCount: 5,
      },
    ],
  },
  {
    _id: 'cat_combos',
    name: 'Combo Packs',
    slug: 'combo-packs',
    image: '/images/cat_combos.jpg',
    color: '#a16207',
    description: 'Value gift boxes and complete Diwali family celebration bundles.',
    itemCount: 14,
    sortOrder: 4,
    isActive: true,
    subcategories: [
      {
        _id: 'sub_cmb_family',
        name: 'Family Mega Gift Boxes',
        slug: 'family-mega-gift-boxes',
        image: '/images/cat_combos.jpg',
        description: '35 to 55 items deluxe family celebration boxes with heavy discount.',
        itemCount: 4,
      },
      {
        _id: 'sub_cmb_kids',
        name: 'Kids Safe & Noiseless Combos',
        slug: 'kids-noiseless-combos',
        image: '/images/hero_combo_boxes.jpg',
        description: '100% low-sound light and color cracker assortments for children.',
        itemCount: 4,
      },
      {
        _id: 'sub_cmb_budget',
        name: 'Budget Festive Starter Kits',
        slug: 'budget-starter-packs',
        image: '/images/cat_combos.jpg',
        description: 'Affordable pocket-friendly festival starter boxes under ₹1,499.',
        itemCount: 3,
      },
      {
        _id: 'sub_cmb_vip',
        name: 'VIP Grand Diwali Hampers',
        slug: 'vip-luxury-hampers',
        image: '/images/hero_combo_boxes.jpg',
        description: 'Ultra luxury branded fireworks trunk with aerial cakes & novelties.',
        itemCount: 3,
      },
    ],
  },
  {
    _id: 'cat_spinners',
    name: 'Ground Spinners',
    slug: 'ground-spinners',
    image: '/images/cat_spinners.jpg',
    color: '#1d4ed8',
    description: 'Whistling chakkars, deluxe wheel spinners, and wire ground chakras.',
    itemCount: 12,
    sortOrder: 5,
    isActive: true,
    subcategories: [
      {
        _id: 'sub_spn_wheel',
        name: 'Deluxe Wheel Chakkars',
        slug: 'deluxe-wheel-chakkars',
        image: '/images/cat_spinners.jpg',
        description: 'Big zamin chakkars, wire wheels, and long duration ground spinners.',
        itemCount: 4,
      },
      {
        _id: 'sub_spn_whistling',
        name: 'Musical & Whistling Chakkars',
        slug: 'musical-whistling-chakkars',
        image: '/images/cat_spinners.jpg',
        description: 'Spinning ground discs that whistle and generate fiery golden halos.',
        itemCount: 4,
      },
      {
        _id: 'sub_spn_disco',
        name: 'Disco Strobe & Rotary Spinners',
        slug: 'disco-strobe-rotary-spinners',
        image: '/images/cat_spinners.jpg',
        description: 'Multi-color strobe flashers and dual-direction ground chakras.',
        itemCount: 4,
      },
    ],
  },
  {
    _id: 'cat_novelty',
    name: 'Novelty Items',
    slug: 'novelty-items',
    image: '/images/cat_novelty.jpg',
    color: '#be185d',
    description: 'Magic whips, pop pops, serpent eggs, siren whistles, and smoke bombs.',
    itemCount: 15,
    sortOrder: 6,
    isActive: true,
    subcategories: [
      {
        _id: 'sub_nov_smoke',
        name: 'Color Smoke Tubes & Fountains',
        slug: 'color-smoke-tubes',
        image: '/images/cat_novelty.jpg',
        description: 'Vibrant daytime party smoke tubes for photography & celebrations.',
        itemCount: 4,
      },
      {
        _id: 'sub_nov_poppop',
        name: 'Pop Pops & Throw Snappers',
        slug: 'pop-pops-snappers',
        image: '/images/cat_novelty.jpg',
        description: 'Friction snap crackers, drop bangers, and fun party snappers.',
        itemCount: 4,
      },
      {
        _id: 'sub_nov_magic',
        name: 'Magic Whips & Serpent Tablets',
        slug: 'magic-whips-serpent-eggs',
        image: '/images/cat_novelty.jpg',
        description: 'Crackling sparkler cords, growing serpent eggs, and magic matches.',
        itemCount: 4,
      },
      {
        _id: 'sub_nov_bombs',
        name: 'Classic Sound Bombs & Hydro Rockets',
        slug: 'classic-sound-crackers',
        image: '/images/cat_novelty.jpg',
        description: 'Traditional Sivakasi atom bombs, hydro bombs, and green sound crackers.',
        itemCount: 3,
      },
    ],
  },
];

// ── Products Catalog with Subcategories ──────────────────────────────────────
export const products = [
  // ── Sparklers Subcategories Products
  {
    _id: 'prod_spk_1',
    name: 'Golden Radiance 15cm Electric Sparklers (10 Boxes)',
    slug: 'golden-radiance-electric-sparklers-10-boxes',
    price: 499,
    discountPrice: 279,
    category: { _id: 'cat_sparklers', name: 'Sparklers', slug: 'sparklers' },
    subCategory: { _id: 'sub_spk_electric', name: 'Electric Sparklers', slug: 'electric-sparklers' },
    images: ['/images/cat_sparklers.jpg', '/images/crackly-artwork.png'],
    description: 'Low-smoke cold spark technology electric sparkler sticks. 100 sticks total with dazzling golden sparkle shower.',
    characteristics: [
      { key: 'Box Quantity', value: '10 Boxes (10 Sticks each = 100 Sticks)' },
      { key: 'Length', value: '15cm Length' },
      { key: 'Burn Time', value: '45-60 Seconds per Stick' },
      { key: 'Safety', value: 'Low Smoke & Cold Spark Safe' },
    ],
    tags: ['sparklers', 'electric', 'kids', 'safe', 'gold'],
    isFeatured: true,
    isActive: true,
    stock: 150,
    rating: 4.9,
    reviewsCount: 310,
    sortOrder: 1,
    createdAt: '2026-08-15T10:00:00.000Z',
  },
  {
    _id: 'prod_spk_2',
    name: 'Vibrant Tri-Colour Sparklers Neon Pack (50 Sticks)',
    slug: 'vibrant-tri-colour-sparklers-neon-pack',
    price: 599,
    discountPrice: 329,
    category: { _id: 'cat_sparklers', name: 'Sparklers', slug: 'sparklers' },
    subCategory: { _id: 'sub_spk_color', name: 'Color Sparklers', slug: 'color-sparklers' },
    images: ['/images/cat_sparklers.jpg', '/images/hero_aerial_fireworks.jpg'],
    description: 'Emerald green, ruby red, and sapphire blue glittering color sparklers in a protective gift box.',
    characteristics: [
      { key: 'Color Shades', value: 'Red, Green, Blue & Gold Glow' },
      { key: 'Pack Count', value: '50 Sticks Assortment' },
      { key: 'Burn Time', value: '60 Seconds each' },
    ],
    tags: ['sparklers', 'color', 'neon', 'green', 'red'],
    isFeatured: true,
    isActive: true,
    stock: 90,
    rating: 4.8,
    reviewsCount: 180,
    sortOrder: 2,
    createdAt: '2026-08-16T10:00:00.000Z',
  },
  {
    _id: 'prod_spk_3',
    name: 'Mega Jumbo 50cm Wedding & Festival Sparklers (Pack of 20)',
    slug: 'mega-jumbo-50cm-festival-sparklers',
    price: 899,
    discountPrice: 549,
    category: { _id: 'cat_sparklers', name: 'Sparklers', slug: 'sparklers' },
    subCategory: { _id: 'sub_spk_giant', name: 'Giant & Jumbo Sparklers', slug: 'giant-jumbo-sparklers' },
    images: ['/images/cat_sparklers.jpg', '/images/crackly-artwork.png'],
    description: 'Half-meter long giant sparklers burning continuously for up to 3 full minutes. Ideal for celebrations and photography.',
    characteristics: [
      { key: 'Length', value: '50cm (Half Metre Giant)' },
      { key: 'Burn Time', value: 'Over 180 Seconds (3 Minutes)' },
      { key: 'Handle', value: 'Extra-Long Safe Wooden Grip' },
    ],
    tags: ['sparklers', 'jumbo', 'giant', 'celebration'],
    isFeatured: false,
    isActive: true,
    stock: 80,
    rating: 5.0,
    reviewsCount: 145,
    sortOrder: 3,
    createdAt: '2026-08-17T10:00:00.000Z',
  },
  {
    _id: 'prod_spk_4',
    name: 'Crackling Star Whistle Sparklers (30 Sticks)',
    slug: 'crackling-star-whistle-sparklers',
    price: 649,
    discountPrice: 389,
    category: { _id: 'cat_sparklers', name: 'Sparklers', slug: 'sparklers' },
    subCategory: { _id: 'sub_spk_crackling', name: 'Crackling & Whistle Sparklers', slug: 'crackling-whistle-sparklers' },
    images: ['/images/cat_sparklers.jpg', '/images/hero_aerial_fireworks.jpg'],
    description: 'High-energy sparklers bursting with popcorn-like crackling sparkles and high-frequency mini whistle notes.',
    characteristics: [
      { key: 'Effects', value: 'Popcorn Crackles + Whistle Notes' },
      { key: 'Quantity', value: '30 Special Sparklers' },
      { key: 'Duration', value: '75 Seconds' },
    ],
    tags: ['sparklers', 'crackling', 'whistle'],
    isFeatured: false,
    isActive: true,
    stock: 110,
    rating: 4.7,
    reviewsCount: 95,
    sortOrder: 4,
    createdAt: '2026-08-18T10:00:00.000Z',
  },

  // ── Fountains Subcategories Products
  {
    _id: 'prod_fnt_1',
    name: 'Royal Asoka Tri-Colour Giant Flower Pots (Pack of 10)',
    slug: 'royal-asoka-giant-flower-pots',
    price: 899,
    discountPrice: 499,
    category: { _id: 'cat_fountains', name: 'Fountains', slug: 'fountains' },
    subCategory: { _id: 'sub_fnt_flowerpots', name: 'Classic Flower Pots', slug: 'classic-flower-pots' },
    images: ['/images/cat_fountains.jpg', '/images/crackly-artwork.png'],
    description: 'Classic jumbo flower pots producing golden glittering fountain sprays up to 15 feet high with gradual color transitions.',
    characteristics: [
      { key: 'Quantity', value: '10 Giant Pots per Box' },
      { key: 'Fountain Height', value: 'Up to 15 Feet' },
      { key: 'Burn Time', value: '25-30 Seconds per piece' },
    ],
    tags: ['fountain', 'flowerpot', 'silent', 'sparkle'],
    isFeatured: true,
    isActive: true,
    stock: 120,
    rating: 4.8,
    reviewsCount: 240,
    sortOrder: 5,
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    _id: 'prod_fnt_2',
    name: 'Multi-Stage Rainbow Magic Fountain Cones (Pack of 5)',
    slug: 'multi-stage-rainbow-magic-fountain-cones',
    price: 749,
    discountPrice: 419,
    category: { _id: 'cat_fountains', name: 'Fountains', slug: 'fountains' },
    subCategory: { _id: 'sub_fnt_tricolor', name: 'Tri-Colour Fountain Cones', slug: 'tri-color-fountains' },
    images: ['/images/cat_fountains.jpg', '/images/hero_aerial_fireworks.jpg'],
    description: '3-stage changing color fountain cones that transition through gold, ruby, and violet starry showers.',
    characteristics: [
      { key: 'Stages', value: '3 Distinct Color Transformations' },
      { key: 'Height', value: '12-14 Feet High' },
    ],
    tags: ['fountain', 'tricolor', 'rainbow', 'cones'],
    isFeatured: false,
    isActive: true,
    stock: 75,
    rating: 4.9,
    reviewsCount: 110,
    sortOrder: 6,
    createdAt: '2026-08-21T10:00:00.000Z',
  },
  {
    _id: 'prod_fnt_3',
    name: 'Siren Whistle Blast Flower Fountains (Pack of 6)',
    slug: 'siren-whistle-blast-flower-fountains',
    price: 699,
    discountPrice: 399,
    category: { _id: 'cat_fountains', name: 'Fountains', slug: 'fountains' },
    subCategory: { _id: 'sub_fnt_whistle', name: 'Whistling & Musical Fountains', slug: 'whistling-fountains' },
    images: ['/images/cat_fountains.jpg', '/images/cat_sparklers.jpg'],
    description: 'Loud musical siren whistling notes paired with glittering silver showers.',
    characteristics: [
      { key: 'Effect', value: 'Siren Whistle + Silver Waterfall' },
      { key: 'Pack Size', value: '6 Whistle Pots' },
    ],
    tags: ['fountain', 'whistle', 'siren', 'musical'],
    isFeatured: false,
    isActive: true,
    stock: 95,
    rating: 4.7,
    reviewsCount: 88,
    sortOrder: 7,
    createdAt: '2026-08-22T10:00:00.000Z',
  },
  {
    _id: 'prod_fnt_4',
    name: 'Jellybean Kids Tabletop Cold Fountains (Pack of 12)',
    slug: 'jellybean-kids-tabletop-cold-fountains',
    price: 549,
    discountPrice: 299,
    category: { _id: 'cat_fountains', name: 'Fountains', slug: 'fountains' },
    subCategory: { _id: 'sub_fnt_kids', name: 'Kids Mini Safe Fountains', slug: 'kids-safe-fountains' },
    images: ['/images/cat_fountains.jpg', '/images/hero_combo_boxes.jpg'],
    description: 'Child-friendly, smokeless cold spark mini flower pots in vibrant colors.',
    characteristics: [
      { key: 'Safety', value: 'Cold Spark Child-Safe' },
      { key: 'Quantity', value: '12 Mini Pots' },
    ],
    tags: ['fountain', 'kids', 'safe', 'tabletop'],
    isFeatured: false,
    isActive: true,
    stock: 130,
    rating: 4.9,
    reviewsCount: 160,
    sortOrder: 8,
    createdAt: '2026-08-23T10:00:00.000Z',
  },

  // ── Aerial Shots Subcategories Products
  {
    _id: 'prod_aer_1',
    name: 'Sky King 30-Shot Multi-Color Aerial Bloom',
    slug: 'sky-king-30-shot-aerial-bloom',
    price: 1999,
    discountPrice: 1299,
    category: { _id: 'cat_aerial', name: 'Aerial Shots', slug: 'aerial-shots' },
    subCategory: { _id: 'sub_aer_cakes', name: 'Multi-Shot Cakes (12 to 30 Shots)', slug: 'multi-shot-cakes-12-30' },
    images: ['/images/cat_aerial.jpg', '/images/hero_aerial_fireworks.jpg'],
    description: 'Mesmerizing 30-shot sky spectacle ejecting brilliant red, green, and golden peonies with crackling tail whistles.',
    characteristics: [
      { key: 'Shot Count', value: '30 Consecutive Sky Shots' },
      { key: 'Height', value: '120 - 150 Feet Altitude' },
      { key: 'Duration', value: '45 Seconds' },
    ],
    tags: ['aerial', 'skyshot', 'fireworks', 'bestseller', 'night'],
    isFeatured: true,
    isActive: true,
    stock: 65,
    rating: 4.9,
    reviewsCount: 380,
    sortOrder: 9,
    createdAt: '2026-08-25T10:00:00.000Z',
  },
  {
    _id: 'prod_aer_2',
    name: 'Celebration 120-Shot Mega Sky Symphony',
    slug: 'celebration-120-shot-mega-sky-symphony',
    price: 6499,
    discountPrice: 3999,
    category: { _id: 'cat_aerial', name: 'Aerial Shots', slug: 'aerial-shots' },
    subCategory: { _id: 'sub_aer_mega', name: 'Mega Sky Symphony (60 to 120 Shots)', slug: 'mega-symphony-60-120' },
    images: ['/images/hero_aerial_fireworks.jpg', '/images/cat_aerial.jpg'],
    description: 'The ultimate festival finale cake! 120 rapid aerial shots firing in synchronized volleys with thunderous booms and panoramic palm trees.',
    characteristics: [
      { key: 'Shot Count', value: '120 Rapid Multi-Break Shots' },
      { key: 'Duration', value: 'Over 2 Minutes Continuous Finale' },
      { key: 'Altitude', value: '180+ Feet' },
    ],
    tags: ['aerial', 'skyshot', '120shots', 'grand', 'finale'],
    isFeatured: true,
    isActive: true,
    stock: 25,
    rating: 5.0,
    reviewsCount: 95,
    sortOrder: 10,
    createdAt: '2026-08-26T10:00:00.000Z',
  },
  {
    _id: 'prod_aer_3',
    name: 'Thunder King Whistling Double Boom Rockets (Pack of 10)',
    slug: 'thunder-king-whistling-double-boom-rockets',
    price: 899,
    discountPrice: 529,
    category: { _id: 'cat_aerial', name: 'Aerial Shots', slug: 'aerial-shots' },
    subCategory: { _id: 'sub_aer_rockets', name: 'Single & Double Sound Rockets', slug: 'single-double-rockets' },
    images: ['/images/cat_aerial.jpg', '/images/hero_aerial_fireworks.jpg'],
    description: 'High-altitude whistling rockets soaring 150 feet with dual sonic boom explosions.',
    characteristics: [
      { key: 'Sound', value: 'Whistle + Double Sonic Boom' },
      { key: 'Quantity', value: '10 High Altitude Rockets' },
    ],
    tags: ['rockets', 'thunder', 'sound', 'aerial'],
    isFeatured: false,
    isActive: true,
    stock: 85,
    rating: 4.8,
    reviewsCount: 140,
    sortOrder: 11,
    createdAt: '2026-08-27T10:00:00.000Z',
  },
  {
    _id: 'prod_aer_4',
    name: 'Night Sky Parachute Flares & UFO Spinners (Pack of 6)',
    slug: 'night-sky-parachute-flares-ufo-spinners',
    price: 799,
    discountPrice: 469,
    category: { _id: 'cat_aerial', name: 'Aerial Shots', slug: 'aerial-shots' },
    subCategory: { _id: 'sub_aer_parachute', name: 'Parachute & Night Sky Drone Shots', slug: 'parachute-drone-aerials' },
    images: ['/images/hero_aerial_fireworks.jpg', '/images/cat_aerial.jpg'],
    description: 'Shoots high into the air and releases glowing parachute lamps that float gently downwards.',
    characteristics: [
      { key: 'Effect', value: 'Glowing Parachute Drop' },
      { key: 'Pack Count', value: '6 Parachute Shooters' },
    ],
    tags: ['parachute', 'drone', 'nightsky', 'floating'],
    isFeatured: false,
    isActive: true,
    stock: 60,
    rating: 4.9,
    reviewsCount: 75,
    sortOrder: 12,
    createdAt: '2026-08-28T10:00:00.000Z',
  },

  // ── Combo Packs Subcategories Products
  {
    _id: 'prod_cmb_1',
    name: 'Mega Diwali Dhamaka Family Gift Box (45 Items)',
    slug: 'mega-diwali-dhamaka-family-gift-box',
    price: 4999,
    discountPrice: 2899,
    category: { _id: 'cat_combos', name: 'Combo Packs', slug: 'combo-packs' },
    subCategory: { _id: 'sub_cmb_family', name: 'Family Mega Gift Boxes', slug: 'family-mega-gift-boxes' },
    images: ['/images/cat_combos.jpg', '/images/hero_combo_boxes.jpg', '/images/crackly-artwork.png'],
    description: 'All-in-one comprehensive festival box packed with flower pots, sparklers, ground chakkars, whistling rockets, aerial shots, and kids novelties.',
    characteristics: [
      { key: 'Total Items', value: '45 Variety Cracker Packs' },
      { key: 'Suitability', value: 'Ideal for 4-6 Family Members' },
      { key: 'Certification', value: '100% Green Certified by CSIR-NEERI' },
    ],
    tags: ['combo', 'giftbox', 'family', 'festive', 'featured'],
    isFeatured: true,
    isActive: true,
    stock: 80,
    rating: 5.0,
    reviewsCount: 520,
    sortOrder: 13,
    createdAt: '2026-08-30T10:00:00.000Z',
  },
  {
    _id: 'prod_cmb_2',
    name: 'Kids Joy Festive Special Cracker Pack (20 Items)',
    slug: 'kids-joy-festive-special-cracker-pack',
    price: 1899,
    discountPrice: 1099,
    category: { _id: 'cat_combos', name: 'Combo Packs', slug: 'combo-packs' },
    subCategory: { _id: 'sub_cmb_kids', name: 'Kids Safe & Noiseless Combos', slug: 'kids-noiseless-combos' },
    images: ['/images/hero_combo_boxes.jpg', '/images/cat_combos.jpg'],
    description: 'Child-safe cracker collection with 100% noiseless & low-sound items. Includes color sparklers, mini pots, musical chakkars, and party poppers.',
    characteristics: [
      { key: 'Pack Contents', value: '20 Safe Kids Varieties' },
      { key: 'Noise Rating', value: 'Zero Loud Sound (Child & Pet Friendly)' },
    ],
    tags: ['kids', 'safe', 'noiseless', 'combo', 'green'],
    isFeatured: true,
    isActive: true,
    stock: 70,
    rating: 4.9,
    reviewsCount: 210,
    sortOrder: 14,
    createdAt: '2026-08-31T10:00:00.000Z',
  },
  {
    _id: 'prod_cmb_3',
    name: 'Diwali Starter Pocket Box (15 Items)',
    slug: 'diwali-starter-pocket-box',
    price: 1299,
    discountPrice: 799,
    category: { _id: 'cat_combos', name: 'Combo Packs', slug: 'combo-packs' },
    subCategory: { _id: 'sub_cmb_budget', name: 'Budget Festive Starter Kits', slug: 'budget-starter-packs' },
    images: ['/images/cat_combos.jpg', '/images/hero_combo_boxes.jpg'],
    description: 'Budget-friendly festival starter pack containing essential flower pots, ground spinners, sparklers, and snappers.',
    characteristics: [
      { key: 'Total Varieties', value: '15 Item Packs' },
      { key: 'Price Point', value: 'Under ₹1,000 Budget Value' },
    ],
    tags: ['budget', 'starter', 'combopack', 'diwali'],
    isFeatured: false,
    isActive: true,
    stock: 120,
    rating: 4.7,
    reviewsCount: 95,
    sortOrder: 15,
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    _id: 'prod_cmb_4',
    name: 'VIP Royal Deluxe Wooden Trunk Diwali Hamper (70 Items)',
    slug: 'vip-royal-deluxe-wooden-trunk-diwali-hamper',
    price: 9999,
    discountPrice: 5999,
    category: { _id: 'cat_combos', name: 'Combo Packs', slug: 'combo-packs' },
    subCategory: { _id: 'sub_cmb_vip', name: 'VIP Grand Diwali Hampers', slug: 'vip-luxury-hampers' },
    images: ['/images/hero_combo_boxes.jpg', '/images/cat_combos.jpg'],
    description: 'The most prestigious Diwali hamper packed inside an antique carved wooden trunk. Includes giant aerial cakes, jumbo fountains, and silver sparklers.',
    characteristics: [
      { key: 'Items Count', value: '70 Ultra-Premium Varieties' },
      { key: 'Packaging', value: 'Handcrafted Wooden Keepsake Trunk' },
    ],
    tags: ['vip', 'luxury', 'trunk', 'hamper', 'exclusive'],
    isFeatured: false,
    isActive: true,
    stock: 15,
    rating: 5.0,
    reviewsCount: 42,
    sortOrder: 16,
    createdAt: '2026-09-02T10:00:00.000Z',
  },

  // ── Ground Spinners Subcategories Products
  {
    _id: 'prod_spn_1',
    name: 'Deluxe Wheel Big Zamin Chakkars (Pack of 20)',
    slug: 'deluxe-wheel-big-zamin-chakkars',
    price: 499,
    discountPrice: 289,
    category: { _id: 'cat_spinners', name: 'Ground Spinners', slug: 'ground-spinners' },
    subCategory: { _id: 'sub_spn_wheel', name: 'Deluxe Wheel Chakkars', slug: 'deluxe-wheel-chakkars' },
    images: ['/images/cat_spinners.jpg', '/images/crackly-artwork.png'],
    description: 'Traditional large ground spinning wheels throwing a 4-foot radius golden fiery halo.',
    characteristics: [
      { key: 'Quantity', value: '20 Deluxe Wheels' },
      { key: 'Spin Time', value: '25 Seconds each' },
    ],
    tags: ['spinners', 'chakkars', 'ground', 'traditional'],
    isFeatured: true,
    isActive: true,
    stock: 160,
    rating: 4.8,
    reviewsCount: 195,
    sortOrder: 17,
    createdAt: '2026-09-02T10:00:00.000Z',
  },
  {
    _id: 'prod_spn_2',
    name: 'Whistling Deluxe Ground Wheel Spinners (Pack of 15)',
    slug: 'whistling-deluxe-ground-wheel-spinners',
    price: 599,
    discountPrice: 329,
    category: { _id: 'cat_spinners', name: 'Ground Spinners', slug: 'ground-spinners' },
    subCategory: { _id: 'sub_spn_whistling', name: 'Musical & Whistling Chakkars', slug: 'musical-whistling-chakkars' },
    images: ['/images/cat_spinners.jpg', '/images/hero_aerial_fireworks.jpg'],
    description: 'High-speed rotating ground chakkars with loud musical whistling notes and dual-ring fiery halos.',
    characteristics: [
      { key: 'Sound', value: 'Loud Whistling Siren RPM' },
      { key: 'Pack Count', value: '15 Whistling Chakkars' },
    ],
    tags: ['spinners', 'chakkar', 'ground', 'whistle'],
    isFeatured: true,
    isActive: true,
    stock: 140,
    rating: 4.7,
    reviewsCount: 185,
    sortOrder: 18,
    createdAt: '2026-09-03T10:00:00.000Z',
  },
  {
    _id: 'prod_spn_3',
    name: 'Disco Strobe Multi-Color Rotary Ground Discs (Pack of 10)',
    slug: 'disco-strobe-rotary-ground-discs',
    price: 649,
    discountPrice: 379,
    category: { _id: 'cat_spinners', name: 'Ground Spinners', slug: 'ground-spinners' },
    subCategory: { _id: 'sub_spn_disco', name: 'Disco Strobe & Rotary Spinners', slug: 'disco-strobe-rotary-spinners' },
    images: ['/images/cat_spinners.jpg', '/images/cat_fountains.jpg'],
    description: 'Spins rapidly while flashing multi-color disco strobe bursts across the floor.',
    characteristics: [
      { key: 'Strobe Flash', value: 'RGB Multi-Color Pulse' },
      { key: 'Count', value: '10 Strobe Discs' },
    ],
    tags: ['spinners', 'disco', 'strobe', 'color'],
    isFeatured: false,
    isActive: true,
    stock: 90,
    rating: 4.9,
    reviewsCount: 82,
    sortOrder: 19,
    createdAt: '2026-09-03T10:00:00.000Z',
  },

  // ── Novelty Items Subcategories Products
  {
    _id: 'prod_nov_1',
    name: 'Magic Rainbow Smoke Tubes Kit (6 Color Grenades)',
    slug: 'magic-rainbow-smoke-tubes-kit',
    price: 699,
    discountPrice: 389,
    category: { _id: 'cat_novelty', name: 'Novelty Items', slug: 'novelty-items' },
    subCategory: { _id: 'sub_nov_smoke', name: 'Color Smoke Tubes & Fountains', slug: 'color-smoke-tubes' },
    images: ['/images/cat_novelty.jpg', '/images/hero_aerial_fireworks.jpg'],
    description: 'High-density daylight color smoke tubes in Yellow, Purple, Cyan, Orange, Pink, and Green.',
    characteristics: [
      { key: 'Colors', value: '6 Neon Shades' },
      { key: 'Smoke Duration', value: '60 Seconds continuous dense cloud' },
    ],
    tags: ['novelty', 'smoke', 'colors', 'daytime'],
    isFeatured: true,
    isActive: true,
    stock: 120,
    rating: 4.9,
    reviewsCount: 220,
    sortOrder: 20,
    createdAt: '2026-09-04T10:00:00.000Z',
  },
  {
    _id: 'prod_nov_2',
    name: 'Party Pop Pop Drop Snappers (Box of 500 Snaps)',
    slug: 'party-pop-pop-drop-snappers',
    price: 399,
    discountPrice: 199,
    category: { _id: 'cat_novelty', name: 'Novelty Items', slug: 'novelty-items' },
    subCategory: { _id: 'sub_nov_poppop', name: 'Pop Pops & Throw Snappers', slug: 'pop-pops-snappers' },
    images: ['/images/cat_novelty.jpg', '/images/cat_sparklers.jpg'],
    description: 'Fun throw-down pop pop snappers that pop on impact. Safe, noiseless, and fun for all ages.',
    characteristics: [
      { key: 'Quantity', value: '500 Pop Pops (10 Boxes of 50 pcs)' },
      { key: 'Safety', value: 'Zero Fire Required (Impact Friction)' },
    ],
    tags: ['poppop', 'snappers', 'kids', 'safe'],
    isFeatured: false,
    isActive: true,
    stock: 250,
    rating: 4.8,
    reviewsCount: 310,
    sortOrder: 21,
    createdAt: '2026-09-04T10:00:00.000Z',
  },
  {
    _id: 'prod_nov_3',
    name: 'Magic Crackling Whips & Serpent Tablets Assortment',
    slug: 'magic-crackling-whips-serpent-tablets',
    price: 449,
    discountPrice: 249,
    category: { _id: 'cat_novelty', name: 'Novelty Items', slug: 'novelty-items' },
    subCategory: { _id: 'sub_nov_magic', name: 'Magic Whips & Serpent Tablets', slug: 'magic-whips-serpent-eggs' },
    images: ['/images/cat_novelty.jpg', '/images/cat_sparklers.jpg'],
    description: 'Long crackling whip cords and growing black serpent egg tablets.',
    characteristics: [
      { key: 'Contents', value: '10 Magic Whips + 20 Serpent Eggs' },
      { key: 'Effect', value: 'Crackling Fuse + Growing Serpent Shape' },
    ],
    tags: ['whip', 'serpent', 'novelty', 'magic'],
    isFeatured: false,
    isActive: true,
    stock: 140,
    rating: 4.7,
    reviewsCount: 115,
    sortOrder: 22,
    createdAt: '2026-09-05T10:00:00.000Z',
  },
  {
    _id: 'prod_nov_4',
    name: 'Classic Sivakasi Green Atom Bombs (Pack of 10)',
    slug: 'classic-sivakasi-green-atom-bombs',
    price: 599,
    discountPrice: 349,
    category: { _id: 'cat_novelty', name: 'Novelty Items', slug: 'novelty-items' },
    subCategory: { _id: 'sub_nov_bombs', name: 'Classic Sound Bombs & Hydro Rockets', slug: 'classic-sound-crackers' },
    images: ['/images/cat_novelty.jpg', '/images/hero_aerial_fireworks.jpg'],
    description: 'Authentic CSIR-NEERI certified green sound atom bombs with safe decibel limits.',
    characteristics: [
      { key: 'Decibel Rating', value: 'Under 120 dB (Government Approved)' },
      { key: 'Pack Size', value: '10 Green Atom Bombs' },
    ],
    tags: ['bombs', 'sound', 'traditional', 'atombomb'],
    isFeatured: false,
    isActive: true,
    stock: 90,
    rating: 4.8,
    reviewsCount: 135,
    sortOrder: 23,
    createdAt: '2026-09-05T10:00:00.000Z',
  },
];

// ── Value Propositions ───────────────────────────────────────────────────────
export const valuePropositions = [
  {
    icon: '🚚',
    title: 'Fast Delivery',
    subtitle: 'Across India with Live WhatsApp Tracking',
  },
  {
    icon: '🛡️',
    title: 'Genuine Products',
    subtitle: '100% Original Sivakasi Fresh Stock',
  },
  {
    icon: '💛',
    title: 'Safe Celebrations',
    subtitle: 'CSIR-NEERI Green Certified Crackers',
  },
  {
    icon: '⚡',
    title: 'Instant Dispatch',
    subtitle: 'Packed with Heavy-Duty Safety Wrap',
  },
];

// ── Promotional Offer Banner ─────────────────────────────────────────────────
export const promoOffer = {
  badge: 'DIWALI SPECIAL OFFER',
  title: 'Get Flat 15% Off On Your Entire Festival Order',
  couponCode: 'DIWALI15',
  description: 'Apply coupon code at checkout for immediate festive savings!',
  buttonText: 'Claim Festive Discount 🎆',
};

// ── Coupons ──────────────────────────────────────────────────────────────────
export const coupons = [
  {
    code: 'DIWALI15',
    type: 'percentage',
    discountPercent: 15,
    minOrderAmount: 999,
    maxDiscountAmount: 1000,
    description: '15% off on Diwali orders above ₹999',
  },
  {
    code: 'WELCOME10',
    type: 'percentage',
    discountPercent: 10,
    minOrderAmount: 499,
    maxDiscountAmount: 500,
    description: '10% discount on your first order',
  },
  {
    code: 'DHAMAKA500',
    type: 'fixed',
    discountAmount: 500,
    minOrderAmount: 2499,
    description: 'Flat ₹500 off on festive orders above ₹2,499',
  },
];

// ── Sample Orders ────────────────────────────────────────────────────────────
export const mockOrders = [
  {
    _id: 'ord_festive_101',
    orderNumber: 'CRK-99214',
    status: 'shipped',
    paymentMethod: 'razorpay',
    razorpayPaymentId: 'pay_Festive883Klm',
    trackingId: 'BLUEDART-882910394',
    courier: 'BlueDart Air Express',
    subtotal: 4198,
    discountAmount: 629,
    total: 3569,
    items: [
      {
        product: 'prod_cmb_1',
        name: 'Mega Diwali Dhamaka Family Gift Box (45 Items)',
        price: 2899,
        quantity: 1,
        image: '/images/cat_combos.jpg',
      },
      {
        product: 'prod_aer_1',
        name: 'Sky King 30-Shot Multi-Color Aerial Bloom',
        price: 1299,
        quantity: 1,
        image: '/images/cat_aerial.jpg',
      },
    ],
    shippingAddress: {
      street: 'Flat 4A, Green Meadows, 14th Main Road, Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      landmark: 'Near Tower Park',
    },
    statusHistory: [
      {
        status: 'placed',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        note: 'Order placed & prepaid via Razorpay Online Payment',
      },
      {
        status: 'processing',
        timestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
        note: 'Quality inspection & safety packing completed in Sivakasi Central Hub',
      },
      {
        status: 'shipped',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        note: 'Dispatched via BlueDart Express (AWB: BLUEDART-882910394)',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

// ── Store Information ────────────────────────────────────────────────────────
export const storeInfo = {
  name: 'Crackly',
  tagline: 'Spread Happiness — 100% Original Sivakasi Green Crackers',
  email: 'support@cracklystore.in',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  address: 'No. 88, Sivakasi Main Road, Sivakasi, Tamil Nadu - 626123',
  supportHours: 'Mon - Sun: 8:00 AM – 10:00 PM IST (Festive Support)',
};

// ── Query & Filter Helpers ───────────────────────────────────────────────────

export function getProducts(options = {}) {
  const { category, subCategory, sort = 'newest', search, limit, isFeatured } = options;
  let result = [...products];

  if (category) {
    result = result.filter(
      (p) =>
        p.category?._id === category ||
        p.category?.slug === category ||
        p.category === category
    );
  }

  if (subCategory) {
    result = result.filter(
      (p) =>
        p.subCategory?._id === subCategory ||
        p.subCategory?.slug === subCategory ||
        p.subCategory === subCategory
    );
  }

  if (isFeatured !== undefined) {
    result = result.filter((p) => p.isFeatured === isFeatured);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.subCategory?.name?.toLowerCase().includes(q)
    );
  }

  if (sort === 'price_asc') {
    result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price_desc') {
    result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'featured') {
    result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  } else {
    result.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  if (limit && limit > 0) {
    result = result.slice(0, limit);
  }

  return result;
}

export function getProductBySlug(slug) {
  if (!slug) return null;
  return (
    products.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) ||
    products.find((p) => p._id === slug) ||
    null
  );
}

export function getProductById(id) {
  if (!id) return null;
  return products.find((p) => p._id === id || p.slug === id) || null;
}

export function getCategories() {
  return [...categories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export function getCategoryBySlug(slug) {
  if (!slug) return null;
  return (
    categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) ||
    categories.find((c) => c._id === slug) ||
    null
  );
}

export function getSubcategoriesByCategory(categorySlug) {
  const cat = getCategoryBySlug(categorySlug);
  return cat?.subcategories || [];
}

export function getSubcategoryBySlug(categorySlug, subSlug) {
  const subcats = getSubcategoriesByCategory(categorySlug);
  return (
    subcats.find((s) => s.slug.toLowerCase() === subSlug.toLowerCase()) ||
    subcats.find((s) => s._id === subSlug) ||
    null
  );
}

export function searchProducts(query, params = {}) {
  return getProducts({ search: query, ...params });
}

export function validateCoupon(code, subtotal = 0) {
  if (!code) return { valid: false, message: 'Please enter a coupon code' };
  const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

  if (!found) {
    return { valid: false, message: 'Invalid coupon code' };
  }

  if (subtotal < (found.minOrderAmount || 0)) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${found.minOrderAmount} required for this coupon`,
    };
  }

  let discount = 0;
  if (found.type === 'percentage') {
    discount = Math.round((subtotal * found.discountPercent) / 100);
    if (found.maxDiscountAmount) {
      discount = Math.min(discount, found.maxDiscountAmount);
    }
  } else if (found.type === 'fixed') {
    discount = Math.min(subtotal, found.discountAmount);
  }

  return {
    valid: true,
    code: found.code,
    couponDiscount: discount,
    description: found.description,
  };
}

export function getOrders() {
  return [...mockOrders];
}

export function getOrderById(id) {
  return (
    mockOrders.find((o) => o._id === id || o.orderNumber === id) ||
    mockOrders[0]
  );
}

export default {
  heroSlides,
  categories,
  products,
  valuePropositions,
  promoOffer,
  coupons,
  mockOrders,
  storeInfo,
  getProducts,
  getProductBySlug,
  getProductById,
  getCategories,
  getCategoryBySlug,
  getSubcategoriesByCategory,
  getSubcategoryBySlug,
  searchProducts,
  validateCoupon,
  getOrders,
  getOrderById,
};
