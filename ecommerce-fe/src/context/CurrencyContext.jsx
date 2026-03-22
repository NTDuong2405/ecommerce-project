import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [rate, setRate] = useState(25000); // Fallback mặc định
  const [loading, setLoading] = useState(true);

  const fetchRate = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      if (res.data && res.data.rates && res.data.rates.VND) {
        setRate(res.data.rates.VND);
        console.log(`%c📊 [Finance Update] Tỷ giá USD -> VND hôm nay: ${res.data.rates.VND.toLocaleString()}đ`, "color: #2563eb; font-weight: bold; border: 1px solid #2563eb; padding: 4px; border-radius: 4px;");
      }
    } catch (err) {
      console.warn('⚠️ Lỗi khi lấy tỷ giá dynamic, sử dụng tỷ giá mặc định:', rate);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  return (
    <CurrencyContext.Provider value={{ rate, loading, refreshRate: fetchRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
