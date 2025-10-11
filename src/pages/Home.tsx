import React from "react";
import { useNavigate } from "react-router-dom";

type ModeType = "dinein" | "pickup" | "delivery";

export default function Home() {
  const navigate = useNavigate();

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

  function onChoose(mode: ModeType) {
    navigate(`/order?mode=${mode}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 from-orange-50 to-white flex flex-col">
      {/* BANNER */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 w-full relative">
        <div className="rounded-b-2xl overflow-hidden">
          <img
            src="banner-kopi.jpg"
            alt="Banner"
            className="w-full h-44 md:h-64 object-cover"
          />
        </div>

        {/* Kartu informasi di atas banner */}
        <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2 w-[90%] md:w-[70%]">
          <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 rounded-md">
  <path d="M10 18h24v16c0 3.314-2.686 6-6 6h-12c-3.314 0-6-2.686-6-6V18z" fill="#6B4423"/>
  <path d="M34 22h2c2.209 0 4 1.791 4 4v2c0 2.209-1.791 4-4 4h-2" stroke="#6B4423" stroke-width="2.5" strokeLinecap="round" fill="none"/>
  <rect x="10" y="18" width="24" height="3" fill="#4A2F1A"/>
  <g opacity="0.3">
    <rect x="15" y="24" width="2" height="2" fill="white"/>
    <rect x="19" y="24" width="2" height="2" fill="white"/>
    <rect x="27" y="24" width="2" height="2" fill="white"/>
    <rect x="15" y="28" width="2" height="2" fill="white"/>
    <rect x="23" y="28" width="2" height="2" fill="white"/>
    <rect x="27" y="28" width="2" height="2" fill="white"/>
    <rect x="19" y="32" width="2" height="2" fill="white"/>
    <rect x="23" y="32" width="2" height="2" fill="white"/>
  </g>
  <g stroke="#6B4423" stroke-width="2" strokeLinecap="round" fill="none">
    <path d="M16 14c0-2 1-3 2-3s2 1 2 3" opacity="0.6"/>
    <path d="M22 13c0-2 1-3 2-3s2 1 2 3" opacity="0.8"/>
    <path d="M28 14c0-2 1-3 2-3s2 1 2 3" opacity="0.6"/>
  </g>
</svg>
             {/* <img
                src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                alt="Logo"
                className="w-12 h-12 rounded-md"
              />*/}
              <div>
                <h3 className="font-semibold text-slate-800 text-base md:text-lg">
                  SmartCoffee.
                </h3>
                <p className="text-xs text-slate-500">DINE - CLICK -DONE</p>
              </div>
            </div>
            <div className="text-orange-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* PILIHAN MODE */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onChoose(card.id)}
            className="group bg-white shadow-sm rounded-xl p-5 flex flex-col items-start gap-3 hover:shadow-lg transition hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 text-orange-600">
              {card.icon}
            </div>
            <div className="text-base font-semibold text-slate-800">
              {card.title}
            </div>
            <div className="text-sm text-slate-500">{card.subtitle}</div>
            <div className="mt-1 text-xs text-slate-400 group-hover:text-slate-600">
              Klik untuk mulai
            </div>
          </button>
        ))}
      </main>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto px-4 md:px-6 mt-10 text-center text-xs text-slate-400 pb-6 w-full">
        © {new Date().getFullYear()} SmartCoffee. — Dibuat oleh Kuh, Tio, Cul
      </footer>
    </div>
  );
}
