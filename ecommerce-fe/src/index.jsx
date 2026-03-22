import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <I18nextProvider i18n={i18n}>
    <SocketProvider>
      <CartProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <App />
      </CartProvider>
    </SocketProvider>
  </I18nextProvider>
);

