import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Truck, RefreshCw, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white">Free Express Delivery</h5>
              <p className="text-xs text-slate-400">Orders over $100</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white">2-Year Warranty</h5>
              <p className="text-xs text-slate-400">100% Guaranteed</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white">30-Day Easy Returns</h5>
              <p className="text-xs text-slate-400">No questions asked</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white">Simulated Checkout</h5>
              <p className="text-xs text-slate-400">Secure end-to-end sandbox</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">NovaStore</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Agile Software Development and DevOps laboratory reference application. Built with MERN Stack, Docker, Kubernetes, Prometheus, and automated CI/CD.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-800 text-indigo-400 border border-slate-700">
                v1.0.0-prod
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-800 text-emerald-400 border border-slate-700">
                Prometheus Ready
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=Electronics" className="hover:text-white transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/products?category=Computing" className="hover:text-white transition-colors">
                  Computing
                </Link>
              </li>
              <li>
                <Link to="/products?category=Audio" className="hover:text-white transition-colors">
                  Audio & Sound
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Area */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Customer Hub
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* System & DevOps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              DevOps & Status
            </h4>
            <ul className="space-y-2.5 text-sm font-mono text-xs">
              <li>
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Health API
                </a>
              </li>
              <li>
                <a
                  href="/metrics"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Prometheus /metrics
                </a>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-amber-400 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} NovaStore Platform. Built for Agile & DevOps Excellence.</p>
          <div className="flex gap-6">
            <span>React + Vite</span>
            <span>Node.js + Express</span>
            <span>MongoDB Mongoose</span>
            <span>Kubernetes</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
