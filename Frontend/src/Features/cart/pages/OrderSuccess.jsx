import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Copy,
  Check,
  Printer,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  CreditCard,
  AlertCircle,
  Home,
  PartyPopper,
  ReceiptText
} from "lucide-react";
import gsap from "gsap";
import { useLenis } from "../../../assets/useLenis";
import { getOrderDetailsAPI } from "../service/cart.api";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80";

const OrderSuccess = () => {
  useLenis();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdFromQuery = searchParams.get("order_id");

  const authUser = useSelector((state) => state.auth.user);

  const [order, setOrder] = useState(location.state?.payment || null);
  const [loading, setLoading] = useState(!location.state?.payment && !!orderIdFromQuery);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const activeOrderId = orderIdFromQuery || order?.razorpay?.orderId || location.state?.orderId || "N/A";
  const activePaymentId = order?.razorpay?.paymentId || location.state?.paymentId || "N/A";

  // Fetch order from backend if not matching current order or if no order
  useEffect(() => {
    if (orderIdFromQuery) {
      const isAlreadyMatching =
        order &&
        (order.razorpay?.orderId === orderIdFromQuery ||
         order._id === orderIdFromQuery);

      if (!isAlreadyMatching) {
        setLoading(true);
        getOrderDetailsAPI(orderIdFromQuery)
          .then((data) => {
            if (data.success && data.order) {
              setOrder(data.order);
            } else {
              setError("Unable to find order details.");
            }
          })
          .catch((err) => {
            console.warn("Order details fetch error:", err);
            setError(err.response?.data?.message || "Unable to load full receipt details.");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [orderIdFromQuery, order]);

  // Entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".success-anim", {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "all",
      });

      gsap.from(".badge-bounce", {
        scale: 0.5,
        rotation: -10,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        clearProps: "all",
      });
    });

    return () => ctx.revert();
  }, [loading]);

  const handleCopy = (text, field) => {
    if (!text || text === "N/A") return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isValidImg = (url) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("blob:")) return false;
    return true;
  };

  // Helper for safe product image, prioritizing the specific variant image
  const getItemImage = (item) => {
    const p = item?.productId;
    const varId = item?.variantId || item?.variant;

    // 1. If this item has a specific variant, prioritize finding the variant-specific image
    if (varId && varId !== "default") {
      const targetVar = String(varId);

      // Check if product object has variants
      if (p && typeof p === "object") {
        // If p.variants is already a single matched object
        if (p.variants && !Array.isArray(p.variants)) {
          const v = p.variants;
          const vUrl = (v.images?.[0]?.url && isValidImg(v.images[0].url) ? v.images[0].url : null) ||
                       (typeof v.images?.[0] === "string" && isValidImg(v.images[0]) ? v.images[0] : null) ||
                       (v.Images?.[0]?.url && isValidImg(v.Images[0].url) ? v.Images[0].url : null) ||
                       (typeof v.image === "string" && isValidImg(v.image) ? v.image : null);
          if (vUrl) return vUrl;
        }

        const variantsList = Array.isArray(p.variants)
          ? p.variants
          : (Array.isArray(p.allVariants) ? p.allVariants : []);

        if (variantsList.length > 0) {
          let vIdx = variantsList.findIndex((v, idx) =>
            (v._id && String(v._id) === targetVar) ||
            (v.id && String(v.id) === targetVar) ||
            String(idx) === targetVar ||
            targetVar === `variant-${idx}`
          );

          if (vIdx === -1 && !isNaN(Number(targetVar))) {
            const num = Number(targetVar);
            if (num >= 0 && num < variantsList.length) {
              vIdx = num;
            }
          }

          if (vIdx !== -1) {
            const matchedV = variantsList[vIdx];
            const vUrl =
              (matchedV?.images?.[0]?.url && isValidImg(matchedV.images[0].url) ? matchedV.images[0].url : null) ||
              (typeof matchedV?.images?.[0] === "string" && isValidImg(matchedV.images[0]) ? matchedV.images[0] : null) ||
              (matchedV?.Images?.[0]?.url && isValidImg(matchedV.Images[0].url) ? matchedV.Images[0].url : null) ||
              (typeof matchedV?.image === "string" && isValidImg(matchedV.image) ? matchedV.image : null) ||
              (matchedV?.previewUrl && isValidImg(matchedV.previewUrl) ? matchedV.previewUrl : null);

            if (vUrl) return vUrl;

            // Check if product has an image at variant index
            const rawPImages = (p.images || p.Images || []).map((img) =>
              typeof img === "string" ? img : img?.url
            ).filter(isValidImg);

            if (vIdx < rawPImages.length && rawPImages[vIdx]) {
              return rawPImages[vIdx];
            }
          }
        }
      }
    }

    // 2. Check item's direct images (from orderItems)
    if (item?.images && item.images.length > 0) {
      const url = typeof item.images[0] === "string" ? item.images[0] : item.images[0]?.url;
      if (isValidImg(url)) return url;
    }

    // 3. Fallback to top-level product images
    if (p && typeof p === "object") {
      if (p.images && p.images.length > 0) {
        const url = typeof p.images[0] === "string" ? p.images[0] : p.images[0]?.url;
        if (isValidImg(url)) return url;
      }
      if (p.Images && p.Images.length > 0) {
        const url = typeof p.Images[0] === "string" ? p.Images[0] : p.Images[0]?.url;
        if (isValidImg(url)) return url;
      }
      if (isValidImg(p.image)) return p.image;
    }

    return FALLBACK_IMG;
  };

  // Format order date
  const orderDate = new Date(order?.createdAt || Date.now()).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate delivery date estimate (4 days from now)
  const deliveryEstimate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const orderItems = Array.isArray(order?.orderItems) ? order.orderItems : [];
  const totalAmount = order?.price?.amount || 0;
  const currency = order?.price?.currency || "INR";

  const status = order?.status || "pending";
  const isPaid = status === "paid";
  const isPending = status === "pending";
  const isFailed = status === "failed";

  const statusTheme = {
    paid: {
      headerSubtitle: "CHECKOUT COMPLETE",
      headerPillBg: "bg-[#00C853] text-black",
      headerPillText: "PAYMENT SECURED & VERIFIED",
      headerPillIcon: <ShieldCheck className="w-4 h-4" />,
      bannerBg: "bg-[#00C853] text-black",
      stickerLabel: "OFFICIAL SNITCH RECEIPT",
      stickerIcon: <PartyPopper className="w-4 h-4 text-[#FF5500]" />,
      badgeBg: "bg-black text-[#00C853]",
      badgeIcon: <CheckCircle2 className="w-4 h-4" />,
      badgeLabel: "Order Confirmed & Paid",
      heroTitle: "Thank You For Your Order!",
      heroSubtitle: "We've received your payment and are getting your order ready. A confirmation notice has been registered with your account.",
      statusPill: "bg-[#00C853] text-black",
      statusLabel: "PAID",
      statusIcon: <CheckCircle2 className="w-3.5 h-3.5" />,
      totalLabel: "TOTAL AMOUNT PAID",
      totalTag: "SUCCESS",
      totalTagBg: "bg-[#FFD600] text-black",
      timelineDelivery: deliveryEstimate,
      timelineDeliveryPrefix: "ESTIMATED DELIVERY:",
      step1Class: "bg-[#00C853]/15 border-2 border-black shadow-[3px_3px_0px_#000000]",
      step1Pill: "bg-[#00C853] text-black",
      step1Icon: <CheckCircle2 className="w-5 h-5 text-[#00C853]" />,
      step1Title: "Payment Confirmed",
      step1Desc: "Transaction authenticated & stock reserved.",
      step2Class: "bg-[#FFD600]/30 border-2 border-black shadow-[3px_3px_0px_#000000]",
      step2Pill: "bg-[#FFD600] text-black",
      step2Ping: true,
      step2Desc: "Inspecting fabric & packaging your pieces.",
      dispatchNote: "Doorstep delivery within 3 - 5 business days.",
      guaranteeText: "Free Return & Exchange Window Active",
      guaranteeIcon: <ShieldCheck className="w-4 h-4 text-[#00C853]" />,
    },
    pending: {
      headerSubtitle: "ORDER REGISTERED (PENDING)",
      headerPillBg: "bg-[#FFD600] text-black",
      headerPillText: "AWAITING PAYMENT CONFIRMATION",
      headerPillIcon: <Clock className="w-4 h-4" />,
      bannerBg: "bg-[#FFD600] text-black",
      stickerLabel: "PENDING VERIFICATION",
      stickerIcon: <Clock className="w-4 h-4 text-black" />,
      badgeBg: "bg-black text-[#FFD600]",
      badgeIcon: <Clock className="w-4 h-4" />,
      badgeLabel: "Order Payment Pending",
      heroTitle: "Order Awaiting Payment",
      heroSubtitle: "This order is registered in our records, but payment confirmation is pending from Razorpay. Once verified, it will enter fulfillment.",
      statusPill: "bg-[#FFD600] text-black",
      statusLabel: "PENDING",
      statusIcon: <Clock className="w-3.5 h-3.5" />,
      totalLabel: "TOTAL AMOUNT DUE",
      totalTag: "PENDING",
      totalTagBg: "bg-black text-[#FFD600]",
      timelineDelivery: "Pending Verification",
      timelineDeliveryPrefix: "DISPATCH STATUS:",
      step1Class: "bg-[#FFD600]/30 border-2 border-black shadow-[3px_3px_0px_#000000]",
      step1Pill: "bg-[#FFD600] text-black",
      step1Icon: <Clock className="w-5 h-5 text-black" />,
      step1Title: "Awaiting Payment",
      step1Desc: "Payment verification pending with gateway.",
      step2Class: "bg-[#F5EBE6] border-2 border-black/30 opacity-75",
      step2Pill: "bg-black/10 text-black",
      step2Ping: false,
      step2Desc: "Will begin as soon as payment is confirmed.",
      dispatchNote: "Fulfillment will start immediately upon payment verification.",
      guaranteeText: "Inventory reserved pending payment",
      guaranteeIcon: <Clock className="w-4 h-4 text-[#FF5500]" />,
    },
    failed: {
      headerSubtitle: "PAYMENT INCOMPLETE",
      headerPillBg: "bg-[#FF3B30] text-white",
      headerPillText: "PAYMENT VERIFICATION FAILED",
      headerPillIcon: <AlertCircle className="w-4 h-4" />,
      bannerBg: "bg-[#FF3B30] text-white",
      stickerLabel: "UNSUCCESSFUL TRANSACTION",
      stickerIcon: <AlertCircle className="w-4 h-4 text-white" />,
      badgeBg: "bg-black text-[#FF3B30]",
      badgeIcon: <AlertCircle className="w-4 h-4" />,
      badgeLabel: "Payment Failed / Incomplete",
      heroTitle: "Payment Not Completed",
      heroSubtitle: "We could not verify payment for this transaction. No items will be dispatched until payment is completed.",
      statusPill: "bg-[#FF3B30] text-white",
      statusLabel: "FAILED",
      statusIcon: <AlertCircle className="w-3.5 h-3.5" />,
      totalLabel: "TOTAL DUE (UNPAID)",
      totalTag: "UNPAID",
      totalTagBg: "bg-black text-white",
      timelineDelivery: "Order On Hold",
      timelineDeliveryPrefix: "DISPATCH STATUS:",
      step1Class: "bg-[#FF3B30]/15 border-2 border-black shadow-[3px_3px_0px_#000000]",
      step1Pill: "bg-[#FF3B30] text-white",
      step1Icon: <AlertCircle className="w-5 h-5 text-[#FF3B30]" />,
      step1Title: "Payment Failed",
      step1Desc: "Payment was cancelled or signature verification failed.",
      step2Class: "bg-[#F5EBE6] border-2 border-black/30 opacity-75",
      step2Pill: "bg-black/10 text-black",
      step2Ping: false,
      step2Desc: "Fulfillment on hold due to incomplete payment.",
      dispatchNote: "No shipment scheduled for failed orders.",
      guaranteeText: "Order placed on hold / incomplete",
      guaranteeIcon: <AlertCircle className="w-4 h-4 text-[#FF3B30]" />,
    }
  };

  const currentTheme = statusTheme[status] || statusTheme.pending;

  return (
    <div className="min-h-screen bg-[#F5EBE6] text-black font-body antialiased selection:bg-[#FF5500] selection:text-white px-3 sm:px-6 py-6 sm:py-10">
      {/* Print-specific style tweak */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-full { width: 100% !important; box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>

      {/* Top Header / Navigation */}
      <header className="max-w-[1280px] mx-auto mb-8 success-anim no-print">
        <div className="bg-white border-2 border-black rounded-[28px] p-4 sm:p-5 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <Link to="/" className="group flex items-baseline gap-1">
              <span className="font-heading font-black text-3xl tracking-tight text-black">
                snitch<span className="text-[#FF5500]">.</span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-black/60 uppercase ml-2">
                {currentTheme.headerSubtitle}
              </span>
            </Link>

            <Link
              to="/"
              className="sm:hidden px-4 py-2 rounded-full bg-[#F5EBE6] text-black font-heading font-extrabold text-xs border-2 border-black hover:bg-black hover:text-white transition-all flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>SHOP</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className={`px-4 py-2 rounded-full border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 ${currentTheme.headerPillBg}`}>
              {currentTheme.headerPillIcon}
              <span>{currentTheme.headerPillText}</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-full bg-[#F5EBE6] text-black font-heading font-extrabold text-xs border-2 border-black hover:bg-black hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>CONTINUE SHOPPING</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto space-y-8">
        {/* Hero Celebration / Status Banner */}
        <section className="success-anim">
          <div className={`relative overflow-hidden ${currentTheme.bannerBg} p-6 sm:p-10 rounded-[32px] border-2 border-black shadow-[6px_6px_0px_#000000]`}>
            {/* Background decorative stickers */}
            <div className="absolute -top-6 -right-6 w-36 h-36 bg-black/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute top-3 right-6 hidden md:flex items-center gap-2 bg-white/90 border-2 border-black rounded-full px-4 py-1.5 shadow-[3px_3px_0px_#000000] rotate-3 font-mono font-black text-xs text-black">
              {currentTheme.stickerIcon}
              <span>{currentTheme.stickerLabel}</span>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className={`badge-bounce inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${currentTheme.badgeBg} font-mono text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000]`}>
                  {currentTheme.badgeIcon}
                  <span>{currentTheme.badgeLabel}</span>
                </div>

                <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-tight uppercase">
                  {currentTheme.heroTitle}
                </h1>

                <p className="font-medium text-sm sm:text-base max-w-2xl opacity-90">
                  {currentTheme.heroSubtitle}
                </p>

                {/* Quick Info Tags */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-black">
                  <div className="flex items-center gap-2 bg-white border-2 border-black px-3.5 py-1.5 rounded-full shadow-[2px_2px_0px_#000000]">
                    <span className="font-mono text-[11px] font-bold text-black/70">ORDER ID:</span>
                    <span className="font-mono text-xs font-black text-black select-all">{activeOrderId}</span>
                    <button
                      onClick={() => handleCopy(activeOrderId, "orderId")}
                      title="Copy Order ID"
                      className="p-1 hover:bg-black/10 rounded-full transition-colors cursor-pointer"
                    >
                      {copiedField === "orderId" ? (
                        <Check className="w-3.5 h-3.5 text-[#00C853]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-black" />
                      )}
                    </button>
                  </div>

                  {activePaymentId !== "N/A" && (
                    <div className="flex items-center gap-2 bg-white border-2 border-black px-3.5 py-1.5 rounded-full shadow-[2px_2px_0px_#000000]">
                      <span className="font-mono text-[11px] font-bold text-black/70">PAYMENT ID:</span>
                      <span className="font-mono text-xs font-black text-black select-all">{activePaymentId}</span>
                      <button
                        onClick={() => handleCopy(activePaymentId, "paymentId")}
                        title="Copy Payment ID"
                        className="p-1 hover:bg-black/10 rounded-full transition-colors cursor-pointer"
                      >
                        {copiedField === "paymentId" ? (
                          <Check className="w-3.5 h-3.5 text-[#00C853]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-black" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-[#FFD600] border-2 border-black px-3.5 py-1.5 rounded-full shadow-[2px_2px_0px_#000000] font-mono text-xs font-bold text-black">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{orderDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for quick sharing/print */}
              <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto no-print">
                <button
                  onClick={handlePrint}
                  className="flex-1 md:flex-initial px-5 py-3 rounded-full bg-white text-black font-heading font-black text-xs border-2 border-black shadow-[3px_3px_0px_#000000] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT RECEIPT</span>
                </button>
                <Link
                  to={isPending || isFailed ? "/cart" : "/"}
                  className="flex-1 md:flex-initial px-5 py-3 rounded-full bg-black text-white font-heading font-black text-xs border-2 border-black shadow-[3px_3px_0px_#000000] hover:bg-[#FF5500] hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isPending ? "GO TO CART" : isFailed ? "RETRY CART" : "EXPLORE MORE"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Order Fulfillment Timeline Progress */}
        <section className="success-anim bg-white border-2 border-black rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b-2 border-black">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#FF5500]" />
                <h2 className="font-heading font-black text-xl tracking-tight uppercase">Order Journey</h2>
              </div>
              <p className="text-black/60 font-medium text-xs sm:text-sm mt-0.5">
                {isPending
                  ? "Fulfillment begins once payment confirmation is received"
                  : isFailed
                  ? "Order processing is paused until payment is successfully completed"
                  : "Track your package from confirmation to your doorstep"}
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-[#F5EBE6] border-2 border-black flex items-center gap-2 font-mono text-xs font-bold shadow-[2px_2px_0px_#000000]">
              <Sparkles className="w-4 h-4 text-[#FF5500]" />
              <span>{currentTheme.timelineDeliveryPrefix} <strong className="text-black">{currentTheme.timelineDelivery}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1: Confirmed or Pending */}
            <div className={`p-4 rounded-2xl ${currentTheme.step1Class} relative`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${currentTheme.step1Pill} border border-black`}>
                  Step 01
                </span>
                {currentTheme.step1Icon}
              </div>
              <h3 className="font-heading font-black text-sm uppercase">{currentTheme.step1Title}</h3>
              <p className="text-xs text-black/70 font-medium mt-1">{currentTheme.step1Desc}</p>
            </div>

            {/* Step 2: Processing */}
            <div className={`p-4 rounded-2xl ${currentTheme.step2Class} relative`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${currentTheme.step2Pill} border border-black`}>
                  Step 02
                </span>
                {currentTheme.step2Ping && <div className="w-2.5 h-2.5 rounded-full bg-[#FF5500] animate-ping" />}
              </div>
              <h3 className="font-heading font-black text-sm uppercase">Packing & Quality Check</h3>
              <p className="text-xs text-black/70 font-medium mt-1">{currentTheme.step2Desc}</p>
            </div>

            {/* Step 3: Dispatched */}
            <div className="p-4 rounded-2xl bg-[#F5EBE6] border-2 border-black/30 opacity-75">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-black/10 text-black">
                  Step 03
                </span>
                <PackageCheck className="w-4 h-4 text-black/40" />
              </div>
              <h3 className="font-heading font-bold text-sm uppercase text-black/60">Dispatched</h3>
              <p className="text-xs text-black/50 font-medium mt-1">Handed over to express courier partner.</p>
            </div>

            {/* Step 4: Delivered */}
            <div className="p-4 rounded-2xl bg-[#F5EBE6] border-2 border-black/30 opacity-75">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-black/10 text-black">
                  Step 04
                </span>
                <Truck className="w-4 h-4 text-black/40" />
              </div>
              <h3 className="font-heading font-bold text-sm uppercase text-black/60">Out for Delivery</h3>
              <p className="text-xs text-black/50 font-medium mt-1">Arriving safely at your address.</p>
            </div>
          </div>
        </section>

        {/* Loading / Error State Banner if needed */}
        {loading && (
          <section className="bg-white border-2 border-black rounded-[32px] p-8 shadow-[4px_4px_0px_#000000] text-center space-y-4">
            <div className="w-12 h-12 border-4 border-black border-t-[#FF5500] rounded-full animate-spin mx-auto" />
            <h3 className="font-heading font-black text-lg">Retrieving Order Details...</h3>
            <p className="font-mono text-xs text-black/60">Connecting with the Snitch order ledger</p>
          </section>
        )}

        {error && !order && (
          <section className="bg-[#FF3B30]/10 border-2 border-[#FF3B30] rounded-[32px] p-6 shadow-[4px_4px_0px_#FF3B30] flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-[#FF3B30] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading font-black text-base text-[#FF3B30]">Receipt Synchronization Notice</h3>
              <p className="text-xs text-black/80 font-medium mt-1">{error}</p>
              <p className="text-xs text-black/60 font-mono mt-2">
                Your payment ID is: <strong>{activeOrderId}</strong>. Please preserve this for support inquiries.
              </p>
            </div>
          </section>
        )}

        {/* Main 2-Column Content: Items Purchased + Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Purchased Items (8 cols) */}
          <section className="lg:col-span-8 space-y-6 success-anim">
            <div className="bg-white border-2 border-black rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-black" />
                  <h2 className="font-heading font-black text-xl tracking-tight uppercase">
                    Items In This Order
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FFD600] border border-black font-mono text-xs font-black">
                  {orderItems.length} {orderItems.length === 1 ? "PRODUCT" : "PRODUCTS"}
                </span>
              </div>

              {orderItems.length > 0 ? (
                <div className="divide-y-2 divide-black/10 space-y-4">
                  {orderItems.map((item, idx) => {
                    const itemImg = getItemImage(item);
                    const itemQty = Number(item.quantity) || 1;
                    const itemAmount = item.price?.amount || 0;
                    const itemCurr = item.price?.currency || currency;
                    const varInfo = item.variantId || item.variant;

                    return (
                      <div
                        key={item._id || idx}
                        className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        {/* Thumbnail & Title */}
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-black bg-white shadow-[2px_2px_0px_#000000] flex-shrink-0">
                            <img
                              src={itemImg}
                              alt={item.title || "Product item"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMG;
                              }}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="font-heading font-extrabold text-base text-black group-hover:text-[#FF5500] transition-colors leading-snug">
                              {item.title || "Snitch Signature Apparel"}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2">
                              {varInfo && (
                                <span className="px-2.5 py-0.5 rounded-full bg-[#C4A1FF] text-black font-mono text-[10px] font-black uppercase border border-black">
                                  Variant: {String(varInfo).slice(-6)}
                                </span>
                              )}
                              <span className="px-2.5 py-0.5 rounded-full bg-[#F5EBE6] text-black font-mono text-[10px] font-bold border border-black">
                                QTY: {itemQty}
                              </span>
                            </div>

                            <p className="font-mono text-xs text-black/60 font-medium">
                              Unit Price: {itemCurr === "INR" ? "₹" : itemCurr} {itemAmount.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-black/10">
                          <span className="font-mono text-xs text-black/60 sm:hidden">Total:</span>
                          <span className="font-heading font-black text-lg sm:text-xl text-black">
                            {itemCurr === "INR" ? "₹" : itemCurr} {(itemAmount * itemQty).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-heading font-bold text-black/70">
                    Order items registered under transaction reference <strong>{activeOrderId}</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Delivery & Customer Info Bento */}
            <div className="bg-white border-2 border-black rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000] grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="font-mono text-[10px] font-black uppercase text-black/50 tracking-wider">
                  CUSTOMER DETAILS
                </span>
                <p className="font-heading font-black text-base text-black">
                  {authUser?.fullName || authUser?.name || "Verified Customer"}
                </p>
                <p className="font-mono text-xs text-black/70">{authUser?.email || "customer@snitch.com"}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#1677FF]/10 text-[#1677FF] border border-[#1677FF]/40 font-mono text-[10px] font-bold">
                  AUTHENTICATED BUYER
                </span>
              </div>

              <div className="space-y-2 sm:border-l-2 sm:border-black/10 sm:pl-6">
                <span className="font-mono text-[10px] font-black uppercase text-black/50 tracking-wider">
                  SHIPPING & DISPATCH
                </span>
                <p className="font-heading font-black text-base text-black">Snitch Priority Express</p>
                <p className="font-mono text-xs text-black/70">{currentTheme.dispatchNote}</p>
                <div className="flex items-center gap-1.5 text-xs font-bold mt-2">
                  {currentTheme.guaranteeIcon}
                  <span>{currentTheme.guaranteeText}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Financial Summary & Actions (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 success-anim">
            {/* Price & Payment Summary Card */}
            <div className="bg-white border-2 border-black rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-black" />
                  <h3 className="font-heading font-black text-xl tracking-tight uppercase">Payment Details</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_#000000] flex items-center gap-1 ${currentTheme.statusPill}`}>
                  {currentTheme.statusIcon}
                  <span>{currentTheme.statusLabel}</span>
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs pb-6 mb-6 border-b-2 border-black">
                <div className="flex items-center justify-between text-black/70">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">
                    {currency === "INR" ? "₹" : currency} {totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-black/70">
                  <span>Shipping & Handling</span>
                  <span className="font-bold text-[#00C853] bg-[#00C853]/10 px-2 py-0.5 rounded border border-[#00C853]/30">
                    FREE
                  </span>
                </div>

                <div className="flex items-center justify-between text-black/70">
                  <span>Taxes (GST Included)</span>
                  <span className="font-bold text-black">₹0</span>
                </div>

                <div className="flex items-center justify-between text-black/70">
                  <span>Payment Gateway</span>
                  <span className="font-bold text-black">Razorpay Secure</span>
                </div>
              </div>

              {/* Total Card */}
              <div className="bg-[#F5EBE6] p-5 rounded-2xl border-2 border-black mb-6 flex items-baseline justify-between shadow-[2px_2px_0px_#000000]">
                <div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-black/60 block">
                    {currentTheme.totalLabel}
                  </span>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-black tracking-tight">
                    {currency === "INR" ? "₹" : currency} {totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className={`font-mono text-[11px] font-black px-3 py-1 rounded-full border border-black ${currentTheme.totalTagBg}`}>
                  {currentTheme.totalTag}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 no-print">
                {isPending || isFailed ? (
                  <Link
                    to="/cart"
                    className="w-full py-4 rounded-full bg-[#FF5500] text-black font-heading font-black text-base border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>{isPending ? "GO TO CART / COMPLETE ORDER" : "RETRY ORDER IN CART"}</span>
                  </Link>
                ) : (
                  <Link
                    to="/"
                    className="w-full py-4 rounded-full bg-[#FF5500] text-black font-heading font-black text-base border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>CONTINUE SHOPPING</span>
                  </Link>
                )}

                <Link
                  to="/orders"
                  className="w-full py-3.5 rounded-full bg-[#FFD600] text-black font-heading font-extrabold text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <ReceiptText className="w-4 h-4" />
                  <span>VIEW ALL ORDERS</span>
                </Link>

                <button
                  onClick={handlePrint}
                  className="w-full py-3.5 rounded-full bg-white text-black font-heading font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>DOWNLOAD / PRINT RECEIPT</span>
                </button>
              </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-[#C4A1FF] border-2 border-black rounded-[28px] p-6 shadow-[4px_4px_0px_#000000] no-print">
              <div className="flex items-center gap-2 mb-2 font-heading font-black text-base">
                <Sparkles className="w-5 h-5 text-black" />
                <span>NEED HELP WITH THIS ORDER?</span>
              </div>
              <p className="font-medium text-xs text-black/85 mb-4">
                {isPending
                  ? "Have questions or need help completing your payment? Our support squad is available 24/7."
                  : isFailed
                  ? "Encountered an issue during payment? Our support squad is available 24/7."
                  : "Have questions regarding delivery or styling? Our support squad is available 24/7."}
              </p>
              <a
                href="mailto:support@snitch.com"
                className="inline-block px-4 py-2 rounded-full bg-black text-white font-mono font-bold text-xs border-2 border-black hover:bg-white hover:text-black transition-colors"
              >
                CONTACT SUPPORT
              </a>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="max-w-[1280px] mx-auto mt-12 pt-8 border-t-2 border-black/15 text-center font-mono text-xs text-black/50 no-print">
        <p>© {new Date().getFullYear()} SNITCH CO. ALL RIGHTS RESERVED. SECURED BY RAZORPAY.</p>
      </footer>
    </div>
  );
};

export default OrderSuccess;