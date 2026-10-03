import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import {
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  ShieldCheck,
  MapPin,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const Checkout = () => {
  const { cart, refreshCart } = useCart();
  const { user, addAddress } = useAuth();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const deliveryCharge = subtotal >= 100 || subtotal === 0 ? 0 : 12;
  const grandTotal = Math.round((subtotal + estimatedTax + deliveryCharge) * 100) / 100;

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const [shippingAddress, setShippingAddress] = useState({
    street: defaultAddr?.street || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    postalCode: defaultAddr?.postalCode || '',
    country: defaultAddr?.country || 'USA'
  });

  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [saveAddress, setSaveAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleAddressChange = (e) => {
    setShippingAddress((prev) => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // If user opted to save address
      if (saveAddress && user) {
        await addAddress({ ...shippingAddress, isDefault: true }).catch(() => {});
      }

      const order = await orderService.createOrder({
        shippingAddress,
        paymentMethod,
        discountAmount: 0
      });

      // Refresh cart state since backend cleared it
      await refreshCart();

      // Navigate to payment execution page
      navigate(`/payment/${order._id}`, { state: { order } });
    } catch (err) {
      setError(err.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Checkout & Shipping
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your destination address and choose your payment simulator
          </p>
        </div>
        <Link
          to="/cart"
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Shipping Address + Payment Method */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                1. Delivery Destination Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Street Address"
                  id="street"
                  placeholder="e.g. 123 Tech Way, Suite 400"
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  required
                />
              </div>

              <Input
                label="City"
                id="city"
                placeholder="e.g. San Francisco"
                value={shippingAddress.city}
                onChange={handleAddressChange}
                required
              />

              <Input
                label="State / Province"
                id="state"
                placeholder="e.g. CA"
                value={shippingAddress.state}
                onChange={handleAddressChange}
                required
              />

              <Input
                label="Postal / ZIP Code"
                id="postalCode"
                placeholder="e.g. 94105"
                value={shippingAddress.postalCode}
                onChange={handleAddressChange}
                required
              />

              <Input
                label="Country"
                id="country"
                placeholder="e.g. USA"
                value={shippingAddress.country}
                onChange={handleAddressChange}
                required
              />
            </div>

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-600 font-medium">
                Save this shipping address for future orders
              </span>
            </label>
          </div>

          {/* Section 2: Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                2. Select Simulated Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card option */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'CARD'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Credit / Debit Card
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visa, Mastercard, Amex sandbox simulator
                  </p>
                </div>
              </label>

              {/* UPI option */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'UPI'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    UPI / QR Code
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Google Pay, PhonePe, Paytm simulation
                  </p>
                </div>
              </label>

              {/* Net Banking */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'NET_BANKING'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="NET_BANKING"
                  checked={paymentMethod === 'NET_BANKING'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Net Banking
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    All major institutional banks
                  </p>
                </div>
              </label>

              {/* COD */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'COD'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <Banknote className="w-4 h-4 text-amber-600" />
                    Cash on Delivery
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay upon package doorstep handoff
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Order Items Review & Final Total */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 sticky top-28">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({items.length} Items)
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product?._id || item._id} className="flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-slate-900">{item.quantity}x</span>
                  <span className="text-slate-700 truncate">{item.product?.name}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Sales Tax (8%)</span>
              <span className="font-semibold text-slate-900">{formatCurrency(estimatedTax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span className="font-semibold text-slate-900">
                {deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge)}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-900">Final Payable</span>
              <span className="text-xl font-extrabold text-indigo-600">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full shadow-lg"
            icon={ArrowRight}
          >
            Review & Make Payment
          </Button>

          <p className="text-[11px] text-slate-400 text-center">
            Prices and delivery rates are verified server-side prior to order creation.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
