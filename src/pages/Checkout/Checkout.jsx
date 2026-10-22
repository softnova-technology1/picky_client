import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Modal from '../../components/ui/Modal/Modal';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { orderService } from '../../services/order.service';
import { settingsService } from '../../services/settings.service';
import { authService } from '../../services/auth.service';
import { formatPrice } from '../../utils/formatPrice';
import { calculateShippingFee, isTamilNaduPincode } from '../../utils/shippingCalculator';
import { useCouponStore } from '../../store/couponStore';
import { useOrderStore } from '../../store/orderStore';
import styles from './Checkout.module.css';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Truck,
  Sparkles,
  User,
  Phone,
  Mail,
  X,
  ShoppingBag,
  Building2,
  QrCode,
  Tag,
  Minus,
  Plus,
  Edit3,
  Gift,
} from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Dynamic delivery fee and duration calculator based on PIN Code zones
export const calculateDeliveryByPincode = (pincodeStr, customSettings = null) => {
  return calculateShippingFee(pincodeStr, customSettings);
};

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, buyNowItem, clearBuyNowItem, updateQty, updateBuyNowQty, coupon, couponDiscount, setCoupon, clearCart, removeItem } = useCartStore();
  const isBuyNow = searchParams.get('buyNow') === 'true' && Boolean(buyNowItem);
  const fromCart = searchParams.get('fromCart') === 'true' || Boolean(buyNowItem?.fromCart);
  const checkoutItems = isBuyNow ? [buyNowItem] : items;

  // ─── Auto Stock Reservation for Checkout Lifecycle ───
  // Immediately reserve stock whenever customer enters checkout with products!
  const sessionIdRef = React.useRef(
    `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  );
  const orderCompletedRef = React.useRef(false);
  const lastReservedKeyRef = React.useRef('');

  // 1. Auto-reserve stock on mount and on item/quantity change in checkout
  React.useEffect(() => {
    if (checkoutItems.length === 0 || orderCompletedRef.current) return;

    const payloadItems = checkoutItems.map((i) => ({
      productId: i.productId || i._id || i.id,
      quantity: i.quantity || 1,
    }));

    const key = JSON.stringify(payloadItems);
    if (lastReservedKeyRef.current === key) return;
    lastReservedKeyRef.current = key;

    orderService
      .reserveCheckout({
        sessionId: sessionIdRef.current,
        items: payloadItems,
      })
      .then(() => {
        // Reserved in DB
      })
      .catch((err) => {
        console.warn('Checkout auto-reserve notice:', err?.response?.data?.message || err?.message);
      });
  }, [checkoutItems]);

  // 2. Release reserved stock when customer leaves / unmounts Checkout without completing order
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (!orderCompletedRef.current && sessionIdRef.current) {
        try {
          const payload = JSON.stringify({ sessionId: sessionIdRef.current });
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/v1/orders/checkout/release', blob);
        } catch (_) {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (!orderCompletedRef.current && sessionIdRef.current) {
        orderService
          .releaseCheckout({
            sessionId: sessionIdRef.current,
          })
          .catch((err) => console.warn('Checkout release on unmount notice:', err));
      }
    };
  }, []);

  // Handle quantity changes cleanly in checkout (both Buy Now and regular bag items)
  const handleUpdateItemQty = (item, newQty) => {
    if (newQty < 1) return;
    const maxStock = typeof item.stock === 'number' ? item.stock : (typeof item.countInStock === 'number' ? item.countInStock : 10);
    if (newQty > maxStock) {
      showToast(`Maximum available quantity reached for "${item.name}"`, 'warning');
      return;
    }
    if (isBuyNow) {
      if (updateBuyNowQty) {
        updateBuyNowQty(newQty);
      } else {
        updateQty(item, newQty);
      }
    } else {
      updateQty(item, newQty);
    }
  };

  // Enforce stock ceiling on mount / loaded state
  React.useEffect(() => {
    if (isBuyNow && buyNowItem) {
      const maxStock = typeof buyNowItem.stock === 'number' ? buyNowItem.stock : 10;
      if ((buyNowItem.quantity || 1) > maxStock) {
        updateBuyNowQty(maxStock);
      }
    }
  }, [isBuyNow, buyNowItem?.stock]);
  const { user, updateUser } = useAuthStore();
  const { showToast } = useUiStore();
  const { coupons } = useCouponStore();

  // Live Shipping Rules State loaded from MongoDB Database with instant synchronous cache hydration
  const [shippingSettings, setShippingSettings] = useState(() => {
    return settingsService.getCachedShippingSettings();
  });

  // Fetch live shipping & pincode rules from MongoDB on mount
  React.useEffect(() => {
    let isMounted = true;
    async function loadShippingRules() {
      try {
        const res = await settingsService.getSettings();
        const data = res?.data || res;
        if (isMounted && data?.shipping) {
          setShippingSettings(data.shipping);
        }
      } catch (err) {
        console.warn('Live shipping rules fetch notice:', err);
      }
    }
    loadShippingRules();
    return () => {
      isMounted = false;
    };
  }, []);

  // Workflow step: 1 = 'checkout' (Shipping & Delivery Form), 2 = 'payment' (Payment Method & Order Summary)
  const [checkoutStep, setCheckoutStep] = useState(1);

  // Saved Addresses State loaded from MongoDB Database with instant cache fallback on page reload
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const cached = localStorage.getItem('picky_user_addresses');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      const cachedId = localStorage.getItem('picky_selected_address_id');
      if (cachedId) return cachedId;
      const cached = localStorage.getItem('picky_user_addresses');
      if (cached) {
        const list = JSON.parse(cached);
        const def = list.find((a) => a.isDefault) || list[0];
        return def?.id || null;
      }
    } catch {}
    return null;
  });

  // Customer Contact & Shipping Address Form State with instant hydration
  const [formData, setFormData] = useState(() => {
    try {
      const cached = localStorage.getItem('picky_user_addresses');
      const cachedId = localStorage.getItem('picky_selected_address_id');
      if (cached) {
        const list = JSON.parse(cached);
        const matched = list.find((a) => a.id === cachedId) || list.find((a) => a.isDefault) || list[0];
        if (matched) {
          return {
            fullName: matched.fullName || '',
            email: matched.email || '',
            phone: matched.phone || '',
            pincode: matched.pincode || '',
            street: matched.street || '',
            landmark: matched.landmark || '',
            city: matched.city || '',
            state: matched.state || '',
          };
        }
      }
    } catch {}
    return {
      fullName: '',
      email: '',
      phone: '',
      pincode: '',
      street: '',
      city: '',
      state: '',
      landmark: '',
    };
  });

  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Fetch addresses directly from MongoDB Database on mount or when user changes
  React.useEffect(() => {
    let isMounted = true;

    const loadDbAddresses = async () => {
      try {
        const res = await authService.getAddresses();
        const list = res?.data || res || [];
        const normList = Array.isArray(list)
          ? list.map((a) => ({
              ...a,
              id: a._id ? a._id.toString() : (a.id || `addr_${Math.random()}`),
            }))
          : [];

        if (!isMounted) return;

        if (normList.length > 0) {
          setSavedAddresses(normList);
          try {
            localStorage.setItem('picky_user_addresses', JSON.stringify(normList));
          } catch (_) {}
          const defaultAddr = normList.find((a) => a.isDefault) || normList[0];
          setSelectedAddressId((prevId) => {
            const stillExists = prevId && normList.some((a) => a.id === prevId);
            const activeId = stillExists ? prevId : defaultAddr.id;
            try {
              localStorage.setItem('picky_selected_address_id', activeId);
            } catch (_) {}
            return activeId;
          });
          setIsAddingNewAddress(false);
          setFormData((prev) => {
            if (prev.pincode) return prev;
            return {
              fullName: defaultAddr.fullName || user?.name || '',
              email: defaultAddr.email || user?.email || '',
              phone: defaultAddr.phone || user?.phone || '',
              pincode: defaultAddr.pincode || '',
              street: defaultAddr.street || '',
              landmark: defaultAddr.landmark || '',
              city: defaultAddr.city || '',
              state: defaultAddr.state || '',
            };
          });
        } else {
          // First time user / no address saved in MongoDB: show direct form fields
          setSavedAddresses([]);
          setSelectedAddressId(null);
          setIsAddingNewAddress(true);
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || user?.name || '',
            email: prev.email || user?.email || '',
            phone: prev.phone || user?.phone || '',
          }));
        }
      } catch (err) {
        console.warn('Could not fetch addresses from DB, checking user profile:', err);
        if (user?.addresses && Array.isArray(user.addresses) && user.addresses.length > 0) {
          const normList = user.addresses.map((a) => ({
            ...a,
            id: a._id ? a._id.toString() : (a.id || `addr_${Math.random()}`),
          }));
          setSavedAddresses(normList);
          const defaultAddr = normList.find((a) => a.isDefault) || normList[0];
          setSelectedAddressId(defaultAddr.id);
          setIsAddingNewAddress(false);
        } else {
          setSavedAddresses([]);
          setIsAddingNewAddress(true);
        }
      }
    };

    loadDbAddresses();

    return () => {
      isMounted = false;
    };
  }, [user?._id || user?.id]);

  // Sync formData with selected address on selection change
  React.useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId && !isAddingNewAddress) {
      try {
        localStorage.setItem('picky_selected_address_id', selectedAddressId);
      } catch (_) {}
      const matched = savedAddresses.find((a) => a.id === selectedAddressId);
      if (matched) {
        setFormData({
          fullName: matched.fullName || '',
          email: matched.email || user?.email || '',
          phone: matched.phone || '',
          pincode: matched.pincode || '',
          street: matched.street || '',
          landmark: matched.landmark || '',
          city: matched.city || '',
          state: matched.state || '',
        });
      }
    }
  }, [selectedAddressId, savedAddresses, isAddingNewAddress]);

  // Delivery Mode Selection: 'standard' | 'pickup'
  const [deliveryMode, setDeliveryMode] = useState('standard');

  // Selected Payment Method: 'card' | 'upi' | 'netbanking'
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Gift Wrapping Selection & Custom Message State
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Promo Code Input
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Payment processing & Razorpay Modal state
  const [loading, setLoading] = useState(false);
  const [showRzModal, setShowRzModal] = useState(false);
  const [rzSessionId, setRzSessionId] = useState(null);
  const [rzTab, setRzTab] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showCancelPaymentConfirm, setShowCancelPaymentConfirm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pincode') {
      const cleanPin = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        pincode: cleanPin,
        state: isTamilNaduPincode(cleanPin) && !prev.state ? 'Tamil Nadu' : prev.state,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate pricing breakdown
  const subtotal = checkoutItems.reduce((sum, item) => {
    const price = item.discountPrice || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  // Original total before discounts for strikethrough effect
  const originalSubtotal = checkoutItems.reduce((sum, item) => {
    const origPrice = item.price && item.discountPrice && item.price > item.discountPrice
      ? item.price
      : Math.round((item.discountPrice || item.price || 0) * 1.25);
    return sum + origPrice * (item.quantity || 1);
  }, 0);

  // Dynamic Pincode-based Delivery Calculation (retrieved from live MongoDB database settings)
  const activePincode = (formData.pincode || (savedAddresses.find((a) => a.id === selectedAddressId)?.pincode) || '').toString().trim();
  const deliveryInfo = calculateShippingFee(activePincode, shippingSettings, deliveryMode);
  const deliveryFee = coupon?.toUpperCase() === 'FREEDELIVERY' ? 0 : deliveryInfo.fee;
  
  // Fixed Convenience Fee as shown in reference design: ₹2
  const convenienceFee = checkoutItems.length > 0 ? 2 : 0;

  // Live Gift Wrap Configuration from MongoDB Settings
  const giftWrapConfig = shippingSettings?.giftWrap || { enabled: true, fee: 30 };
  const giftWrapFee = (isGiftWrap && giftWrapConfig?.enabled !== false)
    ? Number(giftWrapConfig.fee !== undefined ? giftWrapConfig.fee : 30)
    : 0;

  // Final Payable (including items subtotal, delivery fee, convenience fee, and optional gift wrap fee)
  const finalPayable = Math.max(0, subtotal + deliveryFee + convenienceFee + giftWrapFee - (couponDiscount || 0));

  // Handle Promo Code Application — validated against centralized MOCK_COUPONS
  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a coupon code');
      return;
    }

    // Find matching active coupon from live coupon store
    const availableCoupons = Array.isArray(coupons) && coupons.length > 0 ? coupons : [];
    const matched = availableCoupons.find(
      (c) => c.code.toUpperCase() === code && c.isActive !== false
    );

    if (!matched) {
      const inactive = availableCoupons.find((c) => c.code.toUpperCase() === code);
      if (inactive) {
        setPromoError(`Coupon "${code}" has expired or is no longer active.`);
      } else {
        const activeCodes = availableCoupons.filter((c) => c.isActive !== false).map((c) => c.code).join(', ');
        setPromoError(activeCodes ? `Invalid coupon. Try: ${activeCodes}` : 'Invalid coupon code.');
      }
      showToast('Coupon code is invalid or inactive', 'error');
      return;
    }

    if (matched.minOrderAmount && subtotal < matched.minOrderAmount) {
      setPromoError(
        `Minimum order of ${formatPrice(matched.minOrderAmount)} required for coupon "${code}".`
      );
      showToast(`Min. order ${formatPrice(matched.minOrderAmount)} needed`, 'error');
      return;
    }

    let discount = 0;
    if (matched.type === 'percentage') {
      discount = Math.round((subtotal * matched.value) / 100);
      if (matched.maxDiscountAmount) {
        discount = Math.min(discount, matched.maxDiscountAmount);
      }
    } else {
      // flat
      discount = Math.min(subtotal, matched.value);
    }

    setCoupon(code, discount);
    const savingText = matched.type === 'percentage'
      ? `${matched.value}% OFF — saved ${formatPrice(discount)}`
      : `₹${matched.value} OFF applied`;
    showToast(`🎉 Coupon "${code}" applied! ${savingText}.`, 'success');
    setPromoCodeInput('');
  };

  const handleRemovePromo = () => {
    setCoupon(null, 0);
    showToast('Coupon code removed', 'info');
  };

  // Recalculate applied coupon discount dynamically if quantity/subtotal changes
  React.useEffect(() => {
    if (!coupon) return;
    const availableCoupons = Array.isArray(coupons) && coupons.length > 0 ? coupons : [];
    const matched = availableCoupons.find(
      (c) => c.code.toUpperCase() === coupon.toUpperCase() && c.isActive !== false
    );
    if (!matched) return;

    if (matched.minOrderAmount && subtotal < matched.minOrderAmount) {
      setCoupon(null, 0);
      showToast(`Coupon "${coupon}" removed: order below min. ${formatPrice(matched.minOrderAmount)}`, 'info');
      return;
    }

    let discount = 0;
    if (matched.type === 'percentage') {
      discount = Math.round((subtotal * matched.value) / 100);
      if (matched.maxDiscountAmount) {
        discount = Math.min(discount, matched.maxDiscountAmount);
      }
    } else {
      discount = Math.min(subtotal, matched.value);
    }
    if (discount !== couponDiscount) {
      setCoupon(coupon, discount);
    }
  }, [subtotal, coupon, coupons, couponDiscount]);

  // ─── Auto-Apply Recovery / Promotion Coupon from URL (?coupon=CODE) ───
  const hasAutoAppliedUrlCouponRef = React.useRef(false);
  React.useEffect(() => {
    const urlCoupon = searchParams.get('coupon')?.trim()?.toUpperCase();
    if (!urlCoupon || hasAutoAppliedUrlCouponRef.current || coupon) return;
    if (subtotal <= 0) return;

    hasAutoAppliedUrlCouponRef.current = true;
    const availableCoupons = Array.isArray(coupons) && coupons.length > 0 ? coupons : [];
    const matched = availableCoupons.find(
      (c) => c.code.toUpperCase() === urlCoupon && c.isActive !== false
    );

    if (matched) {
      if (matched.minOrderAmount && subtotal < matched.minOrderAmount) {
        showToast(`Recovery coupon "${urlCoupon}" requires min. order of ${formatPrice(matched.minOrderAmount)}`, 'info');
        return;
      }

      let discount = 0;
      if (matched.type === 'percentage') {
        discount = Math.round((subtotal * matched.value) / 100);
        if (matched.maxDiscountAmount) {
          discount = Math.min(discount, matched.maxDiscountAmount);
        }
      } else {
        discount = Math.min(subtotal, matched.value);
      }

      setCoupon(urlCoupon, discount);
      showToast(`🎉 Recovery coupon "${urlCoupon}" automatically applied!`, 'success');
    } else {
      if (urlCoupon === 'COMEBACK5') {
        const discount = Math.round((subtotal * 5) / 100);
        setCoupon('COMEBACK5', discount);
        showToast('🎉 Exclusive 5% Comeback discount automatically applied!', 'success');
      } else if (urlCoupon === 'SAVE15') {
        const discount = Math.round((subtotal * 15) / 100);
        setCoupon('SAVE15', discount);
        showToast('🎉 Exclusive 15% Comeback discount automatically applied!', 'success');
      } else if (urlCoupon === 'FREEDELIVERY') {
        setCoupon('FREEDELIVERY', 0);
        showToast('🚚 Free Delivery coupon automatically applied!', 'success');
      }
    }
  }, [searchParams, coupons, subtotal, coupon, setCoupon, showToast]);

  // Step 1 Validation & Proceeding to Payment Step
  const handleConfirmDetails = async (e) => {
    if (e) e.preventDefault();

    // Case 1: Selecting from saved addresses in DB
    if (savedAddresses.length > 0 && !isAddingNewAddress) {
      const matched = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];
      if (!matched) {
        showToast('Please select a delivery address', 'error');
        return;
      }
      setFormData({
        fullName: matched.fullName || '',
        email: matched.email || user?.email || formData.email || '',
        phone: matched.phone || '',
        pincode: matched.pincode || '',
        street: matched.street || '',
        landmark: matched.landmark || '',
        city: matched.city || '',
        state: matched.state || '',
      });
      setCheckoutStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Case 2: New address form validation (first time user or when adding new address)
    if (!formData.fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }
    if (!formData.pincode.trim()) {
      showToast('Please enter your PIN code', 'error');
      return;
    }
    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim()) {
      showToast('Please fill in your full address (Flat/House, City, State)', 'error');
      return;
    }

    // Save this address directly into MongoDB Database
    setIsSavingAddress(true);
    try {
      const addressPayload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        pincode: formData.pincode.trim(),
        street: formData.street.trim(),
        landmark: formData.landmark?.trim() || '',
        city: formData.city.trim(),
        state: formData.state.trim(),
        isDefault: savedAddresses.length === 0,
      };

      const res = await authService.addAddress(addressPayload);
      const resData = res?.data || res;
      const updatedList = resData?.addresses || [];
      const added = resData?.addedAddress;

      const normList = Array.isArray(updatedList)
        ? updatedList.map((a) => ({
            ...a,
            id: a._id ? a._id.toString() : (a.id || `addr_${Math.random()}`),
          }))
        : [];

      setSavedAddresses(normList);
      const newId = added?._id ? added._id.toString() : (normList.length > 0 ? normList[normList.length - 1].id : null);
      setSelectedAddressId(newId);
      setIsAddingNewAddress(false);

      const cleanPhone = formData.phone?.trim()?.replace(/\D/g, '')?.slice(-10);
      if (updateUser) {
        updateUser({
          ...(cleanPhone && (!user?.phone || !user.phone.trim()) ? { phone: cleanPhone } : {}),
          addresses: updatedList,
          defaultAddress: resData?.defaultAddress,
        });
      }
      showToast('Address saved to your account in database', 'success');
    } catch (saveErr) {
      console.warn('Note: Address used for current checkout session:', saveErr);
      const fallbackAddr = {
        id: 'addr_' + Date.now(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        pincode: formData.pincode.trim(),
        street: formData.street.trim(),
        landmark: formData.landmark?.trim() || '',
        city: formData.city.trim(),
        state: formData.state.trim(),
        isDefault: savedAddresses.length === 0,
      };
      setSavedAddresses((prev) => [...prev, fallbackAddr]);
      setSelectedAddressId(fallbackAddr.id);
      setIsAddingNewAddress(false);
    } finally {
      setIsSavingAddress(false);
    }

    // Advance to Payment step where right side order summary column is displayed
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Payment Initiation
  const handleInitiatePayment = async () => {
    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (isLoaded && window.Razorpay) {
        try {
          const cartPayload = checkoutItems.map((i) => ({
            productId: i.productId || i._id || i.id,
            name: i.name,
            image: i.image || (Array.isArray(i.images) ? i.images[0] : ''),
            price: i.discountPrice || i.price,
            quantity: i.quantity || 1,
          }));

          const rzInitRes = await orderService.createRazorpayOrder({
            shippingAddress: formData,
            items: cartPayload,
            total: finalPayable,
            totalAmount: finalPayable,
            subtotal,
            discountAmount: couponDiscount || 0,
            giftWrapFee,
            giftWrap: {
              isGiftWrapped: isGiftWrap,
              fee: giftWrapFee,
              message: isGiftWrap ? giftMessage.trim() : '',
            },
          });

          const rzData = rzInitRes?.data?.data || rzInitRes?.data;

          if (rzData?.razorpayOrderId) {
            const options = {
              key: rzData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TUoIIdQyUdDIxE',
              amount: rzData.amount,
              currency: 'INR',
              name: 'Picky Store',
              description: `Order Payment (${checkoutItems.length} items)`,
              image: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
                ? undefined
                : `${window.location.origin}/images/logo.png`,
              order_id: rzData.razorpayOrderId,
              prefill: {
                name: formData.fullName,
                contact: formData.phone,
                email: formData.email,
              },
              theme: { color: '#7c3aed' },
              handler: async (response) => {
                setLoading(true);
                try {
                  const verifyPayload = {
                    shippingAddress: {
                      street: formData.street,
                      city: formData.city,
                      state: formData.state,
                      pincode: formData.pincode,
                      landmark: formData.landmark || '',
                      fullName: formData.fullName,
                      phone: formData.phone,
                    },
                    items: cartPayload,
                    subtotal,
                    shippingFee: deliveryFee,
                    deliveryFee,
                    convenienceFee: 2,
                    giftWrapFee,
                    giftWrap: {
                      isGiftWrapped: isGiftWrap,
                      fee: giftWrapFee,
                      message: isGiftWrap ? giftMessage.trim() : '',
                    },
                    discountAmount: couponDiscount || 0,
                    total: finalPayable,
                    totalAmount: finalPayable,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    deliveryMode: deliveryMode === 'pickup' ? 'Self Pickup' : 'Standard Delivery',
                    isBuyNow: Boolean(isBuyNow),
                    fromCart: Boolean(fromCart),
                  };

                  const verifyRes = await orderService.verifyRazorpayPayment(verifyPayload);

                  const placedOrder = verifyRes?.data?.data || verifyRes?.data || verifyRes;
                  if (!placedOrder || (!placedOrder._id && !placedOrder.id)) {
                    throw new Error('Payment verification failed to return valid order');
                  }

                  if (isBuyNow) {
                    clearBuyNowItem();
                    if (fromCart && buyNowItem) {
                      const targetId = buyNowItem.productId || buyNowItem._id || buyNowItem.id;
                      if (targetId && removeItem) removeItem(targetId);
                    }
                  } else {
                    clearCart();
                  }
                  const cleanPhone = formData.phone?.trim()?.replace(/\D/g, '')?.slice(-10);
                  if (cleanPhone && (!user?.phone || !user.phone.trim()) && updateUser) {
                    updateUser({ phone: cleanPhone });
                  }
                  setLoading(false);
                  showToast('🎉 Payment Successful! Order placed and marked as Sold.', 'success');
                  navigate(`/order-success/${placedOrder._id || placedOrder.id}`);
                  return;
                } catch (verifyErr) {
                  console.error('Razorpay verification error:', verifyErr);
                  // Payment verification failed: Release reserved items back to available stock
                  await orderService.releaseCheckout({
                    sessionId: rzData.razorpayOrderId || sessionIdRef.current,
                    items: cartPayload,
                  }).catch(() => null);
                  setLoading(false);
                  showToast(verifyErr?.response?.data?.message || verifyErr?.message || 'Payment verification failed. Reserved stock has been restored.', 'error');
                }
              },
              modal: {
                ondismiss: async () => {
                  setLoading(false);
                },
              },
            };
            const rzInstance = new window.Razorpay(options);
            rzInstance.on('payment.failed', async (failResp) => {
              setLoading(false);
              showToast(failResp?.error?.description || 'Payment failed.', 'error');
            });
            rzInstance.open();
            return;
          }
        } catch (rzErr) {
          console.warn('Real Razorpay init notice:', rzErr?.message || rzErr);
        }
      }
    } catch (e) {
      console.warn('Script load notice:', e);
    }

    // Direct / Test Payment Modal with Checkout Stock Reservation
    const activeSessionId = sessionIdRef.current;
    setRzSessionId(activeSessionId);
    try {
      const cartPayload = checkoutItems.map((i) => ({
        productId: i.productId || i._id || i.id,
        quantity: i.quantity || 1,
      }));
      await orderService.reserveCheckout({
        sessionId: activeSessionId,
        items: cartPayload,
      });
    } catch (simResErr) {
      console.warn('Simulated reserve notice:', simResErr?.message);
    }

    setLoading(false);
    setRzTab(paymentMethod);
    setShowRzModal(true);
  };

  // Cancel simulated payment modal
  const handleCancelPayment = () => {
    setShowRzModal(false);
    setShowCancelPaymentConfirm(false);
  };

  // Confirm Payment in Modal
  const handleConfirmSimulatedPayment = async () => {
    setShowRzModal(false);
    const currentSessionId = rzSessionId || sessionIdRef.current;
    const startTime = Date.now();
    setLoading(true);

    try {
      const payload = {
        sessionId: currentSessionId,
        items: checkoutItems.map((i) => ({
          productId: i.productId || i._id || i.id,
          name: i.name,
          image: i.image || (Array.isArray(i.images) ? i.images[0] : ''),
          price: i.discountPrice || i.price,
          quantity: i.quantity || 1,
        })),
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark || '',
          phone: formData.phone,
          fullName: formData.fullName,
        },
        subtotal,
        shippingFee: deliveryFee,
        convenienceFee: 2,
        giftWrapFee,
        giftWrap: {
          isGiftWrapped: isGiftWrap,
          fee: giftWrapFee,
          message: isGiftWrap ? giftMessage.trim() : '',
        },
        discountAmount: couponDiscount || 0,
        total: finalPayable,
        totalAmount: finalPayable,
        paymentMethod,
        deliveryMode: deliveryMode === 'pickup' ? 'Self Pickup' : 'Standard Delivery',
        isBuyNow: Boolean(isBuyNow),
        fromCart: Boolean(fromCart),
      };

      orderCompletedRef.current = true;
      const res = await orderService.create(payload);
      const apiOrder = res?.data?.data || res?.data;
      if (!apiOrder || (!apiOrder._id && !apiOrder.id)) {
        throw new Error('Order could not be saved to database');
      }

      if (isBuyNow) {
        clearBuyNowItem();
        if (fromCart && buyNowItem) {
          const targetId = buyNowItem.productId || buyNowItem._id || buyNowItem.id;
          if (targetId && removeItem) removeItem(targetId);
        }
      } else {
        clearCart();
      }
      const cleanPhone = formData.phone?.trim()?.replace(/\D/g, '')?.slice(-10);
      if (cleanPhone && (!user?.phone || !user.phone.trim()) && updateUser) {
        updateUser({ phone: cleanPhone });
      }
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 1000 - elapsed);
      if (remainingDelay > 0) {
        await new Promise((r) => setTimeout(r, remainingDelay));
      }
      setLoading(false);
      showToast('🎉 Order placed successfully! Marked as Sold.', 'success');
      navigate(`/order-success/${apiOrder._id || apiOrder.id}`);
    } catch (apiErr) {
      orderCompletedRef.current = false;
      console.error('Backend order save error:', apiErr);
      if (currentSessionId) {
        // Payment failed: release reserved items
        orderService.releaseCheckout({ sessionId: currentSessionId }).catch(() => null);
      }
      setLoading(false);
      showToast(apiErr?.response?.data?.message || apiErr?.message || 'Failed to place order. Reserved stock restored.', 'error');
    }
  };

  // If cart is empty
  if (checkoutItems.length === 0) {
    return (
      <PageWrapper>
        <div className={styles['checkout-wrapper']}>
          <div className={styles['container']} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h2>Your shopping bag is empty</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Add items to your bag to proceed with checkout.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className={styles['checkout-wrapper']}>
        <div className={styles['container']}>

          {/* ── BREADCRUMB ── */}
          <nav className={styles['breadcrumb-nav']} aria-label="Breadcrumb">
            <Link to="/" className={styles['breadcrumb-item']}>Home</Link>
            <span className={styles['breadcrumb-separator']}>/</span>
            <span className={styles['breadcrumb-current']}>Checkout</span>
          </nav>

          {/* ── 4-STEP HIGH-VISIBILITY FLOATING STEPPER HEADER BAR ── */}
          <div className={styles['stepper-wrapper']}>
            <div className={styles['stepper-header']}>
              {/* Step 1: BAG or ITEM */}
              {isBuyNow ? (
                <div className={`${styles['step-item']} ${styles['completed']}`}>
                  <div className={styles['step-target-node']}>
                    <div className={styles['target-ring']}>
                      <div className={styles['target-dot']}>
                        <Check size={11} strokeWidth={3.5} />
                      </div>
                    </div>
                  </div>
                  <span className={styles['step-label']}>ITEM</span>
                </div>
              ) : (
                <Link to="/cart" className={`${styles['step-item']} ${styles['completed']}`}>
                  <div className={styles['step-target-node']}>
                    <div className={styles['target-ring']}>
                      <div className={styles['target-dot']}>
                        <Check size={11} strokeWidth={3.5} />
                      </div>
                    </div>
                  </div>
                  <span className={styles['step-label']}>BAG</span>
                </Link>
              )}

              <div className={`${styles['step-connector']} ${styles['active']}`} />

              {/* Step 2: CHECKOUT */}
              <div
                className={`${styles['step-item']} ${checkoutStep === 1 ? styles['active'] : styles['completed']}`}
                onClick={() => {
                  if (checkoutStep > 1) {
                    setShowBackConfirm(true);
                  }
                }}
                style={{ cursor: checkoutStep > 1 ? 'pointer' : 'default' }}
              >
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']}>
                      {checkoutStep > 1 ? <Check size={11} strokeWidth={3.5} /> : null}
                    </div>
                  </div>
                </div>
                <span className={styles['step-label']}>CHECKOUT</span>
              </div>

              <div className={`${styles['step-connector']} ${checkoutStep === 2 ? styles['active'] : ''}`} />

              {/* Step 3: PAYMENT */}
              <div className={`${styles['step-item']} ${checkoutStep === 2 ? styles['active'] : ''}`}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']} />
                  </div>
                </div>
                <span className={styles['step-label']}>PAYMENT</span>
              </div>

              <div className={styles['step-connector']} />

              {/* Step 4: CONFIRM */}
              <div className={styles['step-item']}>
                <div className={styles['step-target-node']}>
                  <div className={styles['target-ring']}>
                    <div className={styles['target-dot']} />
                  </div>
                </div>
                <span className={styles['step-label']}>CONFIRM</span>
              </div>
            </div>
          </div>

          {/* ── CHECKOUT LAYOUT ── */}
          <div className={styles['checkout-layout']}>

            {/* ── LEFT PANEL CONTENT ── */}
            <div className={styles['left-panel']}>

              {/* ── STEP 1: SHIPPING DETAILS & DELIVERY MODE ── */}
              {checkoutStep === 1 && (
                <div className={styles['step-content-box']}>
                  
                  {/* Shipping Details Section */}
                  <div className={styles['section-block']}>
                    {/* Header with Title and "Add Address" Button */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}>
                      <div>
                        <h2 className={styles['section-heading']} style={{ margin: 0 }}>
                          {isAddingNewAddress ? 'Add New Address' : 'Shipping Details'}
                        </h2>
                        {savedAddresses.length > 0 && !isAddingNewAddress && (
                          <p style={{ margin: '0.3rem 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                            Select a delivery address or add a new one
                          </p>
                        )}
                      </div>

                      {/* Beside the title: "+ Add Address" button when saved addresses exist */}
                      {savedAddresses.length > 0 && !isAddingNewAddress && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewAddress(true);
                            setFormData({
                              fullName: user?.name || '',
                              email: user?.email || '',
                              phone: user?.phone || '',
                              pincode: '',
                              street: '',
                              landmark: '',
                              city: '',
                              state: '',
                            });
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.55rem 1.05rem',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.22)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                          Add Address
                        </button>
                      )}

                      {/* Cancel button if currently adding new address and already has saved addresses */}
                      {savedAddresses.length > 0 && isAddingNewAddress && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewAddress(false);
                            const matched = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];
                            if (matched) {
                              setFormData({
                                fullName: matched.fullName || '',
                                email: matched.email || user?.email || '',
                                phone: matched.phone || '',
                                pincode: matched.pincode || '',
                                street: matched.street || '',
                                landmark: matched.landmark || '',
                                city: matched.city || '',
                                state: matched.state || '',
                              });
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.5rem 0.95rem',
                            borderRadius: '9px',
                            background: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel & Use Saved
                        </button>
                      )}
                    </div>

                    {/* Returning users: Show selectable address cards */}
                    {savedAddresses.length > 0 && !isAddingNewAddress ? (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1rem',
                        marginBottom: '0.5rem',
                      }}>
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => {
                                setSelectedAddressId(addr.id);
                                setFormData({
                                  fullName: addr.fullName,
                                  email: addr.email || user?.email || '',
                                  phone: addr.phone,
                                  pincode: addr.pincode,
                                  street: addr.street,
                                  landmark: addr.landmark || '',
                                  city: addr.city,
                                  state: addr.state,
                                });
                              }}
                              style={{
                                position: 'relative',
                                padding: '1.25rem',
                                borderRadius: '14px',
                                border: isSelected ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                                background: isSelected ? 'linear-gradient(145deg, #faf5ff 0%, #ffffff 100%)' : '#ffffff',
                                boxShadow: isSelected ? '0 8px 24px -4px rgba(124, 58, 237, 0.16)' : '0 2px 6px rgba(0,0,0,0.02)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.65rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: isSelected ? '6px solid #7c3aed' : '2px solid #cbd5e1',
                                    background: '#ffffff',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0,
                                  }} />
                                  <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                                    {addr.fullName}
                                  </span>
                                </div>
                                {addr.isDefault && (
                                  <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: '#7c3aed',
                                    background: '#f3e8ff',
                                    padding: '0.15rem 0.55rem',
                                    borderRadius: '999px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                  }}>
                                    Default
                                  </span>
                                )}
                              </div>

                              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.45 }}>
                                {addr.street}{addr.landmark ? `, Near ${addr.landmark}` : ''}<br />
                                {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                              </p>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                fontSize: '0.81rem',
                                color: '#64748b',
                                marginTop: 'auto',
                                paddingTop: '0.5rem',
                                borderTop: '1px solid #f1f5f9',
                              }}>
                                <Phone size={13} style={{ color: '#7c3aed' }} />
                                <span>{addr.phone}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* First-time users or "+ Add Address" mode: Show input form fields */
                      <form onSubmit={handleConfirmDetails} id="checkout-form">
                        <div className={styles['form-grid']}>
                          {/* Full Name */}
                          <div className={styles['form-group']}>
                            <label className={styles['field-label']}>FULL NAME *</label>
                            <input
                              type="text"
                              name="fullName"
                              required
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              className={styles['field-input']}
                            />
                          </div>

                          {/* Email Address */}
                          <div className={styles['form-group']}>
                            <label className={styles['field-label']}>EMAIL ADDRESS *</label>
                            <input
                              type="email"
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email address"
                              className={styles['field-input']}
                            />
                          </div>

                          {/* Phone Number */}
                          <div className={styles['form-group']}>
                            <label className={styles['field-label']}>PHONE NUMBER *</label>
                            <input
                              type="tel"
                              name="phone"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter 10-digit mobile number"
                              className={styles['field-input']}
                            />
                          </div>

                          {/* Pin Code */}
                          <div className={styles['form-group']}>
                            <label className={styles['field-label']}>PIN CODE *</label>
                            <input
                              type="text"
                              name="pincode"
                              required
                              value={formData.pincode}
                              onChange={handleInputChange}
                              placeholder="Enter 6-digit PIN code"
                              className={styles['field-input']}
                            />
                          </div>

                          {/* Flat, House No., Apartment */}
                          <div className={styles['form-group']}>
                            <label className={styles['field-label']}>FLAT, HOUSE NO., APARTMENT *</label>
                            <input
                              type="text"
                              name="street"
                              required
                              value={formData.street}
                              onChange={handleInputChange}
                              placeholder="House / Flat No., Building, Street Name"
                              className={styles['field-input']}
                            />
                          </div>

                          {/* Landmark */}
                          <div className={styles['form-group']}>
                            <label className={styles['field-label']}>LANDMARK (OPTIONAL)</label>
                            <input
                              type="text"
                              name="landmark"
                              value={formData.landmark}
                              onChange={handleInputChange}
                              placeholder="E.g. Near Apollo Hospital, Park, etc."
                              className={styles['field-input']}
                            />
                          </div>

                          {/* City / Town */}
                          <div className={styles['form-group']}>
                            <label className={styles['field-label']}>CITY / TOWN *</label>
                            <input
                              type="text"
                              name="city"
                              required
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="Enter City / Town"
                              className={styles['field-input']}
                            />
                          </div>

                          {/* State */}
                          <div className={styles['form-group']}>
                            <label className={styles['field-label']}>STATE *</label>
                            <input
                              type="text"
                              name="state"
                              required
                              value={formData.state}
                              onChange={handleInputChange}
                              placeholder="Enter State"
                              className={styles['field-input']}
                            />
                          </div>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Delivery Mode Section */}
                  <div className={styles['section-block']} style={{ marginTop: '2.5rem' }}>
                    <h2 className={styles['section-heading']}>Delivery Mode</h2>
                    
                    <div className={styles['delivery-mode-grid']}>
                      
                      {/* Option 1: Standard Delivery */}
                      <div
                        className={`${styles['delivery-mode-card']} ${deliveryMode === 'standard' ? styles['selected'] : ''}`}
                        onClick={() => setDeliveryMode('standard')}
                      >
                        <div className={styles['mode-info']}>
                          <span className={styles['mode-title']}>STANDARD DELIVERY</span>
                          <span className={styles['mode-desc']}>
                            {deliveryInfo.daysText}
                            {activePincode && (
                              <span style={{ marginLeft: '0.45rem', fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600 }}>
                                • {deliveryInfo.zone} ({activePincode})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className={styles['mode-price']}>₹{deliveryFee}</div>
                      </div>

                    </div>

                    {/* Option 2: Gift Wrapping Service (Controlled from Admin Settings) */}
                    {giftWrapConfig?.enabled !== false && (
                      <div
                        style={{
                          marginTop: '1.25rem',
                          padding: '1.15rem 1.25rem',
                          borderRadius: '16px',
                          border: isGiftWrap ? '2px solid #e11d48' : '1.5px solid #e2e8f0',
                          background: isGiftWrap
                            ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #ffffff 100%)'
                            : '#ffffff',
                          boxShadow: isGiftWrap
                            ? '0 8px 24px rgba(225, 29, 72, 0.08)'
                            : '0 2px 8px rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.25s ease',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: 1, minWidth: '240px' }}>
                            <div
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: isGiftWrap ? '#e11d48' : '#fdf2f8',
                                color: isGiftWrap ? '#ffffff' : '#e11d48',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.25s ease',
                                flexShrink: 0,
                              }}
                            >
                              <Gift size={22} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', letterSpacing: '0.01em' }}>
                                  GIFT WRAP OPTION
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    padding: '0.15rem 0.55rem',
                                    borderRadius: '9999px',
                                    background: isGiftWrap ? '#fecdd3' : '#f1f5f9',
                                    color: isGiftWrap ? '#9f1239' : '#64748b',
                                  }}
                                >
                                  ₹{giftWrapConfig.fee || 30}
                                </span>
                              </div>
                              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                                Add premium gift box packaging and a personalized greeting card.
                              </p>
                            </div>
                          </div>

                          {/* ON / OFF Toggle Button */}
                          <button
                            type="button"
                            onClick={() => setIsGiftWrap((prev) => !prev)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.45rem 0.95rem',
                              borderRadius: '9999px',
                              border: isGiftWrap ? '1px solid #be123c' : '1px solid #cbd5e1',
                              cursor: 'pointer',
                              background: isGiftWrap ? '#e11d48' : '#f1f5f9',
                              color: isGiftWrap ? '#ffffff' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-block',
                                width: '9px',
                                height: '9px',
                                borderRadius: '50%',
                                background: isGiftWrap ? '#ffffff' : '#94a3b8',
                              }}
                            />
                            {isGiftWrap ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        {/* Expandable Gift Message Box when Gift Wrap is ON */}
                        {isGiftWrap && (
                          <div
                            style={{
                              marginTop: '1.15rem',
                              paddingTop: '1rem',
                              borderTop: '1px dashed #fecdd3',
                            }}
                          >
                            <label
                              htmlFor="giftMessageInput"
                              style={{
                                display: 'block',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#9f1239',
                                marginBottom: '0.4rem',
                              }}
                            >
                              Personalized Gift Message (Optional)
                            </label>
                            <textarea
                              id="giftMessageInput"
                              rows={3}
                              maxLength={200}
                              value={giftMessage}
                              onChange={(e) => setGiftMessage(e.target.value)}
                              placeholder="Type your gift message here (e.g. Wishing you a happy birthday with lots of love!)..."
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '10px',
                                border: '1.5px solid #fda4af',
                                background: '#ffffff',
                                fontSize: '0.85rem',
                                color: '#1e293b',
                                resize: 'none',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s ease',
                              }}
                              onFocus={(e) => (e.target.style.borderColor = '#e11d48')}
                              onBlur={(e) => (e.target.style.borderColor = '#fda4af')}
                            />
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '0.35rem',
                                fontSize: '0.72rem',
                                color: '#9f1239',
                              }}
                            >
                              <span>Printed on a luxury greeting card placed inside the package</span>
                              <span>{giftMessage.length}/200</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Form Action Row: Back to Cart / Shop */}
                  <div className={styles['step1-actions-row']}>
                    {isBuyNow ? (
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className={styles['btn-back-cart']}
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                    ) : (
                      <Link to="/cart" className={styles['btn-back-cart']}>
                        <ArrowLeft size={16} /> Back to Bag
                      </Link>
                    )}
                  </div>

                </div>
              )}

              {/* ── STEP 2: ADDRESS REVIEW & SECURE PAYMENT ── */}
              {checkoutStep === 2 && (
                <div className={`${styles['step-content-box']} ${styles['step-payment-content-box']}`}>
                  
                  {/* 1. Delivery & Contact Information Summary Card */}
                  <div className={styles['address-summary-card']}>
                    <div className={styles['address-card-header']}>
                      <h3 className={styles['address-card-title']}>
                        <MapPin size={18} style={{ color: '#8b5cf6' }} /> Delivery & Contact Information
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowBackConfirm(true)}
                        className={styles['btn-edit-address']}
                      >
                        <Edit3 size={12} /> Edit Address
                      </button>
                    </div>

                    <div className={styles['address-details-grid']}>
                      <div className={styles['detail-col']}>
                        <span className={styles['detail-label']}>Full Name</span>
                        <span className={styles['detail-value']}>{formData.fullName || '—'}</span>
                      </div>

                      <div className={styles['detail-col']}>
                        <span className={styles['detail-label']}>Email Address</span>
                        <span className={styles['detail-value']}>{formData.email || '—'}</span>
                      </div>

                      <div className={styles['detail-col']}>
                        <span className={styles['detail-label']}>Phone Number</span>
                        <span className={styles['detail-value']}>{formData.phone || '—'}</span>
                      </div>

                      <div className={styles['detail-col']}>
                        <span className={styles['detail-label']}>Delivery Mode</span>
                        <span className={styles['detail-value']}>
                          <span className={styles['delivery-badge']}>
                            <Truck size={12} />
                            Standard Delivery (₹{deliveryFee})
                          </span>
                        </span>
                      </div>

                      <div className={`${styles['detail-col']} ${styles['full-row']}`}>
                        <span className={styles['detail-label']}>Shipping Address</span>
                        <span className={styles['detail-value']}>
                          {formData.street}{formData.landmark ? `, Landmark: ${formData.landmark}` : ''}, {formData.city}, {formData.state} - {formData.pincode}
                        </span>
                      </div>

                      {isGiftWrap && (
                        <div className={`${styles['detail-col']} ${styles['full-row']}`} style={{ background: '#fff1f2', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #fecdd3' }}>
                          <span className={styles['detail-label']} style={{ color: '#e11d48', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Gift size={13} /> Gift Wrapping Service (+₹{giftWrapFee})
                          </span>
                          <span className={styles['detail-value']} style={{ color: '#4c0519', marginTop: '0.2rem' }}>
                            {giftMessage.trim() ? `Message: "${giftMessage.trim()}"` : 'No custom message entered'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* ── RIGHT PANEL: ORDER SUMMARY SIDEBAR (Visible across all steps) ── */}
            <div className={styles['right-panel']}>
              <div className={styles['order-summary-card']}>
                  
                  <h3 className={styles['summary-title']}>Order Summary</h3>

                  {/* Cart Items List with Quantity Controls */}
                  <div className={styles['cart-items-wrapper']}>
                    {checkoutItems.map((item, index) => {
                      const price = item.discountPrice || item.price || 0;
                      const origPrice = item.price && item.discountPrice && item.price > item.discountPrice
                        ? item.price
                        : Math.round(price * 1.25);
                      const qty = item.quantity || 1;

                      return (
                        <div key={item._id || item.id || index} className={styles['summary-cart-item']}>
                          <img
                            src={item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200'}
                            alt={item.name}
                            className={styles['cart-item-img']}
                          />

                          <div className={styles['cart-item-details']}>
                            <span className={styles['cart-item-name']}>{item.name}</span>

                            {/* Display final selected variant values (Read-only, no re-prompting) */}
                            {(item.selectedSize || item.selectedColor) && (
                              <div className={styles['checkout-variant-info']}>
                                {item.selectedSize && (
                                  <span className={styles['checkout-variant-tag']}>
                                    Size: <strong>{item.selectedSize}</strong>
                                  </span>
                                )}
                                {item.selectedSize && item.selectedColor && (
                                  <span className={styles['checkout-variant-sep']}>•</span>
                                )}
                                {item.selectedColor && (
                                  <span className={styles['checkout-variant-tag']}>
                                    Color: <span className={styles['checkout-color-circle']} style={{ backgroundColor: item.selectedColor }} />
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Quantity Counter (- 1 +) */}
                            {(() => {
                              const maxStock = typeof item.stock === 'number' ? item.stock : (typeof item.countInStock === 'number' ? item.countInStock : 10);
                              const isMaxReached = qty >= maxStock;
                              return (
                                <div className={styles['qty-counter-row']}>
                                  <span className={styles['qty-label']}>Qty:</span>
                                  <div className={styles['qty-btn-group']}>
                                    <button
                                      type="button"
                                      className={styles['qty-btn']}
                                      disabled={qty <= 1}
                                      onClick={() => handleUpdateItemQty(item, qty - 1)}
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className={styles['qty-num']}>{qty}</span>
                                    <button
                                      type="button"
                                      className={`${styles['qty-btn']} ${isMaxReached ? styles['qty-btn-disabled'] : ''}`}
                                      disabled={isMaxReached}
                                      onClick={() => {
                                        if (isMaxReached) {
                                          showToast('Maximum available quantity reached for this item', 'info');
                                          return;
                                        }
                                        handleUpdateItemQty(item, qty + 1);
                                      }}
                                      aria-label="Increase quantity"
                                      title={isMaxReached ? 'Maximum available limit reached' : 'Increase quantity'}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Prices: Strikethrough original price & current price */}
                          <div className={styles['cart-item-pricing']}>
                            <span className={styles['strikethrough-price']}>
                              {formatPrice(origPrice * qty)}
                            </span>
                            <span className={styles['final-item-price']}>
                              {formatPrice(price * qty)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Have a Promo / Coupon Code? Dotted Box (Only on CHECKOUT step, hidden on PAYMENT step) */}
                  {checkoutStep === 1 && (
                    <div className={styles['promo-box-container']}>
                      <div className={styles['promo-header']}>
                        <Tag size={16} className={styles['promo-tag-icon']} />
                        <span>Have a Promo / Coupon Code?</span>
                      </div>

                      {coupon ? (
                        <div className={styles['promo-applied-bar']}>
                          <span className={styles['applied-code']}>
                            Coupon <strong>{coupon}</strong> (-{formatPrice(couponDiscount)})
                          </span>
                          <button
                            type="button"
                            onClick={handleRemovePromo}
                            className={styles['btn-remove-coupon']}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyPromo} className={styles['promo-form']}>
                          <input
                            type="text"
                            value={promoCodeInput}
                            onChange={(e) => {
                              setPromoCodeInput(e.target.value);
                              setPromoError('');
                            }}
                            placeholder="ENTER PROMO CODE"
                            className={styles['promo-input']}
                          />
                          <button type="submit" className={styles['btn-apply-promo']}>
                            Apply
                          </button>
                        </form>
                      )}

                      {promoError && (
                        <div className={styles['promo-error-text']}>{promoError}</div>
                      )}
                    </div>
                  )}

                  {/* Breakdown Costs */}
                  <div className={styles['pricing-breakdown']}>
                    {/* Subtotal */}
                    <div className={styles['breakdown-row']}>
                      <span className={styles['breakdown-label']}>Subtotal</span>
                      <div className={styles['breakdown-value-wrap']}>
                        <span className={styles['breakdown-strikethrough']}>
                          {formatPrice(originalSubtotal)}
                        </span>
                        <span className={styles['breakdown-val']}>
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Shipping & Delivery */}
                    <div className={styles['breakdown-row']}>
                      <span className={styles['breakdown-label']}>Shipping & Delivery</span>
                      <span className={`${styles['breakdown-val']} ${deliveryFee === 0 ? styles['free'] : ''}`}>
                        {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                      </span>
                    </div>

                    {/* Convenience Fee */}
                    <div className={styles['breakdown-row']}>
                      <span className={styles['breakdown-label']}>Convenience Fee</span>
                      <span className={styles['breakdown-val']}>₹{convenienceFee}</span>
                    </div>

                    {/* Gift Wrapping Fee */}
                    {isGiftWrap && giftWrapFee > 0 && (
                      <div className={styles['breakdown-row']} style={{ color: '#db2777' }}>
                        <span className={styles['breakdown-label']} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#db2777', fontWeight: 600 }}>
                          <Gift size={14} /> Gift Wrapping
                        </span>
                        <span className={styles['breakdown-val']} style={{ color: '#db2777', fontWeight: 700 }}>
                          +{formatPrice(giftWrapFee)}
                        </span>
                      </div>
                    )}

                    {/* Coupon Discount */}
                    {couponDiscount > 0 && (
                      <div className={`${styles['breakdown-row']} ${styles['discount-row']}`}>
                        <span className={styles['breakdown-label']}>Coupon Discount</span>
                        <span className={styles['discount-val']}>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Final Payable Total */}
                  <div className={styles['final-payable-row']}>
                    <span className={styles['final-payable-label']}>Final Payable</span>
                    <span className={styles['final-payable-amount']}>
                      {formatPrice(finalPayable)}
                    </span>
                  </div>

                  {/* Complete Order / Confirm Details Action Button */}
                  <button
                    type="button"
                    onClick={checkoutStep === 1 ? handleConfirmDetails : handleInitiatePayment}
                    disabled={loading || (checkoutStep === 1 && isSavingAddress)}
                    className={styles['btn-action-primary']}
                  >
                    {loading ? (
                      <span>Processing...</span>
                    ) : checkoutStep === 1 ? (
                      <>
                        <span>{isSavingAddress ? 'SAVING DETAILS...' : 'CONFIRM DETAILS'}</span>
                        <ArrowRight size={18} />
                      </>
                    ) : (
                      <>
                        <span>COMPLETE ORDER</span>
                        <Lock size={16} />
                      </>
                    )}
                  </button>

                  {/* 100% SECURE TRANSACTIONS Footer */}
                  <div className={styles['summary-footer-badge']}>
                    <ShieldCheck size={14} className={styles['secure-badge-icon']} />
                    <span>100% SECURE TRANSACTIONS</span>
                  </div>

                </div>
              </div>

          </div>
        </div>
      </div>

      {/* ── SIMULATED RAZORPAY MODAL ── */}
      {showRzModal && (
        <div className={styles['modal-overlay']} onClick={() => setShowCancelPaymentConfirm(true)}>
          <div className={styles['rz-modal-card']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['rz-modal-header']}>
              <div className={styles['rz-logo-wrap']}>
                <Lock size={20} color="#854d0e" />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1c1917' }}>Razorpay Secure</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelPaymentConfirm(true)}
                style={{ background: 'none', border: 'none', color: '#78716c', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles['rz-modal-body']}>
              <div className={styles['rz-amount-banner']}>
                <div className={styles['rz-amount-label']}>Final Payable Amount</div>
                <div className={styles['rz-amount-val']}>{formatPrice(finalPayable)}</div>
              </div>

              <div className={styles['pay-method-tabs']}>
                <button
                  type="button"
                  className={`${styles['pay-tab']} ${rzTab === 'card' ? styles['active'] : ''}`}
                  onClick={() => setRzTab('card')}
                >
                  Card
                </button>
                <button
                  type="button"
                  className={`${styles['pay-tab']} ${rzTab === 'upi' ? styles['active'] : ''}`}
                  onClick={() => setRzTab('upi')}
                >
                  UPI / QR
                </button>
                <button
                  type="button"
                  className={`${styles['pay-tab']} ${rzTab === 'netbanking' ? styles['active'] : ''}`}
                  onClick={() => setRzTab('netbanking')}
                >
                  NetBanking
                </button>
              </div>

              {rzTab === 'card' && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    readOnly
                    value="4111 1111 1111 1111 (Test Card)"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d6d3d1', fontSize: '0.85rem', background: '#fafaf9' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <input
                      type="text"
                      readOnly
                      value="12 / 28"
                      style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d6d3d1', fontSize: '0.85rem', background: '#fafaf9' }}
                    />
                    <input
                      type="text"
                      readOnly
                      value="CVV: 123"
                      style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d6d3d1', fontSize: '0.85rem', background: '#fafaf9' }}
                    />
                  </div>
                </div>
              )}

              {rzTab === 'upi' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiId(`${app.toLowerCase()}@razorpay`)}
                        style={{
                          padding: '0.55rem',
                          borderRadius: '8px',
                          border: upiId.includes(app.toLowerCase()) ? '2px solid #57534e' : '1px solid #e7e5e4',
                          background: upiId.includes(app.toLowerCase()) ? '#f5f5f4' : '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: '#292524',
                          cursor: 'pointer',
                        }}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #d6d3d1', fontSize: '0.85rem' }}
                  />
                </div>
              )}

              {rzTab === 'netbanking' && (
                <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map((bank) => (
                    <div
                      key={bank}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #e7e5e4',
                        background: '#fafaf9',
                        color: '#292524',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Building2 size={16} style={{ display: 'block', margin: '0 auto 0.2rem' }} />
                      {bank}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmSimulatedPayment}
                className={styles['btn-action-primary']}
                style={{ width: '100%', padding: '0.9rem' }}
              >
                <span>Pay {formatPrice(finalPayable)}</span>
                <Check size={18} strokeWidth={2.8} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <Modal isOpen={showBackConfirm} onClose={() => setShowBackConfirm(false)} title="Cancel Payment">
        <p style={{ margin: '0 0 1.5rem', color: '#475569' }}>
          Are you sure you want to go back? This will cancel the payment process.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={() => setShowBackConfirm(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>Stay</button>
          <button onClick={() => { setCheckoutStep(1); setShowBackConfirm(false); }} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
        </div>
      </Modal>

      <Modal isOpen={showCancelPaymentConfirm} onClose={() => setShowCancelPaymentConfirm(false)} title="Cancel Payment">
        <p style={{ margin: '0 0 1.5rem', color: '#475569' }}>
          Are you sure you want to cancel the payment?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={() => setShowCancelPaymentConfirm(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>Continue Payment</button>
          <button onClick={handleCancelPayment} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel Payment</button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
