import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [payment, setPayment] = useState(location.state?.payment || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      const fetchDetails = async () => {
        try {
          const orderData = await orderService.getOrderById(orderId);
          setOrder(orderData);
          const paymentData = await paymentService.getPaymentByOrderId(orderId);
          if (paymentData && paymentData.length > 0) {
            setPayment(paymentData[0]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [orderId, order]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Generating order receipt..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl text-center space-y-6">
        {/* Animated Celebration Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment & Order Verified
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your hardware has been logged into warehouse routing and is being prepared for express dispatch.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-200/70 space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Order Reference</span>
            <span className="font-mono font-bold text-slate-900">#{order?._id}</span>
          </div>

          {payment?.transactionId && (
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Simulated Transaction ID</span>
              <span className="font-mono font-bold text-indigo-600">{payment.transactionId}</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Payment Method</span>
            <span className="font-bold text-slate-900">{order?.paymentMethod}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Shipping To</span>
            <span className="font-medium text-slate-800 text-right">
              {order?.shippingAddress?.street}, {order?.shippingAddress?.city},{' '}
              {order?.shippingAddress?.state} {order?.shippingAddress?.postalCode}
            </span>
          </div>

          <div className="flex justify-between pt-2 items-baseline">
            <span className="font-bold text-slate-900 text-sm">Total Paid</span>
            <span className="font-extrabold text-indigo-600 text-base">
              {formatCurrency(order?.total || 0)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to={`/orders/${order?._id}/track`} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full" icon={Truck}>
              Track Order Live
            </Button>
          </Link>

          <Link to={`/orders/${order?._id}`} className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full" icon={Package}>
              View Order Details
            </Button>
          </Link>

          <Link to="/products" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full" icon={ShoppingBag}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
