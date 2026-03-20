import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

function recalculate(items: CartItem[]) {
  return {
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          const updated = existing
            ? state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
              )
            : [...state.items, item];
          return recalculate(updated);
        }),

      removeItem: (id) =>
        set((state) => recalculate(state.items.filter((i) => i.id !== id))),

      updateQuantity: (id, quantity) =>
        set((state) =>
          recalculate(
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          ),
        ),

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    { name: 'cart' },
  ),
);

export default useCartStore;
