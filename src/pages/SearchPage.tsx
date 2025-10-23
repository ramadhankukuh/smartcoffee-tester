import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { formatRp } from "../utils/format";
import Swal from "sweetalert2";
import FloatingCartButton from "../components/FloatingCartButton";

export default function SearchPage() {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});

  // 🔹 Ambil data menu dari Firestore
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menus"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data);
      } catch (err) {
        console.error("Gagal mengambil menu:", err);
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Menu",
          text: "Periksa koneksi internet atau coba lagi nanti.",
          confirmButtonColor: "#f97316",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // 🔹 Load cart dari localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        const cartMap: Record<string, number> = {};
        parsed.forEach((item: any) => {
          cartMap[item.id] = item.qty;
        });
        setCart(cartMap);
      } catch {
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // 🔹 Simpan cart ke localStorage
  function saveCartToLocalStorage(cart: Record<string, number>) {
    const cartData = Object.entries(cart).map(([id, qty]) => {
      const item = items.find((i) => i.id === id);
      return {
        id,
        name: item?.name,
        price: item?.price,
        qty,
      };
    });
    localStorage.setItem("cart", JSON.stringify(cartData));
  }

  // 🔹 Tambah / Kurangi pesanan
  function addToCart(id: string) {
    setCart((c) => {
      const newCart = { ...c, [id]: (c[id] || 0) + 1 };
      saveCartToLocalStorage(newCart);
      return newCart;
    });
  }

  function removeFromCart(id: string) {
    setCart((c) => {
      const newCart = { ...c };
      if (!newCart[id]) return newCart;
      newCart[id] = newCart[id] - 1;
      if (newCart[id] <= 0) delete newCart[id];
      saveCartToLocalStorage(newCart);
      return newCart;
    });
  }

  // 🔹 Filter menu sesuai pencarian
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [query, items]);

  // 🔹 Hitung total & jumlah item
  const cartEntries = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const item = items.find((i) => i.id === id);
        return item ? { item, qty } : null;
      })
      .filter(Boolean) as { item: any; qty: number }[];
  }, [cart, items]);

  const total = cartEntries.reduce((s, e) => s + e.item.price * e.qty, 0);
  const count = cartEntries.reduce((s, e) => s + e.qty, 0);

  // 🔹 Checkout
  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) return;
    nav("/view-order");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        ☕ Memuat menu SmartCoffee...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm p-4 flex items-center gap-4">
        <button
          onClick={() => nav(-1)}
          className="p-2 rounded-md text-slate-800 hover:bg-slate-100"
        >
          ←
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari menu..."
          className="flex-1 p-2 border rounded-lg"
          autoFocus
        />
      </header>

      {/* Hasil Pencarian */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">
            Menu tidak ditemukan
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((it) => (
              <article
                key={it.id}
                className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-28 h-28 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                    {it.img ? (
                      <img
                        src={it.img}
                        alt={it.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-400">No Img</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{it.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{it.desc}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-slate-700 font-medium">
                        {formatRp(it.price)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(it.id)}
                          className="px-3 py-1 rounded-lg bg-slate-100"
                        >
                          -
                        </button>
                        <div className="w-8 text-center">{cart[it.id] || 0}</div>
                        <button
                          onClick={() => addToCart(it.id)}
                          className="px-3 py-1 rounded-lg bg-blue-600 text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Tombol Checkout Mengapung */}
      {count > 0 && (
        <FloatingCartButton total={total} count={count} onOpen={handleCheckout} />
      )}
    </div>
  );
}
