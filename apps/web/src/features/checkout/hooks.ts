'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-provider';
import { checkoutApi } from './api';
import type { CheckoutPayload } from './types';
export const checkoutKeys = {
  pickups: ['pickup-locations'] as const,
  preview: (p: CheckoutPayload | null) => ['checkout-preview', p] as const,
};
export const usePickupLocations = () =>
  useQuery({
    queryKey: checkoutKeys.pickups,
    queryFn: checkoutApi.pickups,
    staleTime: 300_000,
  });
export function useCheckoutPreview(
  payload: CheckoutPayload | null,
  enabled: boolean,
) {
  const a = useAuth();
  return useQuery({
    queryKey: checkoutKeys.preview(payload),
    queryFn: () => a.authorized((t) => checkoutApi.preview(t, payload!)),
    enabled: a.status === 'authenticated' && enabled && !!payload,
    retry: false,
  });
}
export function useCreateOrder() {
  const a = useAuth();
  return useMutation({
    mutationFn: ({ payload, key }: { payload: CheckoutPayload; key: string }) =>
      a.authorized((t) => checkoutApi.create(t, payload, key)),
    retry: false,
  });
}
