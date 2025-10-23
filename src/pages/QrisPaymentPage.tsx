// src/pages/QRISPaymentPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function QRISPaymentPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [baseQris, setBaseQris] = useState("");

  // Ambil BASE QRIS dari Firestore
  useEffect(() => {
    const docRef = doc(db, "settings", "qris_base");
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) setBaseQris(snap.data().value);
    });
    return () => unsub();
  }, []);

  // Ambil data order dari Firestore
  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (!snap.exists()) {
        setOrder(null);
        return;
      }

      const data = snap.data();
      setOrder(data);

      // Generate QR dinamis
      if (data.paymentMethod === "qris" && data.total && baseQris) {
        const dynamicQris = generateDynamicQris(baseQris, data.total);
        setQrUrl(
          `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
            dynamicQris
          )}&size=300x300`
        );
      }
    });
    return () => unsub();
  }, [orderId, baseQris]);

  // 🔽 Fungsi Download Gambar QR
  const handleDownload = () => {
    if (!qrUrl) return;
    fetch(qrUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `QRIS_${orderId || "order"}.png`;
        link.click();
      });
  };

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-gray-500 text-center">🔍 Order tidak ditemukan.</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <h1 className="text-2xl font-semibold text-slate-800 text-center mb-6">
          Pembayaran dengan QRIS
        </h1>

        {/* Info Meja */}
        {order.table && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 rounded-lg shadow-md mb-6">
            🍽️ Dine-in di <span className="font-bold">Meja {order.table}</span>
          </div>
        )}

        {/* QRIS Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 text-center">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Scan QRIS Menggunakan E-Wallet / M-Banking
          </h2>
          <div className="text-xl font-semibold text-orange-600 mb-2">
            {formatRp(order.total)}
          </div>
          {qrUrl ? (
            <>
              <img
                src={qrUrl}
                alt="QRIS"
                className="mx-auto mb-4 w-56 h-56 object-contain border rounded-xl p-2"
              />
              <button
                onClick={handleDownload}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg shadow transition-all"
              >
                Download QRIS
              </button>
            </>
          ) : (
            <div className="animate-pulse text-gray-400 mb-4">
              Memuat kode QR...
            </div>
          )}



          {/* Progress Bar Status */}
          <div className="mt-6">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span
                className={`${
                  order.status === "menunggu pembayaran"
                    ? "text-orange-500"
                    : "text-gray-400"
                }`}
              >
                Menunggu Pembayaran
              </span>
              <span
                className={`${
                  order.status === "pesanan sedang dibuat"
                    ? "text-blue-500"
                    : "text-gray-400"
                }`}
              >
                Sedang Dibuat
              </span>
              <span
                className={`${
                  order.status === "pesanan selesai"
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                Selesai
              </span>
            </div>

            <div className="relative h-2 bg-gray-200 rounded-full">
              <div
                className={`absolute h-2 rounded-full transition-all duration-500 ${
                  order.status === "menunggu pembayaran"
                    ? "bg-orange-500 w-1/3"
                    : order.status === "pesanan sedang dibuat"
                    ? "bg-blue-500 w-2/3"
                    : "bg-green-500 w-full"
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* Rincian Pesanan */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            🧾 Rincian Pesanan
          </h2>

          <div className="mb-4 text-gray-700 font-medium">
            Nama: <span className="font-semibold">{order.name}</span>
          </div>

          <div className="divide-y divide-gray-200">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between py-2">
                <div>
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    {item.qty} × {formatRp(item.price)}
                  </div>
                </div>
                <div className="font-semibold text-slate-800">
                  {formatRp(item.price * item.qty)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-3 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-orange-600">{formatRp(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔢 Hitung CRC16
function crc16(str: string) {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  let hex = crc.toString(16).toUpperCase();
  if (hex.length === 3) hex = "0" + hex;
  return hex;
}

// 💡 Generate QRIS Dinamis
function generateDynamicQris(base: string, amount: number): string {
  let qris = base.slice(0, -4);
  qris = qris.replace("010211", "010212");
  const parts = qris.split("5802ID");
  if (parts.length !== 2) return base;

  const amtStr = amount.toString();
  const uangTag = "54" + amtStr.length.toString().padStart(2, "0") + amtStr;

  const fixed = parts[0] + uangTag + "5802ID" + parts[1];
  return fixed + crc16(fixed);
}
