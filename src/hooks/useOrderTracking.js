import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/order.service';

export function useOrderTracking(orderId) {
  return useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: () => orderService.getTracking(orderId),
    enabled: !!orderId,
    staleTime: 30_000,
    refetchInterval: (data) =>
      data?.data?.status === 'delivered' ? false : 30_000, // stop polling when delivered
  });
}
