import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem("pichi_cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("pichi_cart", JSON.stringify(items));
  }, [items]);

  function addItem(juego) {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === juego.id);
      if (existente) {
        return prev.map((i) =>
          i.id === juego.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: juego.id,
          titulo: juego.titulo,
          precio: juego.precio,
          portada: juego.portada,
          cantidad: 1,
        },
      ];
    });
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateCantidad(id, cantidad) {
    if (cantidad < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad } : i)));
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateCantidad, clearCart, total, cantidadTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
