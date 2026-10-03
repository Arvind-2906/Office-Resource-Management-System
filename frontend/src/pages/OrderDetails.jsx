import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import Modal from '../components/Modal';
import {
  ArrowLeft,
  Truck,
  Package,
  Clock,
  ShieldCheck,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await orderService.getOrderById(id);
        setOrder(orderData);
        const paymentData = await paymentService.getPaymentByOrderId(id);
        if (paymentData && paymentData.length > 0) {
          setPayment(paymentData[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(order._id);
      setOrder(updated);
      setCancelModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Loading order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorMessage message={error || 'Order record not found'} />
        <div className="mt-4 text-center">
          <Link to="/orders" className="text-xs font-bold text-indigo-600">
            &larr; Back to all orders
          </Link>
        </div>
      </div>
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.orderStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {order.orderStatus}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/orders/${order._id}/track`}>
            <Button variant="primary" size="md" icon={Truck}>
              Live Tracking
            </Button>
          </Link>

          {canCancel && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setCancelModalOpen(true)}
              className="text-rose-600 border-rose-300 hover:bg-rose-50"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100">
              Purchased Items ({order.items.length})
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items.map((item, i) => (
                <div key={i} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-extrabold text-slate-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta (Right col) */}
        <div className="space-y-6">
          {/* Financial Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Payment Summary
            </h3>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (8%)</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span className="font-semibold text-slate-900">
                {order.deliveryCharge === 0 ? 'FREE' : formatCurrency(order.deliveryCharge)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-sm font-extrabold text-slate-900">
              <span>Total Amount</span>
              <span className="text-indigo-600 text-lg">{formatCurrency(order.total)}</span>
            </div>
            <div className="pt-2 flex justify-between text-slate-500">
              <span>Payment Status</span>
              <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-2 text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Shipping Destination
            </h3>
            <p className="font-bold text-slate-800">{order.user?.name || 'Customer'}</p>
            <p className="text-slate-600">{order.shippingAddress?.street}</p>
            <p className="text-slate-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.postalCode}
            </p>
            <p className="text-slate-600">{order.shippingAddress?.country}</p>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Order Cancellation"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <p>
              Are you sure you want to cancel this order? Hardware stock will be released back to warehouse inventory and any payment will be refunded.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelling}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleCancelOrder}
              loading={cancelling}
              icon={XCircle}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;
