import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    // 1. Fetch dữ liệu ban đầu
    api.get('/products?limit=4')
      .then(res => {
        setProducts(res.data.data.data || res.data.data || []);
      })
      .catch(err => console.error(err));

    // 2. Kết nối Socket.io để nhận update Real-time từ Context
    if (socket) {
      socket.on('stock-update', ({ productId, newStock }) => {
        console.log(`%c⚡️ [Real-time Update] Product ID: ${productId} -> New Stock: ${newStock}`, "color: #10b981; font-weight: bold; border: 1px solid #10b981; padding: 4px;");
        setProducts(prev => prev.map(p => 
          p.id == productId ? { ...p, stock: newStock } : p
        ));
      });

      return () => socket.off('stock-update');
    }

  }, [socket]);


  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 translate-y-24 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20 pb-24 md:pt-32 md:pb-36 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
              New Collection 2026 is out now
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 tracking-tight leading-tight mb-6 max-w-4xl">
              Discover Quality Products Without <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Compromise</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
              Elevate your daily life with our curated collection of premium essentials. Free global shipping on orders over $150.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
              <Link to="/products" className="inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto">
                Shop Collection
                <ArrowRight size={20} />
              </Link>
              <Link to="/categories" className="inline-flex justify-center items-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-800 px-8 py-4 rounded-full font-semibold text-lg transition-all w-full sm:w-auto">
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <FeatureItem icon={<Truck className="text-primary-400" size={32} />} title="Free Delivery" desc="On all orders above $150" />
            <FeatureItem icon={<ShieldCheck className="text-primary-400" size={32} />} title="1-Year Warranty" desc="Guranteed replacement" />
            <FeatureItem icon={<TrendingUp className="text-primary-400" size={32} />} title="Premium Quality" desc="Sourced globally" />
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Trending Now</h2>
              <p className="text-slate-600">Our currently most popular items that everyone loves.</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard 
                 key={product.id}
                 id={product.id}
                 image={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'} 
                 title={product.name} 
                 price={product.price} 
                 category="Essential" 
                 rating={4.8} 
                 reviews={124}
                 stock={product.stock}
                 product={product}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center py-6 md:py-0 px-4 group">
    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-900/50 transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 font-display">{title}</h3>
    <p className="text-slate-400">{desc}</p>
  </div>
);

const ProductCard = ({ id, image, title, price, category, rating, reviews, stock, product }) => (
  <Link to={`/product/${id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100">
    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
      />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
        <Star className="text-yellow-400 fill-yellow-400" size={14} />
        <span className="text-xs font-bold text-slate-800">{rating}</span>
      </div>
      
      {/* Stock availability badge */}
      <div className={`absolute top-4 left-4 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 
        ${stock > 0 ? 'bg-white/80 text-emerald-600' : 'bg-rose-500/90 text-white'}`}>
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${stock > 0 ? 'bg-emerald-500' : 'bg-white'}`}></div>
        {stock > 0 ? `In Stock: ${stock}` : 'Out of Stock'}
      </div>

      {/* Discount Tag */}
      {product.discountPercentage > 0 && (
        <div className="absolute top-4 right-14 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg animate-bounce">
          -{product.discountPercentage}% OFF
        </div>
      )}
      
      {/* Quick Add Button overlay */}
      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <button 
          disabled={stock <= 0}
          className={`w-full py-3 font-bold rounded-xl shadow-lg transition-colors ${stock > 0 ? 'bg-white/95 backdrop-blur-md text-slate-900 hover:bg-primary-600 hover:text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`} 
          onClick={(e) => { e.preventDefault(); /* Add to cart */}}
        >
          {stock > 0 ? 'Quick Add' : 'Sold Out'}
        </button>
      </div>
    </div>
    <div className="p-6 flex flex-col flex-1">
      <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">{category}</div>
      <h3 className="text-lg font-bold text-slate-900 font-display mb-2 truncate">{title}</h3>
      <div className="mt-auto">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-xl font-bold text-slate-900">${price.toFixed(2)}</div>
          {product.discountPercentage > 0 && (
            <div className="text-sm text-slate-400 line-through">${product.originalPrice?.toFixed(2)}</div>
          )}
        </div>
        <div className="text-xs text-slate-500">({reviews} reviews)</div>
      </div>
    </div>
  </Link>
);

export default Home;
