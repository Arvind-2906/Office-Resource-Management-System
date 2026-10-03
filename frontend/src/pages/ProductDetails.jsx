import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatCurrency';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import {
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Check,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product._id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Loading device specifications..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorMessage message={error || 'Product not found'} />
        <div className="mt-6 text-center">
          <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:underline">
            &larr; Return to catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb / Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Image Container */}
        <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-lg aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
              {product.category}
            </span>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                {product.brand}
              </span>

              {/* Rating */}
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold text-amber-800 border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating?.toFixed(1) || '4.5'}</span>
                <span className="text-amber-600 font-normal">
                  ({product.numReviews || 0} reviews)
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Tax calculated at checkout
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-6">
            <p>{product.description}</p>
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Inventory Status:</span>
            {isOutOfStock ? (
              <span className="text-rose-600 font-bold">Currently Sold Out</span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-600 font-bold">Only {product.stock} units remaining</span>
            ) : (
              <span className="text-emerald-600 font-bold">In Stock ({product.stock} available)</span>
            )}
          </div>

          {/* Purchase Controls */}
          <div className="space-y-4 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantity
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant={added ? 'accent' : 'primary'}
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                loading={adding}
                className="flex-1"
                icon={added ? Check : ShoppingBag}
              >
                {added ? 'Added to Cart!' : isOutOfStock ? 'Sold Out' : 'Add to Shopping Cart'}
              </Button>

              <Link
                to="/cart"
                className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-sm"
              >
                View Cart
              </Link>
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Free Delivery on orders over $100</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Full 2-Year Hardware Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
