import axios from 'axios';

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

let currentRate = 25000; // Fallback mặc định

export const fetchExchangeRate = async () => {
  try {
    const response = await axios.get(EXCHANGE_RATE_API);
    if (response.data && response.data.rates && response.data.rates.VND) {
      currentRate = response.data.rates.VND;
      console.log(`%c📊 [Currency Update] Tỷ giá USD -> VND hôm nay: ${currentRate.toLocaleString()}đ`, "color: #2563eb; font-weight: bold; padding: 4px;");
      return currentRate;
    }
  } catch (error) {
    console.warn('⚠️ Lỗi khi lấy tỷ giá dynamic, sử dụng tỷ giá mặc định:', currentRate);
  }
  return currentRate;
};

export const getCurrentRate = () => currentRate;
