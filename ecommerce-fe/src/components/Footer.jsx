import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <ShoppingBag className="text-white" size={16} />
              </div>
              <span className="font-display font-bold text-xl text-slate-900">VibeCart.</span>
            </div>
            <p className="text-slate-500 mb-6 leading-relaxed">
              {t('footer.desc')}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">{t('footer.sections.shop')}</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-slate-500 hover:text-primary-600 transition-colors uppercase text-[10px] font-black tracking-widest">{t('footer.links.all_products')}</Link></li>
              <li><Link to="/products?sort=newest" className="text-slate-500 hover:text-primary-600 transition-colors uppercase text-[10px] font-black tracking-widest">{t('footer.links.new_arrivals')}</Link></li>
              <li><Link to="/products" className="text-slate-500 hover:text-primary-600 transition-colors uppercase text-[10px] font-black tracking-widest">{t('footer.links.discounted')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">{t('footer.sections.company')}</h4>
            <ul className="space-y-3">
              <li><Link to="/profile" className="text-slate-500 hover:text-primary-600 transition-colors uppercase text-[10px] font-black tracking-widest">{t('footer.links.about_us')}</Link></li>
              <li><Link to="/track" className="text-slate-500 hover:text-primary-600 transition-colors uppercase text-[10px] font-black tracking-widest">{t('footer.links.support')}</Link></li>
              <li><Link to="/profile" className="text-slate-500 hover:text-primary-600 transition-colors uppercase text-[10px] font-black tracking-widest">{t('footer.links.terms')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">{t('footer.sections.newsletter')}</h4>
            <p className="text-slate-500 mb-4">{t('footer.newsletter_desc')}</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder={t('footer.email_placeholder')} 
                className="flex-1 px-4 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg font-medium hover:bg-primary-700 transition-colors">
                {t('footer.subscribe')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">{t('footer.rights')}</p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition-colors">In</div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition-colors">Tw</div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition-colors">Fb</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
