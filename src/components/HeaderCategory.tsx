import React from "react";
import { useNavigate } from "react-router-dom";
import CategoryTabs from "./CategoryTabs";

// Tambahkan tipe props
type HeaderCategoryProps = {
  title?: string;
  onCategoryChange?: (category: string) => void; // <- ini penting
};

export default function HeaderCategory({ title = "Nama Resto", onCategoryChange }: HeaderCategoryProps) {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => nav("/")}
            aria-label="Kembali"
            className="p-1 rounded-md text-slate-800 hover:bg-slate-100"
          >
            <span className="inline-block -translate-y-[1px]">←</span>
          </button>

          <div className="text-lg font-semibold text-slate-800">{title}</div>

<button
  aria-label="Cari"
  className="p-1 rounded-md text-slate-800 hover:bg-slate-100"
  onClick={() => nav("/search")} // <- ini penting
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z" />
  </svg>
</button>
        </div>

        {/* kategori / tabs */}
        <div className="mt-3">
          <CategoryTabs onChange={onCategoryChange} />
        </div>
      </div>
    </header>
  );
}
