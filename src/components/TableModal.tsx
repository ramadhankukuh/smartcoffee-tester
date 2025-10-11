import React, { useEffect, useState } from "react";

export default function TableModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (table: string) => void;
}) {
  const [table, setTable] = useState("");

  useEffect(() => {
    if (!open) setTable("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] bg-white rounded-t-xl sm:rounded-2xl shadow-2xl p-6 m-4">
        <h3 className="text-xl font-bold">Masukkan Nomor Meja</h3>
        <p className="text-sm text-slate-500 mt-1">Contoh: 1, A2, 12</p>

        <div className="mt-4">
          <label className="block text-xs text-slate-600">Nomor Meja</label>
          <input
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-200 focus:outline-none"
            placeholder="Masukkan nomor meja..."
          />
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700">
            Batal
          </button>
          <button
            onClick={() => onSubmit(table.trim())}
            disabled={!table.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            Lanjut
          </button>
        </div>
      </div>
    </div>
  );
}
