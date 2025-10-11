export type MenuItem = {
  id: number;
  name: string;
  desc: string;
  price: number;
  category: string;
  img: string;
};

export const SAMPLE_MENU: MenuItem[] = [
  // 🥪 MAKANAN
  { 
    id: 1, 
    name: "Nasi Goreng Spesial", 
    desc: "Nasi goreng dengan telur, ayam, dan bumbu rempah khas", 
    price: 25000, 
    category: "MAKANAN",
    img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&h=200&w=200"
  },
  { 
    id: 2, 
    name: "Chicken Sandwich", 
    desc: "Roti panggang dengan isian ayam crispy, sayur, dan saus", 
    price: 28000, 
    category: "MAKANAN",
    img: "/chicken-sandwich.jpg"
  },
  { 
    id: 3, 
    name: "Spaghetti Bolognese", 
    desc: "Spaghetti dengan saus tomat daging cincang", 
    price: 32000, 
    category: "MAKANAN",
    img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&h=200&w=200"
  },
  { 
    id: 4, 
    name: "Chicken Rice Bowl", 
    desc: "Nasi hangat dengan ayam panggang dan saus manis gurih", 
    price: 30000, 
    category: "MAKANAN",
    img: "/chicken-rice-bowl.jpg"
  },
  { 
    id: 5, 
    name: "Beef Burger", 
    desc: "Roti burger dengan daging sapi juicy dan keju leleh", 
    price: 35000, 
    category: "MAKANAN",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&h=200&w=200"
  },

  // ☕ MINUMAN
  { 
    id: 6, 
    name: "Espresso", 
    desc: "Kopi hitam pekat dengan aroma kuat", 
    price: 18000, 
    category: "MINUMAN",
    img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&h=200&w=200"
  },
  { 
    id: 7, 
    name: "Cappuccino", 
    desc: "Kopi dengan susu dan foam lembut di atasnya", 
    price: 25000, 
    category: "MINUMAN",
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&h=200&w=200"
  },
  { 
    id: 8, 
    name: "Caramel Latte", 
    desc: "Latte manis dengan sirup karamel", 
    price: 28000, 
    category: "MINUMAN",
    img: "https://images.unsplash.com/photo-1521305916504-4a1121188589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&h=200&w=200"
  },
  { 
    id: 9, 
    name: "Iced Lemon Tea", 
    desc: "Teh dingin segar dengan perasan lemon", 
    price: 18000, 
    category: "MINUMAN",
    img: "/iced-lemon-tea.jpg"
  },
  { 
    id: 10, 
    name: "Matcha Latte", 
    desc: "Teh hijau matcha berpadu susu creamy", 
    price: 26000, 
    category: "MINUMAN",
    img: "/matcha-latte.jpg"
  },

  // 🍪 SNACK
  { 
    id: 11, 
    name: "French Fries", 
    desc: "Kentang goreng renyah dengan saus sambal & mayo", 
    price: 15000, 
    category: "SNACK",
    img: "/kentang.jpeg"
  },
  { 
    id: 12, 
    name: "Onion Rings", 
    desc: "Bawang goreng tepung crispy dengan saus tartar", 
    price: 17000, 
    category: "SNACK",
    img: "/onion-ring.jpg"
  },
  { 
    id: 13, 
    name: "Churros", 
    desc: "Camilan goreng tabur gula & kayu manis dengan saus coklat", 
    price: 20000, 
    category: "SNACK",
    img: "/churros.jpeg"
  },
  { 
    id: 14, 
    name: "Croissant", 
    desc: "Pastry lembut dengan lapisan renyah", 
    price: 15000, 
    category: "SNACK",
    img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&h=200&w=200"
  },
  { 
    id: 15, 
    name: "Cheesecake Slice", 
    desc: "Potongan cheesecake lembut dengan rasa creamy", 
    price: 22000, 
    category: "SNACK",
    img: "/chesse-cake.jpg"
  }
];
