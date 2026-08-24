import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Package,
  Sparkles,
  Zap,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  X,
  Globe,
  Share2
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useLenis } from "../../../assets/useLenis";
import { useProduct } from "../hook/useProduct";
import gsap from "gsap";

// Mock Fallback Units Data for instant matching
const STATIC_UNITS_DATA = [
  {
    id: "kick",
    title: "Kick Unit Loft",
    name: "Kick Unit Loft",
    category: "Living Units",
    price: { amount: 640, currency: "EUR" },
    stock: 8,
    description: "Compact high-performance architectural studio unit. Includes private bathroom, custom oak work desk, queen-size bed capsule, and high-speed fiber Wi-Fi.",
    specs: [
      { label: "Floor Area", val: "24 m²" },
      { label: "Location", val: "Athens Central Hub" },
      { label: "Bath & Kitchen", val: "Private Ensuite" },
      { label: "Access Control", val: "Smart Keyless NFC" },
      { label: "Climate", val: "A+++ Dual Inverter AC" },
    ],
    Images: [
      { url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80", alt: "Kick Unit View" },
      { url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80", alt: "Living Space" },
    ]
  },
  {
    id: "boost",
    title: "Boost Unit Suite",
    name: "Boost Unit Suite",
    category: "Living Units",
    price: { amount: 680, currency: "EUR" },
    stock: 5,
    description: "Spacious urban apartment suite with private sun-terrace, fully equipped minimalist kitchenette, smart electronic keypad door lock, and acoustic soundproofing.",
    specs: [
      { label: "Floor Area", val: "29 m²" },
      { label: "Location", val: "Piraeus Port Hub" },
      { label: "Kitchen", val: "Induction & Fridge" },
      { label: "Security", val: "24/7 CCTV & Keyless Entry" },
      { label: "Laundry", val: "In-Building Smart Hub" },
    ],
    Images: [
      { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", alt: "Boost Unit Room" },
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80", alt: "Kitchenette" },
    ]
  },
  {
    id: "flex",
    title: "Flex Unit Workspace",
    name: "Flex Unit Workspace",
    category: "Living Units",
    price: { amount: 750, currency: "EUR" },
    stock: 4,
    description: "Corner loft engineered for hybrid creators. Features double acoustic glazed windows, ergonomic Herman Miller setup, and panoramic skyline balcony.",
    specs: [
      { label: "Floor Area", val: "35 m²" },
      { label: "Location", val: "Thessaloniki North" },
      { label: "Ergonomics", val: "Standing Desk & Chair" },
      { label: "Power", val: "Backup UPS & 1Gbps LAN" },
      { label: "Terrace", val: "Private 10m²" },
    ],
    Images: [
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", alt: "Flex Unit Interior" },
      { url: "https://images.unsplash.com/photo-1502005229762-ee152da915ba?auto=format&fit=crop&w=1200&q=80", alt: "Desk Area" },
    ]
  },
  {
    id: "vibe",
    title: "Vibe Penthouse Unit",
    name: "Vibe Penthouse Unit",
    category: "Living Units",
    price: { amount: 800, currency: "EUR" },
    stock: 2,
    description: "Top-floor flagship penthouse suite featuring 360-degree city views, marble accents, smart ambient mood lighting, and king-size luxury mattress.",
    specs: [
      { label: "Floor Area", val: "42 m²" },
      { label: "Location", val: "Athens Panorama" },
      { label: "Audio", val: "Integrated Focal Speakers" },
      { label: "Bed", val: "Organic Latex King" },
      { label: "Concierge", val: "Priority 24/7 Access" },
    ],
    Images: [
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", alt: "Vibe Living" },
      { url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80", alt: "Panoramic View" },
    ]
  }
];

export default function ProductDetails() {
  useLenis();
  const { id } = useParams();
  const { handleGetSingleProduct } = useProduct();

  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      
      // Check static units first
      const staticMatch = STATIC_UNITS_DATA.find((u) => u.id === id);
      if (staticMatch) {
        setProduct(staticMatch);
        setLoading(false);
        return;
      }

      // Fetch from API
      try {
        const res = await handleGetSingleProduct(id);
        if (res && res.product) {
          setProduct(res.product);
        } else {
          // Fallback to first unit if not found
          setProduct(STATIC_UNITS_DATA[0]);
        }
      } catch (err) {
        console.warn("API product not found, falling back to static unit:", err);
        setProduct(STATIC_UNITS_DATA[0]);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();

    gsap.from(".detail-anim", {
      y: 30,
      opacity: 0,
      stagger: 0.08,
      duration: 0.8,
      ease: "power3.out",
      clearProps: "all"
    });
  }, [id]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const priceVal = product.price?.amount || product.priceAmount || 0;
    const item = {
      id: product._id || product.id,
      name: product.title || product.name,
      price: `${product.price?.currency || "EUR"} ${priceVal}`,
      priceVal: priceVal,
      image: product.Images?.[0]?.url || product.images?.[0]?.url || product.images?.[0] || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      quantity: quantity
    };

    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        return prev.map((p) => p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p);
      }
      return [...prev, item];
    });

    triggerToast(`Added ${quantity}x "${item.name}" to selection!`);
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.priceVal * item.quantity), 0);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#F5EBE6] text-black font-body flex items-center justify-center p-8">
        <div className="bg-white border-2 border-black rounded-[32px] p-8 text-center shadow-[4px_4px_0px_#000000]">
          <div className="w-10 h-10 border-4 border-black border-t-[#FF5500] rounded-full animate-spin mx-auto mb-4" />
          <h2 className="font-heading font-black text-xl">Loading Snitch Artifact...</h2>
        </div>
      </div>
    );
  }

  const title = product.title || product.name || "Snitch Product Unit";
  const category = product.category || "Living Units";
  const description = product.description || "Authentic Snitch architectural artifact engineered with high-velocity precision.";
  const priceAmount = product.price?.amount || product.priceAmount || 0;
  const priceCurrency = product.price?.currency || product.priceCurrency || "EUR";
  const stock = product.stock ?? product.stockQuantity ?? 10;
  const images = (product.Images && product.Images.length > 0)
    ? product.Images.map((img) => typeof img === "string" ? img : img.url)
    : (product.images && product.images.length > 0)
    ? product.images.map((img) => typeof img === "string" ? img : img.url)
    : ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80"];

  return (
    <div className="min-h-screen bg-[#F5EBE6] text-black font-body selection:bg-[#FF5500] selection:text-white relative p-4 sm:p-6 lg:p-8">
      
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
                  <h2 className="font-heading font-extrabold text-xl">Selection Cart</h2>
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
                <span className="font-mono font-bold text-sm text-black/70">TOTAL AMOUNT</span>
                <span className="font-heading font-black text-2xl">{priceCurrency} {cartTotal.toLocaleString()}</span>
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
                PROCEED TO CHECKOUT ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar */}
        <aside className="w-full lg:w-44 flex-shrink-0 flex flex-col gap-3">
          <Link to="/" className="mb-2 block group">
            <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-black flex items-baseline">
              snitch<span className="text-[#FF5500]">.</span>
            </h1>
            <span className="text-[8px] font-mono font-bold tracking-widest text-black/80 block uppercase -mt-1">
              PRODUCT SPECIFICATION
            </span>
          </Link>

          <Link
            to="/"
            className="units-pill bg-white text-black font-heading font-extrabold p-3 rounded-2xl flex items-center justify-between text-xs border-2 border-black shadow-[2px_2px_0px_#000000]"
          >
            <span>STOREFRONT</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Cart Pill */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="units-pill bg-[#C4A1FF] text-black font-heading font-black p-3.5 rounded-2xl text-center text-sm border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-2"
          >
            <span>View Cart</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </aside>

        {/* Product Details Content */}
        <main className="flex-1 flex flex-col gap-8 min-w-0">
          
          {/* Breadcrumbs Banner */}
          <div className="detail-anim bg-white border-2 border-black rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-[3px_3px_0px_#000000]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              <Link to="/" className="hover:text-[#FF5500]">Home</Link>
              <span>/</span>
              <span className="text-[#1677FF]">{category}</span>
              <span>/</span>
              <span className="text-black/70 truncate max-w-xs">{title}</span>
            </div>

            <span className="px-3 py-1 rounded-full font-mono text-[10px] font-bold bg-[#00C853] text-black border border-black">
              {stock} UNITS IN STOCK
            </span>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Image Gallery (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-4 detail-anim">
              
              {/* Primary Image Viewport */}
              <div className="h-[380px] sm:h-[480px] rounded-[32px] overflow-hidden border-2 border-black shadow-[4px_4px_0px_#000000] relative bg-white">
                <img
                  src={images[activeImageIdx] || images[0]}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1.5 rounded-full font-mono text-xs font-bold border border-white">
                  AUTHENTICATED UNIT
                </div>
              </div>

              {/* Thumbnails Bar */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-24 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIdx === idx
                          ? "border-black shadow-[3px_3px_0px_#FF5500] scale-105"
                          : "border-black/40 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Bento Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <div className="bg-[#1677FF] text-black p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <ShieldCheck className="w-5 h-5 mb-1.5" />
                  <div className="font-heading font-black text-sm">100% Certified</div>
                  <div className="text-[10px] font-mono text-black/80 font-bold">Verified by Snitch</div>
                </div>

                <div className="bg-[#FFB800] text-black p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <Zap className="w-5 h-5 mb-1.5" />
                  <div className="font-heading font-black text-sm">Instant Access</div>
                  <div className="text-[10px] font-mono text-black/80 font-bold">Keyless NFC Protocol</div>
                </div>

                <div className="bg-[#C4A1FF] text-black p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000]">
                  <Clock className="w-5 h-5 mb-1.5" />
                  <div className="font-heading font-black text-sm">24/7 Concierge</div>
                  <div className="text-[10px] font-mono text-black/80 font-bold">Resident Support</div>
                </div>
              </div>

            </div>

            {/* Right Information & Booking Panel (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-6 detail-anim">
              
              {/* Product Main Card */}
              <div className="bg-white border-2 border-black rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-[#FF5500] uppercase tracking-widest">
                    {category}
                  </span>
                  <h1 className="font-heading font-black text-3xl sm:text-4xl text-black mt-1 mb-3">
                    {title}
                  </h1>

                  {/* Price Banner */}
                  <div className="bg-[#F5EBE6] p-4 rounded-2xl border-2 border-black mb-6 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-black/70 block uppercase">PRICE / MONTH</span>
                      <span className="font-heading font-black text-3xl text-[#FF5500]">
                        {priceCurrency} {priceAmount.toLocaleString()}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-black bg-[#FFD600] px-3 py-1 rounded-full border border-black">
                      IN STOCK
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-black/80 leading-relaxed mb-6">
                    {description}
                  </p>

                  {/* Quantity Selector & Book Button */}
                  <div className="space-y-4 pt-4 border-t-2 border-black/10">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-black uppercase">SELECT QUANTITY:</span>
                      <div className="flex items-center gap-3 bg-[#F5EBE6] border-2 border-black rounded-full px-3 py-1">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="p-1 hover:text-[#FF5500] transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-black text-sm w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                          className="p-1 hover:text-[#FF5500] transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="w-full py-4 rounded-full bg-[#00E676] text-black font-heading font-black text-base border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>BOOK THIS UNIT / ADD TO SELECTION ↗</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Bento */}
              {product.specs && (
                <div className="bg-[#FF5500] text-black p-6 sm:p-7 rounded-[28px] border-2 border-black shadow-[3px_3px_0px_#000000]">
                  <h3 className="font-heading font-black text-xl mb-4">Technical Specifications</h3>
                  <div className="space-y-0 text-black">
                    {Array.isArray(product.specs) ? (
                      product.specs.map((s, idx) => (
                        <div key={idx} className="units-list-item flex items-center justify-between">
                          <span className="text-black/80 font-bold">{s.label || `Spec ${idx + 1}`}</span>
                          <span className="font-black">{s.val || s}</span>
                        </div>
                      ))
                    ) : (
                      <div className="units-list-item border-none font-bold">{String(product.specs)}</div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
