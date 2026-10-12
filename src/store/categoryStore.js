import { create } from 'zustand';
import { categoryService } from '../services/category.service';
import { PICKY_CATEGORIES } from '../data/categoriesData';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  subcategories: [],
  loading: false,
  fetched: false,
  
  fetchCategories: async () => {
    if (get().fetched || get().loading) return; // Prevent multiple fetches
    
    set({ loading: true });
    try {
      const [catRes, subRes] = await Promise.all([
        categoryService.list().catch(() => null),
        categoryService.getSubCategories().catch(() => null)
      ]);
      const dbCategories = catRes?.data?.data || catRes?.data || [];
      
      // Merge DB categories - STRICTLY use real DB image only (no mock images)
      const cList = dbCategories.map(dbCat => {
        const mockCat = PICKY_CATEGORIES.find(mc => mc.slug === dbCat.slug);
        return {
          ...mockCat, // Fallback non-image properties (icon, bgGradient)
          ...dbCat,   // Override with DB real data (name, slug, _id, isActive)
          image: dbCat.image || null, // STRICTLY REAL DB image only! No mock image fallback
        };
      });

      const sList = subRes?.data?.data || subRes?.data || [];
      
      set({ 
        categories: cList, 
        subcategories: sList,
        fetched: true,
        loading: false
      });
    } catch (err) {
      console.error("Error fetching categories:", err);
      set({ loading: false, fetched: true });
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
