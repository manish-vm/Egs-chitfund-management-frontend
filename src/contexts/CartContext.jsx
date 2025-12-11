import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getCart as getCartAPI,
  addToCart as addToCartAPI,
  updateCartItem as updateCartItemAPI,
  removeFromCart as removeFromCartAPI
} from '../services/cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // ✅ Load cart on app start
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCartAPI();
      setItems(data.items || []);
    } catch (err) {
      console.error('Load cart failed', err);
      setItems([]); // ✅ fail-safe
    }
  };

  // ✅ ADD TO CART
  const addToCart = async (data) => {
    const res = await addToCartAPI(data);
    setItems(res.items || []);
  };

  // ✅ UPDATE QTY
  const updateCartItem = async (data) => {
    const res = await updateCartItemAPI(data);
    setItems(res.items || []);
  };

  // ✅ ✅ ✅ REMOVE FROM CART (THIS WAS MISSING)
  const removeFromCart = async (productId, size, color) => {
    const res = await removeFromCartAPI(productId, size, color);
    setItems(res.items || []);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateCartItem,
        removeFromCart // ✅ MUST BE EXPOSED HERE
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
