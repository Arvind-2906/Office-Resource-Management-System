import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { ChevronRight, Package, Clock } from 'lucide-react';

const statusColorMap = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PACKED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-orange-50 text-orange-700 border-orange-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200'
};

export const OrderCard = ({ order }) => {
  const statusClass = statusColorMap[order.orderStatus] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500">
              #{order._id.slice(-8).toUpperCase()}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${statusClass}`}
            >
              {order.orderStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block -mb-0.5">Order Total</span>
          <span className="text-lg font-extrabold text-slate-900">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {/* Item Previews */}
      <div className="py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden">
            {order.items.slice(0, 4).map((item, i) => (
              <img
                key={i}
                src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                alt={item.name}
                className="inline-block h-12 w-12 rounded-xl object-cover ring-2 ring-white border border-slate-100 bg-slate-50"
              />
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {order.items[0]?.name}
              {order.items.length > 1 && (
                <span className="text-slate-500 font-normal">
                  {' '}
                  +{order.items.length - 1} more items
                </span>
              )}
            </p>
            <p className="text-[11px] text-slate-400">
              Paid via {order.paymentMethod} • Status: {order.paymentStatus}
            </p>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-2">
          <Link
            to={`/orders/${order._id}/track`}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            Track Shipment
          </Link>
          <Link
            to={`/orders/${order._id}`}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="View order details"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
