import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
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
  Share2,
  Layers,
  Sliders,
  Check,
  Edit3
} from "lucide-react";
import { useLenis } from "../../../assets/useLenis";
import { useProduct } from "../hook/useProduct";
import { useCart } from "../../cart/hook/useCart";
import gsap from "gsap";
import BuyerLoader from "../../../Components/loaders/BuyerLoader.jsx";

const FALLBACK_DEFAULT_IMG = "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80";

export default function ProductDetails() {
  useLenis();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { handleGetSingleProduct } = useProduct();
  const { totalItems, handleAddToCart: addProductToCart } = useCart();

  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await handleGetSingleProduct(id);
        if (res && res.product) {
          setProduct(res.product);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.warn("API product fetch error:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && product) {
      const targets = document.querySelectorAll(".detail-anim");
      if (targets.length > 0) {
        gsap.from(targets, {
          y: 25,
          opacity: 0,
          stagger: 0.08,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "all"
        });
      }
    }
  }, [loading, product]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return <BuyerLoader duration={0.8} />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5EBE6] text-black font-body flex items-center justify-center p-6">
        <div className="bg-white border-2 border-black rounded-[32px] p-8 sm:p-12 shadow-[6px_6px_0px_#000000] text-center max-w-md">
          <div className="w-16 h-16 bg-[#FF5500] border-2 border-black rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-mono text-2xl font-black shadow-[2px_2px_0px_#000000]">
            ✕
          </div>
          <h2 className="font-heading font-black text-2xl mb-2">Product Not Found</h2>
          <p className="font-mono text-xs text-black/70 mb-6">
            The requested product is unavailable or has been removed.
          </p>
          <Link
            to="/"
            className="px-6 py-3 rounded-full bg-black text-white font-heading font-black text-xs border-2 border-black hover:bg-[#FF5500] transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO STOREFRONT</span>
          </Link>
        </div>
      </div>
    );
  }

  const title = product.title || product.name || "Snitch Product Unit";
  const category = product.category || "Living Units";
  const description = product.description || "Authentic Snitch architectural artifact engineered with high-velocity precision.";
  const basePriceAmount = product.price?.amount || product.priceAmount || 0;
  const basePriceCurrency = product.price?.currency || product.priceCurrency || "INR";
  const baseStock = product.stock ?? product.stockQuantity ?? 10;

  // Normalize Product Images safely
  const rawImages = (product.Images && product.Images.length > 0)
    ? product.Images.map((img) => typeof img === "string" ? img : img.url).filter(Boolean)
    : (product.images && product.images.length > 0)
    ? product.images.map((img) => typeof img === "string" ? img : img.url).filter(Boolean)
    : [FALLBACK_DEFAULT_IMG];

  const isValidImg = (url) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("blob:")) return false;
    return true;
  };

  // Normalize Variants Array
  const rawVariants = Array.isArray(product.variants)
    ? product.variants
    : (product.variants ? [product.variants] : []);

  const normalizedVariants = rawVariants.map((v, idx) => {
    let attrs = [];
    if (Array.isArray(v.attributes)) {
      attrs = v.attributes;
    } else if (v.attributes instanceof Map) {
      attrs = Array.from(v.attributes.entries()).map(([k, val]) => ({ key: k, val }));
    } else if (v.attributes && typeof v.attributes === "object") {
      attrs = Object.entries(v.attributes).map(([k, val]) => ({ key: k, val }));
    }

    const vPrice = v.prices?.amount !== undefined ? v.prices.amount : (v.priceAmount !== undefined ? v.priceAmount : basePriceAmount);
    const vCurr = v.prices?.currency || v.priceCurrency || basePriceCurrency;
    const vStock = v.stock !== undefined ? v.stock : baseStock;

    // Pick valid image, ensuring blob: URLs are discarded so all variants get a clean, working thumbnail
    const vImgRaw = v.images?.[0]?.url ||
      (typeof v.images?.[0] === "string" ? v.images[0] : null) ||
      v.Images?.[0]?.url ||
      (typeof v.Images?.[0] === "string" ? v.Images[0] : null) ||
      (typeof v.image === "string" ? v.image : v.image?.url);

    const vImg = (isValidImg(vImgRaw) ? vImgRaw : null) ||
      (rawImages[idx] || rawImages[0] || FALLBACK_DEFAULT_IMG);

    const variantId = v._id ? String(v._id) : (v.id ? String(v.id) : String(idx));

    return {
      id: variantId,
      _id: variantId,
      label: attrs.map((a) => `${a.key ? a.key + ": " : ""}${a.val}`).filter(Boolean).join(" • ") || `Variant #${idx + 1}`,
      shortLabel: attrs.map((a) => a.val || a.key).filter(Boolean).join(" / ") || `Option #${idx + 1}`,
      attributes: attrs,
      priceAmount: vPrice,
      priceCurrency: vCurr,
      stock: vStock,
      image: vImg
    };
  });

  const hasVariants = normalizedVariants.length > 0;
  const activeVariant = hasVariants ? normalizedVariants[selectedVariantIdx] : null;

  // Active Price, Stock & Image based on Variant
  const currentPrice = activeVariant ? activeVariant.priceAmount : basePriceAmount;
  const currentCurrency = activeVariant ? activeVariant.priceCurrency : basePriceCurrency;
  const currentStock = activeVariant ? activeVariant.stock : baseStock;

  // Primary display image: prioritized by active variant photo or selected thumbnail
  const displayImage =
    (activeVariant?.image && !activeVariant.image.startsWith("blob:") ? activeVariant.image : null) ||
    rawImages[activeImageIdx] ||
    rawImages[0] ||
    FALLBACK_DEFAULT_IMG;

  const handleSelectVariant = (idx) => {
    setSelectedVariantIdx(idx);
    const v = normalizedVariants[idx];
    if (v) {
      if (v.image && rawImages.includes(v.image)) {
        setActiveImageIdx(rawImages.indexOf(v.image));
      } else if (rawImages[idx]) {
        setActiveImageIdx(idx);
      }
    }
  };

  const handleSelectThumbnail = (idx) => {
    setActiveImageIdx(idx);
    const clickedImg = rawImages[idx];
    const matchingVarIdx = normalizedVariants.findIndex((v) => v.image === clickedImg);
    if (matchingVarIdx !== -1) {
      setSelectedVariantIdx(matchingVarIdx);
    } else if (idx < normalizedVariants.length) {
      setSelectedVariantIdx(idx);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      triggerToast("Please sign in to add items to your cart");
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent(`/product/${id}`)}`);
      }, 700);
      return;
    }

    if (user && product?.seller && (String(user._id || user.id) === String(product.seller._id || product.seller.id || product.seller))) {
      triggerToast("You cannot purchase your own listed product.");
      return;
    }

    if (hasVariants && !activeVariant) {
      triggerToast("Please select a variant option first");
      return;
    }

    try {
      const prodId = product._id || product.id;
      const varId = hasVariants
        ? (activeVariant.id || activeVariant._id || String(selectedVariantIdx))
        : "default";
      await addProductToCart(prodId, varId, quantity);
      const varName = activeVariant ? `${title} (${activeVariant.shortLabel})` : title;
      triggerToast(`Added ${quantity}x "${varName}" to your cart!`);
    } catch (err) {
      triggerToast(err.response?.data?.message || err.message || "Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EBE6] text-black font-body selection:bg-[#FF5500] selection:text-white relative p-4 sm:p-6 lg:p-8">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white animate-bounce font-heading font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
          <span>{toastMessage}</span>
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

          {/* Direct Link to Cart Page */}
          <Link
            to="/cart"
            className="units-pill bg-[#C4A1FF] text-black font-heading font-black p-3.5 rounded-2xl text-center text-sm border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer hover:bg-black hover:text-white transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Cart</span>
            {totalItems > 0 && (
              <span className="w-5 h-5 bg-black text-white group-hover:bg-white group-hover:text-black text-xs rounded-full flex items-center justify-center font-mono font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Edit Product Action if Current User is the Seller */}
          {user && product?.seller && (String(user._id || user.id) === String(product.seller._id || product.seller.id || product.seller)) && (
            <Link
              to={`/seller/edit-product/${id}`}
              className="units-pill bg-[#FFD600] text-black font-heading font-extrabold p-3.5 rounded-2xl text-center text-xs border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer hover:bg-black hover:text-white transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>EDIT UNIT</span>
            </Link>
          )}
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

            <div className="flex items-center gap-2">
              {user && product?.seller && (String(user._id || user.id) === String(product.seller._id || product.seller.id || product.seller)) && (
                <Link
                  to={`/seller/edit-product/${id}`}
                  className="px-3 py-1 rounded-full font-mono text-[10px] font-bold bg-[#FFD600] text-black border border-black hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>EDIT</span>
                </Link>
              )}
              <span className="px-3 py-1 rounded-full font-mono text-[10px] font-bold bg-[#00C853] text-black border border-black">
                {currentStock} UNITS IN STOCK
              </span>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Image Gallery (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-4 detail-anim">
              
              {/* Primary Image Viewport */}
              <div className="h-[380px] sm:h-[480px] rounded-[32px] overflow-hidden border-2 border-black shadow-[4px_4px_0px_#000000] relative bg-white">
                <img
                  src={displayImage}
                  alt={title}
                  onError={(e) => { e.currentTarget.src = rawImages[0] || FALLBACK_DEFAULT_IMG; }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1.5 rounded-full font-mono text-xs font-bold border border-white">
                  AUTHENTICATED UNIT
                </div>
              </div>

              {/* Thumbnails Bar with Adequate Padding & Non-Clipping Container */}
              {rawImages.length > 1 && (
                <div className="p-2.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-3 overflow-x-auto">
                  {rawImages.map((imgUrl, idx) => {
                    const isSelected = activeImageIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectThumbnail(idx)}
                        className={`w-24 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer p-0.5 ${
                          isSelected
                            ? "border-black bg-[#FF5500] shadow-[2px_2px_0px_#000000]"
                            : "border-black/30 opacity-70 hover:opacity-100 bg-white"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          onError={(e) => { e.currentTarget.src = FALLBACK_DEFAULT_IMG; }}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Bento Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
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
                      <span className="text-[10px] font-mono font-bold text-black/70 block uppercase">PRICE</span>
                      <span className="font-heading font-black text-3xl text-[#FF5500]">
                        {currentCurrency} {Number(currentPrice).toLocaleString()}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-black bg-[#FFD600] px-3 py-1 rounded-full border border-black">
                      {currentStock > 0 ? `${currentStock} IN STOCK` : "OUT OF STOCK"}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-black/80 leading-relaxed mb-6">
                    {description}
                  </p>

                  {/* Dynamic Interactive Product Variants Selector */}
                  {hasVariants && (
                    <div className="mb-6 p-4 rounded-2xl bg-[#F5EBE6] border-2 border-black">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-heading font-black text-xs text-black uppercase flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-[#1677FF]" />
                          <span>SELECT VARIANT / OPTION:</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#FF5500]">
                          {normalizedVariants.length} Options Available
                        </span>
                      </div>

                      {/* Variant Option Pills with Visual Image Preview */}
                      <div className="flex flex-wrap gap-2">
                        {normalizedVariants.map((v, idx) => {
                          const isSelected = selectedVariantIdx === idx;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleSelectVariant(idx)}
                              className={`px-3.5 py-2.5 rounded-xl font-heading font-extrabold text-xs border-2 border-black transition-all flex items-center gap-2.5 cursor-pointer ${
                                isSelected
                                  ? "bg-black text-white shadow-[2px_2px_0px_#FF5500] scale-[1.02]"
                                  : "bg-white text-black hover:bg-black/5"
                              }`}
                            >
                              {v.image && (
                                <img
                                  src={v.image}
                                  alt={v.shortLabel}
                                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                                  className="w-6 h-6 rounded-lg object-cover border border-black flex-shrink-0 bg-white"
                                />
                              )}
                              <span>{v.shortLabel}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#00E676] ml-auto" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Variant Attributes Breakdown */}
                      {activeVariant && activeVariant.attributes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-black/10 flex flex-wrap gap-2">
                          {activeVariant.attributes.map((attr, aIdx) => (
                            <span
                              key={aIdx}
                              className="px-2.5 py-1 rounded-lg bg-white border border-black/30 font-mono text-[10px] font-bold text-black"
                            >
                              <span className="text-black/60">{attr.key}:</span> {attr.val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity / Inventory Stock & Actions */}
                  <div className="space-y-4 pt-4 border-t-2 border-black/10">
                    {user && product?.seller && (String(user._id || user.id) === String(product.seller._id || product.seller.id || product.seller)) ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3.5 bg-[#F5EBE6] border-2 border-black rounded-2xl">
                          <span className="font-mono text-xs font-bold text-black uppercase">CURRENT INVENTORY STOCK:</span>
                          <span className="font-mono font-black text-sm px-3 py-1 bg-[#FFB800] text-black border border-black rounded-full">
                            {currentStock} UNITS
                          </span>
                        </div>

                        <div className="p-3.5 bg-[#FFB800]/20 border-2 border-black rounded-2xl text-center font-mono text-xs font-bold text-black flex items-center justify-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
                          <span>YOU ARE THE SELLER OF THIS PRODUCT</span>
                        </div>

                        <Link
                          to={`/seller/edit-product/${id}`}
                          className="w-full py-4 rounded-full bg-[#FFD600] text-black font-heading font-black text-base border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Edit3 className="w-5 h-5" />
                          <span>EDIT YOUR LISTED UNIT ↗</span>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-black uppercase">SELECT QUANTITY:</span>
                          <div className="flex items-center gap-3 bg-[#F5EBE6] border-2 border-black rounded-full px-3 py-1">
                            <button
                              type="button"
                              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                              className="p-1 hover:text-[#FF5500] transition-colors cursor-pointer"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-mono font-black text-sm w-6 text-center">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => setQuantity((q) => Math.min(currentStock || 10, q + 1))}
                              className="p-1 hover:text-[#FF5500] transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="w-full py-4 rounded-full bg-[#00E676] text-black font-heading font-black text-base border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-5 h-5" />
                          <span>{hasVariants ? `SELECT ${activeVariant?.shortLabel.toUpperCase()} ↗` : "BOOK THIS UNIT / ADD TO SELECTION ↗"}</span>
                        </button>
                      </>
                    )}
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
