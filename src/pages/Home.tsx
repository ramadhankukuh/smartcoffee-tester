import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type ModeType = "dinein" | "pickup" | "delivery";

export default function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const cards: {
    id: ModeType;
    title: string;
    subtitle: string;
    icon: JSX.Element;
  }[] = [
    {
      id: "dinein",
      title: "Dine In",
      subtitle: "Makan di tempat",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 7h16M4 12h16M10 17h4"
          />
        </svg>
      ),
    },
    {
      id: "pickup",
      title: "Pick Up",
      subtitle: "Ambil sendiri",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
          />
        </svg>
      ),
    },
    {
      id: "delivery",
      title: "Delivery",
      subtitle: "Diantarkan ke alamat",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12h13l3 4h-2v3h-2v-3H8v-4H3z"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const onChoose = (mode: ModeType) => navigate(`/order?mode=${mode}`);

  // Skeleton animasi mirip konten
  const SkeletonCard = () => (
    <div className="p-5 flex flex-col items-start gap-3 w-full rounded-xl bg-white shadow animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-orange-100" />
      <div className="h-5 w-3/4 bg-slate-200 rounded" />
      <div className="h-4 w-1/2 bg-slate-200 rounded" />
      <div className="h-3 w-1/3 bg-slate-300 rounded mt-1" />
    </div>
  );

  const SkeletonBanner = () => (
    <div className="w-full h-44 md:h-64 rounded-b-2xl bg-slate-200 animate-pulse" />
  );

  const SkeletonInfoCard = () => (
    <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 w-[90%] md:w-[70%] h-20 p-4 rounded-xl bg-white shadow animate-pulse flex items-center gap-3">
      <div className="w-12 h-12 bg-orange-100 rounded-md" />
      <div className="flex flex-col gap-1 w-full">
        <div className="h-4 w-1/3 bg-slate-200 rounded" />
        <div className="h-3 w-1/4 bg-slate-300 rounded" />
      </div>
      <div className="w-6 h-6 bg-orange-200 rounded ml-auto" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* BANNER */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 w-full relative mt-6">
        {isLoading ? <SkeletonBanner /> : (
          <div className="rounded-b-2xl overflow-hidden">
            <img src="banner-kopi.jpg" alt="Banner" className="w-full h-44 md:h-64 object-cover" />
          </div>
        )}

        {isLoading ? <SkeletonInfoCard /> : (
          <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 w-[90%] md:w-[70%]">
            <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="w-12 h-12 rounded-md">
                  <path d="M10 18h24v16c0 3.314-2.686 6-6 6h-12c-3.314 0-6-2.686-6-6V18z" fill="#6B4423"/>
                  <path d="M34 22h2c2.209 0 4 1.791 4 4v2c0 2.209-1.791 4-4 4h-2" stroke="#6B4423" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <rect x="10" y="18" width="24" height="3" fill="#4A2F1A"/>
                </svg>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base md:text-lg">SmartCoffee.</h3>
                  <p className="text-xs text-slate-500">DINE - CLICK - DONE</p>
                </div>
              </div>
              <div className="text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* PILIHAN MODE */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 mt-20 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
        {isLoading
          ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((card) => (
              <button key={card.id} onClick={() => onChoose(card.id)}
                className="group bg-white shadow-sm rounded-xl p-5 flex flex-col items-start gap-3 hover:shadow-lg transition hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 text-orange-600">
                  {card.icon}
                </div>
                <div className="text-base font-semibold text-slate-800">{card.title}</div>
                <div className="text-sm text-slate-500">{card.subtitle}</div>
                <div className="mt-1 text-xs text-slate-400 group-hover:text-slate-600">Klik untuk mulai</div>
              </button>
            ))
        }
      </main>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto px-4 md:px-6 mt-10 text-center text-xs text-slate-400 pb-6 w-full">
        © {new Date().getFullYear()} SmartCoffee. — Dibuat oleh Kuh, Tio, Cul
      </footer>
    </div>
  );
}
