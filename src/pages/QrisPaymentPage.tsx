import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function QRISPaymentPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOrder(data);

        // Generate QR dinamis
        if (data.paymentMethod === "qris" && data.total) {
          const dynamicQris = generateDynamicQris(BASE_QRIS, data.total);
          setQrUrl(
            `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
              dynamicQris
            )}&size=250x250`
          );
        }
      } else setOrder(null);
    });
    return () => unsub();
  }, [orderId]);

  if (!order) return <div className="p-6 text-center">Order tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">QRIS Pembayaran</h1>

        {qrUrl && <img src={qrUrl} alt="QRIS" className="mx-auto mb-4 w-40 h-40 object-contain border rounded-lg" />}

        <div className="mb-2 font-semibold text-lg">{formatRp(order.total)}</div>
        <div className="mb-2">Nama: {order.name}</div>
        {order.table && <div className="mb-2">Meja: {order.table}</div>}

        <div
          className={`mt-4 p-2 rounded-lg text-white font-semibold text-lg ${
            order.status === "menunggu pembayaran"
              ? "bg-orange-500"
              : order.status === "pesanan sedang dibuat"
              ? "bg-blue-500"
              : "bg-green-500"
          }`}
        >
          {order.status === "menunggu pembayaran"
            ? "Menunggu Pembayaran"
            : order.status === "pesanan sedang dibuat"
            ? "Pesanan Sedang Dibuat"
            : "Pesanan Selesai"}
        </div>
      </div>
    </div>
  );
}

// QRIS base statis
const BASE_QRIS =
  "00020101021126570011ID.DANA.WWW011893600915335326596902093532659690303UMI51440014ID.CO.QRIS.WWW0215ID10222268737870303UMI5204549953033605802ID5913RAMADHANKUKUH6013Kota Semarang6105501496304D46C";

// Fungsi hitung CRC16
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

// Fungsi QRIS dinamis
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
