import { create } from 'zustand';
import { categoryService } from '../services/category.service';
import { PICKY_CATEGORIES } from '../data/categoriesData';
import { getCatalogSyncChannel } from '../utils/realtimeSync';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  subcategories: [],
  loading: false,
  fetched: false,
  
  fetchCategories: async (force = false) => {
    // Prevent redundant fetches only if we already have loaded categories
    if (!force && get().loading) return;
    if (!force && get().fetched && get().categories.length > 0) return;
    
    set({ loading: true });
    try {
      const [catRes, subRes] = await Promise.all([
        categoryService.list().catch(() => null),
        categoryService.getSubCategories().catch(() => null)
      ]);
      const dbCategories = catRes?.data?.data || catRes?.data || [];
      
      // Merge DB categories - filter only active categories for customer-facing site
      const cList = dbCategories
        .filter((dbCat) => dbCat.isActive !== false)
        .map((dbCat) => {
          const mockCat = PICKY_CATEGORIES.find((mc) => mc.slug === dbCat.slug);
          return {
            ...mockCat, // Fallback non-image properties (icon, bgGradient)
            ...dbCat,   // Override with DB real data (name, slug, _id, isActive)
            image: dbCat.image || null, // STRICTLY REAL DB image only! No mock image fallback
          };
        });

      const sList = subRes?.data?.data || subRes?.data || [];
      const hasCategories = cList.length > 0;
      
      set({ 
        categories: cList, 
        subcategories: sList,
        fetched: hasCategories,
        loading: false
      });
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Keep fetched false so it retries automatically when DB comes online
      set({ loading: false, fetched: false });
    }
  },
  
  getMegaMenu: () => {
    const { categories, subcategories } = get();
    return categories.map(cat => {
      const catSubs = subcategories.filter(s => s.categoryId === cat._id || s.categoryId?._id === cat._id);
      return {
        title: cat.name,
        slug: cat.slug,
        links: catSubs.map(s => ({ name: s.name, slug: s.slug }))
      };
    });
  }
}));

// Real-Time Cross-Tab & Window Listener for Catalog Updates
if (typeof window !== 'undefined') {
  const ch = getCatalogSyncChannel();
  if (ch) {
    ch.onmessage = (event) => {
      if (event?.data?.type === 'CATALOG_UPDATED') {
        useCategoryStore.getState().fetchCategories(true);
      }
    };
  }

  window.addEventListener('picky_catalog_updated', () => {
    useCategoryStore.getState().fetchCategories(true);
  });
}
