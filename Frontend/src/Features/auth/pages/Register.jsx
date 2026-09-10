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
import { useSelector } from "react-redux";
import { useLenis } from "../../../assets/useLenis";
import { useAuth } from "../hook/useAuth";
import gsap from "gsap";

export default function Register() {
  useLenis();
  const navigate = useNavigate();
  const { handleRegister, handleGoogleAuth } = useAuth();
  const { user, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (initialized && user) {
      if (user.role === "seller") {
        navigate("/seller/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [initialized, user, navigate]);

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
              className="w-full py-4 rounded-full bg-[#00C853] text-black font-heading font-black text-sm border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-40 mt-2 cursor-pointer"
            >
              {loading ? "CREATING ONBOARDING..." : "CREATE ACCOUNT ↗"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t-2 border-black/10 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-mono font-bold text-black/50 uppercase tracking-widest shrink-0">
              OR SIGN UP WITH
            </span>
            <div className="border-t-2 border-black/10 w-full"></div>
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-3.5 px-4 rounded-full bg-white text-black font-heading font-extrabold text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>SIGN UP WITH GOOGLE</span>
          </button>

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
