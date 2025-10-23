import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { formatRp } from "../utils/format";

export default function ViewOrderPage() {
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState<any[]>([]);
  const [note, setNote] = useState(localStorage.getItem("note") || "");
  const navigate = useNavigate();

  const table = searchParams.get("table");
  const mode = searchParams.get("mode");

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

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleNext = () => {
    localStorage.setItem("note", note);
    if (table) localStorage.setItem("tableNumber", table);
    if (cart.length > 0) localStorage.setItem("cart", JSON.stringify(cart));

    navigate(`/payment?mode=${mode || ""}&table=${table || ""}`);
  };

  const handleBack = () => {
    localStorage.setItem("note", note);
    if (table) localStorage.setItem("tableNumber", table);
    if (cart.length > 0) localStorage.setItem("cart", JSON.stringify(cart));

    navigate(`/order?mode=${mode || ""}&table=${table || ""}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-6">
          🧾 Ringkasan Pesanan
        </h1>

        {/* Info meja dine-in */}
        {table && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 rounded-lg shadow-md mb-6">
            🍽️ Dine-in di <span className="font-bold">Meja {table}</span>
          </div>
        )}

        {/* Konten pesanan */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Keranjang masih kosong 😅
            </p>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between py-3">
                    <div>
                      <div className="font-medium text-slate-800">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.qty} × {formatRp(item.price)}
                      </div>
                    </div>
                    <div className="text-right font-semibold text-slate-800">
                      {formatRp(item.qty * item.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-3 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatRp(total)}</span>
              </div>

              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Catatan Pesanan
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Kurangi gula, tanpa es..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-medium transition"
                >
                  ← Kembali
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold transition"
                >
                  Lanjut Pembayaran →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
