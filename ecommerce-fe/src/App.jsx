import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShopLayout from './layouts/ShopLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/shop/Home';
import Products from './pages/shop/Products';
import ProductDetail from './pages/shop/ProductDetail';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import CheckoutResult from './pages/shop/CheckoutResult';
import OrderTracking from './pages/shop/OrderTracking';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/shop/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/admin/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Luồng - CÔNG KHAI 100% */}
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/result" element={<CheckoutResult />} />
          <Route path="track" element={<OrderTracking />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Login Page Admin - CÔNG KHAI */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin/Staff Luồng - PHÂN QUYỀN CHẶT CHẼ */}
        <Route path="/admin" element={<ProtectedRoute role={['ADMIN', 'STAFF']} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route element={<ProtectedRoute role={['ADMIN']} />}>
               <Route path="analytics" element={<AdminAnalytics />} />
               <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="marketing" element={<AdminMarketing />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
