import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Plus,
  ArrowLeft,
  ArrowUpRight,
  TrendingUp,
  Package,
  DollarSign,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  Globe,
  Eye,
  AlertTriangle,
  X
} from "lucide-react";
import { useLenis } from "../../../assets/useLenis";
import { useProduct } from "../hook/useProduct";
import gsap from "gsap";
import SellerLoader from "../../../Components/loaders/SellerLoader.jsx";
import { TableRowSkeleton } from "../../../Components/loaders/BentoSkeleton.jsx";

export default function Dashboard() {
  useLenis();
  const { user } = useSelector((state) => state.auth);
  const { products, loading, handleGetSellerProducts, handleDeleteProduct } = useProduct();
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    handleGetSellerProducts().catch(() => {});

    gsap.from(".dash-anim", {
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

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      const prodId = productToDelete._id || productToDelete.id;
      const prodTitle = productToDelete.title || productToDelete.name || "Product";
      await handleDeleteProduct(prodId);
      triggerToast(`"${prodTitle}" removed from inventory.`);
      setProductToDelete(null);
    } catch (err) {
      triggerToast(err.message || "Failed to remove product");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = (products || []).filter((p) => {
    const title = String(p.title || p.name || "").toLowerCase();
    const desc = String(p.description || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || desc.includes(q);
  });

  const totalRevenue = (products || []).reduce(
    (acc, item) => acc + ((item.price?.amount || item.priceAmount || 0) * (item.stock ?? item.stockQuantity ?? 1)),
    0
  );

  return (
    <div className="min-h-screen bg-[#F5EBE6] text-black font-body selection:bg-[#FF5500] selection:text-white relative p-4 sm:p-6 lg:p-8">
      {/* Full-Screen Awwwards Seller Terminal Loader */}
      {showInitialLoader && (
        <SellerLoader onComplete={() => setShowInitialLoader(false)} duration={1.5} />
      )}
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white animate-bounce font-heading font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-[6px_6px_0px_#FF3B30] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setProductToDelete(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-12 h-12 rounded-2xl bg-[#FF3B30]/10 border-2 border-[#FF3B30] flex items-center justify-center mb-4 text-[#FF3B30]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-heading font-black text-2xl text-black mb-2">
              Remove Product Unit?
            </h3>
            <p className="text-xs font-mono font-bold text-black/70 mb-6">
              Are you sure you want to delete <span className="text-black font-black">"{productToDelete.title || productToDelete.name}"</span>? This will permanently remove it and all its variants from the Snitch storefront.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-3 rounded-full bg-white text-black font-heading font-extrabold text-xs border-2 border-black hover:bg-black/5 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-full bg-[#FF3B30] text-white font-heading font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "DELETING..." : "CONFIRM DELETE"}</span>
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
              SELLER TERMINAL
            </span>
          </Link>

          <Link
            to="/"
            className="units-pill bg-white text-black font-heading font-extrabold p-3 rounded-2xl flex items-center justify-between text-xs border-2 border-black shadow-[2px_2px_0px_#000000]"
          >
            <span>STOREFRONT</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link
            to="/seller/create-product"
            className="units-pill bg-[#00C853] text-black font-heading font-extrabold p-3.5 rounded-2xl flex flex-col justify-between h-20 text-left border-2 border-black shadow-[2px_2px_0px_#000000]"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span>+ NEW</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-sm font-black leading-tight">Create Product</span>
          </Link>

          <button
            onClick={() => {
              handleGetSellerProducts();
              triggerToast("Live catalog refreshed!");
            }}
            className="units-pill bg-[#FFB800] text-black font-mono font-bold p-3 rounded-2xl flex items-center justify-between text-xs border-2 border-black shadow-[2px_2px_0px_#000000]"
          >
            <span>REFRESH</span>
            <RefreshCw className="w-4 h-4" />
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Top Title Banner */}
          <div className="dash-anim bg-[#FF5500] text-black p-6 sm:p-8 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">MERCHANT PORTAL</span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-black">
                {user?.fullName ? `${user.fullName}'s Studio` : "Snitch Merchant Terminal"}
              </h2>
            </div>
            <Link
              to="/seller/create-product"
              className="px-6 py-3.5 rounded-full bg-white text-black font-heading font-black text-sm border-2 border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>ADD PRODUCT UNIT</span>
            </Link>
          </div>

          {/* Saturated Telemetry Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 dash-anim">
            
            <div className="bg-[#1677FF] text-black p-6 rounded-[24px] border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
              <span className="text-xs font-mono font-bold uppercase text-white">TOTAL INVENTORY VALUE</span>
              <div className="font-heading font-black text-3xl sm:text-4xl my-2">${totalRevenue.toLocaleString()}</div>
              <span className="text-xs font-mono font-bold text-black/80">Active stock</span>
            </div>

            <div className="bg-[#FFB800] text-black p-6 rounded-[24px] border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
              <span className="text-xs font-mono font-bold uppercase text-black/80">LISTED UNITS</span>
              <div className="font-heading font-black text-3xl sm:text-4xl my-2">{products?.length || 0}</div>
              <span className="text-xs font-mono font-bold text-black/80">Live in catalog</span>
            </div>

            <div className="bg-[#C4A1FF] text-black p-6 rounded-[24px] border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
              <span className="text-xs font-mono font-bold uppercase text-black/80">CONVERSION TELEMETRY</span>
              <div className="font-heading font-black text-3xl sm:text-4xl my-2">4.92%</div>
              <span className="text-xs font-mono font-bold text-black/80">High velocity</span>
            </div>

            <div className="bg-[#00C853] text-black p-6 rounded-[24px] border-2 border-black shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
              <span className="text-xs font-mono font-bold uppercase text-black/80">SELLER STATUS</span>
              <div className="font-heading font-black text-2xl sm:text-3xl my-2 uppercase">{user?.role || "Seller"}</div>
              <span className="text-xs font-mono font-bold text-black/80">Verified merchant</span>
            </div>

          </div>

          {/* Product Inventory Table Box */}
          <div className="dash-anim bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black">
              <div>
                <h3 className="font-heading font-black text-2xl text-black">Inventory Registry</h3>
                <p className="text-xs font-mono font-bold text-black/70">Manage listed architectural units & artifacts</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 units-input text-xs font-mono w-full sm:w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-black text-black font-extrabold uppercase">
                      <th className="pb-3 pl-2">Product Unit</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Stock Quantity</th>
                      <th className="pb-3 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 border-b-2 border-black/20 divide-black/10">
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </tbody>
                </table>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-black/60">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-black" />
                <p className="font-heading font-extrabold text-base text-black mb-4">No product units listed yet.</p>
                <Link
                  to="/seller/create-product"
                  className="px-6 py-3 rounded-full bg-[#00C853] text-black font-heading font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] inline-block"
                >
                  CREATE YOUR FIRST UNIT
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-black text-black font-extrabold uppercase">
                      <th className="pb-3 pl-2">Product Unit</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Stock Quantity</th>
                      <th className="pb-3 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 border-b-2 border-black/20 divide-black/10">
                    {filteredProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-[#F5EBE6] transition-colors">
                        <td className="py-4 pl-2 flex items-center gap-3">
                          <img
                            src={p.Images?.[0]?.url || p.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"}
                            alt={p.title || p.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-black"
                          />
                          <div>
                            <Link to={`/product/${p._id}`} className="font-heading font-black text-sm text-black hover:text-[#FF5500] transition-colors">
                              {p.title || p.name}
                            </Link>
                            <div className="text-[10px] text-black/70 line-clamp-1">{p.description}</div>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-black">{p.category || "Living Units"}</td>
                        <td className="py-4 font-black text-[#FF5500] text-sm">
                          {p.price?.currency || p.priceCurrency || "INR"} {p.price?.amount || p.priceAmount}
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#FFB800] text-black border border-black">
                            {p.stock ?? p.stockQuantity ?? 10} Units
                          </span>
                        </td>
                        <td className="py-4 pr-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/product/${p._id}`}
                              className="p-2 rounded-xl bg-black text-white hover:bg-[#1677FF] transition-colors"
                              title="View Product Page"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              to={`/seller/edit-product/${p._id}`}
                              className="p-2 rounded-xl bg-[#F5EBE6] text-black border border-black hover:bg-black hover:text-white transition-colors"
                              title="Edit Product Unit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => setProductToDelete(p)}
                              className="p-2 rounded-xl bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/30 hover:bg-[#FF3B30] hover:text-white transition-colors cursor-pointer"
                              title="Remove Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}