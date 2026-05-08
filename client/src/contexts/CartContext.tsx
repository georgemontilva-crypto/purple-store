import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { trpc } from "@/lib/trpc";

interface CartContextType {
  sessionId: string;
  cartCount: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

function getOrCreateSessionId() {
  let id = localStorage.getItem("cart_session_id");
  if (!id) {
    id = nanoid(32);
    localStorage.setItem("cart_session_id", id);
  }
  return id;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [sessionId] = useState(getOrCreateSessionId);
  const [cartOpen, setCartOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: cartItems = [] } = trpc.cart.get.useQuery(
    { sessionId },
    { refetchOnWindowFocus: false }
  );

  const upsertMutation = trpc.cart.upsert.useMutation({
    onSuccess: () => utils.cart.get.invalidate({ sessionId }),
  });

  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => utils.cart.get.invalidate({ sessionId }),
  });

  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => utils.cart.get.invalidate({ sessionId }),
  });

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const addToCart = useCallback(
    (productId: number, quantity = 1) => {
      const existing = cartItems.find((i) => i.productId === productId);
      const newQty = (existing?.quantity ?? 0) + quantity;
      upsertMutation.mutate({ sessionId, productId, quantity: newQty });
    },
    [cartItems, sessionId, upsertMutation]
  );

  const removeFromCart = useCallback(
    (productId: number) => {
      removeMutation.mutate({ sessionId, productId });
    },
    [sessionId, removeMutation]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeMutation.mutate({ sessionId, productId });
      } else {
        upsertMutation.mutate({ sessionId, productId, quantity });
      }
    },
    [sessionId, upsertMutation, removeMutation]
  );

  const clearCart = useCallback(() => {
    clearMutation.mutate({ sessionId });
  }, [sessionId, clearMutation]);

  return (
    <CartContext.Provider
      value={{
        sessionId,
        cartCount,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
