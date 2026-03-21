const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-display font-bold text-xl text-slate-900 mb-4">VibeCart.</h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Your premium destination for exclusive items. We provide the best quality products for your lifestyle.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Shop</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">All Products</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">New Arrivals</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">Discounted Items</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">Customer Support</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Newsletter</h4>
            <p className="text-slate-500 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg font-medium hover:bg-primary-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2026 VibeCart. All rights reserved.</p>
          <div className="flex gap-4">
            {/* Social blanks */}
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
