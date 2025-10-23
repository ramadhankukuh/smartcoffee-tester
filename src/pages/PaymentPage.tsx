// src/pages/PaymentPage.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode");
  const table = searchParams.get("table");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        setCartItems(parsed);
      } catch {
        localStorage.removeItem("cart");
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!name.trim() || !email.trim() || !paymentMethod) {
    alert("Nama, email, dan metode pembayaran harus diisi!");
    return;
  }

  // 🟠 Ambil catatan dari localStorage
  const note = localStorage.getItem("note") || "";

  const order = {
    name,
    email,
    phone,
    mode,
    table,
    paymentMethod,
    items: cartItems,
    total,
    note, // 🟢 Tambahkan field ini
    status: "menunggu pembayaran",
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, "orders"), order);
    localStorage.removeItem("cart");
    localStorage.removeItem("note"); // 🧹 Bersihkan juga catatan setelah tersimpan

    if (paymentMethod === "qris") {
      navigate(`/qris-payment/${docRef.id}`);
      return;
    }

    alert("Pesanan berhasil dikirim ke kasir!");
    navigate("/");
  } catch (err) {
    console.error(err);
    alert("Gagal membuat pesanan.");
  }
};


  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-6">
          💳 Pembayaran Pesanan
        </h1>

        {/* Info Meja */}
        {table && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 rounded-lg shadow-md mb-6">
            🍽️ Dine-in di <span className="font-bold">Meja {table}</span>
          </div>
        )}

        {/* Ringkasan Pesanan */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">🧾 Ringkasan</h2>
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <div>
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    {item.qty} × {formatRp(item.price)}
                  </div>
                </div>
                <div className="font-semibold text-slate-800">
                  {formatRp(item.price * item.qty)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-3 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-orange-600">{formatRp(total)}</span>
          </div>
        </div>

        {/* Form Pembayaran */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">🧍‍♂️ Data Pemesan</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nama*</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email*</label>
                <input
                  type="email"
                  placeholder="Masukkan email aktif"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  No HP (opsional)
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

          {/* Metode Pembayaran */}
          <div>
            <h2 className="font-semibold text-lg mb-3 text-gray-700">
              💰 Metode Pembayaran
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {["qris", "gopay", "dana"].map((m) => (
                <label
                  key={m}
                  className={`flex flex-col items-center border p-3 rounded-xl cursor-pointer transition ${
                    paymentMethod === m
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 hover:border-orange-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m}
                    checked={paymentMethod === m}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <span className="text-sm font-medium uppercase">{m}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-600 py-2 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Bayar Sekarang
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
