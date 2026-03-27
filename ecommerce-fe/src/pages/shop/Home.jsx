import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck, Mail, Send, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/format';
import toast from 'react-hot-toast';

const CATEGORIES_LIST = [
  { id: 'Clothing', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80' },
  { id: 'Shoes', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' },
  { id: 'Bags', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80' },
  { id: 'Accessories', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
  { id: 'Tech', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState('');
  const { socket } = useSocket();
  const { t } = useTranslation();

  useEffect(() => {
    api.get('/products?limit=8')
      .then(res => {
        const data = res.data?.data?.data || res.data?.data || [];
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Fetch products error:', err);
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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success(t('home.newsletter.success'));
    setEmail('');
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 translate-y-24 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20 pb-24 md:pt-32 md:pb-40 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
              {t('home.hero.badge')}
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.2] mb-8 max-w-5xl">
              {t('home.hero.title')}<span className="inline-block px-1 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 italic font-medium">{t('home.hero.title_span')}</span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl leading-relaxed">
              {t('home.hero.desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
              <Link to="/products" className="inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-1 w-full sm:w-auto">
                {t('home.hero.cta_shop')}
                <ArrowRight size={22} />
              </Link>
              <Link to="/products" className="inline-flex justify-center items-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-800 text-slate-800 px-10 py-5 rounded-full font-bold text-lg transition-all w-full sm:w-auto">
                {t('home.hero.cta_explore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <FeatureItem icon={<Truck className="text-primary-400" size={36} />} title={t('home.features.delivery')} desc={t('home.features.delivery_desc')} />
            <FeatureItem icon={<ShieldCheck className="text-primary-400" size={36} />} title={t('home.features.warranty')} desc={t('home.features.warranty_desc')} />
            <FeatureItem icon={<TrendingUp className="text-primary-400" size={36} />} title={t('home.features.quality')} desc={t('home.features.quality_desc')} />
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">{t('home.collections.title')}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">{t('home.collections.desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-[400px] md:h-[600px]">
            <div className="md:col-span-3 group relative rounded-3xl overflow-hidden cursor-pointer shadow-xl">
               <img src={CATEGORIES_LIST[0].img} alt="Clothing" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                  <h3 className="text-white text-3xl font-bold mb-2 font-display">{t('home.collections.Clothing')}</h3>
                  <Link to="/products?category=Clothing" className="text-white/80 flex items-center gap-2 hover:text-white transition-all text-sm font-semibold">
                    {t('home.trending.view_all')} <ExternalLink size={16} />
                  </Link>
               </div>
            </div>
            <div className="md:col-span-3 grid grid-cols-2 gap-6">
               {CATEGORIES_LIST.slice(1).map((cat) => (
                 <div key={cat.id} className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg">
                    <img src={cat.img} alt={cat.id} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                      <h3 className="text-white text-lg font-bold font-display">{t(`home.collections.${cat.id}`)}</h3>
                      <Link to={`/products?category=${cat.id}`} className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1 group-hover:text-white transition-all">{t('home.trending.view_all')}</Link>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <div className="text-primary-600 font-bold text-sm tracking-widest uppercase mb-2">{t('nav.products')}</div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">{t('home.trending.title')}</h2>
              <p className="text-slate-600 max-w-xl">{t('home.trending.desc')}</p>
            </div>
            <Link to="/products" className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl text-primary-600 font-bold hover:bg-primary-50 transition-all shadow-sm border border-slate-100">
              {t('home.trending.view_all')} <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {products.map((product) => (
              <ProductCard 
                 key={product.id}
                 id={product.id}
                 image={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'} 
                 title={product.name} 
                 price={product.price} 
                 category={product.category || "Essential"} 
                 rating={4.8} 
                 reviews={Math.floor(Math.random() * 200) + 50}
                 stock={product.stock}
                 product={product}
                 t={t}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative group">
                 <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative z-10">
                   <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&q=80" alt="About" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/30 rounded-full z-20 animate-pulse"></div>
              </div>
              <div className="space-y-8">
                 <div className="w-20 h-1.5 bg-primary-600 rounded-full"></div>
                 <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 leading-tight">
                   {t('home.about.title')}
                 </h2>
                 <p className="text-xl text-slate-600 leading-relaxed">
                   {t('home.about.desc')}
                 </p>
                 <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all flex items-center gap-3 group">
                   {t('home.about.cta')}
                   <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-primary-600 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary-600/30">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Mail size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">{t('home.newsletter.title')}</h2>
              <p className="text-primary-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">{t('home.newsletter.desc')}</p>
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder={t('home.newsletter.placeholder')} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md transition-all"
                  required
                />
                <button type="submit" className="bg-white text-primary-600 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                  {t('home.newsletter.subscribe')}
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-16">{t('home.testimonials.title')}</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { name: 'Sophia Chen', msg: t('home.testimonials.t1'), role: 'Fashion Designer', img: 'https://i.pravatar.cc/150?u=sophia' },
                { name: 'Alex Rivera', msg: t('home.testimonials.t2'), role: 'Tech Enthusiast', img: 'https://i.pravatar.cc/150?u=alex' },
                { name: 'Marcus V.', msg: t('home.testimonials.t3'), role: 'Entrepreneur', img: 'https://i.pravatar.cc/150?u=marcus' },
              ].map((t) => (
                <div key={t.name} className="bg-slate-50 p-10 rounded-[2.5rem] relative group hover:bg-slate-900 hover:text-white transition-all duration-500">
                   <div className="flex justify-center mb-6">
                      <img src={t.img} alt={t.name} className="w-20 h-20 rounded-full border-4 border-white shadow-xl group-hover:border-slate-800 transition-all" />
                   </div>
                   <p className="italic text-lg mb-6 leading-relaxed">"{t.msg}"</p>
                   <div className="font-bold text-slate-900 group-hover:text-primary-400">{t.name}</div>
                   <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{t.role}</div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Social Media Wall */}
      <section className="py-24 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 text-center">
           <div className="mb-12">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">{t('home.social.title')}</h2>
              <p className="text-primary-600 font-bold text-lg">{t('home.social.handle')}</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {[
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
                'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'
              ].map((src, i) => (
                <div key={i} className="aspect-square relative group overflow-hidden cursor-pointer">
                   <img src={src} alt="Social" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-primary-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold">♥ 1.2k</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mb-12">Trusted Partners & Global Presence</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <span className="text-2xl font-black text-slate-800 italic">VESTA</span>
            <span className="text-2xl font-black text-slate-800">NOVA</span>
            <span className="text-2xl font-black text-slate-800 tracking-tighter">PRIME</span>
            <span className="text-2xl font-black text-slate-800 font-display uppercase tracking-widest">Aura</span>
            <span className="text-2xl font-black text-slate-800">LUMOS</span>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center py-6 md:py-0 px-4 group">
    <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary-900/50 transition-all duration-500 shadow-xl shadow-black/20">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 font-display">{title}</h3>
    <p className="text-slate-400 max-w-[200px] leading-relaxed mx-auto">{desc}</p>
  </div>
);

const ProductCard = ({ id, image, title, price, category, rating, reviews, stock, product, t }) => (
  <Link to={`/product/${id}`} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100">
    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
        <Star className="text-yellow-400 fill-yellow-400" size={14} />
        <span className="text-xs font-bold text-slate-800">{rating}</span>
      </div>
      <div className={`absolute top-4 left-4 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${stock > 0 ? 'bg-white/80 text-emerald-600' : 'bg-rose-500/90 text-white'}`}>
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${stock > 0 ? 'bg-emerald-500' : 'bg-white'}`}></div>
        {stock > 0 ? `${t('product.in_stock')}: ${stock}` : t('product.out_of_stock')}
      </div>
      {product.discountPercentage > 0 && (
        <div className="absolute top-16 left-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
          {t('product.discount', { count: product.discountPercentage })}
        </div>
      )}
      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
        <div className={`w-full py-4 font-bold rounded-2xl shadow-xl text-center text-sm ${stock > 0 ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-400'}`}>
          {stock > 0 ? t('product.view_details') : t('product.sold_out')}
        </div>
      </div>
    </div>
    <div className="p-6 flex flex-col flex-1">
      <div className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mb-3">{category}</div>
      <h3 className="text-lg font-bold text-slate-900 font-display mb-3 line-clamp-2 leading-tight">{title}</h3>
      <div className="mt-auto pt-4 border-t border-slate-50">
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
             <div className="text-2xl font-display font-black text-slate-900">{formatPrice(price)}</div>
             {product.discountPercentage > 0 && (
               <div className="text-xs text-slate-400 line-through font-bold">{formatPrice(product.originalPrice)}</div>
             )}
           </div>
           <div className="text-[10px] font-bold text-slate-400 uppercase">({reviews} {t('cart.reviews')})</div>
        </div>
      </div>
    </div>
  </Link>
);

export default Home;
