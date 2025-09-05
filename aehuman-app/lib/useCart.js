// lib/useCart.js
export const CART_KEY = 'ae_cart_v1';

export function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}
export function writeCart(items) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
}

export function currency(n) {
  const v = Number(n ?? 0);
  return n.toFixed(2).replace('.', ',');
}

import { useEffect, useMemo, useState, useCallback } from 'react';

export function useCart() {
  const [items, setItems] = useState([]);

  useEffect(() => { setItems(readCart()); }, []);
  useEffect(() => { writeCart(items); }, [items]);

  const add = useCallback((p, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.id === p.id);
      if (i >= 0) {
        const copy = prev.slice();
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { id: p.id, title: p.title, price: p.price, qty }];
    });
  }, []);

  const setQty = useCallback((id, qty) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(1, qty|0) } : x));
  }, []);
  const remove = useCallback((id) => {
    setItems(prev => prev.filter(x => x.id !== id));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const totalQty = useMemo(() => items.reduce((s,x)=>s+x.qty,0), [items]);
  const subtotal = useMemo(() => items.reduce((s,x)=>s+x.qty*x.price,0), [items]);

  return { items, add, setQty, remove, clear, totalQty, subtotal, total: subtotal };

}
