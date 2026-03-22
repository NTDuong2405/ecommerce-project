import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SocketProvider>
      <CartProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <App />
      </CartProvider>
    </SocketProvider>
  </React.StrictMode>
);

