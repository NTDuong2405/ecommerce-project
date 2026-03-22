import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/format';

const Home = () => {
  const [products, setProducts] = useState([]);
  const { socket } = useSocket();
  const { t } = useTranslation();

  useEffect(() => {
    api.get('/products?limit=4')
      .then(res => {
        const data = res.data?.data?.data || res.data?.data || [];
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Lỗi khi lấy sản phẩm:', err);
        setProducts([]);
      });

    if (socket) {
      socket.on('stock-update', ({ productId, newStock }) => {
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
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 translate-y-24 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20 pb-24 md:pt-32 md:pb-36 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
              {t('home.hero.badge')}
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-extrabold text-slate-900 tracking-tight leading-tight mb-6 max-w-4xl">
              {t('home.hero.title')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">{t('home.hero.title_span')}</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
              {t('home.hero.desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10 md:mb-20 w-full sm:w-auto">
              <Link to="/products?sort=newest" className="inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto">
                {t('home.hero.cta_shop')}
                <ArrowRight size={20} />
              </Link>
              <Link to="/products" className="inline-flex justify-center items-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-800 px-8 py-4 rounded-full font-semibold text-lg transition-all w-full sm:w-auto">
                {t('home.hero.cta_explore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <FeatureItem icon={<Truck className="text-primary-400" size={32} />} title={t('home.features.delivery')} desc={t('home.features.delivery_desc')} />
            <FeatureItem icon={<ShieldCheck className="text-primary-400" size={32} />} title={t('home.features.warranty')} desc={t('home.features.warranty_desc')} />
            <FeatureItem icon={<TrendingUp className="text-primary-400" size={32} />} title={t('home.features.quality')} desc={t('home.features.quality_desc')} />
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">{t('home.trending.title')}</h2>
              <p className="text-slate-600">{t('home.trending.desc')}</p>
            </div>
            <Link to="/products" className="flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
              {t('home.trending.view_all')} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
                 t={t}
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

const ProductCard = ({ id, image, title, price, category, rating, reviews, stock, product, t }) => (
  <Link to={`/product/${id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100">
    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
        <Star className="text-yellow-400 fill-yellow-400" size={14} />
        <span className="text-xs font-bold text-slate-800">{rating}</span>
      </div>
      <div className={`absolute top-4 left-4 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${stock > 0 ? 'bg-white/80 text-emerald-600' : 'bg-rose-500/90 text-white'}`}>
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${stock > 0 ? 'bg-emerald-500' : 'bg-white'}`}></div>
        {stock > 0 ? `${t('product.in_stock')}: ${stock}` : t('product.out_of_stock')}
      </div>
      {product.discountPercentage > 0 && (
        <div className="absolute top-4 right-14 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg animate-bounce">
          {t('product.discount', { count: product.discountPercentage })}
        </div>
      )}
      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <div className={`w-full py-3 font-bold rounded-xl shadow-lg text-center text-sm ${stock > 0 ? 'bg-white/95 backdrop-blur-md text-slate-900' : 'bg-slate-200 text-slate-400'}`}>
          {stock > 0 ? t('product.quick_add') : t('product.sold_out')}
        </div>
      </div>
    </div>
    <div className="p-5 flex flex-col flex-1">
      <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">{category}</div>
      <h3 className="text-base font-bold text-slate-900 font-display mb-2 line-clamp-2 leading-tight">{title}</h3>
      <div className="mt-auto">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-xl font-bold text-slate-900">{formatPrice(price)}</div>
          {product.discountPercentage > 0 && (
            <div className="text-sm text-slate-400 line-through">{formatPrice(product.originalPrice)}</div>
          )}
        </div>
        <div className="text-xs text-slate-500">({reviews} {t('cart.reviews')})</div>
      </div>
    </div>
  </Link>
);

export default Home;
