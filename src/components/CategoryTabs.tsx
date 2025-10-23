import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

type CategoryTabsProps = {
  onChange?: (category: string) => void;
};

export default function CategoryTabs({ onChange }: CategoryTabsProps) {
  const [categories, setCategories] = useState<string[]>(["SEMUA"]);
  const [active, setActive] = useState(0);

useEffect(() => {
  async function fetchCategories() {
    const snap = await getDocs(collection(db, "categories"));
    const data = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as any) }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((d) => d.name);

    setCategories(["SEMUA", ...data]);
  }
  fetchCategories();
}, []);


  const handleClick = (i: number) => {
    setActive(i);
    if (onChange) onChange(categories[i]);
  };

  return (
    <nav className="overflow-x-auto">
      <ul className="flex gap-6 whitespace-nowrap px-1">
        {categories.map((c, i) => (
          <li key={c}>
            <button
              onClick={() => handleClick(i)}
              className={`pb-3 text-sm font-semibold ${
                active === i ? "text-slate-900" : "text-slate-500"
              }`}
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
