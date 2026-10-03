import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Package,
  Users,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  PlusCircle
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await orderService.getAdminStats();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner message="Calculating real-time telemetry metrics..." />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorMessage message={error || 'Unable to display admin metrics'} />;
  }

  const { stats, recentOrders = [], lowStockProducts = [] } = data;

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: ShoppingBag,
      color: 'from-indigo-500 to-indigo-700',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Active Products',
      value: stats.totalProducts || 0,
      icon: Package,
      color: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-600'
    },
    {
      title: 'Customer Accounts',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending Fulfillment',
      value: stats.pendingOrders || 0,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600'
    },
    {
      title: 'Completed Deliveries',
      value: stats.completedOrders || 0,
      icon: CheckCircle2,
      color: 'from-teal-500 to-emerald-600',
      textColor: 'text-teal-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3"
            >
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-sm`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block -mb-0.5">
                  {card.title}
                </span>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Orders (Left) + Low Stock Warnings (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No orders recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((ord) => (
                <div key={ord._id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        #{ord._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="font-medium text-slate-600">
                        by {ord.user?.name || ord.user?.email || 'Guest'}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {formatDate(ord.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900 text-sm">
                      {formatCurrency(ord.total)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                      {ord.orderStatus}
                    </span>
                    <Link
                      to={`/admin/orders/${ord._id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-base">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Alerts
            </div>
            <Link
              to="/admin/products/new"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-emerald-600 py-6 text-center font-medium">
              All product lines are adequately stocked (&gt; 5 units).
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                    <span className="text-[11px] text-slate-500">{prod.category}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px]">
                      {prod.stock} Left
                    </span>
                    <Link
                      to={`/admin/products/${prod._id}/edit`}
                      className="block text-[10px] text-indigo-600 font-bold mt-1"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
