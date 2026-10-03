import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import productService from '../services/productService';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeft, PlusCircle, Image as ImageIcon } from 'lucide-react';

export const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    brand: '',
    stock: '10',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await productService.createProduct({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      });
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Product List
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Add New Product to Catalog</h2>
          <p className="text-xs text-slate-500 mt-1">
            Provide hardware specs, pricing tiers, and warehouse initial inventory
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Title"
            id="name"
            placeholder="e.g. Apex Sound Pro Wireless"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed specifications, features, and package contents..."
              className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand / Manufacturer"
              id="brand"
              placeholder="e.g. AuraSound"
              value={formData.brand}
              onChange={handleChange}
              required
            />

            <div>
              <label
                htmlFor="category"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="Electronics">Electronics</option>
                <option value="Audio">Audio</option>
                <option value="Wearables">Wearables</option>
                <option value="Computing">Computing</option>
                <option value="Accessories">Accessories</option>
                <option value="Smart Home">Smart Home</option>
              </select>
            </div>

            <Input
              label="Retail Price ($)"
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="299.99"
              value={formData.price}
              onChange={handleChange}
              required
            />

            <Input
              label="Warehouse Inventory Stock"
              id="stock"
              type="number"
              min="0"
              placeholder="10"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Image URL"
            id="image"
            placeholder="https://images.unsplash.com/..."
            value={formData.image}
            onChange={handleChange}
            required
            icon={ImageIcon}
          />

          {formData.image && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Live Thumbnail Preview:
              </span>
              <img
                src={formData.image}
                alt="Preview"
                className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/admin/products">
              <Button variant="secondary" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={PlusCircle}
            >
              Publish Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
