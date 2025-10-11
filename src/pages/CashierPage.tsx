import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

type Order = {
  name: string;
  table?: string;
  items: { name: string; qty: number }[];
  total: number;
  paymentMethod: string;
  status: string; // "menunggu pembayaran" | "pesanan sedang dibuat" | "pesanan selesai"
  createdAt: any;
};

export default function CashierPage() {
  const [orders, setOrders] = useState<{ id: string; data: Order }[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, data: d.data() as Order }))
        .sort((a, b) => b.data.createdAt?.seconds - a.data.createdAt?.seconds);
      setOrders(docs);
    });
    return () => unsub();
  }, []);

  const markPaid = async (id: string) => {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, { status: "pesanan sedang dibuat" });
  };

  const markFinished = async (id: string) => {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, { status: "pesanan selesai" });
  };

  const deleteOrder = async (id: string) => {
    const orderRef = doc(db, "orders", id);
    await deleteDoc(orderRef);
  };

  const activeOrders = orders.filter(
    (o) => o.data.status === "menunggu pembayaran" || o.data.status === "pesanan sedang dibuat"
  );
  const finishedOrders = orders.filter((o) => o.data.status === "pesanan selesai");

  const renderOrder = (id: string, data: Order) => (
    <div
      key={id}
      className={`p-4 rounded-xl shadow flex flex-col gap-2
        ${data.status === "menunggu pembayaran" ? "bg-yellow-50" :
        data.status === "pesanan sedang dibuat" ? "bg-orange-50" :
        "bg-green-50"}`}
    >
      <div className="flex justify-between text-sm text-gray-500">
        <span>{new Date(data.createdAt?.seconds * 1000).toLocaleString()}</span>
        <span>ID: {id}</span>
      </div>
      <div className="font-semibold">{data.name}</div>
      <div className="text-gray-700">
        {data.items.map((item) => `${item.name} x${item.qty}`).join(", ")}
      </div>
      <div>No Meja: {data.table || "-"}</div>
      <div>Status: <span className="font-medium">{data.status}</span></div>
      <div className="flex gap-2 mt-2">
        {data.status === "menunggu pembayaran" && (
          <button
            className="bg-orange-500 text-white px-3 py-1 rounded"
            onClick={() => markPaid(id)}
          >
            Sudah Bayar
          </button>
        )}
        {data.status === "pesanan sedang dibuat" && (
          <button
            className="bg-green-500 text-white px-3 py-1 rounded"
            onClick={() => markFinished(id)}
          >
            Selesai
          </button>
        )}
        {data.status === "pesanan selesai" && (
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => deleteOrder(id)}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🧾 Kasir</h1>

      <div>
        <h2 className="text-xl font-semibold mb-2">Pesanan Aktif ({activeOrders.length})</h2>
        <div className="space-y-4">
          {activeOrders.length > 0 ? activeOrders.map(({ id, data }) => renderOrder(id, data)) : (
            <div className="text-gray-400 text-center">Belum ada pesanan aktif</div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Pesanan Selesai ({finishedOrders.length})</h2>
        <div className="space-y-4">
          {finishedOrders.length > 0 ? finishedOrders.map(({ id, data }) => renderOrder(id, data)) : (
            <div className="text-gray-400 text-center">Belum ada pesanan selesai</div>
          )}
        </div>
      </div>
    </div>
  );
}
