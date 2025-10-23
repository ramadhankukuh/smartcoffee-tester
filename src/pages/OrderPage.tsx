import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeaderCategory from "../components/HeaderCategory";
import { formatRp } from "../utils/format";
import FloatingCartButton from "../components/FloatingCartButton";
import Swal from "sweetalert2";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, getDocs } from "firebase/firestore";

export default function OrderPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState("SEMUA");
  const [tables, setTables] = useState<{ id: string; name: string; type: string }[]>([]);
  const [isTableModalOpen, setTableModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);
  const [bestsellers, setBestsellers] = useState<{ name: string; count: number }[]>([]);

  
const [orders, setOrders] = useState<any[]>([]);

  const navigate = useNavigate();

  const mode = searchParams.get("mode");
  const tableFromURL = searchParams.get("table");

useEffect(() => {
  const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
    const itemCount: Record<string, number> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.status === "pesanan selesai") {
        data.items?.forEach((item: any) => {
          itemCount[item.name] = (itemCount[item.name] || 0) + (item.qty || 1);
        });
      }
    });

    const sortedItems = Object.entries(itemCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // top 5 best seller
      .map(([name, count]) => ({ name, count }));

    setBestsellers(sortedItems);
  });

  return () => unsub();
}, []);


async function fetchOrders() {
  const snapshot = await getDocs(collection(db, "orders"));
  const ordersData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // 🔹 Tambahkan bagian ini setelah ambil data dari Firestore
  const itemCount: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    data.items?.forEach((item: any) => {
      itemCount[item.name] = (itemCount[item.name] || 0) + (item.qty || 1);
    });
  });

  // 🔹 Urutkan dari yang paling sering dipesan
  const sortedItems = Object.entries(itemCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // 🔹 Simpan hasilnya ke state bestseller
  setBestsellers(sortedItems);

  // 🔹 Kalau kamu juga nyimpen data order
  setOrders(ordersData);
}

  // 🔥 Ambil data menu realtime
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menus"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Ambil data meja
  useEffect(() => {
    const fetchTables = async () => {
      const snapshot = await getDocs(collection(db, "tables"));
      const data = snapshot.docs.map((doc) => {
        const d = doc.data() as { name?: string; type?: string };
        return { id: doc.id, name: d.name || "", type: d.type || "Indoor" };
      });
      setTables(data);
    };
    fetchTables();
  }, []);

  // Validasi meja dine-in
  useEffect(() => {
    if (mode !== "dinein" || tables.length === 0) return;
    const tableFullNames = tables.map((t) => `${t.type} ${t.name}`);

    if (tableFromURL && tableFullNames.includes(tableFromURL)) {
      setTableNumber(tableFromURL);
    } else if (tableFromURL && !tableFullNames.includes(tableFromURL)) {
      Swal.fire({
        icon: "error",
        title: "Nomor Meja Tidak Valid",
        text: `Meja "${tableFromURL}" tidak tersedia.`,
        confirmButtonColor: "#f97316",
      }).then(() => {
        setSearchParams({ mode: "dinein" });
        setTableModalOpen(true);
      });
    } else {
      setTableModalOpen(true);
    }
  }, [mode, tableFromURL, tables]);

  // 🧠 Filter menu berdasarkan kategori
const filteredItems = useMemo(() => {
  if (selectedCategory === "SEMUA") {
    // Urutkan sesuai urutan kategori di Firestore
    const sorted = [...items].sort((a, b) => {
      const indexA = categories.indexOf(a.category || "");
      const indexB = categories.indexOf(b.category || "");
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1; // kategori tidak dikenal taruh bawah
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    return sorted;
  }

  // Filter berdasarkan kategori terpilih
  return items.filter(
    (it) =>
      it.category &&
      it.category.toUpperCase() === selectedCategory.toUpperCase()
  );
}, [items, selectedCategory, categories]);


  // Simpan keranjang ke localStorage
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

  // Tambah / Kurangi keranjang
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

  // Load cart dari localStorage
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
      } catch (e) {
        console.error("Gagal parsing cart dari localStorage", e);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Hitung total & jumlah item
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

  // Checkout → langsung ke halaman view-order
  const handleCheckout = () => {
    if (mode === "dinein" && !tableNumber) {
      setTableModalOpen(true);
      return;
    }
    if (Object.keys(cart).length === 0) return;

    const cartData = cartEntries.map((e) => ({
      id: e.item.id,
      name: e.item.name,
      price: e.item.price,
      qty: e.qty,
    }));

    localStorage.setItem("cart", JSON.stringify(cartData));

    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (tableNumber) params.set("table", tableNumber);

    navigate(`/view-order?${params.toString()}`);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        ☕ Memuat menu SmartCoffee...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header kategori (pakai kategori dinamis) */}
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <HeaderCategory
          title="SmartCoffee."
          onCategoryChange={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* Info meja dine-in */}
      {mode === "dinein" && tableNumber && (
        <div className="max-w-4xl mx-auto px-4 md:px-6 mt-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 rounded-lg shadow-md">
            🍽️ Anda sedang dine-in di{" "}
            <span className="font-bold">Meja {tableNumber}</span>
          </div>
        </div>
      )}

      {/* Daftar menu */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
<section className="mb-10">
  <h2 className="text-xl font-bold text-slate-800 mb-4">🔥 Best Seller</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
    {bestsellers.map((b) => {
      // cari data menu lengkap dari items
      const menu = items.find((m) => m.name === b.name);
      if (!menu) return null;
      return (
        <article
          key={menu.id}
          className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition"
        >
          <div className="flex gap-4 items-start">
            <div className="w-28 h-28 rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
              <img
                src={menu.img}
                alt={menu.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">
                {menu.name} <span className="text-orange-500 text-sm">({b.count}x)</span>
              </h3>
              <p className="text-sm text-slate-500 mt-1">{menu.desc}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-slate-700 font-medium">{formatRp(menu.price)}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeFromCart(menu.id)}
                    className="px-3 py-1 rounded-lg bg-slate-100"
                  >
                    -
                  </button>
                  <div className="w-8 text-center">{cart[menu.id] || 0}</div>
                  <button
                    onClick={() => addToCart(menu.id)}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      );
    })}
  </div>
</section>


        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredItems.map((it) => (
              <article
                key={it.id}
                className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-28 h-28 rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
                    <img
                      src={it.img}
                      alt={it.name}
                      className="w-full h-full object-cover"
                    />
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
        </section>
      </main>

      {/* Tombol checkout */}
      {count > 0 && (
        <FloatingCartButton total={total} count={count} onOpen={handleCheckout} />
      )}

            {/* Modal pilih meja */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h2 className="text-lg font-semibold mb-1 flex items-center justify-center gap-2">
              🍽️ Pilih Nomor Meja
            </h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              Silakan pilih lokasi dan nomor meja Anda
            </p>

            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-5 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="">-- Pilih Nomor Meja --</option>

              {/* Indoor */}
              <optgroup label="Indoor">
                {tables
                  .filter((t) => t.type.toLowerCase() === "indoor")
                  .map((t) => (
                    <option key={t.id} value={`${t.type} ${t.name}`}>
                      {`${t.type} ${t.name}`}
                    </option>
                  ))}
              </optgroup>

              {/* Outdoor */}
              <optgroup label="Outdoor">
                {tables
                  .filter((t) => t.type.toLowerCase() === "outdoor")
                  .map((t) => (
                    <option key={t.id} value={`${t.type} ${t.name}`}>
                      {`${t.type} ${t.name}`}
                    </option>
                  ))}
              </optgroup>
            </select>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 rounded-lg py-2 transition"
                onClick={() => (window.location.href = "/")}
              >
                Batal
              </button>
              <button
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2 transition"
                onClick={() => {
                  if (!tableNumber.trim()) return;
                  setSearchParams({ mode: "dinein", table: tableNumber });
                  setTableModalOpen(false);
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
