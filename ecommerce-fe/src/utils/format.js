import i18n from '../i18n';
import { getCurrentRate } from './exchangeRate';

/**
 * Format giá tiền dựa trên ngôn ngữ và tỷ giá hiện tại
 * @param {number} price - Giá cơ bản (giả định là USD từ Database)
 * @returns {string} - Chuỗi giá đã được format kèm ký hiệu
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null) return '0';
  
  const currentLang = i18n.language || 'en';
  const isVND = currentLang.startsWith('vi');
  const currencyData = i18n.getResourceBundle(currentLang, 'translation')?.currency || { code: 'USD', symbol: '$' };
  
  // Lấy tỷ giá dynamic cho VND, nếu không thì mặc định là 1 cho USD
  const rate = isVND ? getCurrentRate() : 1;
  
  const convertedPrice = price * rate;
  
  // Format đẹp mắt cho từng quốc gia (ví dụ: 1.500.000đ hoặc $1,500.00)
  return new Intl.NumberFormat(isVND ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: currencyData.code || 'USD',
    minimumFractionDigits: isVND ? 0 : 2
  }).format(convertedPrice);
};
