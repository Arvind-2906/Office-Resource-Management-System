import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import OrderStatusTracker from '../components/OrderStatusTracker';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Package,
  User,
  MapPin,
  Save,
  CreditCard
} from 'lucide-react';

export const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const orderData = await orderService.getOrderById(id);
        setOrder(orderData);
        setNewStatus(orderData.orderStatus);

        const paymentData = await paymentService.getPaymentByOrderId(id);
        setPayments(paymentData || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderData();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await orderService.updateOrderStatus(order._id, newStatus, statusMessage);
      setOrder(updated);
      setSuccess(`Order status successfully updated to ${newStatus}`);
      setStatusMessage('');
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner message="Retrieving order records..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorMessage message={error || 'Order record not found'} />
        <Link to="/admin/orders" className="mt-4 inline-block text-xs font-bold text-indigo-600">
          &larr; Back to Order Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Order #{order._id}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {formatDate(order.createdAt)} • Customer:{' '}
              <span className="font-bold text-slate-800">{order.user?.name}</span> (
              {order.user?.email})
            </p>
          </div>
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            Current: {order.orderStatus}
          </span>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Admin Status Management Action Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-600" />
          Update Order Status & Dispatch Log
        </h3>

        <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fulfillment Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Timeline Status Message (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Courier partner dispatched via FedEx Air Express"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={updating}
              icon={Save}
              className="self-end"
            >
              Update
            </Button>
          </div>
        </form>
      </div>

      {/* Stepper view */}
      <OrderStatusTracker
        currentStatus={order.orderStatus}
        trackingEvents={order.trackingEvents || []}
      />

      {/* Grid: Items & Logistics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchased Items */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Package className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Purchased Items ({order.items?.length || 0})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100"
                  />
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <span className="text-slate-400">
                      {item.quantity} × {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span className="font-semibold">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span className="font-semibold">{formatCurrency(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t">
              <span>Total:</span>
              <span className="text-indigo-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Destination */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Shipping Destination</h3>
            </div>
            <p className="font-bold text-slate-800">{order.user?.name}</p>
            <p className="text-slate-600">{order.shippingAddress?.street}</p>
            <p className="text-slate-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.postalCode}
            </p>
            <p className="text-slate-600">{order.shippingAddress?.country}</p>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Payment Telemetry</h3>
            </div>
            <div className="space-y-1.5 text-slate-600">
              <p>
                Method: <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </p>
              <p>
                Status: <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
              </p>
              {payments.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <p className="font-mono text-[11px]">
                    Txn ID: <span className="text-indigo-600 font-bold">{payments[0].transactionId}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Recorded at {formatDate(payments[0].createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
