import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { Link } from 'react-router-dom';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const product = item.product || {};
  const isOutOfStock = product.stock <= 0;
  const isMaxStock = item.quantity >= (product.stock || 99);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm gap-4 transition-all hover:border-slate-300">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 flex-1">
        <Link
          to={`/products/${product._id}`}
          className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60"
        >
          <img
            src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
            alt={product.name || 'Product'}
            className="w-full h-full object-cover object-center"
          />
        </Link>

        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            {product.category || 'Gear'}
          </span>
          <Link
            to={`/products/${product._id}`}
            className="block text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {product.name || 'Product Item'}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">
            Unit Price: {formatCurrency(item.price)}
          </p>
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-[10px] text-amber-600 font-semibold mt-1">
              Only {product.stock} units in warehouse!
            </p>
          )}
        </div>
      </div>

      {/* Quantity Controls & Line Total */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 self-end sm:self-center">
        {/* Quantity selector */}
        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/80 p-0.5">
          <button
            onClick={() => onUpdateQuantity(product._id, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center text-xs font-bold text-slate-900">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(product._id, item.quantity + 1)}
            disabled={isMaxStock}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right min-w-[80px]">
          <span className="text-xs text-slate-400 block -mb-0.5">Subtotal</span>
          <span className="text-base font-extrabold text-slate-900">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>

        {/* Delete / Remove */}
        <button
          onClick={() => onRemove(product._id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
