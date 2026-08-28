import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  ShoppingBag,
  ArrowLeft,
  Plus,
  Trash2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Package,
  ArrowUpRight,
  LayoutDashboard
} from "lucide-react";
import { useLenis } from "../../../assets/useLenis";
import { useCart } from "../hook/useCart";
import gsap from "gsap";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80";

export default function Cart() {
  useLenis();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { cartItems, totalItems, isLoading, error, handleGetCart, handleAddToCart, handleRemoveFromCart } = useCart();
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    handleGetCart().catch(() => {});

    gsap.from(".cart-anim", {
      y: 25,
      opacity: 0,
      stagger: 0.08,
      duration: 0.7,
      ease: "power3.out",
      clearProps: "all"
    });
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isValidImg = (url) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("blob:")) return false;
    return true;
  };

  // Helper to get image safely, prioritizing the specific variant image
  const getItemImage = (item) => {
    const p = item.product || {};

    // 1. Normalize all top-level product images
    let rawImages = [];
    if (p.Images && p.Images.length > 0) {
      rawImages = p.Images.map((img) => (typeof img === "string" ? img : img?.url)).filter(isValidImg);
    } else if (p.images && p.images.length > 0) {
      rawImages = p.images.map((img) => (typeof img === "string" ? img : img?.url)).filter(isValidImg);
    } else if (isValidImg(p.image)) {
      rawImages = [p.image];
    }

    // 2. If item has a variant, find the variant index and variant-specific image
    if (item.variant !== undefined && item.variant !== null && Array.isArray(p.variants)) {
      const targetVar = String(item.variant);
      let vIdx = p.variants.findIndex((v, idx) =>
        (v._id && String(v._id) === targetVar) ||
        (v.id && String(v.id) === targetVar) ||
        String(idx) === targetVar ||
        targetVar === `variant-${idx}`
      );

      if (vIdx === -1 && !isNaN(Number(targetVar))) {
        const num = Number(targetVar);
        if (num >= 0 && num < p.variants.length) {
          vIdx = num;
        }
      }

      if (vIdx !== -1) {
        const matchedV = p.variants[vIdx];
        const vUrl = (matchedV?.images?.[0]?.url && isValidImg(matchedV.images[0].url) ? matchedV.images[0].url : null) ||
                     (typeof matchedV?.images?.[0] === "string" && isValidImg(matchedV.images[0]) ? matchedV.images[0] : null) ||
                     (matchedV?.Images?.[0]?.url && isValidImg(matchedV.Images[0].url) ? matchedV.Images[0].url : null) ||
                     (typeof matchedV?.image === "string" && isValidImg(matchedV.image) ? matchedV.image : null);

        if (vUrl) return vUrl;
        if (rawImages[vIdx]) return rawImages[vIdx];
      }
    }

    // 3. Fallback to first available product image
    if (rawImages.length > 0) return rawImages[0];
    return FALLBACK_IMG;
  };

  // Safe list of items
  const items = Array.isArray(cartItems) ? cartItems : [];

  // Calculate Subtotal
  const subtotal = items.reduce((acc, item) => {
    const price = item.price?.amount !== undefined
      ? Number(item.price.amount)
      : (Number(item.product?.price?.amount) || 0);
    return acc + price * (item.quantity || 1);
  }, 0);

  // Currency
  const currency = items[0]?.price?.currency || items[0]?.product?.price?.currency || "INR";

  // Handle increasing quantity (+1)
  const handleIncreaseQty = async (item) => {
    if (!user) {
      triggerToast("Please sign in to update your cart");
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent("/cart")}`);
      }, 700);
      return;
    }

    const prodId = item.product?._id || item.product?.id || item.product;
    const varId = item.variant?._id || item.variant?.id || item.variant || "default";

    if (!prodId) {
      triggerToast("Missing product info");
      return;
    }

    try {
      await handleAddToCart(prodId, varId, 1);
      triggerToast("Quantity updated (+1)");
    } catch (err) {
      triggerToast(err.message || "Failed to update quantity");
    }
  };

  // Handle removing item completely
  const handleRemoveItem = async (item) => {
    if (!user) {
      triggerToast("Please sign in to update your cart");
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent("/cart")}`);
      }, 700);
      return;
    }

    const itemId = item._id;
    const prodId = item.product?._id || item.product?.id || item.product;
    const varId = item.variant?._id || item.variant?.id || item.variant;

    try {
      await handleRemoveFromCart(itemId, prodId, varId);
      triggerToast("Item removed from cart");
    } catch (err) {
      triggerToast(err.message || "Failed to remove item");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      triggerToast("Please sign in to proceed with checkout");
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent("/cart")}`);
      }, 700);
      return;
    }

    const currentUserId = user._id?.toString() || user.id?.toString();
    const hasOwnItems = items.some((item) => {
      const sellerId = item.product?.seller?._id?.toString() || item.product?.seller?.toString() || item.product?.seller;
      return sellerId && String(sellerId) === String(currentUserId);
    });

    if (hasOwnItems) {
      triggerToast("Your cart contains products you listed. Please remove them to checkout.");
      return;
    }

    triggerToast("Order placed successfully with Snitch!");
  };

  return (
    <div className="min-h-screen bg-[#F5EBE6] text-black font-body selection:bg-[#FF5500] selection:text-white relative p-4 sm:p-6 lg:p-8">
      
      {/* Interactive Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white animate-bounce font-heading font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation Bar */}
      <header className="max-w-[1600px] mx-auto mb-6 cart-anim">
        <div className="bg-white border-2 border-black rounded-[28px] p-4 sm:p-5 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Storefront Link */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
            <Link to="/" className="group flex items-baseline gap-1">
              <span className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-black">
                snitch<span className="text-[#FF5500]">.</span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-black/60 uppercase ml-2 hidden sm:inline-block">
                CART REGISTER
              </span>
            </Link>

            <Link
              to="/"
              className="px-4 py-2 rounded-full bg-[#F5EBE6] text-black font-heading font-extrabold text-xs border-2 border-black hover:bg-black hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>STOREFRONT</span>
            </Link>
          </div>

          {/* Center Badges */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="px-4 py-2 rounded-full bg-[#1677FF] text-white border-2 border-black font-heading font-extrabold text-xs shadow-[2px_2px_0px_#000000] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"} IN CART</span>
            </div>

            <div className="px-4 py-2 rounded-full bg-[#00C853] text-black border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_#000000] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>VERIFIED CHECKOUT</span>
            </div>
          </div>

          {/* User Status */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {user ? (
              user.role === "seller" ? (
                <Link
                  to="/seller/dashboard"
                  className="px-4 py-2 rounded-full bg-[#FFD600] text-black font-heading font-extrabold text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>SELLER TERMINAL</span>
                </Link>
              ) : (
                <div className="px-4 py-2 rounded-full bg-[#F5EBE6] text-black font-mono font-bold text-xs border-2 border-black truncate max-w-[180px]">
                  {user.fullName || user.email}
                </div>
              )
            ) : (
              <Link
                to="/login?redirect=/cart"
                className="px-4 py-2 rounded-full bg-black text-white font-mono font-bold text-xs border-2 border-black hover:bg-[#FF5500] transition-colors"
              >
                SIGN IN
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Main Cart Canvas */}
      <main className="max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* Banner */}
        <div className="cart-anim bg-[#FF5500] text-black p-6 sm:p-8 rounded-[32px] border-2 border-black shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">SHOPPING REGISTER</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black text-white">ACTIVE</span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl text-black tracking-tight">
              Your Selection Cart
            </h1>
            <p className="font-mono text-xs sm:text-sm text-black/80 font-bold mt-1">
              Review your items and proceed with your order.
            </p>
          </div>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items List (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-6 cart-anim">
            
            <div className="bg-white border-2 border-black rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              
              {/* Header inside Card */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <h2 className="font-heading font-black text-2xl text-black">Cart Items</h2>
                  <span className="px-3 py-1 rounded-full bg-[#FFD600] border border-black font-mono text-xs font-black">
                    {totalItems} {totalItems === 1 ? "Item" : "Items"}
                  </span>
                </div>
              </div>

              {/* Items List or Empty State */}
              {isLoading && items.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 border-4 border-black border-t-[#FF5500] rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-heading font-bold text-base">Fetching your cart...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="py-12 sm:py-16 text-center flex flex-col items-center">
                  <div className="w-24 h-24 mb-6 bg-[#C4A1FF] border-2 border-black rounded-3xl p-5 flex items-center justify-center shadow-[4px_4px_0px_#000000] rotate-[-4deg]">
                    <ShoppingBag className="w-12 h-12 text-black" />
                  </div>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-black mb-2">
                    Your Cart is Empty
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-black/70 max-w-md mb-8 leading-relaxed">
                    Explore products and artifacts created by sellers in the storefront catalog.
                  </p>
                  
                  <Link
                    to="/"
                    className="px-8 py-4 rounded-full bg-[#00C853] text-black font-heading font-black text-sm border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
                  >
                    <span>BROWSE STOREFRONT ↗</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, idx) => {
                    const productObj = item.product || {};
                    const title = productObj.title || productObj.name || "Product";
                    const itemImg = getItemImage(item);
                    const priceAmount = item.price?.amount !== undefined ? Number(item.price.amount) : (Number(productObj.price?.amount) || 0);
                    const priceCurr = item.price?.currency || productObj.price?.currency || currency;
                    const itemKey = item._id || idx;
                    const productId = productObj._id || productObj.id;

                    // Extract variant details if available
                    let variantLabel = null;
                    if (item.variant !== undefined && item.variant !== null && Array.isArray(productObj.variants)) {
                      const targetVar = String(item.variant);
                      let matchedV = productObj.variants.find((v, vIdx) =>
                        (v._id && String(v._id) === targetVar) ||
                        (v.id && String(v.id) === targetVar) ||
                        String(vIdx) === targetVar ||
                        targetVar === `variant-${vIdx}`
                      );
                      if (!matchedV && !isNaN(Number(targetVar))) {
                        matchedV = productObj.variants[Number(targetVar)];
                      }
                      if (matchedV?.attributes) {
                        const attrs = matchedV.attributes instanceof Map ? Array.from(matchedV.attributes.entries()) : Object.entries(matchedV.attributes);
                        variantLabel = attrs.map(([k, v]) => `${k}: ${v}`).join(" • ");
                      }
                    }

                    return (
                      <div
                        key={itemKey}
                        className="p-4 sm:p-5 rounded-[24px] bg-[#F5EBE6] border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group hover:bg-[#FAF4F0] transition-all"
                      >
                        {/* Image & Title */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <Link
                            to={productId ? `/product/${productId}` : "#"}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-black flex-shrink-0 bg-white shadow-[2px_2px_0px_#000000]"
                          >
                            <img
                              src={itemImg}
                              alt={title}
                              onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="text-[10px] font-mono font-black text-[#FF5500] uppercase tracking-wider">
                                {productObj.category || "PRODUCT"}
                              </span>
                              {user && (String(user._id || user.id) === String(productObj.seller?._id || productObj.seller?.id || productObj.seller)) && (
                                <span className="px-2 py-0.5 rounded-full bg-[#FF3B30] text-white font-mono text-[9px] font-black uppercase border border-black">
                                  YOUR LISTING - CANNOT BUY
                                </span>
                              )}
                            </div>

                            <Link
                              to={productId ? `/product/${productId}` : "#"}
                              className="font-heading font-black text-lg sm:text-xl text-black hover:text-[#1677FF] transition-colors truncate block"
                            >
                              {title}
                            </Link>

                            {/* Variant Spec Tag */}
                            {variantLabel && (
                              <div className="text-[11px] font-mono font-bold text-black/70 mt-0.5">
                                <span className="text-black/50">Option:</span> {variantLabel}
                              </div>
                            )}

                            {/* Unit Price */}
                            <div className="mt-1 flex items-center gap-2 flex-wrap font-mono text-xs font-bold text-black/80">
                              <span>{priceCurr} {priceAmount.toLocaleString()} each</span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity, Item Total & Remove Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t-2 sm:border-t-0 border-black/10">
                          
                          {/* Quantity Box with Add Stepper */}
                          <div className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-3 py-1.5 shadow-[2px_2px_0px_#000000]">
                            <span className="font-mono text-xs font-bold text-black/70 pl-1">Qty:</span>
                            <span className="font-mono font-black text-sm px-1 text-center">{item.quantity || 1}</span>
                            <button
                              onClick={() => handleIncreaseQty(item)}
                              disabled={isLoading}
                              className="p-1 hover:text-[#FF5500] transition-colors cursor-pointer disabled:opacity-40"
                              title="Add one more"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[90px]">
                            <span className="text-[9px] font-mono font-bold text-black/60 block uppercase">ITEM TOTAL</span>
                            <span className="font-heading font-black text-lg sm:text-xl text-[#FF5500]">
                              {priceCurr} {(priceAmount * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>

                          {/* Remove Item Button */}
                          <button
                            onClick={() => handleRemoveItem(item)}
                            disabled={isLoading}
                            className="p-2.5 rounded-xl bg-white border-2 border-black hover:bg-red-600 hover:text-white transition-colors cursor-pointer text-black shadow-[2px_2px_0px_#000000] disabled:opacity-40"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Order Summary (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6 cart-anim sticky top-6">
            
            <div className="bg-white border-2 border-black rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-black">
                <h3 className="font-heading font-black text-2xl text-black">
                  Order Summary
                </h3>
                <span className="font-mono text-xs font-bold text-black/70">
                  {totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"}
                </span>
              </div>

              {/* Price Calculation Rows */}
              <div className="space-y-3.5 font-mono text-xs mb-6">
                <div className="flex items-center justify-between text-black/80">
                  <span>ITEMS SUBTOTAL</span>
                  <span className="font-bold text-black">{currency} {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-black/80">
                  <span>SHIPPING</span>
                  <span className="font-bold text-[#00C853] bg-[#00C853]/10 px-2 py-0.5 rounded border border-[#00C853]/30">FREE</span>
                </div>
              </div>

              {/* Grand Total Box */}
              <div className="bg-[#F5EBE6] p-5 rounded-2xl border-2 border-black mb-6 flex items-baseline justify-between shadow-[2px_2px_0px_#000000]">
                <div>
                  <span className="text-[10px] font-mono font-black text-black/70 uppercase block">TOTAL AMOUNT</span>
                  <span className="font-heading font-black text-3xl sm:text-4xl text-[#FF5500]">
                    {currency} {subtotal.toLocaleString()}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-black text-black bg-[#FFD600] px-3 py-1 rounded-full border border-black">
                  {totalItems} ITEMS
                </span>
              </div>

              {/* Checkout Action */}
              <button
                disabled={items.length === 0}
                onClick={handleCheckout}
                className="w-full py-4 rounded-full bg-[#00C853] text-black font-heading font-black text-base border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>PROCEED TO CHECKOUT ↗</span>
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
