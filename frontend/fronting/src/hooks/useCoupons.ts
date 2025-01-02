import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Coupon {
  code: string;
  discount: number;
  minValue?: number;
  description: string;
  expiresAt: string;
  usageLimit?: number;
  usageCount: number;
}

interface CouponValidation {
  valid: boolean;
  message?: string;
  discount?: number;
}

export function useCoupons() {
  const { user } = useAuth();
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch('/api/coupons/available');
        if (!response.ok) throw new Error('Failed to fetch coupons');
        const data = await response.json();
        setAvailableCoupons(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // Validar cupom
  const validateCoupon = async (code: string, subtotal: number): Promise<CouponValidation> => {
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal, userId: user?.id }),
    });
    if (!response.ok) throw new Error('Failed to validate coupon');
    return response.json();
  };

  // Aplicar cupom
  const applyCoupon = async (code: string) => {
    const response = await fetch('/api/coupons/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId: user?.id }),
    });
    if (!response.ok) throw new Error('Failed to apply coupon');
    return response.json();
  };

  return {
    availableCoupons,
    loading,
    error,
    validateCoupon,
    applyCoupon,
  };
}