import { PICKY_CATEGORIES, MEGAMENU_ALL_CATEGORIES } from './categoriesData';

export const MOCK_CATEGORIES = PICKY_CATEGORIES;
export const MOCK_SUBCATEGORIES = MEGAMENU_ALL_CATEGORIES.flatMap(c => {
  const cat = PICKY_CATEGORIES.find(pc => pc.slug === c.slug);
  return c.links.map(l => ({ _id: `sub-${l.slug}`, name: l.name, slug: l.slug, categoryId: cat?._id }));
});
