import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeaderCategory from "../components/HeaderCategory";
import { formatRp } from "../utils/format";
import FloatingCartButton from "../components/FloatingCartButton";
import Swal from "sweetalert2";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, getDocs } from "firebase/firestore";

export default function OrderPage() {
  /** ===== States ===== */
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState("SEMUA");
  const [tables, setTables] = useState<{ id: string; name: string; type: string }[]>([]);
  const [isTableModalOpen, setTableModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [bestsellers, setBestsellers] = useState<{ name: string; count: number }[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode");
  const tableFromURL = searchParams.get("table");

  /** ===== Utility Functions ===== */
  const saveCartToLocalStorage = (cart: Record<string, number>) => {
    const cartData = Object.entries(cart).map(([id, qty]) => {
      const item = items.find((i) => i.id === id);
      return { id, name: item?.name, price: item?.price, qty };
    });
    localStorage.setItem("cart", JSON.stringify(cartData));
  };

  const addToCart = (id: string) => {
    setCart((c) => {
      const newCart = { ...c, [id]: (c[id] || 0) + 1 };
      saveCartToLocalStorage(newCart);
      return newCart;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((c) => {
      const newCart = { ...c };
      if (!newCart[id]) return newCart;
      newCart[id]--;
      if (newCart[id] <= 0) delete newCart[id];
      saveCartToLocalStorage(newCart);
      return newCart;
    });
  };

  /** ===== Fetch Menu Items Realtime ===== */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menus"), (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /** ===== Fetch Tables ===== */
  useEffect(() => {
    const fetchTables = async () => {
      const snapshot = await getDocs(collection(db, "tables"));
      setTables(
        snapshot.docs.map((doc) => {
          const d = doc.data() as { name?: string; type?: string };
          return { id: doc.id, name: d.name || "", type: d.type || "Indoor" };
        })
      );
    };
    fetchTables();
  }, []);

  /** ===== Validate Dine-in Table ===== */
  useEffect(() => {
    if (mode !== "dinein" || tables.length === 0) return;

    const tableFullNames = tables.map((t) => `${t.type} ${t.name}`);
    if (tableFromURL && tableFullNames.includes(tableFromURL)) {
      setTableNumber(tableFromURL);
    } else if (tableFromURL) {
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

  /** ===== Fetch Categories ===== */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snapshot) => {
      const cats = snapshot.docs
        .map((doc) => {
          const d = doc.data() as { name?: string; order?: number };
          return { name: d.name || "", order: typeof d.order === "number" ? d.order : 9999 };
        })
        .sort((a, b) => a.order - b.order)
        .map((c) => c.name);
      setCategories(cats);
    });
    return () => unsub();
  }, []);

  /** ===== Fetch Orders & Best Sellers ===== */
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
      const top5 = Object.entries(itemCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setBestsellers(top5);
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  /** ===== Filtered Items by Category ===== */
  const filteredItems = useMemo(() => {
    if (selectedCategory === "SEMUA") {
      return [...items].sort((a, b) => {
        const idxA = categories.indexOf(a.category || "");
        const idxB = categories.indexOf(b.category || "");
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }
    return items.filter(
      (it) => it.category?.toUpperCase() === selectedCategory.toUpperCase()
    );
  }, [items, selectedCategory, categories]);

  /** ===== Cart Computations ===== */
  const cartEntries = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const item = items.find((i) => i.id === id);
          return item ? { item, qty } : null;
        })
        .filter(Boolean) as { item: any; qty: number }[],
    [cart, items]
  );
  const total = cartEntries.reduce((s, e) => s + e.item.price * e.qty, 0);
  const count = cartEntries.reduce((s, e) => s + e.qty, 0);

  /** ===== Load Cart from LocalStorage ===== */
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (!storedCart) return;
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
  }, []);

  /** ===== Checkout Handler ===== */
  const handleCheckout = () => {
    if (mode === "dinein" && !tableNumber) {
      setTableModalOpen(true);
      return;
    }
    if (!count) return;

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

  /** ===== Loading State ===== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        ☕ Memuat menu SmartCoffee...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== Header Kategori ===== */}
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <HeaderCategory title="SmartCoffee." onCategoryChange={setSelectedCategory} />
      </div>

      {/* ===== Info Meja Dine-in ===== */}
      {mode === "dinein" && tableNumber && (
        <div className="max-w-4xl mx-auto px-4 md:px-6 mt-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 rounded-lg shadow-md">
            🍽️ Anda sedang dine-in di <span className="font-bold">Meja {tableNumber}</span>
          </div>
        </div>
      )}

      {/* ===== Daftar Menu & Best Seller ===== */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">🔥 Best Seller</h2>
          <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 hide-scrollbar">
            <div className="flex gap-4">
              {bestsellers.map((b) => {
                const menu = items.find((m) => m.name === b.name);
                if (!menu) return null;
                return (
                  <article
                    key={menu.id}
                    className="snap-start min-w-[75%] sm:min-w-[45%] lg:min-w-[30%] bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition border border-slate-100"
                  >
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-3">
                      <img src={menu.img} alt={menu.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-semibold text-slate-800">{menu.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{menu.desc}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-slate-700 font-medium">{formatRp(menu.price)}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(menu.id)} className="px-3 py-1 rounded-lg bg-slate-100">-</button>
                        <div className="w-8 text-center">{cart[menu.id] || 0}</div>
                        <button onClick={() => addToCart(menu.id)} className="px-3 py-1 rounded-lg bg-blue-600 text-white">+</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== Menu Berdasarkan Kategori ===== */}
        {selectedCategory === "SEMUA"
          ? categories.filter(Boolean).map((cat) => {
              const catItems = items.filter(
                (it) => it.category?.toUpperCase() === cat.toUpperCase()
              );
              if (!catItems.length) return null;
              return (
                <section key={cat} className="mb-10">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 mt-10">{cat}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {catItems.map((it) => (
                      <article key={it.id} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition">
                        <div className="flex gap-4 items-start">
                          <div className="w-28 h-28 rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
                            <img src={it.img} alt={it.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800">{it.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">{it.desc}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-slate-700 font-medium">{formatRp(it.price)}</div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => removeFromCart(it.id)} className="px-3 py-1 rounded-lg bg-slate-100">-</button>
                                <div className="w-8 text-center">{cart[it.id] || 0}</div>
                                <button onClick={() => addToCart(it.id)} className="px-3 py-1 rounded-lg bg-blue-600 text-white">+</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })
          : (
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 mt-10">{selectedCategory}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredItems.map((it) => (
                  <article key={it.id} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition">
                    <div className="flex gap-4 items-start">
                      <div className="w-28 h-28 rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
                        <img src={it.img} alt={it.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{it.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{it.desc}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-slate-700 font-medium">{formatRp(it.price)}</div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => removeFromCart(it.id)} className="px-3 py-1 rounded-lg bg-slate-100">-</button>
                            <div className="w-8 text-center">{cart[it.id] || 0}</div>
                            <button onClick={() => addToCart(it.id)} className="px-3 py-1 rounded-lg bg-blue-600 text-white">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
      </main>

      {/* ===== Floating Cart Button ===== */}
      {count > 0 && <FloatingCartButton total={total} count={count} onOpen={handleCheckout} />}

      {/* ===== Modal Pilih Meja ===== */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h2 className="text-lg font-semibold mb-1 flex items-center justify-center gap-2">🍽️ Pilih Nomor Meja</h2>
            <p className="text-sm text-gray-500 text-center mb-4">Silakan pilih lokasi dan nomor meja Anda</p>

            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-5 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="">-- Pilih Nomor Meja --</option>
              <optgroup label="Indoor">
                {tables.filter((t) => t.type.toLowerCase() === "indoor").map((t) => (
                  <option key={t.id} value={`${t.type} ${t.name}`}>{`${t.type} ${t.name}`}</option>
                ))}
              </optgroup>
              <optgroup label="Outdoor">
                {tables.filter((t) => t.type.toLowerCase() === "outdoor").map((t) => (
                  <option key={t.id} value={`${t.type} ${t.name}`}>{`${t.type} ${t.name}`}</option>
                ))}
              </optgroup>
            </select>

            <div className="flex gap-3">
              <button className="flex-1 bg-gray-200 hover:bg-gray-300 rounded-lg py-2 transition" onClick={() => (window.location.href = "/")}>Batal</button>
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
