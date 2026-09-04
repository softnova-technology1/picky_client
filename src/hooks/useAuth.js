import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { useCartStore } from '../store/cartStore';
import { cartService } from '../services/cart.service';

export function useAuth() {
  const { user, isLoggedIn, login, logout: storeLogout, accessToken } = useAuthStore();

  const handleLogout = async () => {
    const { refreshToken } = useAuthStore.getState();
    try { await authService.logout(refreshToken); } catch (_) {}
    storeLogout();
    useCartStore.getState().clearCart();
  };

  return { user, isLoggedIn, accessToken, logout: handleLogout };
}
