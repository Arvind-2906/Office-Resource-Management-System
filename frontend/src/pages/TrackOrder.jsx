import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import OrderStatusTracker from '../components/OrderStatusTracker';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { ArrowLeft, Package, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const TrackOrder = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve tracking information');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Connecting to logistics tracking satellite..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <ErrorMessage message={error || 'Tracking record unavailable'} />
        <Link to="/orders" className="mt-4 inline-block text-xs font-bold text-indigo-600">
          &larr; Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          to={`/orders/${order._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Order Summary
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Real-Time Order Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Tracking Package <span className="font-mono font-bold">#{order._id}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block -mb-0.5">Estimated Delivery</span>
            <span className="text-sm font-bold text-emerald-600">Within 2 Business Days</span>
          </div>
        </div>
      </div>

      {/* Visual Stepper */}
      <OrderStatusTracker
        currentStatus={order.orderStatus}
        trackingEvents={order.trackingEvents || []}
      />

      {/* Destination & Package Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Delivery Destination
            </h3>
          </div>
          <div className="text-xs space-y-1 text-slate-600">
            <p className="font-bold text-slate-900">{order.user?.name || 'Customer'}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.postalCode}
            </p>
            <p>{order.shippingAddress?.country}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Package className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Package Contents ({order.items?.length || 0} Items)
            </h3>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1 text-xs">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-700">
                <span className="truncate pr-2">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
