import React from "react";
import { formatRp } from "../utils/format";
import { MenuItem } from "../data/menu";

type Cart = Record<number, number>;

export default function CartPreviewModal({
  open,
  onClose,
  cart,
  items,
  onIncrease,
  onDecrease,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  cart: Cart;
  items: MenuItem[];
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onCheckout: () => void;
}) {
  if (!open) return null;

  // ✅ Aman: handle jika items belum siap atau item tidak ditemukan
  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => {
      const item = items.find((it) => String(it.id) === id);
      if (!item) return null; // skip jika item tidak ditemukan
      return { item, qty };
    })
    .filter((entry): entry is { item: MenuItem; qty: number } => entry !== null);

  // ✅ Aman: handle jika cart kosong
  const total = cartEntries.reduce(
    (s, e) => s + ((e.item?.price ?? 0) * (e.qty ?? 0)),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:w-[520px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 max-h-[80vh] overflow-auto transform translate-y-0 transition-transform">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Keranjang</div>
          <button onClick={onClose} className="text-slate-500">Tutup</button>
        </div>

        <div className="mt-4 space-y-3">
          {cartEntries.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
              Belum ada item di keranjang.
            </div>
          ) : (
            cartEntries.map((e) => (
              <div
                key={e.item.id}
                className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
              >
                <div>
                  <div className="font-medium">{e.item.name}</div>
                  <div className="text-xs text-slate-500">
                    {formatRp(e.item.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDecrease(String(e.item.id))}
                    className="px-3 py-1 bg-white rounded-lg shadow"
                  >
                    -
                  </button>
                  <div className="w-7 text-center">{e.qty}</div>
                  <button
                    onClick={() => onIncrease(String(e.item.id))}
                    className="px-3 py-1 bg-white rounded-lg shadow"
                  >
                    +
                  </button>

                  <div className="ml-4 font-semibold">
                    {formatRp(e.item.price * e.qty)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 border-t pt-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Total</div>
            <div className="text-lg font-bold">{formatRp(total)}</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCheckout}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
