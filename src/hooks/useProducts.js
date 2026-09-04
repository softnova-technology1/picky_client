import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export function useProducts(params) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.list(params),
    staleTime: 5 * 60_000,
  });
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60_000,
  });
}
