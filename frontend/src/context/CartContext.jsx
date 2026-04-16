import React, { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]); // [{ product, quantity }]

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.currentStock) }
            : i
        );
      }
      return [...prev, { product, quantity: Math.min(qty, product.currentStock) }];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    setItems((prev) =>
      prev.map((i) => (i.product._id === productId ? { ...i, quantity: qty } : i))
    );
  };

  const removeFromCart = (productId) =>
    setItems((prev) => prev.filter((i) => i.product._id !== productId));

  const clearCart = () => setItems([]);

  const totalItems  = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.product.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
