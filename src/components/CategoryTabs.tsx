import React, { useState } from "react";

const CATS = [
  "SEMUA",
  "MAKANAN",
  "MINUMAN",
  "SNACK",
];

type CategoryTabsProps = {
  onChange?: (category: string) => void;
};

export default function CategoryTabs({ onChange }: CategoryTabsProps) {
  const [active, setActive] = useState(0);

  const handleClick = (i: number) => {
    setActive(i);
    if (onChange) onChange(CATS[i]);
  };

  return (
    <nav className="overflow-x-auto">
      <ul className="flex gap-6 whitespace-nowrap px-1">
        {CATS.map((c, i) => (
          <li key={c}>
            <button
              onClick={() => handleClick(i)}
              className={`pb-3 text-sm font-semibold ${active === i ? "text-slate-900" : "text-slate-500"}`}
            >
              <div className="relative">
                <span>{c}</span>
                {active === i && (
                  <span className="absolute left-0 right-0 -bottom-3 h-0.5 bg-orange-500 rounded-full" />
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
