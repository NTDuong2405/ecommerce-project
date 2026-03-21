import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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
      // Nếu Unauthorized (Token sai/hết hạn), đá về trang Login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
