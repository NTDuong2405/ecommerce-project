import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Thêm Token vào Header cho mọi request
api.interceptors.request.use(
  (config) => {
    // Luôn ưu tiên Token theo đúng khu vực trang
    const isAdminPath = window.location.pathname.startsWith('/admin');
    
    // Nếu ở trang admin, lấy admin_token. Nếu ở trang shop, lấy token của user
    const token = isAdminPath 
      ? localStorage.getItem('admin_token') 
      : localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý lỗi tập trung (ví dụ: Token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xác định đang ở khu vực nào (Admin hay Shop)
      const isAdminPath = window.location.pathname.startsWith('/admin');
      const isAlreadyOnAdminLogin = window.location.pathname === '/admin/login';
      const isAlreadyOnShopLogin = window.location.pathname === '/login';
      
      if (isAdminPath) {
        // Phe Admin: Xóa admin data & về login admin (để bảo mật)
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        
        if (!isAlreadyOnAdminLogin) {
          window.location.href = '/admin/login';
        }
      } else {
        // Phe Shop: CHỈ XÓA DATA, KHÔNG TỰ ĐỘNG CHUYỂN TRANG
        // Để khách vãng lai vẫn xem được hàng bình thường
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
