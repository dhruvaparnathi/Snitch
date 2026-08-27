import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  Layers,
  Save,
  AlertTriangle,
  X
} from "lucide-react";
import { useLenis } from "../../../assets/useLenis";
import { useProduct } from "../hook/useProduct";
import gsap from "gsap";
import SellerLoader from "../../../Components/loaders/SellerLoader.jsx";

export default function EditProduct() {
  useLenis();
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetSingleProduct, handleUpdateProduct, handleDeleteProduct, loading, error } = useProduct();

  const [initialLoading, setInitialLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Primary Product State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Living Units",
    priceAmount: "",
    priceCurrency: "INR",
    stockQuantity: 10,
    images: [],
  });

  // Multiple Main Images State (includes both existing and newly added photos)
  const [previewImages, setPreviewImages] = useState([]);
  const [activePreviewImgIdx, setActivePreviewImgIdx] = useState(0);

  // Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);

  const [selectedPreviewVariantIdx, setSelectedPreviewVariantIdx] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch and prefill existing product details
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        setInitialLoading(true);
        const res = await handleGetSingleProduct(id);
        const prod = res.product || res;
        if (isMounted && prod) {
          setFormData({
            name: prod.title || prod.name || "",
            description: prod.description || "",
            category: prod.category || "Living Units",
            priceAmount: prod.price?.amount !== undefined ? prod.price.amount : (prod.priceAmount || ""),
            priceCurrency: prod.price?.currency || prod.priceCurrency || "INR",
            stockQuantity: prod.stock !== undefined ? prod.stock : (prod.stockQuantity || 1),
            images: [],
          });

          // Preload Existing Images
          const existingImgs = (prod.Images && prod.Images.length > 0)
            ? prod.Images.map((i) => ({ url: typeof i === "string" ? i : i.url, isExisting: true }))
            : (prod.images && prod.images.length > 0)
            ? prod.images.map((i) => ({ url: typeof i === "string" ? i : i.url, isExisting: true }))
            : [];
          setPreviewImages(existingImgs);

          // Preload Existing Variants
          if (Array.isArray(prod.variants) && prod.variants.length > 0) {
            setHasVariants(true);
            const normalizedVars = prod.variants.map((v, idx) => {
              let attrs = [];
              if (Array.isArray(v.attributes)) {
                attrs = v.attributes;
              } else if (v.attributes instanceof Map) {
                attrs = Array.from(v.attributes.entries()).map(([k, val]) => ({ key: k, val }));
              } else if (v.attributes && typeof v.attributes === "object") {
                attrs = Object.entries(v.attributes).map(([k, val]) => ({ key: k, val }));
              }

              const vImg = v.images?.[0]?.url ||
                (typeof v.images?.[0] === "string" ? v.images[0] : null) ||
                (typeof v.image === "string" ? v.image : v.image?.url) ||
                null;

              return {
                _id: v._id,
                id: v._id || `var-${idx}`,
                stock: v.stock !== undefined ? v.stock : 0,
                priceAmount: v.prices?.amount !== undefined ? v.prices.amount : (v.priceAmount || ""),
                priceCurrency: v.prices?.currency || v.priceCurrency || "INR",
                attributes: attrs.length > 0 ? attrs : [{ key: "Color", val: "" }, { key: "Size", val: "" }],
                image: null,
                previewUrl: vImg && !vImg.startsWith("blob:") ? vImg : null
              };
            });
            setVariants(normalizedVars);
          } else {
            setHasVariants(false);
          }
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    fetchProduct();

    gsap.from(".form-anim", {
      y: 30,
      opacity: 0,
      stagger: 0.08,
      duration: 0.7,
      ease: "power3.out",
      clearProps: "all"
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle Multi-file Upload for New Main Photos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...files]
      }));

      const newPreviewItems = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        isExisting: false
      }));

      setPreviewImages((prev) => [...prev, ...newPreviewItems]);
    }
  };

  const removePhoto = (idx) => {
    const target = previewImages[idx];
    setPreviewImages((prev) => prev.filter((_, i) => i !== idx));

    if (!target.isExisting && target.file) {
      setFormData((prev) => ({
        ...prev,
        images: (prev.images || []).filter((f) => f !== target.file)
      }));
    }

    if (activePreviewImgIdx >= previewImages.length - 1) {
      setActivePreviewImgIdx(Math.max(0, previewImages.length - 2));
    }
  };

  const setPrimaryPhoto = (idx) => {
    setActivePreviewImgIdx(idx);
  };

  // Variant Helpers
  const addVariant = () => {
    const newVariant = {
      id: `var-${Date.now()}`,
      stock: 5,
      priceAmount: formData.priceAmount || "",
      priceCurrency: formData.priceCurrency || "INR",
      attributes: [
        { key: "Color", val: "" },
        { key: "Size", val: "" }
      ],
      image: null,
      previewUrl: null
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const removeVariant = (idx) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
    if (selectedPreviewVariantIdx >= variants.length - 1) {
      setSelectedPreviewVariantIdx(Math.max(0, variants.length - 2));
    }
  };

  const updateVariant = (idx, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const addAttribute = (variantIdx) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[variantIdx].attributes.push({ key: "Material", val: "" });
      return copy;
    });
  };

  const removeAttribute = (variantIdx, attrIdx) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[variantIdx].attributes = copy[variantIdx].attributes.filter((_, i) => i !== attrIdx);
      return copy;
    });
  };

  const updateAttribute = (variantIdx, attrIdx, field, val) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[variantIdx].attributes[attrIdx][field] = val;
      return copy;
    });
  };

  const handleVariantImageChange = (variantIdx, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVariants((prev) => {
      const copy = [...prev];
      copy[variantIdx].image = file;
      copy[variantIdx].previewUrl = url;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.priceAmount) {
      setToastMessage("Please fill in required fields (Name & Price)");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      // Gather preserved existing photos
      const existingImages = previewImages
        .filter((img) => img.isExisting && img.url)
        .map((img) => ({ url: img.url, alt: formData.name }));

      // Clean up variants to ensure proper attributes formatting
      const cleanVariants = hasVariants ? variants.map((v) => ({
        _id: v._id && String(v._id).length === 24 ? v._id : undefined,
        stock: v.stock !== undefined ? Number(v.stock) : 0,
        priceAmount: v.priceAmount !== undefined && v.priceAmount !== "" ? v.priceAmount : formData.priceAmount,
        priceCurrency: v.priceCurrency || formData.priceCurrency || "INR",
        attributes: Array.isArray(v.attributes)
          ? v.attributes.filter((a) => a.key && a.val)
          : v.attributes,
        image: v.image,
        previewUrl: v.previewUrl && !v.previewUrl.startsWith("blob:") ? v.previewUrl : null
      })) : [];

      const payload = {
        ...formData,
        existingImages,
        hasVariants,
        variants: cleanVariants
      };

      await handleUpdateProduct(id, payload);
      setToastMessage("Product & variants updated successfully!");
      setTimeout(() => {
        navigate("/seller/dashboard");
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update product";
      setToastMessage(errorMsg);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await handleDeleteProduct(id);
      setToastMessage("Product permanently removed from inventory.");
      setTimeout(() => {
        navigate("/seller/dashboard");
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to remove product";
      setToastMessage(errorMsg);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeVariant = hasVariants && variants[selectedPreviewVariantIdx] ? variants[selectedPreviewVariantIdx] : null;
  const currentPreviewPrice = activeVariant?.priceAmount || formData.priceAmount || "0";
  const currentPreviewCurrency = activeVariant?.priceCurrency || formData.priceCurrency || "INR";
  
  // Decide which image to show in the preview
  const currentPreviewImg = activeVariant?.previewUrl
    || (previewImages.length > 0 ? previewImages[activePreviewImgIdx]?.url : null)
    || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="min-h-screen bg-[#F5EBE6] text-black font-body selection:bg-[#FF5500] selection:text-white relative p-4 sm:p-6 lg:p-8">
      {/* High-Velocity Seller Publishing Loader */}
      {(loading || initialLoading) && <SellerLoader duration={2.2} subtitle={initialLoading ? "FETCHING UNIT SPECIFICATIONS..." : "UPDATING UNIT IN SNITCH MESH..."} />}
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white animate-bounce font-heading font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-[6px_6px_0px_#FF3B30] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
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
              Are you sure you want to permanently delete <span className="text-black font-black">"{formData.name}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-full bg-white text-black font-heading font-extrabold text-xs border-2 border-black hover:bg-black/5 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
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
              STUDIO TERMINAL
            </span>
          </Link>

          <Link
            to="/seller/dashboard"
            className="units-pill bg-white text-black font-heading font-extrabold p-3 rounded-2xl flex items-center justify-between text-xs border-2 border-black shadow-[2px_2px_0px_#000000]"
          >
            <span>DASHBOARD</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link
            to={`/product/${id}`}
            className="units-pill bg-[#FFD600] text-black font-heading font-extrabold p-3 rounded-2xl flex items-center justify-between text-xs border-2 border-black shadow-[2px_2px_0px_#000000]"
          >
            <span>VIEW LIVE</span>
            <Eye className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="units-pill bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white font-mono font-bold p-3 rounded-2xl flex items-center justify-between text-xs border border-[#FF3B30]/40 transition-colors cursor-pointer mt-4"
          >
            <span>DELETE UNIT</span>
            <Trash2 className="w-4 h-4" />
          </button>
        </aside>

        {/* Main Form & Live Preview Area */}
        <main className="flex-1 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Form Box */}
            <div className="lg:col-span-7 form-anim">
              <div className="bg-white border-2 border-black rounded-[32px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000]">
                <div className="mb-6 pb-4 border-b-2 border-black flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#FF5500] uppercase tracking-widest">
                      EDIT SPECIFICATION
                    </span>
                    <h2 className="font-heading font-black text-3xl text-black mt-1">
                      Edit Product Unit
                    </h2>
                  </div>
                </div>

                {error && (
                  <div className="p-4 mb-6 rounded-2xl bg-[#FF3B30] text-white text-xs font-mono font-bold flex items-center gap-3 border-2 border-black">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                        Product / Unit Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Snitch Monolith Capsule"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 units-input text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 units-input text-sm bg-white"
                        >
                          <option value="Living Units">Living Units</option>
                          <option value="Artifacts">Artifacts</option>
                          <option value="Tech Ecosystem">Tech Ecosystem</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                          Base Stock Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 units-input text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                          Base Price Amount *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 640"
                          value={formData.priceAmount}
                          onChange={(e) => setFormData({ ...formData, priceAmount: e.target.value })}
                          className="w-full px-4 py-3 units-input text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                          Base Currency
                        </label>
                        <select
                          value={formData.priceCurrency}
                          onChange={(e) => setFormData({ ...formData, priceCurrency: e.target.value })}
                          className="w-full px-4 py-3 units-input text-sm bg-white"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                          <option value="CAD">CAD ($)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                        Specifications & Details
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Private bathroom • Work desk • Balcony • High-speed Wi-Fi..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 units-input text-sm resize-none"
                      />
                    </div>

                    {/* Multi-Image Upload Section */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-mono font-bold text-black uppercase">
                          Product Photos (Manage & Add More)
                        </label>
                        {previewImages.length > 0 && (
                          <span className="text-xs font-mono font-bold text-[#FF5500]">
                            {previewImages.length} Photo{previewImages.length > 1 ? "s" : ""} Available
                          </span>
                        )}
                      </div>

                      {/* Dropzone with multiple support */}
                      <div className="relative border-2 border-dashed border-black rounded-2xl p-6 text-center bg-[#F5EBE6] hover:bg-white transition-colors cursor-pointer mb-3">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-8 h-8 text-[#FF5500] mx-auto mb-2" />
                        <p className="text-xs font-mono font-bold text-black">
                          Click or drag photos here to add
                        </p>
                        <p className="text-[10px] font-mono text-black/60 mt-0.5">
                          Hold Ctrl / Shift to select multiple images simultaneously
                        </p>
                      </div>

                      {/* Selected Images Thumbnails Strip */}
                      {previewImages.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-3 bg-[#F5EBE6] border-2 border-black rounded-2xl">
                          {previewImages.map((imgItem, idx) => {
                            const isActive = activePreviewImgIdx === idx;
                            return (
                              <div
                                key={idx}
                                className={`relative rounded-xl overflow-hidden border-2 bg-white group cursor-pointer transition-all ${
                                  isActive ? "border-black shadow-[2px_2px_0px_#FF5500] scale-105" : "border-black/30"
                                }`}
                                onClick={() => setPrimaryPhoto(idx)}
                              >
                                <img
                                  src={imgItem.url}
                                  alt={`Product image ${idx + 1}`}
                                  className="w-full h-20 object-cover"
                                />

                                {/* Primary Badge on 1st Photo */}
                                {idx === 0 && (
                                  <span className="absolute bottom-1 left-1 bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                                    COVER
                                  </span>
                                )}

                                {/* Delete Thumbnail Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePhoto(idx);
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                                  title="Remove photo"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Variants Section */}
                  <div className="pt-6 border-t-2 border-black">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-black text-xl text-black flex items-center gap-2">
                          <Layers className="w-5 h-5 text-[#1677FF]" />
                          <span>Product Variants & Options</span>
                        </h3>
                        <p className="text-xs font-mono font-bold text-black/70">
                          Edit custom sizes, colors, variant pricing, and attributes
                        </p>
                      </div>

                      {/* Enable Variants Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          setHasVariants(!hasVariants);
                          if (!hasVariants && variants.length === 0) addVariant();
                        }}
                        className={`px-4 py-2 rounded-full font-mono text-xs font-bold border-2 border-black transition-all ${
                          hasVariants
                            ? "bg-[#00C853] text-black shadow-[2px_2px_0px_#000000]"
                            : "bg-[#F5EBE6] text-black/70 hover:bg-black hover:text-white"
                        }`}
                      >
                        {hasVariants ? "✓ VARIANTS ACTIVE" : "+ ENABLE VARIANTS"}
                      </button>
                    </div>

                    {hasVariants && (
                      <div className="space-y-5 mt-4">
                        {variants.map((v, vIdx) => (
                          <div
                            key={v.id || vIdx}
                            className="bg-[#F5EBE6] border-2 border-black rounded-[24px] p-5 shadow-[3px_3px_0px_#000000] relative"
                          >
                            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-black/10">
                              <span className="font-heading font-black text-sm text-[#FF5500] uppercase">
                                Variant #{vIdx + 1}
                              </span>

                              {variants.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeVariant(vIdx)}
                                  className="text-xs font-mono font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              )}
                            </div>

                            {/* Attributes Builder */}
                            <div className="space-y-2 mb-4">
                              <label className="block text-[11px] font-mono font-bold text-black uppercase">
                                Variant Attributes (Key : Value)
                              </label>
                              {v.attributes.map((attr, aIdx) => (
                                <div key={aIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. Color / Size"
                                    value={attr.key}
                                    onChange={(e) => updateAttribute(vIdx, aIdx, "key", e.target.value)}
                                    className="w-1/3 px-3 py-2 units-input text-xs"
                                  />
                                  <input
                                    type="text"
                                    placeholder="e.g. Matte Black / Studio XL"
                                    value={attr.val}
                                    onChange={(e) => updateAttribute(vIdx, aIdx, "val", e.target.value)}
                                    className="flex-1 px-3 py-2 units-input text-xs"
                                  />
                                  {v.attributes.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeAttribute(vIdx, aIdx)}
                                      className="p-1.5 text-black hover:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={() => addAttribute(vIdx)}
                                className="text-xs font-mono font-bold text-[#1677FF] hover:underline flex items-center gap-1 mt-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Add Attribute Option</span>
                              </button>
                            </div>

                            {/* Variant Price & Stock */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-mono font-bold text-black uppercase mb-1">
                                  Variant Price
                                </label>
                                <input
                                  type="number"
                                  placeholder="e.g. 680"
                                  value={v.priceAmount}
                                  onChange={(e) => updateVariant(vIdx, "priceAmount", e.target.value)}
                                  className="w-full px-3 py-2 units-input text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono font-bold text-black uppercase mb-1">
                                  Currency
                                </label>
                                <select
                                  value={v.priceCurrency}
                                  onChange={(e) => updateVariant(vIdx, "priceCurrency", e.target.value)}
                                  className="w-full px-3 py-2 units-input text-xs bg-white"
                                >
                                  <option value="INR">INR (₹)</option>
                                  <option value="USD">USD ($)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="GBP">GBP (£)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono font-bold text-black uppercase mb-1">
                                  Variant Stock
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={v.stock}
                                  onChange={(e) => updateVariant(vIdx, "stock", parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 units-input text-xs"
                                />
                              </div>
                            </div>

                            {/* Variant Image */}
                            <div className="mt-3">
                              <label className="block text-[10px] font-mono font-bold text-black uppercase mb-1">
                                Variant Specific Photo (Optional)
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleVariantImageChange(vIdx, e.target.files[0])}
                                className="text-xs font-mono text-black"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addVariant}
                          className="w-full py-3 rounded-2xl bg-[#FFB800] text-black font-heading font-extrabold text-xs border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-2 hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ ADD ANOTHER VARIANT</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t-2 border-black">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 w-full py-4 rounded-full bg-[#00C853] text-black font-heading font-black text-base border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Save className="w-5 h-5" />
                      <span>{loading ? "SAVING CHANGES TO SNITCH..." : "SAVE & UPDATE PRODUCT UNIT ↗"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full sm:w-auto px-6 py-4 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white font-heading font-bold text-sm border-2 border-[#FF3B30]/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>DELETE</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Live Preview Box */}
            <div className="lg:col-span-5 form-anim">
              <div className="sticky top-10">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-black" />
                  <span className="text-xs font-mono font-bold text-black uppercase">LIVE CARD PREVIEW</span>
                </div>

                <div className="bg-white border-2 border-black rounded-[32px] p-6 shadow-[4px_4px_0px_#000000]">
                  <div className="h-64 rounded-[24px] overflow-hidden border-2 border-black mb-4 relative bg-[#F5EBE6]">
                    <img
                      src={currentPreviewImg}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full font-mono text-[10px] font-bold bg-[#1677FF] text-white border border-black">
                      {hasVariants ? "VARIANT PREVIEW" : previewImages.length > 1 ? `PHOTO ${activePreviewImgIdx + 1}/${previewImages.length}` : "LIVE PREVIEW"}
                    </span>
                  </div>

                  {/* Multi-Photo Thumbnail Switcher in Preview */}
                  {previewImages.length > 1 && !activeVariant?.previewUrl && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2">
                      {previewImages.map((pImg, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActivePreviewImgIdx(i)}
                          className={`w-12 h-10 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                            activePreviewImgIdx === i ? "border-[#FF5500] scale-105" : "border-black/30 opacity-70"
                          }`}
                        >
                          <img src={pImg.url} alt="Thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[11px] font-mono font-bold text-black/60 uppercase">{formData.category}</span>
                  <h3 className="font-heading font-black text-2xl text-black mt-0.5 mb-1">
                    {formData.name || "Untitled Unit"}
                  </h3>
                  <p className="text-xs font-semibold text-black/70 mb-4 line-clamp-2">
                    {formData.description || "Enter unit specifications to see live architectural details."}
                  </p>

                  {/* Variant Selection in Preview */}
                  {hasVariants && variants.length > 0 && (
                    <div className="mb-4 pt-3 border-t-2 border-black/10">
                      <span className="text-[10px] font-mono font-bold text-black/80 uppercase block mb-1.5">
                        Available Variants:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {variants.map((v, i) => {
                          const label = v.attributes.map((a) => a.val || a.key).filter(Boolean).join(" / ") || `Option #${i + 1}`;
                          const isSel = selectedPreviewVariantIdx === i;
                          return (
                            <button
                              key={v.id || i}
                              type="button"
                              onClick={() => setSelectedPreviewVariantIdx(i)}
                              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
                                isSel
                                  ? "bg-black text-white border-black"
                                  : "bg-[#F5EBE6] text-black border-black/50 hover:border-black"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t-2 border-black/10">
                    <span className="font-heading font-black text-xl text-[#FF5500]">
                      {currentPreviewCurrency} {currentPreviewPrice}
                    </span>
                    <span className="text-xs font-mono font-bold text-black bg-[#FFB800] px-3 py-1 rounded-full border border-black">
                      {activeVariant ? `${activeVariant.stock} IN STOCK` : `${formData.stockQuantity} IN STOCK`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
