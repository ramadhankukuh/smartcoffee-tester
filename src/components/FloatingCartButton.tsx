import React from "react";
import { formatRp } from "../utils/format";

export default function FloatingCartButton({
  total,
  count,
  onOpen,
}: {
  total: number;
  count: number;
  onOpen: () => void;
}) {
  return (
<div className="fixed inset-x-0 bottom-6 z-40 px-4 flex justify-center">
  <button
    onClick={onOpen}
    className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg px-4 py-3 w-full max-w-md hover:scale-[1.01] transition-transform"
    aria-label="Buka keranjang"
  >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 7h14l-2-7M10 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
          </svg>

          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold shadow">
              {count}
            </span>
          )}
        </div>

        <div className="flex-1 text-left">
          <div className="text-[13px] opacity-90">Total</div>
          <div className="text-sm font-bold leading-none">{formatRp(total)}</div>
        </div>

        <div className="text-sm font-semibold uppercase">Checkout</div>
      </button>
    </div>
  );
}
