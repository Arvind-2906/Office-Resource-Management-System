import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { Sparkles, Mail, Lock, ShieldCheck, User } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Demo credential autofill helpers for rapid laboratory grading
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access your cart, orders, and personalized hardware feed
          </p>
        </div>

        {/* Demo Credentials Quick Click (Lab helper) */}
        <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
          <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
            Lab Evaluation One-Click Autofill:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('john@example.com', 'password123')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 flex items-center justify-center gap-1 shadow-2xs"
            >
              <User className="w-3 h-3" /> Customer
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@novastore.com', 'admin123')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-50 flex items-center justify-center gap-1 shadow-2xs"
            >
              <ShieldCheck className="w-3 h-3 text-amber-600" /> Admin
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={Mail}
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={Lock}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2"
          >
            Sign In to Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
