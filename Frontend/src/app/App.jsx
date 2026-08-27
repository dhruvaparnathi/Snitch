import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ShoppingBag,
  Search,
  X,
  Globe,
  Check,
  Plus,
  Minus,
  Sparkles,
  Shield,
  Zap,
  LayoutDashboard,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useLenis } from "../assets/useLenis";
import { useProduct } from "../Features/product/hook/useProduct";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BuyerLoader from "../Components/loaders/BuyerLoader.jsx";
import { CardSkeleton } from "../Components/loaders/BentoSkeleton.jsx";
import PixelArtCanvas from "../Components/common/PixelArtCanvas.jsx";

gsap.registerPlugin(ScrollTrigger);

// Units Available for Interactive Showcase
const UNITS_DATA = [
  {
    id: "kick",
    name: "Kick Unit",
    title: "Kick Unit",
    priceText: "From 640€ / month",
    priceVal: 640,
    currency: "EUR",
    area: "24 m²",
    location: "Athens Central",
    specs: "Private bathroom • Work desk • Queen bed • High-speed Wi-Fi",
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
    ]
  },
  {
    id: "boost",
    name: "Boost Unit",
    title: "Boost Unit",
    priceText: "From 680€ / month",
    priceVal: 680,
    currency: "EUR",
    area: "29 m²",
    location: "Piraeus Port Hub",
    specs: "Balcony access • Full kitchenette • Smart lock • AC climate control",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    ]
  },
  {
    id: "flex",
    name: "Flex Unit",
    title: "Flex Unit",
    priceText: "From 750€ / month",
    priceVal: 750,
    currency: "EUR",
    area: "35 m²",
    location: "Thessaloniki",
    specs: "Corner loft • Double wardrobe • Ergonomic Herman Miller desk • Lounge space",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005229762-ee152da915ba?auto=format&fit=crop&w=1200&q=80",
    ]
  },
  {
    id: "vibe",
    name: "Vibe Unit",
    title: "Vibe Unit",
    priceText: "From 800€ / month",
    priceVal: 800,
    currency: "EUR",
    area: "42 m²",
    location: "Athens Panorama",
    specs: "Penthouse terrace • Panoramic city skyline • Premium acoustics • King suite",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    ]
  }
];

export default function App() {
  useLenis();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { products: apiProducts, handleGetAllProducts } = useProduct();

  // State
  const [selectedUnit, setSelectedUnit] = useState(UNITS_DATA[1]); // Default to Boost Unit
  const [lang, setLang] = useState("EN");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toastMessage, setToastMessage] = useState(null);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    handleGetAllProducts().catch(() => {});

    // GSAP Stagger Animations
    const ctx = gsap.context(() => {
      gsap.from(".units-anim", {
        y: 35,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "power3.out",
        clearProps: "all"
      });
    });

    return () => ctx.revert();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product) => {
    const prodId = product._id || product.id;
    const priceVal = product.price?.amount || product.priceVal || product.priceAmount || 0;
    const prodName = product.title || product.name || "Unit";
    const prodPrice = product.priceText || `${product.price?.currency || product.currency || "EUR"} ${priceVal}`;
    const prodImage = product.Images?.[0]?.url || product.images?.[0]?.url || product.images?.[0] || product.image;

    setCart((prev) => {
      const exists = prev.find((item) => item.id === prodId);
      if (exists) {
        return prev.map((item) =>
          item.id === prodId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: prodId,
        name: prodName,
        price: prodPrice,
        priceVal: priceVal,
        image: prodImage,
        quantity: 1
      }];
    });
    triggerToast(`Added "${prodName}" to selection`);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const val = item.priceVal || 0;
    return sum + val * item.quantity;
  }, 0);

  // Combine Store Products
  const combinedProducts = [
    ...UNITS_DATA.map((u) => ({
      id: u.id,
      _id: u.id,
      name: u.name,
      title: u.name,
      category: "Living Units",
      price: u.priceText,
      priceVal: u.priceVal,
      currency: "EUR",
      specs: u.specs,
      image: u.images[0],
      badge: "VERIFIED UNIT",
      badgeColor: "bg-[#1677FF] text-white"
    })),
    ...(Array.isArray(apiProducts) ? apiProducts : []).map((p, idx) => ({
      id: p?._id || `item-${idx}`,
      _id: p?._id,
      name: p?.title || p?.name || "Design Artifact",
      title: p?.title || p?.name || "Design Artifact",
      category: p?.category || "Artifacts",
      price: `${p?.price?.currency || p?.priceCurrency || "INR"} ${p?.price?.amount || p?.priceAmount || 0}`,
      priceVal: p?.price?.amount || p?.priceAmount || 0,
      currency: p?.price?.currency || p?.priceCurrency || "INR",
      specs: p?.description ? String(p.description).slice(0, 50) + "..." : "Authentic Snitch Artifact",
      image: p?.Images?.[0]?.url || p?.images?.[0]?.url || "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
      badge: "SELLER ITEM",
      badgeColor: "bg-[#FF5500] text-white"
    }))
  ];

  const filteredProducts = combinedProducts.filter((item) => {
    if (!item) return false;
    const name = String(item.name || item.title || "").toLowerCase();
    const specs = String(item.specs || "").toLowerCase();
    const category = String(item.category || "");
    const q = String(searchQuery || "").toLowerCase();

    const matchesCat = selectedCategory === "All" || category === selectedCategory;
    const matchesQ = name.includes(q) || specs.includes(q);
    return matchesCat && matchesQ;
  });

  return (
    <div className="min-h-screen bg-[#F5EBE6] text-black font-body selection:bg-[#FF5500] selection:text-white relative">
      
      {/* Cozy Pixelated Buyer Loader */}
      {showLoader && <BuyerLoader onComplete={() => setShowLoader(false)} duration={0.8} />}
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white animate-bounce font-heading font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] border-l-2 border-black h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-[#FF5500]" />
                  <h2 className="font-heading font-extrabold text-xl">Snitch Selection Cart</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-xl bg-[#F5EBE6] hover:bg-black hover:text-white transition-colors border border-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-black/50">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-black" />
                    <p className="font-bold font-mono text-sm">Your booking selection is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-[#F5EBE6] border-2 border-black flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-black" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-extrabold text-sm truncate">{item.name}</h4>
                        <p className="text-xs font-mono font-bold text-[#FF5500]">{item.price}</p>
                        <p className="text-[11px] font-semibold text-black/70">Qty: {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 border-t-2 border-black">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono font-bold text-sm text-black/70">ESTIMATED TOTAL</span>
                <span className="font-heading font-black text-2xl">${cartTotal.toLocaleString()}</span>
              </div>
              <button
                onClick={() => {
                  if (cart.length === 0) return;
                  triggerToast("Reservation confirmed with Snitch team!");
                  setCart([]);
                  setIsCartOpen(false);
                }}
                disabled={cart.length === 0}
                className="w-full py-4 rounded-2xl bg-[#00C853] text-black font-extrabold text-base border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-40"
              >
                PROCEED TO BOOKING ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Running Marquee Ribbon */}
      <div className="bg-[#FF3B30] text-[#FFD600] font-heading font-black text-xs sm:text-sm uppercase py-2.5 overflow-hidden border-b-2 border-black tracking-wider">
        <div className="animate-marquee-left whitespace-nowrap flex gap-8 items-center">
          <span>SNITCH ARCHITECTURAL COMMERCE</span>
          <span className="text-white">✦</span>
          <span className="text-white">24/7 Security</span>
          <span className="text-white">✦</span>
          <span>Fast and reliable dispatch</span>
          <span className="text-white">✦</span>
          <span className="text-white">Smart living</span>
          <span className="text-white">✦</span>
          <span>Private kitchen & bathroom</span>
          <span className="text-white">✦</span>
          <span className="text-white">SNITCH PROTOCOL</span>
          <span className="text-white">✦</span>
        </div>
      </div>

      {/* Main Layout Container with Persistent Left Sidebar */}
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Persistent Navigation Sidebar */}
        <aside className="w-full lg:w-44 flex-shrink-0 flex flex-col gap-3">
          
          {/* Logo */}
          <Link to="/" className="mb-2 block group">
            <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-black flex items-baseline">
              snitch<span className="text-[#FF5500]">.</span>
            </h1>
            <span className="text-[8px] font-mono font-bold tracking-widest text-black/80 block uppercase -mt-1">
              ARCHITECTURAL COMMERCE
            </span>
          </Link>

          {/* Vertical Stack of Colored Nav Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2.5">
            
            {/* 01 Blue Pill */}
            <button
              onClick={() => {
                const el = document.getElementById("units-showcase");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="units-pill bg-[#1677FF] text-black font-heading font-extrabold p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between h-20 text-left border-2 border-black shadow-[2px_2px_0px_#000000]"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span>01</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-sm font-black leading-tight">Student Homes</span>
            </button>

            {/* 02 Yellow Pill */}
            <button
              onClick={() => {
                const el = document.getElementById("our-way");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="units-pill bg-[#FFB800] text-black font-heading font-extrabold p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between h-20 text-left border-2 border-black shadow-[2px_2px_0px_#000000]"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span>02</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-sm font-black leading-tight">Our way of living</span>
            </button>

            {/* 03 Orange Pill */}
            <button
              onClick={() => {
                const el = document.getElementById("community");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="units-pill bg-[#FF5500] text-black font-heading font-extrabold p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between h-20 text-left border-2 border-black shadow-[2px_2px_0px_#000000]"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span>03</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-sm font-black leading-tight">Community</span>
            </button>

            {/* 04 Green Pill */}
            <button
              onClick={() => {
                const el = document.getElementById("catalog");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="units-pill bg-[#00C853] text-black font-heading font-extrabold p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between h-20 text-left border-2 border-black shadow-[2px_2px_0px_#000000]"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span>04</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-sm font-black leading-tight">Artifact Catalog</span>
            </button>
          </div>

          {/* Book / Cart Lilac Pill */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="units-pill bg-[#C4A1FF] text-black font-heading font-black p-3.5 rounded-2xl text-center text-sm border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-2"
          >
            <span>Book your Unit</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          {/* Language Toggle Black Pill */}
          <button
            onClick={() => setLang(lang === "EN" ? "EL" : "EN")}
            className="units-pill bg-black text-white font-mono font-bold px-3 py-2.5 rounded-2xl flex items-center justify-between text-xs border-2 border-black"
          >
            <span>{lang === "EN" ? "Ελληνικά" : "English"}</span>
            <Globe className="w-4 h-4 text-white" />
          </button>

          {/* Seller / Auth Action Pill */}
          {user ? (
            user.role === "seller" ? (
              <Link
                to="/seller/dashboard"
                className="units-pill bg-[#FFD600] text-black font-heading font-extrabold p-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 border-2 border-black text-center shadow-[2px_2px_0px_#000000]"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>SELLER TERMINAL</span>
              </Link>
            ) : (
              <div className="bg-white border-2 border-black p-2.5 rounded-2xl text-center text-xs font-mono font-bold">
                {user.fullName || user.email}
              </div>
            )
          ) : (
            <div className="flex flex-col gap-1.5">
              <Link
                to="/login"
                className="units-pill bg-white text-black font-mono font-bold p-2.5 rounded-2xl text-xs text-center border-2 border-black hover:bg-black hover:text-white transition-colors"
              >
                SIGN IN
              </Link>
            </div>
          )}

          {/* Social Icons Pill */}
          <div className="bg-black text-white p-2.5 rounded-2xl flex items-center justify-around text-xs font-mono font-bold border-2 border-black">
            <span className="cursor-pointer hover:text-[#FF5500]">IG</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-[#1677FF]">FB</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-[#00C853]">TT</span>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 flex flex-col gap-8 min-w-0">
          
          {/* Bento Grid (Mirroring Units.gr Hero Layout Exactly) */}
          <section id="our-way" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 units-anim">
            
            {/* 1. Large Vibrant Interior Architecture Photo */}
            <div className="lg:col-span-5 h-[340px] sm:h-[420px] rounded-[28px] overflow-hidden border-2 border-black shadow-[3px_3px_0px_#000000] relative group">
              <img
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
                alt="Snitch Lounge"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full font-mono text-xs font-bold border border-white">
                SNITCH PARK CENTRAL
              </div>
            </div>

            {/* 2. Solid Orange "Security" Bento Card */}
            <div className="lg:col-span-4 bg-[#FF5500] text-black p-7 rounded-[28px] border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
              <div>
                <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-black">
                  Security
                </h2>
                <h3 className="font-heading font-extrabold text-sm sm:text-base text-black/90 mb-4 mt-0.5">
                  Day and night
                </h3>

                <div className="space-y-0 text-black">
                  <div className="units-list-item">24/7 CCTV Surveillance</div>
                  <div className="units-list-item">7/7 Night patrol</div>
                  <div className="units-list-item">High-security entrance door with electronic lock</div>
                  <div className="units-list-item border-none pb-0">Smart and secure access control</div>
                </div>
              </div>
            </div>

            {/* 3. Right Laptop & Croissant Workspace Photo */}
            <div className="lg:col-span-3 h-[340px] sm:h-[420px] rounded-[28px] overflow-hidden border-2 border-black shadow-[3px_3px_0px_#000000] relative group">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
                alt="Workspace and Lifestyle"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* 4. Solid Lilac "Community Living Spaces" Bento Card */}
            <div className="lg:col-span-4 bg-[#C4A1FF] text-black p-7 rounded-[28px] border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
              <div>
                <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-black">
                  Community living spaces
                </h2>
                <h3 className="font-heading font-extrabold text-sm text-black/90 mb-4 mt-0.5">
                  Open access, 24/7
                </h3>

                <div className="space-y-0 text-black">
                  <div className="units-list-item">Fully equipped gym</div>
                  <div className="units-list-item">Self-service laundry room</div>
                  <div className="units-list-item border-none pb-0">Social areas</div>
                </div>
              </div>
            </div>

            {/* 5. Keypad Electronic Smart Lock Photo Block */}
            <div className="lg:col-span-4 h-[260px] sm:h-[300px] rounded-[28px] overflow-hidden border-2 border-black shadow-[3px_3px_0px_#000000] relative group">
              <img
                src="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80"
                alt="Smart Keyless Lock"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* 6. Solid Yellow "Support" Bento Card */}
            <div className="lg:col-span-4 bg-[#FFD600] text-black p-7 rounded-[28px] border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
              <div>
                <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-black">
                  Support
                </h2>
                <h3 className="font-heading font-extrabold text-sm text-black/90 mb-4 mt-0.5">
                  We've got you covered
                </h3>

                <div className="space-y-0 text-black">
                  <div className="units-list-item">24/7 Resident support</div>
                  <div className="units-list-item">Check-in & Onboarding assistance</div>
                  <div className="units-list-item">Fast request handling</div>
                  <div className="units-list-item">Fast maintenance support</div>
                  <div className="units-list-item border-none pb-0">Continuous experience improvements</div>
                </div>
              </div>
            </div>

          </section>

          {/* Section 2: "Check out our Units" (Image 2 from Screenshots) */}
          <section id="units-showcase" className="flex flex-col gap-4 mt-6">
            
            {/* Top Red/Orange Down Arrow Banner */}
            <div className="bg-[#FF5500] text-black font-heading font-black text-2xl sm:text-4xl py-4 px-6 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-between">
              <span className="text-[#1677FF] font-black">↓↓</span>
              <h2 className="tracking-tight">Check out our Units</h2>
              <span className="text-[#1677FF] font-black">↓↓</span>
            </div>

            {/* Interactive Unit Switcher & Photo Slider Box */}
            <div className="bg-white border-2 border-black rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Interactive Unit Selection Pills */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                {UNITS_DATA.map((unit) => {
                  const isActive = selectedUnit.id === unit.id;
                  return (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit)}
                      className={`w-full py-4 px-6 rounded-full border-2 border-black text-left flex items-center justify-between transition-all font-heading ${
                        isActive
                          ? "bg-black text-white shadow-[2px_2px_0px_#FF5500] scale-[1.02]"
                          : "bg-white text-black hover:bg-[#F5EBE6]"
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-lg">{unit.name}</div>
                        <div className={`text-xs font-mono font-bold ${isActive ? "text-[#FFB800]" : "text-black/70"}`}>
                          {unit.priceText}
                        </div>
                      </div>
                      <span className="text-xl font-bold font-mono">
                        {isActive ? "→" : "↗"}
                      </span>
                    </button>
                  );
                })}

                {/* View Details / Book Buttons */}
                <div className="flex gap-2 mt-2">
                  <Link
                    to={`/product/${selectedUnit.id}`}
                    className="flex-1 py-4 px-4 rounded-full bg-white text-black font-heading font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-all text-center flex items-center justify-center gap-1"
                  >
                    <span>VIEW DETAILS</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => addToCart(selectedUnit)}
                    className="flex-1 py-4 px-4 rounded-full bg-[#00E676] text-black font-heading font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-1"
                  >
                    <span>BOOK UNIT</span>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Unit Images Slider with Details */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="h-[360px] sm:h-[440px] rounded-[24px] overflow-hidden border-2 border-black shadow-[3px_3px_0px_#000000] relative">
                  <Swiper
                    modules={[Navigation, Autoplay]}
                    navigation={true}
                    autoplay={{ delay: 3500 }}
                    className="h-full w-full"
                  >
                    {selectedUnit.images.map((imgUrl, idx) => (
                      <SwiperSlide key={idx} className="h-full w-full">
                        <img
                          src={imgUrl}
                          alt={selectedUnit.name}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => navigate(`/product/${selectedUnit.id}`)}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  
                  {/* Floating Unit Specifications Badge */}
                  <Link
                    to={`/product/${selectedUnit.id}`}
                    className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border-2 border-black p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 z-10 hover:bg-black hover:text-white transition-colors"
                  >
                    <span className="font-heading font-extrabold text-sm">{selectedUnit.name} • {selectedUnit.area}</span>
                    <span className="font-mono text-xs font-bold flex items-center gap-1">
                      <span>{selectedUnit.location}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              </div>

            </div>

          </section>

          {/* Section 3: "How We Think" Retro Pixel Art Canvas (Image 3 from Screenshots) */}
          <section id="community" className="bg-[#FFB800] p-4 sm:p-5 rounded-[32px] border-2 border-black shadow-[4px_4px_0px_#000000]">
            <div className="bg-[#FF3B30] rounded-[24px] border-2 border-black p-8 sm:p-14 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
              
              {/* Retro Pixel Smiley Face SVG */}
              <svg className="w-40 h-40 sm:w-56 sm:h-56 text-[#C4A1FF] mb-4 opacity-90" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2h10v2H7V2zM5 4h2v2H5V4zM17 4h2v2h-2V4zM3 6h2v4H3V6zM19 6h2v4h-2V6zM1 10h2v4H1v-4zM21 10h2v4h-2v-4zM3 14h2v4H3v-4zM19 14h2v4h-2v-4zM5 18h2v2H5v-2zM17 18h2v2h-2v-2zM7 20h10v2H7v-2zM7 8h2v2H7V8zM15 8h2v2h-2V8zM7 14h2v2H7v-2zM9 16h6v2H9v-2zM15 14h2v2h-2v-2z" />
              </svg>

              <h2 className="font-heading font-black text-4xl sm:text-7xl tracking-tighter text-black uppercase">
                How we think
              </h2>
              <p className="font-mono font-bold text-sm sm:text-base text-white mt-2 max-w-lg">
                Creating radical spaces and authentic artifacts for independent student living and creators.
              </p>
            </div>
          </section>

          {/* Section 4: Live E-Commerce Catalog (Products & Artifacts) */}
          <section id="catalog" className="flex flex-col gap-6 mt-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
              <div>
                <span className="text-xs font-mono font-bold text-[#1677FF] uppercase tracking-widest">
                  CURATED STOREFRONT
                </span>
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-black">
                  Snitch Artifacts & Living Spaces
                </h2>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search units or artifacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 units-input text-xs font-mono w-full sm:w-64"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {["All", "Living Units", "Artifacts", "Tech Ecosystem"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full font-heading font-extrabold text-xs border-2 border-black transition-all ${
                    selectedCategory === cat
                      ? "bg-black text-white shadow-[2px_2px_0px_#FF5500]"
                      : "bg-white text-black hover:bg-[#F5EBE6]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((item) => {
                const prodId = item._id || item.id;
                return (
                  <div
                    key={prodId}
                    className="bg-white border-2 border-black rounded-[28px] p-5 shadow-[3px_3px_0px_#000000] flex flex-col justify-between hover:translate-x-[1px] hover:translate-y-[1px] transition-all group"
                  >
                    <div>
                      <Link to={`/product/${prodId}`} className="block h-56 rounded-[20px] overflow-hidden border-2 border-black mb-4 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full font-mono text-[10px] font-bold border border-black ${item.badgeColor || 'bg-black text-white'}`}>
                          {item.badge}
                        </span>
                      </Link>

                      <span className="text-[11px] font-mono font-bold text-black/60 uppercase">{item.category}</span>
                      <Link to={`/product/${prodId}`} className="block">
                        <h3 className="font-heading font-black text-xl text-black mt-0.5 mb-1 hover:text-[#FF5500] transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-xs font-semibold text-black/70 mb-4">{item.specs}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t-2 border-black/10 gap-2">
                      <span className="font-heading font-black text-lg text-[#FF5500]">{item.price}</span>
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/product/${prodId}`}
                          className="px-3 py-2 rounded-xl bg-white text-black font-heading font-bold text-xs border border-black hover:bg-[#F5EBE6]"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-2 rounded-xl bg-black text-white font-heading font-extrabold text-xs hover:bg-[#00C853] hover:text-black transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>SELECT</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </section>

          {/* Snitch Footer */}
          <footer className="mt-12 pt-8 pb-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between text-xs font-mono font-bold text-black gap-4">
            <div>© {new Date().getFullYear()} SNITCH ARCHITECTURAL COMMERCE. ALL RIGHTS RESERVED.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:underline">PRIVACY POLICY</a>
              <a href="#" className="hover:underline">TERMS</a>
              <a href="#" className="hover:underline">CONTACT</a>
            </div>
          </footer>

        </main>
      </div>

    </div>
  );
}