import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { Star, Search, SlidersHorizontal, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { useTranslation } from 'react-i18next';


const Products = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('subCategory') || '');
  const [categories] = useState(['Fashion', 'Tech', 'Accessories', 'Beauty', 'Home']);

  const subCategoryMap = {
    Fashion: ['Áo Dài', 'Streetwear', 'Pants', 'T-Shirt', 'Polo'],
    Tech: ['Smartphone', 'Audio', 'Laptop', 'Smart Home'],
    Accessories: ['Watch', 'Bag', 'Jewelry'],
    Beauty: ['Skincare', 'Makeup', 'Body Care'],
    Home: ['Pottery/Basket', 'Vase', 'Furniture', 'Decoration']
  };
  const sortParam = searchParams.get('sort');
  const limit = 8;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (searchTerm) params.append('search', searchTerm);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubCategory) params.append('subCategory', selectedSubCategory);
      
      // Hỗ trợ New Arrivals: Sắp xếp theo ngày tạo mới nhất
      if (sortParam === 'newest') {
        params.append('sortBy', 'createdAt');
        params.append('order', 'desc');
      }

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data.data || []);
      setTotal(res.data.data.meta?.total || 0);
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync with URL params
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const subCat = searchParams.get('subCategory') || '';
    
    if (cat !== selectedCategory || subCat !== selectedSubCategory) {
      setSelectedCategory(cat);
      setSelectedSubCategory(subCat);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm, minPrice, maxPrice, sortParam, selectedCategory, selectedSubCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput);
  };

  const updateCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory(''); // Reset sub on main cat change
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (cat) newParams.set('category', cat);
    else newParams.delete('category');
    newParams.delete('subCategory');
    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 mb-3">
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Collection</span>
        </h1>
        <p className="text-slate-500 text-lg">Discover {total} premium products handpicked for you.</p>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-8">
          <button
            onClick={() => updateCategory('')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCategory 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => updateCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-colors">
            Search
          </button>
        </form>

        {/* Price filters */}
        <div className="flex items-center gap-2 text-sm shrink-0">
          <SlidersHorizontal size={18} className="text-slate-400" />
          <input
            type="number"
            placeholder="Min $"
            className="w-24 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
          />
          <span className="text-slate-400">—</span>
          <input
            type="number"
            placeholder="Max $"
            className="w-24 px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
              <div className="aspect-[4/5] bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-6 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <ShoppingBag size={56} className="mb-4 text-slate-300" />
          <p className="text-xl font-semibold font-display text-slate-700">No products found</p>
          <p className="text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={16} /> Prev
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${page === i + 1 ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── Product Card Component ─── */
const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="text-yellow-400 fill-yellow-400" size={12} />
          <span className="text-xs font-bold text-slate-800">4.8</span>
        </div>
        {product.stock === 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 text-white text-xs font-bold text-center py-2">
            OUT OF STOCK
          </div>
        )}

        {/* Discount Tag */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg animate-bounce">
            -{product.discountPercentage}%
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
          <div className="w-full py-2.5 bg-white/95 backdrop-blur-md text-slate-900 font-bold rounded-xl shadow-lg text-center text-sm">
            View Details →
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1.5">Essential</div>
        <h3 className="text-base font-bold text-slate-900 font-display mb-2 line-clamp-2">{product.name}</h3>
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xl font-bold text-slate-900">{formatPrice(product.price)}</div>
            {product.discountPercentage > 0 && (
              <div className="text-sm text-slate-400 line-through">{formatPrice(product.originalPrice)}</div>
            )}
          </div>
          {product.stock > 0 && product.stock <= 10 && (
            <span className="text-xs text-orange-600 font-semibold italic">Only {product.stock} left!</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Products;
