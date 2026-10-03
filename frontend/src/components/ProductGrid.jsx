import React from 'react';
import ProductCard from './ProductCard';
import { PackageX } from 'lucide-react';
import Button from './Button';

export const ProductGrid = ({ products = [], onResetFilters }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <PackageX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Products Found</h3>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          We couldn't find any products matching your current search or filter criteria. Try adjusting your search term or clearing the filters.
        </p>
        {onResetFilters && (
          <div className="mt-6">
            <Button variant="secondary" onClick={onResetFilters}>
              Reset All Filters
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
