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
  Package,
  Layers,
  PlusCircle
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
import { useCart } from "../Features/cart/hook/useCart";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_IMG = "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80";

export default function App() {
  useLenis();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { products: apiProducts, loading: productsLoading, handleGetAllProducts } = useProduct();
  const { totalItems, handleAddToCart: addProductToCart } = useCart();

  // State
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [lang, setLang] = useState("EN");
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
        duration: 0.8,
        ease: "power3.out",
        clearProps: "all"
      });
    });

    return () => ctx.revert();
  }, []);

  // Real user products list
  const userProducts = Array.isArray(apiProducts) ? apiProducts : [];

  // Currently selected product for featured showcase
  const selectedProduct =
    userProducts.find((p) => (p._id || p.id) === selectedProductId) ||
    userProducts[0] ||
    null;

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to extract image safely
  const getProductImage = (product) => {
    if (!product) return FALLBACK_IMG;
    if (product.Images && product.Images.length > 0) {
      const first = product.Images[0];
      return typeof first === "string" ? first : first?.url || FALLBACK_IMG;
    }
    if (product.images && product.images.length > 0) {
      const first = product.images[0];
      return typeof first === "string" ? first : first?.url || FALLBACK_IMG;
    }
    return product.image || FALLBACK_IMG;
  };

  // Helper to get all image URLs for slider
  const getProductImages = (product) => {
    if (!product) return [FALLBACK_IMG];
    let imgs = [];
    if (Array.isArray(product.Images) && product.Images.length > 0) {
      imgs = product.Images.map((i) => (typeof i === "string" ? i : i?.url)).filter(Boolean);
    } else if (Array.isArray(product.images) && product.images.length > 0) {
      imgs = product.images.map((i) => (typeof i === "string" ? i : i?.url)).filter(Boolean);
    }
    return imgs.length > 0 ? imgs : [FALLBACK_IMG];
  };

  const addToCart = async (product) => {
    if (!product) return;
    const prodId = product._id || product.id;
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

    if (hasVariants) {
      navigate(`/product/${prodId}`);
      return;
    }

    if (!user) {
      triggerToast("Please sign in to add items to your cart");
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent("/")}`);
      }, 700);
      return;
    }

    const prodName = product.title || product.name || "Product";
    try {
      await addProductToCart(prodId, "default", 1);
      triggerToast(`Added "${prodName}" to cart!`);
    } catch (err) {
      triggerToast(err.message || "Failed to add to cart");
    }
  };

  // Available Categories extracted from real user products
  const productCategories = [
    "All",
    ...Array.from(new Set(userProducts.map((p) => p.category).filter(Boolean)))
  ];

  // Filtered Products
  const filteredProducts = userProducts.filter((item) => {
    if (!item) return false;
    const name = String(item.title || item.name || "").toLowerCase();
    const desc = String(item.description || "").toLowerCase();
    const cat = String(item.category || "");
    const q = String(searchQuery || "").toLowerCase();

    const matchesCat = selectedCategory === "All" || cat === selectedCategory;
    const matchesQ = name.includes(q) || desc.includes(q);
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

      {/* Top Running Marquee Ribbon */}
      <div className="bg-[#FF3B30] text-[#FFD600] font-heading font-black text-xs sm:text-sm uppercase py-2.5 overflow-hidden border-b-2 border-black tracking-wider">
        <div className="animate-marquee-left whitespace-nowrap flex gap-8 items-center">
          <span>SNITCH ARCHITECTURAL COMMERCE</span>
          <span className="text-white">✦</span>
          <span className="text-white">Live Creator Products</span>
          <span className="text-white">✦</span>
          <span>Authentic User Artifacts</span>
          <span className="text-white">✦</span>
          <span className="text-white">Direct Seller Marketplace</span>
          <span className="text-white">✦</span>
          <span>High-Velocity Commerce</span>
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
              STOREFRONT SYSTEM
            </span>
          </Link>

          {/* Vertical Stack of Colored Nav Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2.5">
            
            {/* 01 Blue Pill - Featured */}
            <button
              onClick={() => {
                const el = document.getElementById("featured-showcase");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="units-pill bg-[#1677FF] text-black font-heading font-extrabold p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between h-20 text-left border-2 border-black shadow-[2px_2px_0px_#000000]"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span>01</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-sm font-black leading-tight">Featured</span>
            </button>

            {/* 02 Green Pill - Catalog */}
            <button
              onClick={() => {
                const el = document.getElementById("catalog");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="units-pill bg-[#00C853] text-black font-heading font-extrabold p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between h-20 text-left border-2 border-black shadow-[2px_2px_0px_#000000]"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span>02</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-sm font-black leading-tight">All Products</span>
            </button>

            {/* 03 Orange Pill - Community */}
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
              <span className="text-sm font-black leading-tight">How We Think</span>
            </button>

            {/* 04 Yellow Pill - Seller Gateway */}
            {user?.role === "seller" ? (
              <Link
                to="/seller/create-product"
                className="units-pill bg-[#FFD600] text-black font-heading font-extrabold p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between h-20 text-left border-2 border-black shadow-[2px_2px_0px_#000000]"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span>04</span>
                  <PlusCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-black leading-tight">Add Product</span>
              </Link>
            ) : (
              <Link
                to="/seller/dashboard"
                className="units-pill bg-[#FFD600] text-black font-heading font-extrabold p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between h-20 text-left border-2 border-black shadow-[2px_2px_0px_#000000]"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span>04</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span className="text-sm font-black leading-tight">Become Seller</span>
              </Link>
            )}
          </div>

          {/* Book / Cart Lilac Pill */}
          <Link
            to="/cart"
            className="units-pill bg-[#C4A1FF] text-black font-heading font-black p-3.5 rounded-2xl text-center text-sm border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer hover:bg-black hover:text-white transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Your Cart</span>
            {totalItems > 0 && (
              <span className="w-5 h-5 bg-black text-white group-hover:bg-white group-hover:text-black text-xs rounded-full flex items-center justify-center font-mono font-bold">
                {totalItems}
              </span>
            )}
          </Link>

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
              <div className="bg-white border-2 border-black p-2.5 rounded-2xl text-center text-xs font-mono font-bold truncate">
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
          
          {/* Section 1: Featured Products Interactive Switcher */}
          <section id="featured-showcase" className="flex flex-col gap-4 units-anim">
            
            {/* Header Ribbon */}
            <div className="bg-[#FF5500] text-black font-heading font-black text-2xl sm:text-3xl py-4 px-6 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-between">
              <span className="text-[#1677FF] font-black">↓↓</span>
              <h2 className="tracking-tight uppercase">Featured Products</h2>
              <span className="text-[#1677FF] font-black">↓↓</span>
            </div>

            {/* Interactive Showcase Box */}
            {productsLoading ? (
              <div className="bg-white border-2 border-black rounded-[32px] p-8 shadow-[4px_4px_0px_#000000]">
                <CardSkeleton count={2} />
              </div>
            ) : userProducts.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-[32px] p-8 sm:p-12 shadow-[4px_4px_0px_#000000] text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-[#FFD600] border-2 border-black rounded-3xl p-4 flex items-center justify-center shadow-[3px_3px_0px_#000000] mb-4">
                  <Package className="w-10 h-10 text-black" />
                </div>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-black mb-2">
                  No Products Published Yet
                </h3>
                <p className="font-mono text-xs sm:text-sm text-black/70 max-w-md mb-6">
                  Sellers have not published any products to the storefront registry yet.
                </p>
                <Link
                  to={user ? "/seller/create-product" : "/login?redirect=/seller/create-product"}
                  className="px-6 py-3.5 rounded-full bg-[#00C853] text-black font-heading font-black text-sm border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>CREATE THE FIRST PRODUCT ↗</span>
                </Link>
              </div>
            ) : (
              <div className="bg-white border-2 border-black rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Column: Interactive Product Selection List */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="text-xs font-mono font-bold text-[#FF5500] uppercase tracking-wider mb-1">
                    SELECT A PRODUCT TO PREVIEW:
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {userProducts.slice(0, 5).map((prod) => {
                      const prodId = prod._id || prod.id;
                      const isSelected = selectedProduct && (selectedProduct._id || selectedProduct.id) === prodId;
                      const priceAmt = prod.price?.amount !== undefined ? prod.price.amount : (prod.priceAmount || 0);
                      const priceCurr = prod.price?.currency || prod.priceCurrency || "INR";

                      return (
                        <button
                          key={prodId}
                          onClick={() => setSelectedProductId(prodId)}
                          className={`w-full py-3.5 px-5 rounded-2xl border-2 border-black text-left flex items-center justify-between transition-all font-heading cursor-pointer ${
                            isSelected
                              ? "bg-black text-white shadow-[3px_3px_0px_#FF5500] scale-[1.01]"
                              : "bg-[#F5EBE6] text-black hover:bg-white"
                          }`}
                        >
                          <div className="min-w-0 flex-1 mr-3">
                            <div className="font-extrabold text-base truncate">{prod.title || prod.name}</div>
                            <div className={`text-xs font-mono font-bold ${isSelected ? "text-[#FFD600]" : "text-[#FF5500]"}`}>
                              {priceCurr} {Number(priceAmt).toLocaleString()}
                            </div>
                          </div>
                          <span className="text-lg font-bold font-mono">
                            {isSelected ? "→" : "↗"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions for Selected Product */}
                  {selectedProduct && (
                    <div className="flex gap-2 mt-3 pt-3 border-t-2 border-black/10">
                      <Link
                        to={`/product/${selectedProduct._id || selectedProduct.id}`}
                        className="flex-1 py-3 px-4 rounded-xl bg-white text-black font-heading font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-all text-center flex items-center justify-center gap-1"
                      >
                        <span>VIEW FULL DETAILS</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/product/${selectedProduct._id || selectedProduct.id}`}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#00E676] text-black font-heading font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{selectedProduct.variants && selectedProduct.variants.length > 0 ? "SELECT VARIANT / OPTION ↗" : "ADD TO CART ↗"}</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Right Column: Selected Product Image Gallery / Slider */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  {selectedProduct && (
                    <div className="h-[340px] sm:h-[400px] rounded-[24px] overflow-hidden border-2 border-black shadow-[3px_3px_0px_#000000] relative bg-[#FAF4F0]">
                      <Swiper
                        modules={[Navigation, Autoplay]}
                        navigation={true}
                        autoplay={{ delay: 4000 }}
                        className="h-full w-full"
                      >
                        {getProductImages(selectedProduct).map((imgUrl, idx) => (
                          <SwiperSlide key={idx} className="h-full w-full">
                            <img
                              src={imgUrl}
                              alt={selectedProduct.title || "Product"}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => navigate(`/product/${selectedProduct._id || selectedProduct.id}`)}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      
                      {/* Floating Product Badge */}
                      <Link
                        to={`/product/${selectedProduct._id || selectedProduct.id}`}
                        className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border-2 border-black p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 z-10 hover:bg-black hover:text-white transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-heading font-extrabold text-sm block truncate">
                            {selectedProduct.title || selectedProduct.name}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-black/60 truncate block">
                            Seller: {selectedProduct.seller?.username || selectedProduct.seller?.fullName || "Verified Seller"}
                          </span>
                        </div>
                        <span className="font-heading font-black text-sm text-[#FF5500] flex items-center gap-1">
                          <span>{selectedProduct.price?.currency || "INR"} {Number(selectedProduct.price?.amount || 0).toLocaleString()}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            )}

          </section>

          {/* Section 2: Complete User Products Catalog */}
          <section id="catalog" className="flex flex-col gap-6 mt-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
              <div>
                <span className="text-xs font-mono font-bold text-[#1677FF] uppercase tracking-widest">
                  STOREFRONT REGISTRY
                </span>
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-black">
                  All User Products ({userProducts.length})
                </h2>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 units-input text-xs font-mono w-full sm:w-64"
                />
              </div>
            </div>

            {/* Category Filter Pills (if any categories exist) */}
            {productCategories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {productCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full font-heading font-extrabold text-xs border-2 border-black transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-black text-white shadow-[2px_2px_0px_#FF5500]"
                        : "bg-white text-black hover:bg-[#F5EBE6]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {productsLoading ? (
              <CardSkeleton count={6} />
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-[32px] p-12 text-center shadow-[3px_3px_0px_#000000]">
                <Package className="w-12 h-12 mx-auto mb-3 text-black/40" />
                <h3 className="font-heading font-black text-xl mb-1">No products match your search</h3>
                <p className="font-mono text-xs text-black/60">Try searching for a different keyword or view all products.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => {
                  const prodId = prod._id || prod.id;
                  const prodTitle = prod.title || prod.name || "Product";
                  const prodPrice = `${prod.price?.currency || prod.priceCurrency || "INR"} ${Number(prod.price?.amount || prod.priceAmount || 0).toLocaleString()}`;
                  const prodDesc = prod.description || "Authentic Snitch product created by verified seller.";
                  const prodImg = getProductImage(prod);
                  const sellerName = prod.seller?.username || prod.seller?.fullName || "Verified Seller";

                  return (
                    <div
                      key={prodId}
                      className="bg-white border-2 border-black rounded-[28px] p-5 shadow-[3px_3px_0px_#000000] flex flex-col justify-between hover:translate-x-[1px] hover:translate-y-[1px] transition-all group"
                    >
                      <div>
                        <Link to={`/product/${prodId}`} className="block h-56 rounded-[20px] overflow-hidden border-2 border-black mb-4 relative bg-[#FAF5EE]">
                          <img
                            src={prodImg}
                            alt={prodTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full font-mono text-[10px] font-bold border border-black bg-[#1677FF] text-white shadow-[1px_1px_0px_#000000]">
                            {sellerName}
                          </span>
                        </Link>

                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-[#FF5500] uppercase tracking-wider">
                            {prod.category || "PRODUCT"}
                          </span>
                          {prod.variants && prod.variants.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-[#FFD600] border border-black font-mono text-[9px] font-bold">
                              {prod.variants.length} {prod.variants.length === 1 ? 'OPTION' : 'OPTIONS'}
                            </span>
                          )}
                        </div>

                        <Link to={`/product/${prodId}`} className="block">
                          <h3 className="font-heading font-black text-xl text-black mt-0.5 mb-1 hover:text-[#FF5500] transition-colors truncate">
                            {prodTitle}
                          </h3>
                        </Link>
                        <p className="text-xs font-semibold text-black/70 mb-4 line-clamp-2">{prodDesc}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t-2 border-black/10 gap-2">
                        <span className="font-heading font-black text-lg text-[#FF5500]">{prodPrice}</span>
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/product/${prodId}`}
                            className="px-3 py-2 rounded-xl bg-white text-black font-heading font-bold text-xs border border-black hover:bg-[#F5EBE6]"
                          >
                            View
                          </Link>
                          {prod.variants && prod.variants.length > 0 ? (
                            <Link
                              to={`/product/${prodId}`}
                              className="px-4 py-2 rounded-xl bg-[#00E676] text-black font-heading font-extrabold text-xs border border-black hover:bg-black hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>SELECT OPTION ↗</span>
                            </Link>
                          ) : (
                            <button
                              onClick={() => addToCart(prod)}
                              className="px-4 py-2 rounded-xl bg-black text-white font-heading font-extrabold text-xs hover:bg-[#00C853] hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>SELECT</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </section>

          {/* Section 3: "How We Think" Retro Pixel Art Canvas */}
          <section id="community" className="bg-[#FFB800] p-4 sm:p-5 rounded-[32px] border-2 border-black shadow-[4px_4px_0px_#000000]">
            <div className="bg-[#FF3B30] rounded-[24px] border-2 border-black p-8 sm:p-14 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
              
              {/* Retro Pixel Smiley Face SVG */}
              <svg className="w-36 h-36 sm:w-48 sm:h-48 text-[#C4A1FF] mb-4 opacity-90" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2h10v2H7V2zM5 4h2v2H5V4zM17 4h2v2h-2V4zM3 6h2v4H3V6zM19 6h2v4h-2V6zM1 10h2v4H1v-4zM21 10h2v4h-2v-4zM3 14h2v4H3v-4zM19 14h2v4h-2v-4zM5 18h2v2H5v-2zM17 18h2v2h-2v-2zM7 20h10v2H7v-2zM7 8h2v2H7V8zM15 8h2v2h-2V8zM7 14h2v2H7v-2zM9 16h6v2H9v-2zM15 14h2v2h-2v-2z" />
              </svg>

              <h2 className="font-heading font-black text-4xl sm:text-6xl tracking-tighter text-black uppercase">
                How we think
              </h2>
              <p className="font-mono font-bold text-sm sm:text-base text-white mt-2 max-w-lg">
                Creating radical commerce protocols and direct merchant artifacts for creators and independent sellers.
              </p>
            </div>
          </section>

          {/* Snitch Footer */}
          <footer className="mt-12 pt-8 pb-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between text-xs font-mono font-bold text-black gap-4">
            <div>© {new Date().getFullYear()} SNITCH COMMERCE SYSTEM. ALL RIGHTS RESERVED.</div>
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