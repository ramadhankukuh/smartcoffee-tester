import React, { useState, useMemo } from "react";
import { SAMPLE_MENU, MenuItem } from "../data/menu";
import { formatRp } from "../utils/format";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const nav = useNavigate();
  const [query, setQuery] = useState("");

  // Filter menu sesuai input search
  const filteredItems: MenuItem[] = useMemo(() => {
    const q = query.toLowerCase();
    return SAMPLE_MENU.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query]);

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

      <main className="max-w-6xl mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">Menu tidak ditemukan</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((it) => (
              <article
                key={it.id}
                className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-28 h-28 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    Img
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{it.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{it.desc}</p>
                    <div className="mt-3 text-slate-700 font-medium">{formatRp(it.price)}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
