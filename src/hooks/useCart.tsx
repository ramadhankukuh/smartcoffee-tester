import { useState, useEffect } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        setCart([]);
      }
    }
  }, []);

  // Simpan cart ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Sync antar tab
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "cart") {
        setCart(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const newCart = [...prev];
        newCart[idx].qty += item.qty;
        return newCart;
      } else {
        return [...prev, item];
      }
    });
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return { cart, addItem, removeItem, updateQty, clearCart, total, count };
}
