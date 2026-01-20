import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { ExtendedModuleConfig, formatModulePrice } from '@/types/modules';
import { getModuleFromCatalog } from '@/config/moduleCatalog';

// ============================================================================
// TYPES
// ============================================================================

export interface CartItem {
  moduleId: string;
  module: ExtendedModuleConfig;
  quantity: number;
  billingCycle: 'monthly' | 'yearly';
  unitPrice: number;
  totalPrice: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountPercent: number;
  couponCode: string | null;
  total: number;
  monthlyEquivalent: number;
}

interface AddonsCartContextType {
  // Cart state
  items: CartItem[];
  isOpen: boolean;
  billingCycle: 'monthly' | 'yearly';
  couponCode: string | null;
  couponDiscount: number;
  
  // Actions
  addToCart: (moduleId: string, quantity?: number) => void;
  removeFromCart: (moduleId: string) => void;
  updateQuantity: (moduleId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Coupon
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  
  // Billing cycle
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
  
  // UI
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Summary
  getSummary: () => CartSummary;
  itemCount: number;
}

const AddonsCartContext = createContext<AddonsCartContextType | undefined>(undefined);

// ============================================================================
// MOCK COUPONS
// ============================================================================

const VALID_COUPONS: Record<string, { discount: number; type: 'percent' | 'fixed' }> = {
  'FIRST10': { discount: 10, type: 'percent' },
  'SAVE20': { discount: 20, type: 'percent' },
  'WELCOME50': { discount: 5000, type: 'fixed' }, // R$ 50,00
};

// ============================================================================
// PROVIDER
// ============================================================================

export function AddonsCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Add item to cart
  const addToCart = useCallback((moduleId: string, quantity: number = 1) => {
    const module = getModuleFromCatalog(moduleId);
    if (!module || !module.pricing) return;
    
    setItems(prev => {
      const existing = prev.find(item => item.moduleId === moduleId);
      
      if (existing) {
        // Update quantity
        return prev.map(item => 
          item.moduleId === moduleId 
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * item.unitPrice
              }
            : item
        );
      }
      
      // Add new item
      const unitPrice = billingCycle === 'yearly' 
        ? module.pricing!.yearlyPrice / 12 
        : module.pricing!.monthlyPrice;
      
      return [...prev, {
        moduleId,
        module,
        quantity,
        billingCycle,
        unitPrice,
        totalPrice: quantity * unitPrice,
      }];
    });
    
    setIsOpen(true);
  }, [billingCycle]);

  // Remove item from cart
  const removeFromCart = useCallback((moduleId: string) => {
    setItems(prev => prev.filter(item => item.moduleId !== moduleId));
  }, []);

  // Update quantity
  const updateQuantity = useCallback((moduleId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(moduleId);
      return;
    }
    
    setItems(prev => prev.map(item => 
      item.moduleId === moduleId 
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ));
  }, [removeFromCart]);

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
  }, []);

  // Apply coupon
  const applyCoupon = useCallback((code: string): boolean => {
    const coupon = VALID_COUPONS[code.toUpperCase()];
    if (!coupon) {
      return false;
    }
    
    setCouponCode(code.toUpperCase());
    setCouponDiscount(coupon.discount);
    return true;
  }, []);

  // Remove coupon
  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setCouponDiscount(0);
  }, []);

  // Update billing cycle and recalculate prices
  const handleSetBillingCycle = useCallback((cycle: 'monthly' | 'yearly') => {
    setBillingCycle(cycle);
    
    // Recalculate prices for all items
    setItems(prev => prev.map(item => {
      const module = item.module;
      if (!module.pricing) return item;
      
      const unitPrice = cycle === 'yearly' 
        ? module.pricing.yearlyPrice / 12 
        : module.pricing.monthlyPrice;
      
      return {
        ...item,
        billingCycle: cycle,
        unitPrice,
        totalPrice: item.quantity * unitPrice,
      };
    }));
  }, []);

  // Get cart summary
  const getSummary = useCallback((): CartSummary => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    let discount = 0;
    let discountPercent = 0;
    
    if (couponCode && couponDiscount > 0) {
      const coupon = VALID_COUPONS[couponCode];
      if (coupon) {
        if (coupon.type === 'percent') {
          discountPercent = coupon.discount;
          discount = Math.round(subtotal * (coupon.discount / 100));
        } else {
          discount = Math.min(coupon.discount, subtotal);
          discountPercent = Math.round((discount / subtotal) * 100);
        }
      }
    }
    
    // Yearly discount (20% off)
    if (billingCycle === 'yearly') {
      discountPercent += 20;
    }
    
    const total = Math.max(0, subtotal - discount);
    const monthlyEquivalent = billingCycle === 'yearly' ? total : total;
    
    return {
      items,
      subtotal,
      discount,
      discountPercent,
      couponCode,
      total,
      monthlyEquivalent,
    };
  }, [items, couponCode, couponDiscount, billingCycle]);

  // Item count
  const itemCount = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0)
  , [items]);

  const value = useMemo(() => ({
    items,
    isOpen,
    billingCycle,
    couponCode,
    couponDiscount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    setBillingCycle: handleSetBillingCycle,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    toggleCart: () => setIsOpen(prev => !prev),
    getSummary,
    itemCount,
  }), [
    items,
    isOpen,
    billingCycle,
    couponCode,
    couponDiscount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    handleSetBillingCycle,
    getSummary,
    itemCount,
  ]);

  return (
    <AddonsCartContext.Provider value={value}>
      {children}
    </AddonsCartContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useAddonsCart() {
  const context = useContext(AddonsCartContext);
  if (!context) {
    throw new Error('useAddonsCart must be used within an AddonsCartProvider');
  }
  return context;
}
