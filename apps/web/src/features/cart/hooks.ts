'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from './api';
import type { Cart } from './types';
export const cartKey = ['cart'] as const;
export function useCart() {
  return useQuery({ queryKey: cartKey, queryFn: cartApi.get });
}
function useCartMutation<T>(fn: (x: T) => Promise<Cart | void>) {
  const q = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) =>
      r
        ? q.setQueryData(cartKey, r)
        : q.invalidateQueries({ queryKey: cartKey }),
  });
}
export const useAddCartItem = () => useCartMutation(cartApi.add);
export const useUpdateCartItem = () =>
  useCartMutation(({ id, quantity }: { id: string; quantity: string }) =>
    cartApi.update(id, quantity),
  );
export const useRemoveCartItem = () =>
  useCartMutation((id: string) => cartApi.remove(id));
export const useClearCart = () => useCartMutation(() => cartApi.clear());
