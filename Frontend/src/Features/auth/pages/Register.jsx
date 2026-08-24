import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowLeft,
  Store,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useLenis } from "../../../assets/useLenis";
import { useAuth } from "../hook/useAuth";
import gsap from "gsap";

export default function Register() {
  useLenis();
  const navigate = useNavigate();
  const { handleRegister } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    gsap.from(".auth-anim", {
      y: 30,
      opacity: 0,
      stagger: 0.08,
      duration: 0.7,
      ease: "power3.out",
      clearProps: "all"
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await handleRegister(formData);
      setToastMessage("Account created successfully!");
      setTimeout(() => {
        if (formData.role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EBE6] text-black font-body selection:bg-[#FF5500] selection:text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white animate-bounce font-heading font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="max-w-[1200px] mx-auto w-full flex items-center justify-between pb-6 border-b-2 border-black">
        <Link to="/" className="group">
          <h1 className="font-heading font-black text-3xl tracking-tight text-black flex items-baseline">
            snitch<span className="text-[#FF5500]">.</span>
          </h1>
        </Link>
        <Link
          to="/"
          className="units-pill bg-white text-black font-mono font-bold px-4 py-2 rounded-full border-2 border-black text-xs flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>STOREFRONT</span>
        </Link>
      </header>

      {/* Register Box */}
      <main className="max-w-md mx-auto w-full my-auto py-8 auth-anim">
        <div className="bg-white border-2 border-black rounded-[32px] p-8 sm:p-10 shadow-[4px_4px_0px_#000000]">
          
          <div className="text-center mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF5500]">
              NEW IDENTITY
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-black mt-1">
              Create Account
            </h2>
          </div>

          {/* Switcher Pills */}
          <div className="grid grid-cols-2 gap-2 bg-[#F5EBE6] p-1.5 rounded-full border-2 border-black mb-6">
            <Link
              to="/login"
              className="py-2.5 text-center rounded-full text-black font-heading font-bold text-xs hover:bg-white transition-colors"
            >
              SIGN IN
            </Link>
            <button className="py-2.5 rounded-full bg-black text-white font-heading font-black text-xs shadow-md">
              REGISTER
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 mb-6 rounded-2xl bg-[#FF3B30] text-white text-xs font-mono font-bold flex items-center gap-3 border-2 border-black">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 units-input text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 units-input text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-4 py-2.5 units-input text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 units-input text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "user" })}
                  className={`py-3 rounded-2xl font-heading font-black text-xs border-2 border-black flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === "user"
                      ? "bg-[#1677FF] text-white shadow-[2px_2px_0px_#000000]"
                      : "bg-[#F5EBE6] text-black"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>BUYER</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "seller" })}
                  className={`py-3 rounded-2xl font-heading font-black text-xs border-2 border-black flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === "seller"
                      ? "bg-[#FFB800] text-black shadow-[2px_2px_0px_#000000]"
                      : "bg-[#F5EBE6] text-black"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>SELLER</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#00C853] text-black font-heading font-black text-sm border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-40 mt-2"
            >
              {loading ? "CREATING ONBOARDING..." : "CREATE ACCOUNT ↗"}
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t-2 border-black/10 text-xs font-mono font-bold text-black/70">
            Already registered?{" "}
            <Link to="/login" className="text-[#1677FF] font-black underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto w-full text-center text-xs font-mono font-bold text-black/60 pt-4">
        © {new Date().getFullYear()} SNITCH ARCHITECTURAL COMMERCE
      </footer>
    </div>
  );
}
