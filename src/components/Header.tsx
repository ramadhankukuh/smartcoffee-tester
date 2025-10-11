import { ArrowLeft, Search } from "lucide-react";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 w-full bg-white z-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 h-14 border-b">
        <button className="p-2">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-semibold text-base truncate">
          SmartCoffee.
        </h1>
        <button className="p-2">
          <Search size={22} />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="overflow-x-auto border-b">
        <div className="flex space-x-6 px-4 py-2 text-sm font-medium whitespace-nowrap">
          <button className="text-orange-600 border-b-2 border-orange-600 pb-1">
            FRIED CHICKEN BY AYAM NGACIR
          </button>
          <button className="pb-1">GEPREK</button>
          <button className="pb-1">KHAS DINUS</button>
          <button className="pb-1">MINUMAN</button>
          <button className="pb-1">SNACK</button>
        </div>
      </div>
    </div>
  );
}
