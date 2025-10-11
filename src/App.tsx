import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import OrderPage from "./pages/OrderPage";
import SearchPage from "./pages/SearchPage";
import PaymentPage from "./pages/PaymentPage";
import AdminDashboard from "./pages/AdminDashboard";
import CashierPage from "./pages/CashierPage";
import LoginPage from "./pages/LoginPage";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import QrisPaymentPage from "./pages/QrisPaymentPage";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <Routes>
      {/* Halaman User */}
      <Route path="/" element={<Home />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/qris-payment/:orderId" element={<QrisPaymentPage />} />


      {/* Halaman Kasir */}
      <Route
        path="/cashier"
        element={user ? <CashierPage /> : <Navigate to="/login" replace />}
      />

      {/* Halaman Admin */}
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={user ? <AdminDashboard /> : <Navigate to="/login" replace />}
      />

      {/* Jika route tidak ditemukan */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
