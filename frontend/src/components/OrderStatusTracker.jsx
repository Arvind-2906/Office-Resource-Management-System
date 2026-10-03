import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  CheckCheck,
  AlertOctagon
} from 'lucide-react';
import { formatDate } from '../utils/formatCurrency';

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PACKED', label: 'Packed', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: MapPin },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCheck }
];

export const OrderStatusTracker = ({ currentStatus = 'PENDING', trackingEvents = [] }) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-rose-900">Order Cancelled</h4>
        <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
          This order was cancelled. Any payment made will be refunded automatically to your original payment method.
        </p>
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-6">
        Fulfillment Progress
      </h4>

      {/* Stepper bar */}
      <div className="relative">
        {/* Background connector line */}
        <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-slate-100 -z-0" />
        
        {/* Active progress connector line */}
        <div
          className="hidden sm:block absolute top-5 left-6 h-1 bg-indigo-600 transition-all duration-500 -z-0"
          style={{
            width: `${(activeIndex / (ORDER_STEPS.length - 1)) * 92}%`
          }}
        />

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 sm:gap-2">
          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center z-10">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-50'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? 'text-indigo-600'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <span className="text-[10px] text-slate-400 block sm:hidden">
                    {isCurrent ? 'Current Status' : isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline logs */}
      {trackingEvents.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Activity History
          </h5>
          <div className="space-y-3">
            {trackingEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{event.message}</p>
                  <span className="text-slate-400 text-[11px]">
                    {formatDate(event.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTracker;
