import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useProduct } from "../hook/useProduct";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  CAD: "C$"
};

export default function CreateProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { handleCreateProduct, loading, error: apiError } = useProduct();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceAmount: "",
    priceCurrency: "INR",
    stockQuantity: "1"
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length === 0) return;

    const availableSlots = 7 - images.length;
    if (availableSlots <= 0) {
      setFieldErrors((prev) => ({
        ...prev,
        images: "Maximum limit of 7 images reached"
      }));
      return;
    }

    const filesToAdd = validFiles.slice(0, availableSlots);
    const newPreviews = filesToAdd.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      url: URL.createObjectURL(file)
    }));

    setImages((prev) => [...prev, ...filesToAdd]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setFieldErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (indexToRemove) => {
    const itemToRemove = imagePreviews[indexToRemove];
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.url);
    }
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Product name is required";
    if (!formData.description.trim()) errs.description = "Description is required";
    if (!formData.priceAmount || isNaN(formData.priceAmount) || Number(formData.priceAmount) <= 0) {
      errs.priceAmount = "Valid price amount is required";
    }
    if (formData.stockQuantity === "" || isNaN(formData.stockQuantity) || Number(formData.stockQuantity) < 0) {
      errs.stockQuantity = "Valid stock quantity is required";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    try {
      await handleCreateProduct({
        name: formData.name.trim(),
        description: formData.description.trim(),
        priceAmount: Number(formData.priceAmount),
        priceCurrency: formData.priceCurrency,
        stockQuantity: Number(formData.stockQuantity),
        images
      });

      setSuccessMessage("Product published successfully! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      // Error handled in slice/hook
    }
  };

  const currSymbol = CURRENCY_SYMBOLS[formData.priceCurrency] || "₹";
  const inStock = formData.stockQuantity && Number(formData.stockQuantity) > 0;

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-on-background)] font-body min-h-screen flex selection:bg-primary/30 selection:text-primary-fixed">
      
      {/* Side Navigation Bar */}
      <nav className="bg-[var(--color-surface-container)] text-[var(--color-secondary)] font-body h-full w-64 fixed left-0 top-0 border-r border-[rgba(122,111,155,0.2)] shadow-xl flex flex-col h-screen p-4 gap-2 hidden md:flex z-40">
        <div className="mb-8 px-2 mt-4">
          <h1 className="text-2xl font-['Sora'] font-black text-[var(--color-primary)] tracking-tighter">
            Snitch
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-variant)] flex items-center justify-center overflow-hidden border border-[rgba(122,111,155,0.3)]">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">storefront</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--color-on-surface)]">Seller Studio</div>
              <Link to="/" className="text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                Switch to Buyer
              </Link>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full mt-6 bg-gradient-to-r from-[var(--color-inverse-primary)] to-[var(--color-secondary)] text-white rounded-xl py-2.5 px-4 font-semibold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            List New Item
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          <Link to="/" className="text-[var(--color-on-surface-variant)] flex items-center gap-3 p-3 hover:bg-[rgba(42,27,82,0.5)] rounded-xl hover:translate-x-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Dashboard
          </Link>
          <Link to="/create-product" className="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] rounded-xl flex items-center gap-3 p-3 hover:translate-x-1 transition-all cursor-pointer font-semibold">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            Inventory
          </Link>
          <a href="#" className="text-[var(--color-on-surface-variant)] flex items-center gap-3 p-3 hover:bg-[rgba(42,27,82,0.5)] rounded-xl hover:translate-x-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">insights</span>
            Analytics
          </a>
          <a href="#" className="text-[var(--color-on-surface-variant)] flex items-center gap-3 p-3 hover:bg-[rgba(42,27,82,0.5)] rounded-xl hover:translate-x-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">chat</span>
            Messages
          </a>
          <a href="#" className="text-[var(--color-on-surface-variant)] flex items-center gap-3 p-3 hover:bg-[rgba(42,27,82,0.5)] rounded-xl hover:translate-x-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Settings
          </a>
        </div>

        <div className="mt-auto pt-4 border-t border-[rgba(122,111,155,0.2)] space-y-1">
          <a href="#" className="text-[var(--color-on-surface-variant)] flex items-center gap-3 p-3 hover:bg-[rgba(42,27,82,0.5)] rounded-xl hover:translate-x-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">help</span>
            Help
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-y-auto relative">
        {/* Background Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[var(--color-primary)]/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-secondary)]/10 rounded-full blur-[150px]"></div>
        </div>

        {/* Top Header */}
        <header className="sticky top-0 z-30 glass-card border-x-0 border-t-0 border-b border-[rgba(122,111,155,0.3)] px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors text-sm font-semibold group">
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Inventory
          </Link>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="primary-gradient-btn px-6 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">publish</span>
                <span>Publish Product</span>
              </>
            )}
          </button>
        </header>

        {/* Main Form Content */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 w-full max-w-7xl mx-auto">
          
          {/* Notifications */}
          <div className="lg:col-span-12">
            {apiError && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">error</span>
                <span>{apiError}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Left Column: Form */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Basic Details Card */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-['Sora'] text-xl font-semibold mb-6 flex items-center gap-2 text-[var(--color-on-surface)]">
                <span className="material-symbols-outlined text-[var(--color-primary)]">edit_document</span>
                Basic Details
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Neon Horizon Cyber Jacket"
                    className="w-full bg-[var(--color-surface-container-high)] border border-[rgba(122,111,155,0.5)] rounded-lg px-4 py-3 text-[var(--color-on-surface)] placeholder:text-[rgba(177,164,211,0.5)] transition-all outline-none focus:border-[var(--color-primary)] font-body"
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-2">Description *</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the item, its features, and condition..."
                    className="w-full bg-[var(--color-surface-container-high)] border border-[rgba(122,111,155,0.5)] rounded-lg px-4 py-3 text-[var(--color-on-surface)] placeholder:text-[rgba(177,164,211,0.5)] transition-all outline-none focus:border-[var(--color-primary)] font-body resize-y"
                  />
                  {fieldErrors.description && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Card */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-['Sora'] text-xl font-semibold mb-6 flex items-center gap-2 text-[var(--color-on-surface)]">
                <span className="material-symbols-outlined text-[var(--color-primary)]">sell</span>
                Pricing & Inventory
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-2">Currency</label>
                  <div className="relative">
                    <select
                      name="priceCurrency"
                      value={formData.priceCurrency}
                      onChange={handleInputChange}
                      className="w-full bg-[var(--color-surface-container-high)] border border-[rgba(122,111,155,0.5)] rounded-lg px-4 py-3 text-[var(--color-on-surface)] appearance-none transition-all outline-none focus:border-[var(--color-primary)] font-body cursor-pointer"
                    >
                      <option value="INR" className="bg-[#1d103f] text-white">INR (₹)</option>
                      <option value="USD" className="bg-[#1d103f] text-white">USD ($)</option>
                      <option value="EUR" className="bg-[#1d103f] text-white">EUR (€)</option>
                      <option value="GBP" className="bg-[#1d103f] text-white">GBP (£)</option>
                      <option value="JPY" className="bg-[#1d103f] text-white">JPY (¥)</option>
                      <option value="CAD" className="bg-[#1d103f] text-white">CAD (C$)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-on-surface-variant)]">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-2">Price *</label>
                  <input
                    type="number"
                    name="priceAmount"
                    min="0"
                    step="0.01"
                    value={formData.priceAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-[var(--color-surface-container-high)] border border-[rgba(122,111,155,0.5)] rounded-lg px-4 py-3 text-[var(--color-on-surface)] placeholder:text-[rgba(177,164,211,0.5)] transition-all outline-none focus:border-[var(--color-primary)] font-body"
                  />
                  {fieldErrors.priceAmount && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.priceAmount}</p>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-[var(--color-on-surface-variant)] mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    min="0"
                    step="1"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    placeholder="1"
                    className="w-full bg-[var(--color-surface-container-high)] border border-[rgba(122,111,155,0.5)] rounded-lg px-4 py-3 text-[var(--color-on-surface)] placeholder:text-[rgba(177,164,211,0.5)] transition-all outline-none focus:border-[var(--color-primary)] font-body"
                  />
                  {fieldErrors.stockQuantity && (
                    <p className="text-xs text-red-400 mt-1">{fieldErrors.stockQuantity}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Media Upload Card */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-['Sora'] text-xl font-semibold mb-6 flex items-center gap-2 text-[var(--color-on-surface)]">
                <span className="material-symbols-outlined text-[var(--color-primary)]">image</span>
                Media
              </h2>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-[rgba(122,111,155,0.5)] rounded-xl p-10 text-center hover:bg-[rgba(42,27,82,0.4)] hover:border-[var(--color-primary)] transition-all cursor-pointer group flex flex-col items-center justify-center ${
                  isDragging ? "border-[var(--color-primary)] bg-[rgba(168,164,255,0.1)]" : ""
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">cloud_upload</span>
                </div>
                <p className="text-[var(--color-on-surface)] font-semibold mb-1">Click or drag images here</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">SVG, PNG, JPG or GIF (max. 7 files)</p>
              </div>

              {fieldErrors.images && (
                <p className="text-xs text-red-400 mt-2">{fieldErrors.images}</p>
              )}

              {/* Thumbnails */}
              {imagePreviews.length > 0 && (
                <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                  {imagePreviews.map((item, idx) => (
                    <div key={item.id} className="w-24 h-24 rounded-lg bg-[var(--color-surface-container-highest)] border border-[rgba(122,111,155,0.3)] flex-shrink-0 relative group overflow-hidden">
                      <img src={item.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                          className="material-symbols-outlined text-red-400 cursor-pointer hover:scale-110"
                        >
                          delete
                        </span>
                      </div>
                    </div>
                  ))}
                  {imagePreviews.length < 7 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-lg border border-dashed border-[rgba(122,111,155,0.5)] flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer transition-colors flex-shrink-0"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Sticky Live Preview */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <h3 className="font-['Sora'] text-lg font-semibold text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">visibility</span>
                Live Preview
              </h3>

              {/* Preview Card */}
              <div className="glass-card rounded-xl overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-shadow duration-300">
                <div className="aspect-square bg-[var(--color-surface-container-highest)] relative overflow-hidden flex items-center justify-center">
                  {imagePreviews.length > 0 ? (
                    <img
                      src={imagePreviews[0].url}
                      alt="Product Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[var(--color-on-surface-variant)] gap-2">
                      <span className="material-symbols-outlined text-4xl">inventory_2</span>
                      <span className="text-xs">Product Image Preview</span>
                    </div>
                  )}

                  {/* Stock Badge */}
                  <div className="absolute top-3 right-3">
                    {inStock ? (
                      <span className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-[rgba(122,111,155,0.3)] text-xs font-semibold px-2.5 py-1 rounded-full text-[var(--color-primary)] shadow-sm flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse"></div>
                        In Stock
                      </span>
                    ) : (
                      <span className="bg-[var(--color-surface)]/80 backdrop-blur-md border border-red-500/30 text-xs font-semibold px-2.5 py-1 rounded-full text-red-400 shadow-sm flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="font-['Sora'] font-semibold text-lg text-[var(--color-on-surface)] line-clamp-1 mb-1">
                    {formData.name.trim() || "Product Name Preview"}
                  </h4>
                  <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-2 mb-4 h-10">
                    {formData.description.trim() || "Add a description to see how it looks here."}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="font-['Sora'] font-bold text-xl text-[var(--color-primary)] flex items-baseline gap-1">
                      <span className="text-sm text-[var(--color-primary-dim)]">{currSymbol}</span>
                      <span>{formData.priceAmount ? Number(formData.priceAmount).toFixed(2) : "0.00"}</span>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="w-10 h-10 rounded-lg bg-[var(--color-surface-container-high)] border border-[rgba(122,111,155,0.3)] flex items-center justify-center text-[var(--color-on-surface-variant)] cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-[var(--color-surface-container-low)] rounded-lg p-4 border border-[rgba(122,111,155,0.2)] flex items-start gap-3">
                <span className="material-symbols-outlined text-[var(--color-primary-dim)] mt-0.5 text-lg">info</span>
                <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                  This is an approximation of how your product will appear in the marketplace grid. The actual appearance may vary based on buyer device and screen size.
                </p>
              </div>

            </div>
          </div>

        </div>

      </main>

    </div>
  );
}