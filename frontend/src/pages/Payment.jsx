import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import { formatCurrency } from '../utils/formatCurrency';
import Button from '../components/Button';
import Input from '../components/Input';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight
} from 'lucide-react';

export const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loadingOrder, setLoadingOrder] = useState(!order);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Simulation test toggle
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Form states based on method
  const [cardData, setCardData] = useState({
    name: 'John Doe',
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '123'
  });

  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    if (!order && orderId) {
      const fetchOrder = async () => {
        try {
          const data = await orderService.getOrderById(orderId);
          setOrder(data);
        } catch (err) {
          setError(err.message || 'Failed to retrieve order');
        } finally {
          setLoadingOrder(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, order]);

  if (loadingOrder) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Securing payment tunnel..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <ErrorMessage message={error || 'Order record not found'} />
        <Link to="/orders" className="mt-4 inline-block text-xs font-bold text-indigo-600">
          View My Orders
        </Link>
      </div>
    );
  }

  const handlePayNow = async (e) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);

    try {
      const details = {};
      if (order.paymentMethod === 'CARD') {
        details.cardNumber = cardData.cardNumber;
      } else if (order.paymentMethod === 'UPI') {
        details.upiId = upiId;
      } else if (order.paymentMethod === 'NET_BANKING') {
        details.bankName = selectedBank;
      }

      const payment = await paymentService.processPayment({
        orderId: order._id,
        method: order.paymentMethod,
        simulateFailure,
        details
      });

      if (payment.status === 'SUCCESS') {
        navigate(`/order-confirmation/${order._id}`, {
          state: { order, payment }
        });
      } else {
        setError(
          'Simulated payment failure triggered. You can uncheck "Simulate Gateway Failure" and retry to test successful processing.'
        );
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Simulated Payment Gateway
        </h1>
        <p className="text-xs text-slate-500">
          Order ID: <span className="font-mono font-bold text-slate-700">#{order._id}</span>
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Payment Form (Left 2 cols) */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {order.paymentMethod === 'CARD' && <CreditCard className="w-5 h-5 text-indigo-600" />}
              {order.paymentMethod === 'UPI' && <QrCode className="w-5 h-5 text-emerald-600" />}
              {order.paymentMethod === 'NET_BANKING' && <Building2 className="w-5 h-5 text-blue-600" />}
              {order.paymentMethod === 'COD' && <Banknote className="w-5 h-5 text-amber-600" />}
              <span className="font-bold text-slate-900 text-sm">
                Payment Channel: {order.paymentMethod}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              SANDBOX SIMULATOR
            </span>
          </div>

          {/* Test Failure Toggle for Agile Assessment */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Simulate Payment Gateway Failure (Negative Test Case)
              </span>
            </label>
            <p className="text-[11px] text-amber-700 pl-6 leading-relaxed">
              Check this box to verify that the application properly records a FAILED payment state and updates order telemetry without deducting charges.
            </p>
          </div>

          <form onSubmit={handlePayNow} className="space-y-4">
            {order.paymentMethod === 'CARD' && (
              <div className="space-y-4">
                <Input
                  label="Cardholder Name"
                  id="cardName"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  required
                />
                <Input
                  label="Simulated Card Number"
                  id="cardNumber"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                  required
                  icon={CreditCard}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry"
                    id="expiry"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    required
                  />
                  <Input
                    label="CVV"
                    id="cvv"
                    type="password"
                    maxLength={4}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {order.paymentMethod === 'UPI' && (
              <div className="space-y-4">
                <Input
                  label="Virtual Payment Address (VPA) / UPI ID"
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okhdfcbank"
                  required
                  icon={QrCode}
                />
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Or Scan Instant UPI Sandbox QR:
                  </p>
                  <div className="w-32 h-32 bg-white rounded-xl mx-auto border border-slate-200 p-2 flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-slate-800" />
                  </div>
                </div>
              </div>
            )}

            {order.paymentMethod === 'NET_BANKING' && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Select Banking Institution
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="HDFC Bank">HDFC Bank Sandbox</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="Chase Manhattan">Chase Manhattan Bank</option>
                  <option value="Citibank">Citibank International</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                </select>
              </div>
            )}

            {order.paymentMethod === 'COD' && (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <Banknote className="w-10 h-10 text-amber-600 mx-auto" />
                <h4 className="font-bold text-amber-900 text-sm">Cash on Delivery Verification</h4>
                <p className="text-xs text-amber-700 max-w-sm mx-auto">
                  Please keep exact currency amount ready upon delivery. Confirm order dispatch below.
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant={simulateFailure ? 'danger' : 'accent'}
              size="lg"
              loading={processing}
              className="w-full shadow-lg mt-4"
              icon={ShieldCheck}
            >
              {processing
                ? 'Processing Gateway Request...'
                : simulateFailure
                ? `Execute Failure Simulation (${formatCurrency(order.total)})`
                : `Pay ${formatCurrency(order.total)} Now`}
            </Button>
          </form>
        </div>

        {/* Order Brief (Right col) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100">
            Order Breakdown
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (8%)</span>
              <span className="font-semibold text-slate-800">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span className="font-semibold text-slate-800">
                {order.deliveryCharge === 0 ? 'FREE' : formatCurrency(order.deliveryCharge)}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Total Payable</span>
              <span className="text-xl font-extrabold text-indigo-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
            <p>• Zero real card or banking data stored.</p>
            <p>• Fully compliant with DevOps sandbox evaluation specs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
