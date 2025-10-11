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

    const order = {
      name,
      email,
      phone,
      mode,
      table,
      paymentMethod,
      items: cartItems,
      total,
      status: "menunggu pembayaran", // initial status
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "orders"), order);
      localStorage.removeItem("cart");

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
    <div className="min-h-screen bg-slate-50 p-4 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 mt-6">
        <h1 className="text-2xl font-bold text-center mb-6">💳 Pembayaran Pesanan</h1>
        {/* Ringkasan pesanan */}
        <div className="mb-6 divide-y">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <div>{item.name} x{item.qty}</div>
              <div>{formatRp(item.price * item.qty)}</div>
            </div>
          ))}
          <div className="flex justify-between mt-3 font-bold text-orange-600 text-lg">
            <span>Total</span>
            <span>{formatRp(total)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nama*" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2" />
          <input type="email" placeholder="Email*" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg p-2" />
          <input type="tel" placeholder="No HP" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded-lg p-2" />
          
          {/* Metode Pembayaran */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {["qris", "gopay", "dana"].map(m => (
              <label key={m} className={`flex flex-col items-center border p-3 rounded-xl cursor-pointer ${paymentMethod === m ? "border-orange-500 bg-orange-50" : "border-gray-300"}`}>
                <input type="radio" name="payment" value={m} checked={paymentMethod === m} onChange={e => setPaymentMethod(e.target.value)} className="hidden" />
                <span className="text-sm font-medium">{m.toUpperCase()}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-gray-200 py-2 rounded-lg">Kembali</button>
            <button type="submit" className="flex-1 bg-orange-600 py-2 text-white rounded-lg">Bayar Sekarang</button>
          </div>
        </form>
      </div>
    </div>
  );
}
