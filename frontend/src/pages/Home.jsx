import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  ShoppingBag,
  TrendingUp,
  Headphones,
  Laptop,
  Watch,
  Home as HomeIcon,
  Cable
} from 'lucide-react';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORY_CARDS = [
  { name: 'Audio', icon: Headphones, count: '6 Devices', color: 'from-blue-500 to-indigo-600' },
  { name: 'Computing', icon: Laptop, count: '8 Models', color: 'from-violet-500 to-purple-600' },
  { name: 'Wearables', icon: Watch, count: '5 Trackers', color: 'from-emerald-500 to-teal-600' },
  { name: 'Smart Home', icon: HomeIcon, count: '4 Gadgets', color: 'from-amber-500 to-orange-600' },
  { name: 'Accessories', icon: Cable, count: '9 Items', color: 'from-rose-500 to-pink-600' }
];

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getProducts({ limit: 8, sort: 'rating_desc' });
        setFeaturedProducts(data.products || []);
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white pt-20 pb-28">
        {/* Glow backdrop shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold tracking-wide uppercase mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Agile DevOps Reference Architecture
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Next-Gen E-Commerce,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Engineered for Speed.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Discover precision hardware, pro-grade studio audio, and smart connected tech. Built with modern fullstack microservices, Prometheus monitoring, and containerized scale.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Explore Catalog
            </Link>
            <Link
              to="/products?category=Computing"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 backdrop-blur-md transition-all duration-200 flex items-center gap-2"
            >
              Latest Computing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-4xl mx-auto">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">99.99%</p>
              <p className="text-xs text-slate-400 mt-0.5">Uptime SLA</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">20+ Items</p>
              <p className="text-xs text-slate-400 mt-0.5">Ready to Ship</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 150ms</p>
              <p className="text-xs text-slate-400 mt-0.5">API Latency</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Simulated</p>
              <p className="text-xs text-slate-400 mt-0.5">Zero-Risk Sandbox</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORY_CARDS.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="group relative rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 mb-6`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Curated Picks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Top Rated Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All ({featuredProducts.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching top rated catalog..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Technical Highlights / DevOps Sandbox Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              DevOps-Ready Architecture
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Built for CI/CD, Containerization, and Microservice Observability.
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Equipped with live Prometheus metrics scraping, health & readiness probes, containerized Docker Compose stacks, Kubernetes ingress routing, and automated testing pipelines.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-md transition-all"
              >
                Browse Store Catalog
              </Link>
              <a
                href="/metrics"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs border border-slate-700 transition-all font-mono"
              >
                View /metrics Feed
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
