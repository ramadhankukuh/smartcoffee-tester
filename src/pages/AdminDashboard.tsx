import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [menus, setMenus] = useState<any[]>([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    desc: "",
    price: "",
    category: "Minuman",
    img: "",
  });
  const [loading, setLoading] = useState(true);
  const colRef = collection(db, "menus");
  const navigate = useNavigate();

  // ✅ Logout handler
  async function handleLogout() {
    try {
      await signOut(auth);
      localStorage.removeItem("adminToken");
      navigate("/login");
    } catch (err) {
      alert("Gagal logout!");
    }
  }

  // 🔄 Fetch menu dari Firestore
  async function fetchMenus() {
    setLoading(true);
    const snapshot = await getDocs(colRef);
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setMenus(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchMenus();
  }, []);

  // 💾 Tambah / Edit Menu
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.id) {
      await updateDoc(doc(db, "menus", form.id), {
        name: form.name,
        desc: form.desc,
        price: Number(form.price),
        category: form.category,
        img: form.img,
      });
    } else {
      await addDoc(colRef, {
        name: form.name,
        desc: form.desc,
        price: Number(form.price),
        category: form.category,
        img: form.img,
      });
    }
    setForm({
      id: "",
      name: "",
      desc: "",
      price: "",
      category: "Minuman",
      img: "",
    });
    fetchMenus();
  }

  // ❌ Hapus Menu
  async function handleDelete(id: string) {
    if (!confirm("Hapus menu ini?")) return;
    await deleteDoc(doc(db, "menus", id));
    fetchMenus();
  }

  // ✏️ Edit Menu
  function handleEdit(m: any) {
    setForm(m);
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* 🔸 Header */}
      <header className="flex justify-between items-center bg-amber-700 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">☕ SmartCoffee Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-md transition"
        >
          Logout
        </button>
      </header>

      <main className="p-6">
        {/* 🧾 Form Input */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-md max-w-xl mx-auto mb-8"
        >
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Nama Menu"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="border p-2 rounded-lg"
            />
            <textarea
              placeholder="Deskripsi"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              required
              className="border p-2 rounded-lg"
            />
            <input
              type="number"
              placeholder="Harga"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="border p-2 rounded-lg"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border p-2 rounded-lg"
            >
              <option>Minuman</option>
              <option>Makanan</option>
              <option>Snack</option>
            </select>
            <input
              type="text"
              placeholder="URL Gambar"
              value={form.img}
              onChange={(e) => setForm({ ...form, img: e.target.value })}
              required
              className="border p-2 rounded-lg"
            />
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition"
            >
              {form.id ? "Update Menu" : "Tambah Menu"}
            </button>
          </div>
        </form>

        {/* 📋 Daftar Menu */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((m) => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
              >
                <img
                  src={m.img}
                  alt={m.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <h2 className="text-lg font-semibold mt-2">{m.name}</h2>
                <p className="text-sm text-gray-500">{m.desc}</p>
                <p className="text-orange-600 font-semibold mt-1">
                  Rp {m.price.toLocaleString()}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(m)}
                    className="flex-1 bg-blue-500 text-white rounded-lg py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="flex-1 bg-red-500 text-white rounded-lg py-1"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
