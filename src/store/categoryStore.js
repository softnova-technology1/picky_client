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
      
      // Merge DB categories with rich UI properties from PICKY_CATEGORIES
      const cList = dbCategories.map(dbCat => {
        const mockCat = PICKY_CATEGORIES.find(mc => mc.slug === dbCat.slug);
        return {
          ...mockCat, // Fallback rich properties (bgGradient, heroImage, etc.)
          ...dbCat,   // Override with DB real data (name, slug, _id, isActive)
          image: dbCat.image || mockCat?.image, // Prefer DB image, fallback to mock
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
