import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ExternalLink,
  Copy,
  Check,
  Package,
  Truck,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Sparkles,
  ReceiptText,
  ChevronRight
} from "lucide-react";
import gsap from "gsap";
import { useLenis } from "../../../assets/useLenis";
import { getUserOrdersAPI } from "../service/cart.api";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80";

const OrderHistory = () => {
  useLenis();
  const navigate = useNavigate();
  const { user, initialized: authInitialized } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch orders on mount
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserOrdersAPI();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load user orders:", err);
      setError(err.response?.data?.message || err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Entrance animations
  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.from(".history-anim", {
          y: 25,
          opacity: 0,
          stagger: 0.07,
          duration: 0.6,
          ease: "power3.out",
          clearProps: "all",
        });
      });
      return () => ctx.revert();
    }
  }, [loading, statusFilter]);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isValidImg = (url) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("blob:")) return false;
    return true;
  };

  // Helper for safe item image, prioritizing the specific variant image
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

  // Filter and sort logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Status filter
        if (statusFilter !== "all" && order.status !== statusFilter) {
          return false;
        }

        // Search filter (by order ID, payment ID, or item title)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const orderId = (order.razorpay?.orderId || order._id || "").toLowerCase();
          const paymentId = (order.razorpay?.paymentId || "").toLowerCase();
          const matchesItem = Array.isArray(order.orderItems) && order.orderItems.some((item) =>
            (item.title || "").toLowerCase().includes(query)
          );
          return orderId.includes(query) || paymentId.includes(query) || matchesItem;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        const amountA = Number(a.price?.amount || 0);
        const amountB = Number(b.price?.amount || 0);

        if (sortBy === "newest") return dateB - dateA;
        if (sortBy === "oldest") return dateA - dateB;
        if (sortBy === "amount-high") return amountB - amountA;
        if (sortBy === "amount-low") return amountA - amountB;
        return 0;
      });
  }, [orders, statusFilter, searchQuery, sortBy]);

  // Summary Metrics
  const totalPaidOrders = orders.filter((o) => o.status === "paid").length;
  const totalSpent = orders
    .filter((o) => o.status === "paid")
    .reduce((acc, curr) => acc + Number(curr.price?.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#F5EBE6] text-black font-body antialiased selection:bg-[#FF5500] selection:text-white px-3 sm:px-6 py-6 sm:py-10">
      
      {/* Top Header Navigation */}
      <header className="max-w-[1400px] mx-auto mb-8 history-anim">
        <div className="bg-white border-2 border-black rounded-[28px] p-4 sm:p-5 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Storefront Link */}
          <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-start">
            <Link to="/" className="group flex items-baseline gap-1">
              <span className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-black">
                snitch<span className="text-[#FF5500]">.</span>
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-black/60 uppercase ml-2 hidden sm:inline-block">
                ORDER ARCHIVES
              </span>
            </Link>

            <Link
              to="/"
              className="px-4 py-2 rounded-full bg-[#F5EBE6] text-black font-heading font-extrabold text-xs border-2 border-black hover:bg-black hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>STOREFRONT</span>
            </Link>
          </div>

          {/* Center Badges */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="px-4 py-2 rounded-full bg-[#1677FF] text-white border-2 border-black font-heading font-extrabold text-xs shadow-[2px_2px_0px_#000000] flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>{orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"} TOTAL</span>
            </div>

            <div className="px-4 py-2 rounded-full bg-[#00C853] text-black border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_#000000] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{totalPaidOrders} PAID</span>
            </div>
          </div>

          {/* Right Action: Cart & User Status */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              to="/cart"
              className="px-4 py-2 rounded-full bg-[#FFD600] text-black font-heading font-extrabold text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>VIEW CART</span>
            </Link>

            {user ? (
              <div className="px-4 py-2 rounded-full bg-[#F5EBE6] text-black font-mono font-bold text-xs border-2 border-black truncate max-w-[160px] hidden sm:block">
                {user.fullName || user.email}
              </div>
            ) : (
              <Link
                to="/login?redirect=/orders"
                className="px-4 py-2 rounded-full bg-black text-white font-mono font-bold text-xs border-2 border-black hover:bg-[#FF5500] transition-colors"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto space-y-8">
        {/* Hero Banner with Stats Bento */}
        <section className="history-anim">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Main Welcome & Header Card (7 cols) */}
            <div className="md:col-span-7 bg-[#FF5500] text-black p-6 sm:p-8 rounded-[32px] border-2 border-black shadow-[5px_5px_0px_#000000] flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black text-[#FF5500] font-mono text-xs font-black uppercase tracking-wider border-2 border-black">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customer Ledger</span>
                </div>
                <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-black">
                  Your Orders
                </h1>
                <p className="text-black/85 font-medium text-sm sm:text-base max-w-xl">
                  Review transaction histories, inspect purchased drops, and download official receipts anytime.
                </p>
              </div>

              <div className="pt-6 flex items-center gap-3 relative z-10 flex-wrap">
                <button
                  onClick={fetchOrders}
                  disabled={loading}
                  className="px-4 py-2 rounded-full bg-white text-black font-heading font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>REFRESH ORDERS</span>
                </button>
                <span className="font-mono text-xs text-black/70 font-semibold">
                  Last updated: Just now
                </span>
              </div>
            </div>

            {/* Quick Metrics Cards (5 cols) */}
            <div className="md:col-span-5 grid grid-cols-2 gap-4">
              {/* Metric 1: Total Spent */}
              <div className="bg-white p-5 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
                <span className="font-mono text-[10px] font-black uppercase text-black/50 tracking-wider">
                  TOTAL INVESTMENT
                </span>
                <div className="my-2">
                  <span className="font-heading font-black text-2xl sm:text-3xl text-black">
                    ₹{totalSpent.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#00C853]/20 text-[#00C853] font-mono text-[10px] font-bold border border-[#00C853]/40 w-fit">
                  LIFETIME SPEND
                </span>
              </div>

              {/* Metric 2: Completed Orders */}
              <div className="bg-[#C4A1FF] p-5 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
                <span className="font-mono text-[10px] font-black uppercase text-black/70 tracking-wider">
                  PAID ORDERS
                </span>
                <div className="my-2">
                  <span className="font-heading font-black text-2xl sm:text-3xl text-black">
                    {totalPaidOrders}
                  </span>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-black text-white font-mono text-[10px] font-bold border border-black w-fit">
                  VERIFIED
                </span>
              </div>

              {/* Metric 3: Express Deliveries */}
              <div className="col-span-2 bg-[#FFD600] p-5 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                    <Truck className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-sm uppercase">Snitch Priority Express</h4>
                    <p className="font-mono text-xs text-black/70">All orders insured & tracked end-to-end</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section className="history-anim bg-white border-2 border-black rounded-[28px] p-4 sm:p-5 shadow-[4px_4px_0px_#000000] flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            {[
              { key: "all", label: "All Orders", count: orders.length },
              { key: "paid", label: "Paid", count: totalPaidOrders },
              { key: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
              { key: "failed", label: "Failed", count: orders.filter((o) => o.status === "failed").length },
            ].map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-4 py-2 rounded-full font-heading font-extrabold text-xs border-2 border-black transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                    isActive
                      ? "bg-black text-white shadow-[2px_2px_0px_#FF5500]"
                      : "bg-[#F5EBE6] text-black hover:bg-black/10"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? "bg-[#FF5500] text-black" : "bg-black/10 text-black"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-black/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search order ID or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F5EBE6] border-2 border-black font-body text-xs font-semibold text-black placeholder:text-black/50 focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#000000] transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none pl-4 pr-9 py-2 rounded-full bg-white border-2 border-black font-heading font-extrabold text-xs text-black cursor-pointer shadow-[2px_2px_0px_#000000] focus:outline-none"
              >
                <option value="newest">Latest Orders</option>
                <option value="oldest">Oldest Orders</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-black absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border-2 border-black rounded-[32px] p-6 shadow-[4px_4px_0px_#000000] animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-6 w-48 bg-black/10 rounded-full" />
                  <div className="h-6 w-24 bg-black/10 rounded-full" />
                </div>
                <div className="h-20 bg-[#F5EBE6] rounded-2xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error Notice if any */}
        {error && !loading && (
          <div className="bg-[#FF3B30]/10 border-2 border-[#FF3B30] rounded-[32px] p-6 shadow-[4px_4px_0px_#FF3B30] flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-[#FF3B30] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading font-black text-base text-[#FF3B30]">Failed to Load Orders</h3>
              <p className="text-xs text-black/80 font-medium mt-1">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-3 px-4 py-1.5 rounded-full bg-black text-white font-mono text-xs font-bold border-2 border-black hover:bg-[#FF5500] transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <section className="bg-white border-2 border-black rounded-[32px] p-10 sm:p-16 shadow-[5px_5px_0px_#000000] text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-[#FFD600] border-2 border-black rounded-3xl p-5 flex items-center justify-center shadow-[4px_4px_0px_#000000] rotate-[-3deg]">
              <Package className="w-12 h-12 text-black" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-heading font-black text-2xl uppercase tracking-tight">
                No Orders Recorded Yet
              </h3>
              <p className="text-black/70 text-sm font-medium">
                {searchQuery || statusFilter !== "all"
                  ? "No transactions match your current search or status filter criteria."
                  : "Your Snitch collection awaits. Discover elevated streetwear and living essentials today."}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              {searchQuery || statusFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="px-6 py-3 rounded-full bg-[#F5EBE6] text-black font-heading font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-all cursor-pointer"
                >
                  CLEAR FILTERS
                </button>
              ) : null}

              <Link
                to="/"
                className="px-8 py-3.5 rounded-full bg-[#00C853] text-black font-heading font-black text-sm border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>EXPLORE DROPS</span>
              </Link>
            </div>
          </section>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const orderId = order.razorpay?.orderId || order._id;
              const paymentId = order.razorpay?.paymentId;
              const amount = order.price?.amount || 0;
              const currency = order.price?.currency || "INR";
              const items = Array.isArray(order.orderItems) ? order.orderItems : [];
              const totalItemsCount = items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
              const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              // Status styles
              const statusConfig = {
                paid: {
                  bg: "bg-[#00C853]",
                  text: "text-black",
                  label: "PAID",
                  icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                },
                pending: {
                  bg: "bg-[#FFD600]",
                  text: "text-black",
                  label: "PENDING",
                  icon: <Clock className="w-3.5 h-3.5" />,
                },
                failed: {
                  bg: "bg-[#FF3B30]",
                  text: "text-white",
                  label: "FAILED",
                  icon: <AlertCircle className="w-3.5 h-3.5" />,
                },
              };

              const currentStatus = statusConfig[order.status] || statusConfig.pending;

              return (
                <div
                  key={order._id}
                  className="history-anim bg-white border-2 border-black rounded-[32px] overflow-hidden shadow-[4px_4px_0px_#000000] transition-transform hover:-translate-y-0.5"
                >
                  {/* Order Card Top Bar */}
                  <div className="p-5 sm:p-6 bg-[#FAF4F0] border-b-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Order Reference & Date */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_#000000]">
                          <span className="font-mono text-[11px] font-bold text-black/60">ORDER:</span>
                          <span className="font-mono text-xs font-black text-black select-all">{orderId}</span>
                          <button
                            onClick={() => handleCopy(orderId, order._id)}
                            title="Copy Order ID"
                            className="p-1 hover:bg-black/10 rounded-full transition-colors cursor-pointer"
                          >
                            {copiedId === order._id ? (
                              <Check className="w-3.5 h-3.5 text-[#00C853]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-black" />
                            )}
                          </button>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`px-3 py-1 rounded-full border-2 border-black font-mono text-[10px] font-black uppercase flex items-center gap-1.5 shadow-[1px_1px_0px_#000000] ${currentStatus.bg} ${currentStatus.text}`}
                        >
                          {currentStatus.icon}
                          <span>{currentStatus.label}</span>
                        </div>

                        {paymentId && (
                          <span className="font-mono text-[10px] text-black/60 hidden sm:inline-block">
                            Pay ID: <strong>{paymentId}</strong>
                          </span>
                        )}
                      </div>

                      <p className="font-mono text-xs text-black/60 font-medium">Placed on: {orderDate}</p>
                    </div>

                    {/* Order Total & Receipt Link */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-black/10">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-black/60 uppercase block text-right">
                          Total Amount
                        </span>
                        <span className="font-heading font-black text-xl sm:text-2xl text-black">
                          {currency === "INR" ? "₹" : currency} {amount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <Link
                        to={`/order-success?order_id=${orderId}`}
                        state={{ payment: order, orderId }}
                        className="px-4 py-2.5 rounded-full bg-black text-white font-heading font-black text-xs border-2 border-black shadow-[2px_2px_0px_#FF5500] hover:bg-[#FF5500] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                      >
                        <ReceiptText className="w-3.5 h-3.5" />
                        <span>VIEW RECEIPT</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="divide-y-2 divide-black/10">
                      {items.map((item, idx) => {
                        const itemImg = getItemImage(item);
                        const itemQty = Number(item.quantity) || 1;
                        const itemPrice = item.price?.amount || 0;
                        const itemProdId = item.productId?._id || item.productId;

                        return (
                          <div
                            key={item._id || idx}
                            className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-black bg-white shadow-[2px_2px_0px_#000000] flex-shrink-0">
                                <img
                                  src={itemImg}
                                  alt={item.title || "Product item"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_IMG;
                                  }}
                                />
                              </div>

                              <div className="space-y-1">
                                {itemProdId ? (
                                  <Link
                                    to={`/product/${itemProdId}`}
                                    className="font-heading font-extrabold text-sm sm:text-base text-black hover:text-[#FF5500] transition-colors leading-snug flex items-center gap-1.5"
                                  >
                                    <span>{item.title || "Snitch Signature Item"}</span>
                                    <ExternalLink className="w-3 h-3 text-black/40" />
                                  </Link>
                                ) : (
                                  <h4 className="font-heading font-extrabold text-sm sm:text-base text-black">
                                    {item.title || "Snitch Signature Item"}
                                  </h4>
                                )}

                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.variantId && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#C4A1FF] text-black font-mono text-[9px] font-black uppercase border border-black">
                                      Variant: {String(item.variantId).slice(-6)}
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded-full bg-[#F5EBE6] text-black font-mono text-[10px] font-bold border border-black">
                                    QTY: {itemQty}
                                  </span>
                                  <span className="font-mono text-xs text-black/60">
                                    @ ₹{itemPrice.toLocaleString("en-IN")} each
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-black/10">
                              <span className="font-mono text-xs text-black/60 sm:hidden">Line Total:</span>
                              <span className="font-heading font-black text-base text-black">
                                ₹{(itemPrice * itemQty).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Bottom Delivery Note */}
                  <div className="px-5 sm:px-6 py-3 bg-[#F5EBE6]/60 border-t-2 border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-black/70">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#00C853]" />
                      <span>Delivery Status: <strong>{order.status === "paid" ? "Confirmed & Dispatched" : "Pending Verification"}</strong></span>
                    </div>
                    <span>{totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} inside package</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Note */}
      <footer className="max-w-[1400px] mx-auto mt-12 pt-8 border-t-2 border-black/15 text-center font-mono text-xs text-black/50">
        <p>© {new Date().getFullYear()} SNITCH CO. CUSTOMER ORDER ARCHIVES. SECURE COMMERCE.</p>
      </footer>
    </div>
  );
};

export default OrderHistory;
