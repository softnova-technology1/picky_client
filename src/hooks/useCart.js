import { useQuery } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';
import { useAuthStore } from '../store/authStore';

export function useCart() {
  const { isLoggedIn } = useAuthStore();

  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.get(),
    enabled: isLoggedIn,
    staleTime: 60_000,
  });
}
