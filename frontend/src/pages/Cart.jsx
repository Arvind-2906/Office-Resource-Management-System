import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/CartItem';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency } from '../utils/formatCurrency';
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';

export const Cart = () => {
  const { cart, updateQuantity, removeItem, clearCart, loading, error } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const deliveryCharge = subtotal >= 100 || subtotal === 0 ? 0 : 12;
  const grandTotal = Math.round((subtotal + estimatedTax + deliveryCharge) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 max-w-md mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Looks like you haven't added any products to your shopping cart yet. Browse our curated gear catalog to find what you need.
          </p>
          <div className="pt-2">
            <Link to="/products">
              <Button variant="primary" size="md" icon={ArrowRight}>
                Discover Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {items.length} unique item{items.length > 1 ? 's' : ''} ready for checkout
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Cart Layout: Items List (Left) + Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.product?._id || item._id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Order Financial Summary Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 sticky top-28">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-slate-800">{formatCurrency(estimatedTax)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                Standard Delivery
                {subtotal >= 100 && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                )}
              </span>
              <span className="font-semibold text-slate-800">
                {deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge)}
              </span>
            </div>

            {subtotal < 100 && (
              <p className="text-[11px] text-indigo-600 font-medium">
                Add {formatCurrency(100 - subtotal)} more to qualify for Free Shipping!
              </p>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <div>
                <span className="text-base font-extrabold text-slate-900 block">Estimated Total</span>
                <span className="text-[10px] text-slate-400">All prices in USD</span>
              </div>
              <span className="text-2xl font-extrabold text-indigo-600">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/checkout')}
            className="w-full shadow-lg"
            icon={ArrowRight}
          >
            Proceed to Checkout
          </Button>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified server-side calculation guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
