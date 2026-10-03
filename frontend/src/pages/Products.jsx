import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import ProductGrid from '../components/ProductGrid';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State derived from URL search parameters
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read current query values
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentMinRating = searchParams.get('minRating') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Load filter options (categories & brands) once on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, filterData] = await Promise.all([
          productService.getCategories(),
          productService.getFilters()
        ]);
        setCategories(cats || []);
        setBrands(filterData.brands || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products whenever search params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getProducts({
          search: currentSearch,
          category: currentCategory,
          brand: currentBrand,
          minPrice: currentMinPrice,
          maxPrice: currentMaxPrice,
          minRating: currentMinRating,
          sort: currentSort,
          page: currentPage,
          limit: 12
        });

        setProducts(res.products || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentSearch,
    currentCategory,
    currentBrand,
    currentMinPrice,
    currentMaxPrice,
    currentMinRating,
    currentSort,
    currentPage
  ]);

  // Helper to update URL params
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 unless we are deliberately changing the page
    if (!('page' in updates)) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleSearch = (term) => updateParams({ search: term });
  const handleCategoryChange = (category) => updateParams({ category });
  const handleBrandChange = (brand) => updateParams({ brand });
  const handlePriceChange = (type, val) => {
    if (type === 'min') updateParams({ minPrice: val });
    if (type === 'max') updateParams({ maxPrice: val });
  };
  const handleRatingChange = (rating) => updateParams({ minRating: rating });
  const handleSortChange = (sort) => updateParams({ sort });

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Title and Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Discover Products
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {pagination.total || 0} premium devices and accessories
          </p>
        </div>

        <div className="w-full md:max-w-md flex items-center gap-3">
          <SearchBar
            initialValue={currentSearch}
            onSearch={handleSearch}
            placeholder="Search catalog by keyword..."
          />
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden p-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50"
            aria-label="Toggle Filters"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block lg:col-span-1 sticky top-28">
          <FilterSidebar
            categories={categories}
            brands={brands}
            selectedCategory={currentCategory}
            selectedBrand={currentBrand}
            minPrice={currentMinPrice}
            maxPrice={currentMaxPrice}
            minRating={currentMinRating}
            sort={currentSort}
            onCategoryChange={handleCategoryChange}
            onBrandChange={handleBrandChange}
            onPriceChange={handlePriceChange}
            onRatingChange={handleRatingChange}
            onSortChange={handleSortChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1">
            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategory={currentCategory}
              selectedBrand={currentBrand}
              minPrice={currentMinPrice}
              maxPrice={currentMaxPrice}
              minRating={currentMinRating}
              sort={currentSort}
              onCategoryChange={(c) => {
                handleCategoryChange(c);
                setMobileFilterOpen(false);
              }}
              onBrandChange={(b) => {
                handleBrandChange(b);
                setMobileFilterOpen(false);
              }}
              onPriceChange={handlePriceChange}
              onRatingChange={(r) => {
                handleRatingChange(r);
                setMobileFilterOpen(false);
              }}
              onSortChange={(s) => {
                handleSortChange(s);
                setMobileFilterOpen(false);
              }}
              onReset={() => {
                handleResetFilters();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        )}

        {/* Product Cards Grid & Pagination */}
        <div className="lg:col-span-3 space-y-8">
          {error && <ErrorMessage message={error} onRetry={() => updateParams({})} />}

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner message="Querying product catalog..." />
            </div>
          ) : (
            <>
              <ProductGrid
                products={products}
                onResetFilters={handleResetFilters}
              />

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Page <span className="font-bold text-slate-800">{pagination.page}</span> of{' '}
                    <span className="font-bold text-slate-800">{pagination.totalPages}</span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
