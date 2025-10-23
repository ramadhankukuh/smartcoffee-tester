import React, { useEffect, useState, useCallback } from "react";
import { db, auth } from "../firebaseConfig";
import Swal from "sweetalert2";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

type Order = {
  name: string;
  table?: string;
  note?: string;
  items: { name: string; qty: number }[];
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: any;
};

type Table = { id: string; name: string; type: "Indoor" | "Outdoor" };

export default function AdminDashboard() {
  const navigate = useNavigate();

  /** ===== State Tabs ===== */
  const [activeTab, setActiveTab] = useState<
    "menu" | "kasir" | "penjualan" | "pengaturan"
  >("menu");

  /** ===== Menu States ===== */
  const [menus, setMenus] = useState<any[]>([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    desc: "",
    price: "",
    category: "",
    img: "",
  });
  const [loadingMenu, setLoadingMenu] = useState(true);
  const menusColRef = collection(db, "menus");

  /** ===== Category States ===== */
  const [categories, setCategories] = useState<any[]>([]);
  const [catForm, setCatForm] = useState({ id: "", name: "" });
  const categoriesColRef = collection(db, "categories");

  /** ===== Orders ===== */
  const [orders, setOrders] = useState<{ id: string; data: Order }[]>([]);

  /** ===== Tables ===== */
  const [tables, setTables] = useState<Table[]>([]);
  const [tableForm, setTableForm] = useState({
    id: "",
    name: "",
    type: "Indoor" as "Indoor" | "Outdoor",
  });
  const [loadingTables, setLoadingTables] = useState(true);
  const tablesColRef = collection(db, "tables");

  /** ===== QRIS Base ===== */
  const [baseQris, setBaseQris] = useState("");

  /** ===== Fetch Functions ===== */
  const fetchMenus = useCallback(async () => {
    setLoadingMenu(true);
    const snapshot = await getDocs(menusColRef);
    setMenus(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoadingMenu(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const snapshot = await getDocs(categoriesColRef);
    const data = snapshot.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setCategories(data);
  }, []);

  const fetchTables = useCallback(async () => {
    setLoadingTables(true);
    const snapshot = await getDocs(tablesColRef);
    setTables(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Table[]);
    setLoadingTables(false);
  }, []);

  /** ===== Auth ===== */
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  /** ===== Menu Handlers ===== */
  const handleSubmitMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      desc: form.desc,
      price: Number(form.price),
      category: form.category,
      img: form.img,
    };
    if (form.id) await updateDoc(doc(db, "menus", form.id), payload);
    else await addDoc(menusColRef, payload);

    setForm({ id: "", name: "", desc: "", price: "", category: "", img: "" });
    fetchMenus();
  };

  const handleDeleteMenu = async (id: string) => {
    await deleteDoc(doc(db, "menus", id));
    fetchMenus();
  };

  const handleEditMenu = (menu: any) => setForm(menu);

  /** ===== Category Handlers ===== */
  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (catForm.id) await updateDoc(doc(db, "categories", catForm.id), { name: catForm.name });
    else await addDoc(categoriesColRef, { name: catForm.name });
    setCatForm({ id: "", name: "" });
    fetchCategories();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Hapus Kategori?",
      text: `Apakah kamu yakin ingin menghapus kategori "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      await fetchCategories();
      Swal.fire("Dihapus!", `Kategori "${name}" berhasil dihapus.`, "success");
    } catch (err) {
      console.error("Gagal menghapus kategori:", err);
      Swal.fire("Error", "Gagal menghapus kategori!", "error");
    }
  };

  const moveCategory = async (from: number, to: number) => {
    const newCats = [...categories];
    const [moved] = newCats.splice(from, 1);
    newCats.splice(to, 0, moved);
    setCategories(newCats);

    for (let i = 0; i < newCats.length; i++) {
      await updateDoc(doc(db, "categories", newCats[i].id), { order: i });
    }
  };

  /** ===== Orders Handlers ===== */
  const markPaid = async (id: string) => updateDoc(doc(db, "orders", id), { status: "pesanan sedang dibuat" });
  const markFinished = async (id: string) => updateDoc(doc(db, "orders", id), { status: "pesanan selesai" });
  const deleteOrder = async (id: string) => deleteDoc(doc(db, "orders", id));

  /** ===== Tables Handlers ===== */
  const handleSubmitTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tableForm.id) await updateDoc(doc(db, "tables", tableForm.id), tableForm);
    else await addDoc(tablesColRef, tableForm);
    setTableForm({ id: "", name: "", type: "Indoor" });
    fetchTables();
  };

  const handleDeleteTable = async (id: string) => {
    await deleteDoc(doc(db, "tables", id));
    fetchTables();
  };

  const handleEditTable = (t: Table) => setTableForm(t);

  /** ===== QRIS Handlers ===== */
  const handleSaveQrisBase = async () => {
    try {
      await setDoc(doc(db, "settings", "qris_base"), { value: baseQris }, { merge: true });
      alert("QRIS base berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan QRIS base.");
    }
  };

  /** ===== useEffect ===== */
  useEffect(() => {
    fetchMenus();
    fetchCategories();
    fetchTables();

    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, data: d.data() as Order }))
        .sort((a, b) => b.data.createdAt?.seconds - a.data.createdAt?.seconds);
      setOrders(docs);
    });
    return () => unsub();
  }, [fetchMenus, fetchCategories, fetchTables]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "qris_base"), (snap) => {
      if (snap.exists()) setBaseQris(snap.data().value);
    });
    return () => unsub();
  }, []);

  /** ===== Statistik ===== */
  const totalMenu = menus.length;
  const categoryStats = categories.map((cat) => ({
    name: cat.name,
    count: menus.filter((m) => m.category === cat.name).length,
  }));
  const activeOrdersCount = orders.filter((o) => o.data.status !== "pesanan selesai").length;
  const totalPenjualan = orders.reduce((acc, o) => acc + o.data.total, 0);
  const totalPesananSelesai = orders.filter((o) => o.data.status === "pesanan selesai").length;

  /** ===== Render ===== */
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold">SmartCoffee</div>
        <nav className="flex flex-col gap-2 p-4">
          {["penjualan", "kasir", "menu", "pengaturan"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`py-2 px-3 rounded hover:bg-gray-700 transition ${
                activeTab === tab ? "bg-gray-700" : ""
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="mt-4 py-2 px-3 rounded bg-red-600 hover:bg-red-700 transition"
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        {/* ===== Tab Content ===== */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            {/* === Statistik Menu === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded shadow flex flex-col items-center">
                <span className="text-gray-500 text-sm">Total Menu</span>
                <span className="text-xl font-bold">{totalMenu}</span>
              </div>

              {categoryStats.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-white p-4 rounded shadow flex flex-col items-center"
                >
                  <span className="text-gray-500 text-sm">{cat.name}</span>
                  <span className="text-xl font-bold">{cat.count}</span>
                </div>
              ))}
            </div>

            {/* === Pengaturan Kategori & Tambah Menu sejajar === */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ➕ Tambah Menu */}
              <form
                onSubmit={handleSubmitMenu}
                className="bg-white rounded p-6 shadow"
              >
                <h2 className="text-lg font-semibold mb-4">
                  {form.id ? "Edit Menu" : "Tambah Menu"}
                </h2>
                <div className="grid gap-3">
                  <input
                    type="text"
                    placeholder="Nama Menu"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                  <textarea
                    placeholder="Deskripsi"
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Harga"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="URL Gambar"
                    value={form.img}
                    onChange={(e) => setForm({ ...form, img: e.target.value })}
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                  <button className="bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition">
                    {form.id ? "Update Menu" : "Tambah Menu"}
                  </button>
                </div>
              </form>

              {/* 📂 Pengaturan Kategori */}
              <div className="bg-white rounded p-6 shadow">
                <h2 className="text-lg font-semibold mb-4">
                  Pengaturan Kategori
                </h2>

                {/* Form tambah kategori */}
                <form
                  onSubmit={handleSubmitCategory}
                  className="flex gap-2 mb-4"
                >
                  <input
                    type="text"
                    placeholder="Nama Kategori"
                    value={catForm.name}
                    onChange={(e) =>
                      setCatForm({ ...catForm, name: e.target.value })
                    }
                    className="border p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                  <button className="bg-gray-800 text-white px-4 rounded hover:bg-gray-900 transition">
                    {catForm.id ? "Update" : "Tambah"}
                  </button>
                </form>

                {/* List kategori */}
                {categories.length === 0 ? (
                  <p className="text-gray-500">Belum ada kategori.</p>
                ) : (
                  <ul className="space-y-2">
                    {categories.map((cat, i) => (
                      <li
                        key={cat.id}
                        className="flex items-center justify-between border-b py-2"
                      >
                        <span>{cat.name}</span>
                        <div className="flex gap-2">
                          <button
                            disabled={i === 0}
                            onClick={() => moveCategory(i, i - 1)}
                            className="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            disabled={i === categories.length - 1}
                            onClick={() => moveCategory(i, i + 1)}
                            className="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCategory(cat.id, cat.name)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Hapus
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* === Daftar Menu di bawah === */}
            {loadingMenu ? (
              <p className="text-center text-gray-500">Memuat data...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menus.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition flex flex-col"
                  >
                    <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
                      <img
                        src={m.img}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        {m.category}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg mb-1">{m.name}</h3>
                      <p className="text-gray-500 text-sm mb-2 flex-1">
                        {m.desc}
                      </p>
                      <p className="text-gray-800 font-bold mb-3">
                        Rp {m.price.toLocaleString()}
                      </p>
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => handleEditMenu(m)}
                          className="flex-1 bg-blue-500 text-white rounded py-1 hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(m.id)}
                          className="flex-1 bg-red-500 text-white rounded py-1 hover:bg-red-600 transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "kasir" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold mb-4">🧾 Kasir</h1>

            {/* Pesanan Aktif */}
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Pesanan Aktif ({activeOrdersCount})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders
                  .filter((o) => o.data.status !== "pesanan selesai")
                  .map(({ id, data }) => (
                    <div
                      key={id}
                      className={`p-4 rounded-xl shadow flex flex-col justify-between
            ${
              data.status === "menunggu pembayaran"
                ? "bg-yellow-50"
                : data.status === "pesanan sedang dibuat"
                ? "bg-orange-50"
                : "bg-green-50"
            } transition`}
                    >
                      <div>
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>
                            {new Date(
                              data.createdAt?.seconds * 1000
                            ).toLocaleString()}
                          </span>
                          <span>ID: {id}</span>
                        </div>
                        <div className="font-semibold text-lg">{data.name}</div>
                        <div className="text-gray-700 mb-1">
                          {data.items
                            .map((item) => `${item.name} x${item.qty}`)
                            .join(", ")}
                        </div>
{data.note && (
  <div className="text-gray-700 mb-1">
    Catatan: <span className="italic">{data.note}</span>
  </div>
)}

                        <div>
                          Status:{" "}
                          <span className="font-medium">{data.status}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {data.status === "menunggu pembayaran" && (
                          <button
                            className="flex-1 bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
                            onClick={() => markPaid(id)}
                          >
                            Sudah Bayar
                          </button>
                        )}
                        {data.status === "pesanan sedang dibuat" && (
                          <button
                            className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                            onClick={() => markFinished(id)}
                          >
                            Selesai
                          </button>
                        )}
                        {data.status === "pesanan selesai" && (
                          <button
                            className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                            onClick={() => deleteOrder(id)}
                          >
                            🗑️ Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Pesanan Selesai */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Pesanan Selesai</h2>
              {orders.filter((o) => o.data.status === "pesanan selesai")
                .length === 0 ? (
                <p className="text-gray-500">Belum ada pesanan selesai.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders
                    .filter((o) => o.data.status === "pesanan selesai")
                    .map(({ id, data }) => (
                      <div
                        key={id}
                        className="p-4 rounded-xl shadow bg-green-50 flex flex-col justify-between transition"
                      >
                        <div>
                          <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <span>
                              {new Date(
                                data.createdAt?.seconds * 1000
                              ).toLocaleString()}
                            </span>
                            <span>ID: {id}</span>
                          </div>
                          <div className="font-semibold text-lg">
                            {data.name}
                          </div>
                          <div className="text-gray-700 mb-1">
                            {data.items
                              .map((item) => `${item.name} x${item.qty}`)
                              .join(", ")}
                          </div>
{data.note && (
  <div className="text-gray-700 mb-1">
    Catatan: <span className="italic">{data.note}</span>
  </div>
)}

                          <div>
                            Status:{" "}
                            <span className="font-medium">{data.status}</span>
                          </div>
                        </div>
                        <button
                          className="mt-3 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                          onClick={() => deleteOrder(id)}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "penjualan" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">💰 Penjualan</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="bg-white p-4 rounded shadow flex flex-col items-center">
                <span className="text-gray-500 text-sm">Total Penjualan</span>
                <span className="text-xl font-bold">
                  {totalPenjualan.toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-4 rounded shadow flex flex-col items-center">
                <span className="text-gray-500 text-sm">Pesanan Selesai</span>
                <span className="text-xl font-bold">{totalPesananSelesai}</span>
              </div>
              <div className="bg-white p-4 rounded shadow flex flex-col items-center">
                <span className="text-gray-500 text-sm">Pesanan Aktif</span>
                <span className="text-xl font-bold">{activeOrdersCount}</span>
              </div>
              <div className="bg-white p-4 rounded shadow flex flex-col items-center">
                <span className="text-gray-500 text-sm">Menu Terlaris</span>
                <span className="text-xl font-bold">-</span>{" "}
                {/* Bisa dihitung nanti */}
              </div>
            </div>
          </div>
        )}

        {activeTab === "pengaturan" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold mb-4">⚙️ Pengaturan Meja</h1>

            {/* Form Tambah/Edit Meja */}
            <form
              onSubmit={handleSubmitTable}
              className="bg-white rounded p-6 shadow max-w-lg"
            >
              <h2 className="text-lg font-semibold mb-4">
                {tableForm.id ? "Edit Meja" : "Tambah Meja"}
              </h2>
              <div className="grid gap-3">
                <input
                  type="text"
                  placeholder="Nama Meja"
                  value={tableForm.name}
                  onChange={(e) =>
                    setTableForm({ ...tableForm, name: e.target.value })
                  }
                  className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
                <select
                  value={tableForm.type}
                  onChange={(e) =>
                    setTableForm({
                      ...tableForm,
                      type: e.target.value as "Indoor" | "Outdoor",
                    })
                  }
                  className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option>Indoor</option>
                  <option>Outdoor</option>
                </select>
                <button className="bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition">
                  {tableForm.id ? "Update Meja" : "Tambah Meja"}
                </button>
              </div>
            </form>

            {/* Daftar Meja */}
            <div className="bg-white rounded p-6 shadow">
              <h2 className="text-lg font-semibold mb-4">Daftar Meja</h2>
              {loadingTables ? (
                <p className="text-gray-500">Memuat daftar meja...</p>
              ) : tables.length === 0 ? (
                <p className="text-gray-500">Belum ada meja.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {tables.map((t) => (
                    <div
                      key={t.id}
                      className="bg-gray-50 p-3 rounded shadow flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-gray-500 text-sm">{t.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTable(t)}
                          className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTable(t.id)}
                          className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* QRIS Base */}
            <div className="bg-white rounded p-6 shadow max-w-lg">
              <h2 className="text-lg font-semibold mb-4">QRIS Base</h2>
              <textarea
                value={baseQris}
                onChange={(e) => setBaseQris(e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                rows={6}
              />
              <button
                onClick={handleSaveQrisBase}
                className="mt-3 bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 transition"
              >
                Simpan QRIS Base
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}